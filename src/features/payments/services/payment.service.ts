import { db } from "@/src/services/firebase";

import { Payment } from "../types/payment";

import { addToBudget } from "./budget.service";

import {
    addDoc,
    collection,
    doc,
    getDoc,
    getDocs,
    query,
    serverTimestamp,
    updateDoc,
    where,
} from "firebase/firestore";
import { getPaymentSettings } from "./paymentsSettings.service";

// *======================================================*
// *MONTH HELPERS*
// *======================================================*

const getMonthString = (date: Date) => {
    return `${date.getFullYear()}-${String(
        date.getMonth() + 1,
    ).padStart(2, "0")}`;
};

const addMonths = (date: Date, months: number) => {
    const result = new Date(date);

    result.setMonth(result.getMonth() + months);

    return result;
};

// *======================================================*
// *CREATE NORMAL MONTHLY PAYMENT*
// *======================================================*

export const createMonthlyPayment = async (userId: string) => {
    const month = getMonthString(new Date());

    // *Get monthly amount configured by admin*
    const settings = await getPaymentSettings();

    const monthlyAmount = settings.monthlyAmount;

    if (monthlyAmount <= 0) {
        throw new Error(
            "Le montant mensuel configuré est invalide.",
        );
    }

    // *Check if payment already exists*
    const q = query(
        collection(db, "payments"),
        where("userId", "==", userId),
        where("month", "==", month),
    );

    const existing = await getDocs(q);

    if (!existing.empty) return;

    // *Get user*
    const userRef = doc(db, "users", userId);

    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) return;

    const user = userSnap.data();

    await addDoc(collection(db, "payments"), {
        userId,

        month,

        amount: monthlyAmount,

        paid: false,

        paidAt: null,

        fullName: user.fullName,

        floor: user.floor,

        door: user.door,

        createdAt: serverTimestamp(),

        paymentType: "monthly",
    });
};

// *======================================================*
// *ADVANCE PAYMENT*
// *======================================================*

export const createAdvancePayment = async (
    userId: string,
    numberOfMonths: number,
    monthlyAmount: number,
) => {
    if (numberOfMonths <= 0) {
        throw new Error(
            "Le nombre de mois doit être supérieur à 0.",
        );
    }

    if (monthlyAmount <= 0) {
        throw new Error(
            "Le montant mensuel configuré est invalide.",
        );
    }

    // ======================================================
    // GET USER
    // ======================================================

    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
        throw new Error("Utilisateur introuvable.");
    }

    const user = userSnap.data();

    // ======================================================
    // GET ALL USER PAYMENTS
    // ======================================================

    const paymentsQuery = query(
        collection(db, "payments"),
        where("userId", "==", userId),
    );

    const paymentsSnap = await getDocs(paymentsQuery);

    // Map existing payments by month
    const existingPayments = new Map<
        string,
        {
            ref: typeof paymentsSnap.docs[number]["ref"];
            paid: boolean;
            amount: number;
        }
    >();

    paymentsSnap.forEach((paymentDoc) => {
        const data = paymentDoc.data();

        existingPayments.set(data.month, {
            ref: paymentDoc.ref,
            paid: data.paid === true,
            amount: data.amount ?? monthlyAmount,
        });
    });

    // ======================================================
    // FIND OLDEST UNPAID MONTH
    // ======================================================

    const unpaidMonths = Array.from(
        existingPayments.entries(),
    )
        .filter(([_, payment]) => !payment.paid)
        .map(([month]) => month)
        .sort();

    // ======================================================
    // DETERMINE MONTHS TO PAY
    // ======================================================

    const monthsToProcess: string[] = [];

    // ------------------------------------------------------
    // 1. PAY OLDEST UNPAID MONTHS FIRST
    // ------------------------------------------------------

    for (const month of unpaidMonths) {
        if (monthsToProcess.length >= numberOfMonths) {
            break;
        }

        monthsToProcess.push(month);
    }

    // ------------------------------------------------------
    // 2. IF WE STILL NEED MONTHS,
    //    CONTINUE FROM CURRENT MONTH
    // ------------------------------------------------------

    const today = new Date();

    let futureMonthIndex = 0;

    while (monthsToProcess.length < numberOfMonths) {
        const date = addMonths(today, futureMonthIndex);
        const month = getMonthString(date);

        // Don't add a month that is already selected
        if (!monthsToProcess.includes(month)) {
            const existingPayment = existingPayments.get(month);

            // If it doesn't exist, or exists but is unpaid,
            // it can be processed.
            if (!existingPayment || !existingPayment.paid) {
                monthsToProcess.push(month);
            }
        }

        futureMonthIndex++;
    }

    // ======================================================
    // PROCESS MONTHS
    // ======================================================

    let processedMonths = 0;

    for (const month of monthsToProcess) {
        const existingPayment = existingPayments.get(month);

        // ==================================================
        // EXISTING PAYMENT
        // ==================================================

        if (existingPayment) {
            // Already paid → don't touch it
            if (existingPayment.paid) {
                continue;
            }

            // Existing unpaid payment → mark as paid
            await updateDoc(existingPayment.ref, {
                paid: true,
                paidAt: serverTimestamp(),
                paymentType: "advance",
                updatedAt: serverTimestamp(),
            });

            await addToBudget(monthlyAmount);

            processedMonths++;

            continue;
        }

        // ==================================================
        // PAYMENT DOESN'T EXIST → CREATE IT
        // ==================================================

        await addDoc(collection(db, "payments"), {
            userId,
            month,
            amount: monthlyAmount,
            paid: true,
            paidAt: serverTimestamp(),
            fullName: user.fullName,
            floor: user.floor,
            door: user.door,
            createdAt: serverTimestamp(),
            paymentType: "advance",
        });

        await addToBudget(monthlyAmount);

        processedMonths++;
    }

    // ======================================================
    // RESULT
    // ======================================================

    return {
        processedMonths,
        totalAmount: processedMonths * monthlyAmount,
        monthlyAmount,
        months: monthsToProcess,
    };
};


// *======================================================*
// *MARK PAYMENT AS PAID*
// *======================================================*

export const markPaymentAsPaid = async (
    paymentId: string,
) => {
    const paymentRef = doc(
        db,
        "payments",
        paymentId,
    );

    const paymentSnap = await getDoc(paymentRef);

    if (!paymentSnap.exists()) return;

    const payment = paymentSnap.data() as Payment;

    if (payment.paid) return;

    await updateDoc(paymentRef, {
        paid: true,

        paidAt: serverTimestamp(),

        updatedAt: serverTimestamp(),
    });

    await addToBudget(payment.amount);
};
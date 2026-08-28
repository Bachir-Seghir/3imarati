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

    // *Get user*
    const userRef = doc(db, "users", userId);

    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
        throw new Error("Utilisateur introuvable.");
    }

    const user = userSnap.data();

    const today = new Date();

    let processedMonths = 0;

    // *======================================================*
    // *PROCESS EACH MONTH*
    // *======================================================*

    for (let i = 0; i < numberOfMonths; i++) {
        const date = addMonths(today, i);

        const month = getMonthString(date);

        // *==========================================*
        // *Check existing payment*
        // *==========================================*

        const q = query(
            collection(db, "payments"),
            where("userId", "==", userId),
            where("month", "==", month),
        );

        const existing = await getDocs(q);

        // *==========================================*
        // *Payment already exists*
        // *==========================================*

        if (!existing.empty) {
            const paymentDoc = existing.docs[0];

            const payment = paymentDoc.data();

            // *Already paid → don't touch it*
            if (payment.paid === true) {
                continue;
            }

            // *Existing unpaid payment → mark as paid*
            await updateDoc(paymentDoc.ref, {
                paid: true,

                paidAt: serverTimestamp(),

                paymentType: "advance",

                updatedAt: serverTimestamp(),
            });

            await addToBudget(monthlyAmount);

            processedMonths++;

            continue;
        }

        // *==========================================*
        // *Payment doesn't exist → create it*
        // *==========================================*

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

    // *==========================================*
    // *RESULT*
    // *==========================================*

    return {
        processedMonths,

        totalAmount:
            processedMonths * monthlyAmount,

        monthlyAmount,
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
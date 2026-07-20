import { db } from "@/src/services/firebase";
import {
    addDoc,
    collection,
    doc,
    getDoc,
    getDocs,
    query,
    serverTimestamp,
    updateDoc,
    where
} from "firebase/firestore";
import { Payment } from "../types/payment";
import { addToBudget } from "./budget.service";

export const createMonthlyPayment = async (userId: string) => {
    const month = new Date().toISOString().slice(0, 7);

    // 🔍 check if already exists
    const q = query(
        collection(db, "payments"),
        where("userId", "==", userId),
        where("month", "==", month)
    );

    const existing = await getDocs(q);

    if (!existing.empty) return; // 🚫 already created
    // 🟢 fetch user profile
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) return;

    const user = userSnap.data();


    await addDoc(collection(db, "payments"), {
        userId,
        month,
        amount: 500,
        paid: false,
        paidAt: null,

        fullName: user.fullName,
        floor: user.floor,
        door: user.door,
    });
};

// ✅ Mark payment as paid
export const markPaymentAsPaid = async (paymentId: string) => {
    const paymentRef = doc(db, "payments", paymentId)
    const paymentSnap = await getDoc(paymentRef)

    if (!paymentSnap.exists()) return;

    const payment = paymentSnap.data() as Payment

    if (payment.paid) return; // 🚫 avoid double click

    await updateDoc(paymentRef, {
        paid: true,
        paidAt: serverTimestamp()
    })
    await addToBudget(payment.amount);
};

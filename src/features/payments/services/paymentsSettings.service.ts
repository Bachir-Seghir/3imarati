import { db } from "@/src/services/firebase";
import {
    doc,
    getDoc,
    serverTimestamp,
    setDoc,
} from "firebase/firestore";

const PAYMENT_SETTINGS_ID = "payment";

export type PaymentSettings = {
    monthlyAmount: number;
    updatedAt?: any;
    updatedBy?: string;
};

export const getPaymentSettings = async (): Promise<PaymentSettings> => {
    const ref = doc(db, "settings", PAYMENT_SETTINGS_ID);

    const snap = await getDoc(ref);

    if (!snap.exists()) {
        // Default value if settings don't exist yet
        return {
            monthlyAmount: 1000,
        };
    }

    return snap.data() as PaymentSettings;
};

export const updateMonthlyAmount = async (
    monthlyAmount: number,
    adminId?: string,
) => {
    const ref = doc(db, "settings", PAYMENT_SETTINGS_ID);

    await setDoc(
        ref,
        {
            monthlyAmount,
            updatedAt: serverTimestamp(),
            updatedBy: adminId ?? null,
        },
        { merge: true },
    );
};
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
    paymentStartMonth: string;
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
            paymentStartMonth: "",
        };
    }

    const data = snap.data();

    return {
        monthlyAmount:
            typeof data.monthlyAmount === "number"
                ? data.monthlyAmount
                : 1000,

        paymentStartMonth:
            typeof data.paymentStartMonth === "string"
                ? data.paymentStartMonth
                : "",

        updatedAt: data.updatedAt,
        updatedBy: data.updatedBy,
    }
};

export const updatePaymentSettings = async (
    settings: {
        monthlyAmount: number;
        paymentStartMonth: string;
    },
    adminId?: string,
) => {
    const ref = doc(db, "settings", PAYMENT_SETTINGS_ID);

    await setDoc(
        ref,
        {
            monthlyAmount: settings.monthlyAmount,
            paymentStartMonth: settings.paymentStartMonth,
            updatedAt: serverTimestamp(),
            updatedBy: adminId ?? null,
        },
        { merge: true },
    );
};
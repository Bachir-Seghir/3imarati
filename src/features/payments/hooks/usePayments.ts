import { db } from "@/src/services/firebase";
import { collection, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";

export const usePayments = () => {
    const [payments, setPayments] = useState<any[]>([]);

    useEffect(() => {
        const unsub = onSnapshot(collection(db, "payments"), (snap) => {
            const data = snap.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setPayments(data);
        });

        return () => unsub();
    }, []);

    return payments;
};
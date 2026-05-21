import { db } from "@/src/services/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";

export const useBudget = () => {
    const [budget, setBudget] = useState(0);

    useEffect(() => {
        const budgetRef = doc(db, "budget", "main");

        const unsub = onSnapshot(budgetRef, (snap) => {
            if (snap.exists()) {
                setBudget(snap.data().amount || 0);
            }
        });

        return () => unsub();
    }, []);

    return budget;
};
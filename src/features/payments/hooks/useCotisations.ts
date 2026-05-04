import { db } from "@/src/services/firebase";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { useEffect, useState } from "react";

export const useCotisations = () => {
    const [cotisations, setCotisations] = useState<any[]>([]);

    useEffect(() => {
        const q = query(
            collection(db, "cotisations"),
            orderBy("createdAt", "desc")
        )
        const unsub = onSnapshot(q, (snap) => {
            const data = snap.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setCotisations(data);
        });

        return () => unsub();
    }, []);

    return cotisations;
};
import { db } from "@/src/services/firebase";
import { collection, onSnapshot, query } from "firebase/firestore";
import { useEffect, useState } from "react";


export const useCompalintsStats = () => {

    const [complaints, setComplaints] = useState<any[]>([]);
    useEffect(() => {
        const qComplaints = query(collection(db, "complaints"));

        const unsubscribeComp = onSnapshot(qComplaints, (snap) => {
            const data = snap.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));

            setComplaints(data);
        });

        return () => {
            unsubscribeComp();
        };
    }, []);

    return complaints
}
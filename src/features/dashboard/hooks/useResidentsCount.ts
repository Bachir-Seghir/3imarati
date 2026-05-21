import { db } from "@/src/services/firebase";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";


export const useResidentsCount = () => {

    const [residentsCount, setResidentsCount] = useState(0)

    useEffect(() => {
        const qUsers = query(
            collection(db, "users"),
            where("approved", "==", true),
        );

        const unsubscribeUsers = onSnapshot(qUsers, (snap) => {
            setResidentsCount(snap.size);
        });

        return () => {
            unsubscribeUsers();
        };
    }, [])

    return residentsCount
}
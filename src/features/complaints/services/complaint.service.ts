import { db } from "@/src/services/firebase";
import {
    collection,
    doc,
    getDocs,
    query,
    runTransaction,
    serverTimestamp,
    updateDoc,
    where
} from "firebase/firestore";

import { Complaint } from "../types/complaint";

// 🟢 Create complaint with an automatically incremented number
export const createComplaint = async (
    data: Omit<
        Complaint,
        | "id"
        | "complaintNumber"
        | "createdAt"
        | "updatedAt"
        | "status"
    >
) => {
    const year = new Date().getFullYear();

    // Counter document for the current year
    const counterRef = doc(
        db,
        "counters",
        `complaints-${year}`
    );

    // Generate the complaint document reference
    const complaintRef = doc(collection(db, "complaints"));

    await runTransaction(db, async (transaction) => {
        const counterSnap = await transaction.get(counterRef);

        const currentValue = counterSnap.exists()
            ? Number(counterSnap.data().value) || 0
            : 0;

        const nextNumber = currentValue + 1;

        const complaintNumber =
            `${year}-${String(nextNumber).padStart(3, "0")}`;

        // Update the counter
        transaction.set(counterRef, {
            year,
            value: nextNumber,
            updatedAt: serverTimestamp(),
        });

        // Create the complaint with its number
        transaction.set(complaintRef, {
            ...data,
            complaintNumber,
            status: "En_Attente",
            assignedToId: null,
            assignedToName: null,
            assignedAt: null,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });
    });

    return complaintRef;
};

// 🔵 Update status (admin)
export const updateComplaintStatus = async (
    id: string,
    status: Complaint["status"]
) => {
    const ref = doc(db, "complaints", id);

    await updateDoc(ref, {
        status,
        updatedAt: serverTimestamp(),
    });
};

// 🟣 Get user complaints
export const getUserComplaints = async (userId: string) => {
    const q = query(
        collection(db, "complaints"),
        where("userId", "==", userId)
    );

    return await getDocs(q);
};
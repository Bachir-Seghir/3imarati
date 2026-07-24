import { db } from "@/src/services/firebase";
import {
    addDoc,
    collection,
    doc,
    getDocs,
    query,
    serverTimestamp,
    updateDoc,
    where,
} from "firebase/firestore";

import { Complaint } from "../types/complaint";

// 🟢 Create complaint
export const createComplaint = async (data: Omit<Complaint, "id" | "createdAt" | "updatedAt" | "status">) => {
    return await addDoc(collection(db, "complaints"), {
        ...data,
        status: "En_Attente",
        assignedToId: null,
        assignedToName: null,
        assignedAt: null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });
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
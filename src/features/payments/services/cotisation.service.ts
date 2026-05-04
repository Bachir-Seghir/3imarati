import { db } from "@/src/services/firebase";
import { addDoc, collection, doc, getDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { Cotisation } from "../types/cotisation";
import { addToBudget } from "./budget.service";


// cerate Cotisation Request
export const createCotisation = async (amount: number, userId: string, floor: string, door: string, fullName: string) => {

    await addDoc(collection(db, "cotisations"), {
        amount,
        fullName,
        floor,
        door,
        createdBy: userId,
        status: "pending",
        createdAt: serverTimestamp(),
        approvedAt: null,
    });
};

// approve cotisation request
export const approveCotisation = async (cotisationId: string) => {
    try {
        const ref = doc(db, "cotisations", cotisationId)
        const snap = await getDoc(ref)

        if (!snap.exists()) {
            console.log("Cotisation not found");
            return;
        }

        const cotisation: Cotisation = {
            id: snap.id,
            ...(snap.data() as Omit<Cotisation, "id">)
        }

        if (cotisation.status === "approved") {
            console.log("Already approved");
            return;
        }

        await updateDoc(ref, {
            status: "approved",
            approvedAt: serverTimestamp()
        })

        await addToBudget(cotisation.amount)

    } catch (error) {
        console.log("APPROVE COTISATION ERROR:", error);
    }

}

// Reject cotisation

export const rejectCotisation = async (cotisationId: string) => {
    try {
        const ref = doc(db, "cotisations", cotisationId)
        const snap = await getDoc(ref)

        if (!snap.exists()) {
            console.log("Cotisation not found");
            return;
        }

        const cotisation: Cotisation = {
            id: snap.id,
            ...(snap.data() as Omit<Cotisation, "id">)
        }

        if (cotisation.status === "rejected") {
            console.log("Already rejected");
            return;
        }

        await updateDoc(ref, {
            status: "rejected",
        })


    } catch (error) {
        console.log("REJECTING COTISATION ERROR:", error);
    }
}
import { db } from "@/src/services/firebase";
import { doc, increment, updateDoc } from "firebase/firestore";


// ➕ Add amount to budget (reusable)
export const addToBudget = async (amount: number) => {
    const budgetRef = doc(db, "budget", "main");
    await updateDoc(budgetRef, {
        amount: increment(amount),
    })
}
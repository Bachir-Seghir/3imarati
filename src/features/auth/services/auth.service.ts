import { auth } from "@/src/services/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";

export const login = async (email: string, password: string) => {
    return signInWithEmailAndPassword(auth, email, password);
};
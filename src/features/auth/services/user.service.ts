import { db } from "@/src/services/firebase";
import { UserProfile } from "@/src/types/user";
import { deleteDoc, doc, getDoc, updateDoc } from "firebase/firestore";

export const getUserProfile = async (user: {
    uid: string;
    email: string | null;
}): Promise<UserProfile | null> => {
    const ref = doc(db, "users", user.uid);
    const snap = await getDoc(ref);

    // ✅ CREATE if not exists
    if (!snap.exists()) {
        return null
    };


    // ✅ RETURN existing
    return snap.data() as UserProfile;
};

export const updateUserProfile = async (uid: string, data: Partial<UserProfile>) => {
    const ref = doc(db, "users", uid);
    await updateDoc(ref, data);
};

export const deleteUser = async (uid: string) => {
    await deleteDoc(doc(db, "users", uid));
};
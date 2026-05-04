import { db } from "@/src/services/firebase";
import { UserProfile } from "@/src/types/user";
import { doc, getDoc, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";

export const getOrCreateUserProfile = async (user: {
    uid: string;
    email: string | null;
}): Promise<UserProfile> => {
    const ref = doc(db, "users", user.uid);
    const snap = await getDoc(ref);

    // ✅ CREATE if not exists
    if (!snap.exists()) {
        const newUser: UserProfile = {
            email: user.email || "",
            fullName: user.email?.split("@")[0] || "",
            role: "resident",
            floor: 0,
            door: 0,
            identityImage: null,
            approved: false,
            createdAt: serverTimestamp() as any,
        };

        await setDoc(ref, newUser);
        return newUser;
    }

    // ✅ RETURN existing
    return snap.data() as UserProfile;
};

export const updateUserProfile = async (uid: string, data: Partial<UserProfile>) => {
    const ref = doc(db, "users", uid);
    await updateDoc(ref, data);
};
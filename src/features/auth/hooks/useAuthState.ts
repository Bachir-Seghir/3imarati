import { auth, db } from "@/src/services/firebase";
import { UserProfile } from "@/src/types/user";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";
import { getOrCreateUserProfile } from "../services/user.service";

export function useAuthState() {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [authLoading, setAuthLoading] = useState(true);
    const [profileLoading, setProfileLoading] = useState(false);

    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, async (u) => {
            setUser(u);
            setProfile(null);

            if (!u) {
                setAuthLoading(false);
                return;
            }

            setProfileLoading(true);
            await getOrCreateUserProfile({
                uid: u.uid,
                email: u.email
            })

            const ref = doc(db, "users", u.uid);


            const unsubscribeDoc = onSnapshot(ref, (docSnap) => {
                setProfile(docSnap.data() as UserProfile);
                setProfileLoading(false);
            });

            setAuthLoading(false);

            return () => unsubscribeDoc();
        });

        return () => unsubscribeAuth();
    }, []);

    return {
        user,
        profile,
        loading: authLoading || profileLoading,
    };
}
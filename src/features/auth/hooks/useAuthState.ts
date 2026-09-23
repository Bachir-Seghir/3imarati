import { auth, db } from "@/src/services/firebase";
import { UserProfile } from "@/src/types/user";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";
import { registerForPushNotificationsAsync } from "../../notifications/services/pushNotifications";

export function useAuthState() {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);

    const [authLoading, setAuthLoading] = useState(true);
    const [profileLoading, setProfileLoading] = useState(false);

    useEffect(() => {
        let unsubscribeProfile: (() => void) | undefined;

        const unsubscribeAuth = onAuthStateChanged(auth, (u) => {
            setUser(u);
            setProfile(null);

            // No authenticated user
            if (!u) {
                unsubscribeProfile?.();
                unsubscribeProfile = undefined;

                setProfileLoading(false);
                setAuthLoading(false);

                return;
            }
            // Register this device for push notifications
            registerForPushNotificationsAsync(u.uid)
                .catch((error) => {
                    console.error(
                        "Push notification registration failed:",
                        error
                    );
                });

            // User exists → listen to Firestore profile
            setProfileLoading(true);

            // Remove previous profile listener if any
            unsubscribeProfile?.();

            const ref = doc(db, "users", u.uid);

            unsubscribeProfile = onSnapshot(
                ref,
                (docSnap) => {
                    if (docSnap.exists()) {
                        setProfile(docSnap.data() as UserProfile);
                    } else {
                        // Profile hasn't been created yet
                        setProfile(null);
                    }

                    setProfileLoading(false);
                },
                (error) => {
                    console.error("PROFILE ERROR:", error);

                    setProfile(null);
                    setProfileLoading(false);
                },
            );

            setAuthLoading(false);
        });

        return () => {
            unsubscribeAuth();
            unsubscribeProfile?.();
        };
    }, []);

    return {
        user,
        profile,
        loading: authLoading || profileLoading,
    };
}
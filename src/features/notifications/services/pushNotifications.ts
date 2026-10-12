import Constants from "expo-constants";
import {
    deleteDoc,
    doc,
    serverTimestamp,
    setDoc,
} from "firebase/firestore";
import { Platform } from "react-native";

import { db } from "@/src/services/firebase";

export async function registerForPushNotificationsAsync(
    userId: string
) {
    // Web does not use native Expo push registration.
    if (Platform.OS === "web") {
        return null;
    }

    try {
        // Load native-only modules after checking the platform.
        const Device = await import("expo-device");
        const Notifications = await import("expo-notifications");

        if (!Device.isDevice) {
            console.log("Push notifications require a physical device.");
            return null;
        }

        const { status: existingStatus } =
            await Notifications.getPermissionsAsync();

        let finalStatus = existingStatus;

        if (existingStatus !== "granted") {
            const { status } =
                await Notifications.requestPermissionsAsync();

            finalStatus = status;
        }

        if (finalStatus !== "granted") {
            return null;
        }

        if (Device.osName === "Android") {
            await Notifications.setNotificationChannelAsync(
                "default",
                {
                    name: "3imarati",
                    importance: Notifications.AndroidImportance.MAX,
                    vibrationPattern: [0, 250, 250, 250],
                    sound: "default",
                }
            );
        }

        const projectId =
            Constants.expoConfig?.extra?.eas?.projectId ??
            Constants.easConfig?.projectId;

        if (!projectId) {
            throw new Error("EAS project ID not found.");
        }

        const token = (
            await Notifications.getExpoPushTokenAsync({
                projectId,
            })
        ).data;

        console.log("Expo Push Token:", token);

        const tokenId = encodeURIComponent(token);

        await setDoc(
            doc(db, "users", userId, "pushTokens", tokenId),
            {
                token,
                platform: Platform.OS,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            },
            { merge: true }
        );

        console.log("Push token saved successfully.");

        return token;
    } catch (error) {
        console.error("Push registration error:", error);
        return null;
    }
}

export async function removePushToken(userId: string) {
    if (Platform.OS === "web") {
        return;
    }

    try {
        const Device = await import("expo-device");
        const Notifications = await import("expo-notifications");

        if (!Device.isDevice) {
            return;
        }

        const projectId =
            Constants.expoConfig?.extra?.eas?.projectId ??
            Constants.easConfig?.projectId;

        if (!projectId) {
            console.log("EAS project ID not found.");
            return;
        }

        const token = (
            await Notifications.getExpoPushTokenAsync({
                projectId,
            })
        ).data;

        const tokenId = encodeURIComponent(token);

        await deleteDoc(
            doc(db, "users", userId, "pushTokens", tokenId)
        );

        console.log("Push token removed successfully.");
    } catch (error) {
        console.error("Push token removal error:", error);
    }
}

import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";

import {
    deleteDoc,
    doc,
    serverTimestamp,
    setDoc,
} from "firebase/firestore";

import { db } from "@/src/services/firebase";

export async function registerForPushNotificationsAsync(
    userId: string
) {
    try {
        // Push notifications require a physical device
        if (!Device.isDevice) {
            console.log(
                "Push notifications require a physical device."
            );
            return null;
        }

        // Check notification permission
        const { status: existingStatus } =
            await Notifications.getPermissionsAsync();

        let finalStatus = existingStatus;

        if (existingStatus !== "granted") {
            const { status } =
                await Notifications.requestPermissionsAsync();

            finalStatus = status;
        }

        // Android notification channel
        if (Device.osName === "Android") {
            await Notifications.setNotificationChannelAsync(
                "default",
                {
                    name: "3imarati",
                    importance:
                        Notifications.AndroidImportance.MAX,
                    vibrationPattern: [0, 250, 250, 250],
                    sound: "default",
                }
            );
        }

        // Get EAS project ID
        const projectId =
            Constants.expoConfig?.extra?.eas?.projectId ??
            Constants.easConfig?.projectId;

        if (!projectId) {
            throw new Error(
                "EAS project ID not found."
            );
        }

        // Get the real Expo Push Token
        const token =
            (
                await Notifications.getExpoPushTokenAsync({
                    projectId,
                })
            ).data;

        console.log(
            "Expo Push Token:",
            token
        );

        // Save the real token in Firestore
        const tokenId = encodeURIComponent(token);

        await setDoc(
            doc(
                db,
                "users",
                userId,
                "pushTokens",
                tokenId
            ),
            {
                token,
                platform: "android",
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            },
            { merge: true }
        );

        console.log(
            "Push token saved successfully."
        );

        return token;
    } catch (error) {
        console.error(
            "Push registration error:",
            error
        );

        return null;
    }
}

export async function removePushToken(userId: string) {
    try {
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
            doc(
                db,
                "users",
                userId,
                "pushTokens",
                tokenId
            )
        );

        console.log("Push token removed successfully.");
    } catch (error) {
        console.error(
            "Push token removal error:",
            error
        );
    }
}
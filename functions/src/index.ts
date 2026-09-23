import { Expo } from "expo-server-sdk";
import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { onDocumentCreated } from "firebase-functions/v2/firestore";

initializeApp();

const db = getFirestore();
const expo = new Expo();

/**
 * Get Expo push tokens for a list of users.
 */
async function getPushTokensForUsers(
    userIds: string[]
): Promise<string[]> {
    const tokens: string[] = [];

    for (const userId of userIds) {
        const snapshot = await db
            .collection("users")
            .doc(userId)
            .collection("pushTokens")
            .get();

        for (const doc of snapshot.docs) {
            const data = doc.data();

            if (
                typeof data.token === "string" &&
                Expo.isExpoPushToken(data.token)
            ) {
                tokens.push(data.token);
            }
        }
    }

    return [...new Set(tokens)];
}

/**
 * Send a push notification through Expo.
 */
async function sendPushNotification(
    tokens: string[],
    title: string,
    body: string,
    data: Record<string, unknown> = {}
): Promise<void> {
    if (tokens.length === 0) {
        console.log("No push tokens found.");
        return;
    }

    const messages = tokens.map((token) => ({
        to: token,
        title,
        body,
        data,
    }));

    const chunks = expo.chunkPushNotifications(messages);

    for (const chunk of chunks) {
        try {

            await expo.sendPushNotificationsAsync(chunk);

        } catch (error) {
            console.error(
                "Error sending Expo push notifications:",
                error
            );
        }
    }
}

/**
 * Get all approved users.
 */
async function getApprovedUserIds(): Promise<string[]> {
    const snapshot = await db
        .collection("users")
        .where("approved", "==", true)
        .get();

    return snapshot.docs.map((doc) => doc.id);
}

/**
 * Get Admin + SuperAdmin users.
 *
 * The app currently stores roles as an array:
 * roles: ["resident"]
 * roles: ["admin"]
 * roles: ["superAdmin"]
 */
async function getAdminIds(): Promise<string[]> {
    const snapshot = await db
        .collection("users")
        .get();

    const adminIds: string[] = [];

    for (const doc of snapshot.docs) {
        const data = doc.data();

        const roles = Array.isArray(data.roles)
            ? data.roles
            : [];

        if (
            roles.includes("admin") ||
            roles.includes("superAdmin")
        ) {
            adminIds.push(doc.id);
        }
    }

    return adminIds;
}



/* ============================================================
   📝 NEW COMPLAINT
   ============================================================ */

export const notifyNewComplaint = onDocumentCreated(
    "complaints/{complaintId}",
    async (event) => {
        const snapshot = event.data;

        if (!snapshot) {
            return;
        }

        const complaint = snapshot.data();

        const fullName =
            typeof complaint.createdByName === "string"
                ? complaint.createdByName
                : "Un résident";

        const userIds =
            await getApprovedUserIds();

        const tokens =
            await getPushTokensForUsers(userIds);

        await sendPushNotification(
            tokens,
            "Nouvelle réclamation",
            `${fullName} a ajouté une nouvelle réclamation`,
            {
                type: "new_complaint",
                complaintId: event.params.complaintId,
            }
        );
    }
);


/* ============================================================
   👤 NEW RESIDENT
   ============================================================ */

export const notifyNewResident = onDocumentCreated(
    "users/{userId}",
    async (event) => {
        const snapshot = event.data;

        if (!snapshot) {
            return;
        }

        const user = snapshot.data();

        const fullName =
            typeof user.fullName === "string"
                ? user.fullName
                : "Un nouveau résident";

        const roles = Array.isArray(user.roles)
            ? user.roles
            : [];

        // Only trigger this notification for residents.
        if (!roles.includes("resident")) {
            return;
        }

        const adminIds =
            await getAdminIds();

        const tokens =
            await getPushTokensForUsers(adminIds);

        await sendPushNotification(
            tokens,
            "Nouveau résident inscrit",
            `${fullName} vient de s'inscrire et attend votre approbation`,
            {
                type: "new_resident",
                userId: event.params.userId,
            }
        );
    }
);


/* ============================================================
   📢 NEW INFORMATION
   ============================================================ */

export const notifyNewInformation = onDocumentCreated(
    "notifications/{notificationId}",
    async (event) => {
        const snapshot = event.data;

        if (!snapshot) {
            return;
        }

        const notification = snapshot.data();

        const adminFullName =
            typeof notification.createdByName === "string"
                ? notification.createdByName
                : "L'administration";

        const userIds =
            await getApprovedUserIds();

        const tokens =
            await getPushTokensForUsers(userIds);

        await sendPushNotification(
            tokens,
            "Nouvelle information",
            `${adminFullName} a publié une nouvelle information`,
            {
                type: "new_information",
                notificationId:
                    event.params.notificationId,
            }
        );
    }
);
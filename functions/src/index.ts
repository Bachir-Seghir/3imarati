import { Expo } from "expo-server-sdk";
import { initializeApp } from "firebase-admin/app";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
import { onDocumentCreated, onDocumentUpdated } from "firebase-functions/v2/firestore";
import { onSchedule } from "firebase-functions/v2/scheduler";

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


export const generateMonthlyPayments = onSchedule(
    {
        schedule: "0 0 2 * *",
        timeZone: "Africa/Algiers",
    },
    async () => {
        console.log("Starting monthly payment generation...");

        // ============================================
        // GET PAYMENT SETTINGS
        // ============================================

        const settingsSnap = await db
            .collection("settings")
            .doc("payment")
            .get();

        if (!settingsSnap.exists) {
            console.error(
                "Payment settings document not found."
            );
            return;
        }

        const settings = settingsSnap.data();

        const monthlyAmount = settings?.monthlyAmount;

        if (
            typeof monthlyAmount !== "number" ||
            monthlyAmount <= 0
        ) {
            console.error(
                "Invalid monthly payment amount."
            );
            return;
        }

        // ============================================
        // CURRENT MONTH
        // ============================================

        const now = new Date();

        const month = `${now.getFullYear()}-${String(
            now.getMonth() + 1
        ).padStart(2, "0")}`;

        console.log(
            `Generating payments for ${month}`
        );

        // ============================================
        // GET APPROVED RESIDENTS
        // ============================================

        const residentsSnap = await db
            .collection("users")
            .where("approved", "==", true)
            .get();

        console.log(
            `Found ${residentsSnap.size} approved users.`
        );

        // ============================================
        // CREATE PAYMENTS
        // ============================================

        let createdCount = 0;
        let skippedCount = 0;

        for (const residentDoc of residentsSnap.docs) {
            const resident = residentDoc.data();

            const userId = residentDoc.id;

            // Deterministic payment document ID
            const paymentId = `${userId}_${month}`;

            const paymentRef = db
                .collection("payments")
                .doc(paymentId);

            const paymentSnap = await paymentRef.get();

            // Payment already exists
            if (paymentSnap.exists) {
                skippedCount++;
                continue;
            }

            await paymentRef.set({
                userId,
                month,
                amount: monthlyAmount,
                paid: false,
                paidAt: null,

                fullName:
                    typeof resident.fullName === "string"
                        ? resident.fullName
                        : "",

                floor: resident.floor ?? null,
                door: resident.door ?? null,

                createdAt: FieldValue.serverTimestamp(),
                paymentType: "monthly",
            });

            createdCount++;
        }

        console.log(
            `Monthly payment generation finished. Created: ${createdCount}, skipped: ${skippedCount}`
        );
    }
);

export const generatePaymentsForApprovedResident =
    onDocumentUpdated(
        "users/{userId}",
        async (event) => {
            const before = event.data?.before.data();
            const after = event.data?.after.data();

            if (!before || !after) {
                return;
            }

            // Run only when approved changes from false -> true
            if (
                before.approved === true ||
                after.approved !== true
            ) {
                return;
            }

            const userId = event.params.userId;

            console.log(
                `Generating missing payments for resident: ${userId}`
            );

            // ============================================================
            // GET PAYMENT SETTINGS
            // ============================================================

            const settingsSnap = await db
                .collection("settings")
                .doc("payment")
                .get();

            if (!settingsSnap.exists) {
                console.error(
                    "Payment settings document not found."
                );
                return;
            }

            const settings = settingsSnap.data();

            const monthlyAmount =
                settings?.monthlyAmount;

            const paymentStartMonth =
                settings?.paymentStartMonth;

            if (
                typeof monthlyAmount !== "number" ||
                monthlyAmount <= 0
            ) {
                console.error(
                    "Invalid monthly payment amount."
                );
                return;
            }

            if (
                typeof paymentStartMonth !== "string" ||
                !paymentStartMonth
            ) {
                console.error(
                    "Payment start month is not configured."
                );
                return;
            }

            // ============================================================
            // CURRENT MONTH
            // ============================================================

            const now = new Date();

            const currentMonth =
                `${now.getFullYear()}-${String(
                    now.getMonth() + 1
                ).padStart(2, "0")}`;

            // If payment system starts in the future,
            // there is nothing to generate.
            if (paymentStartMonth > currentMonth) {
                console.log(
                    `Payment start month ${paymentStartMonth} is after current month ${currentMonth}.`
                );
                return;
            }

            // ============================================================
            // GET EXISTING PAYMENTS FOR THIS RESIDENT
            // ============================================================

            const paymentsSnap = await db
                .collection("payments")
                .where("userId", "==", userId)
                .get();

            const existingMonths = new Set<string>();

            for (const paymentDoc of paymentsSnap.docs) {
                const payment = paymentDoc.data();

                if (
                    typeof payment.month === "string"
                ) {
                    existingMonths.add(payment.month);
                }
            }

            // ============================================================
            // GENERATE MISSING PAYMENTS
            // ============================================================

            const startDate = new Date(
                `${paymentStartMonth}-01T00:00:00`
            );

            const endDate = new Date(
                `${currentMonth}-01T00:00:00`
            );

            let currentDate = startDate;

            let createdCount = 0;
            let skippedCount = 0;

            while (currentDate <= endDate) {
                const month =
                    `${currentDate.getFullYear()}-${String(
                        currentDate.getMonth() + 1
                    ).padStart(2, "0")}`;

                // Payment already exists
                if (existingMonths.has(month)) {
                    skippedCount++;

                    currentDate.setMonth(
                        currentDate.getMonth() + 1
                    );

                    continue;
                }

                // Deterministic payment ID
                const paymentId =
                    `${userId}_${month}`;

                const paymentRef = db
                    .collection("payments")
                    .doc(paymentId);

                await paymentRef.set({
                    userId,
                    month,
                    amount: monthlyAmount,
                    paid: false,
                    paidAt: null,

                    fullName:
                        typeof after.fullName === "string"
                            ? after.fullName
                            : "",

                    floor: after.floor ?? null,
                    door: after.door ?? null,

                    createdAt:
                        FieldValue.serverTimestamp(),

                    paymentType: "monthly",
                });

                createdCount++;

                console.log(
                    `Created missing payment: ${paymentId}`
                );

                currentDate.setMonth(
                    currentDate.getMonth() + 1
                );
            }

            console.log(
                `Missing payment generation finished for ${userId}. ` +
                `Created: ${createdCount}, skipped: ${skippedCount}.`
            );
        }
    );
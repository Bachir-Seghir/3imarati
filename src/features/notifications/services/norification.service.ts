import { db } from "@/src/services/firebase";
import { addDoc, collection, deleteDoc, doc, onSnapshot, orderBy, query, serverTimestamp, updateDoc } from "firebase/firestore";
import { Notification } from "../types/notification";

/**
 * Subscribe to active notifications ordered by newest first
 */

export function subscribeNotifications(
    callback: (notifications: Notification[]) => void
) {
    const q = query(
        collection(db, "notifications"),
        orderBy('createdAt', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
        const notifications = snapshot.docs
            .map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }))
            .filter((n: any) => n.active !== false) as Notification[];

        callback(notifications)
    })
}

/**
 * Create notification
 */

export async function createNotification({
    title,
    description,
    category,
    createdById,
    createdByName
}: {
    title: string;
    description: string | null;
    category: 'Importante' | 'Info';
    createdById: string;
    createdByName: string;
}) {
    await addDoc(collection(db, "notifications"), {
        title,
        description,
        category,
        active: true,
        createdById,
        createdByName,

        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),

        expiresAt: null,
    })
}

/**
 * Update Notification
 */

export async function updateNotification(
    id: string,
    data: Partial<Notification>
) {
    await updateDoc(doc(db, "notifications", id), {
        ...data,
        updatedAt: serverTimestamp()
    })
}

/**
 * Soft delete Notification
 */

export async function hideNotification(
    id: string,
) {
    await updateDoc(doc(db, "notifications", id), {
        active: false,
        updatedAt: serverTimestamp()
    })
}

/**
 * Permanent delete 
 */

export async function deleteNotification(
    id: string,
) {
    await deleteDoc(doc(db, "notifications", id))
}
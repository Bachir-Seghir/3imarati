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
    imageUrl,
    description,
    category,
    createdById,
    createdByName
}: {
    title: string;
    imageUrl?: string | null;
    description: string | null;
    category: 'Importante' | 'Info';
    createdById: string;
    createdByName: string;
}) {
    await addDoc(collection(db, "notifications"), {
        title,
        imageUrl: imageUrl ?? null,
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
 * Permanent delete 
 */

export async function deleteNotification(
    id: string,
) {
    await deleteDoc(doc(db, "notifications", id))
}
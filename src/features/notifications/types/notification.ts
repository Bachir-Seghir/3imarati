import { Timestamp } from "firebase/firestore";

export type NotificationCategory =
    | 'Importante'
    | 'Info';

export type Notification = {
    id: string;
    imageUrl?: string | null;
    title: string;
    description?: string | null;
    category: NotificationCategory;

    active: boolean;

    createdById: string;
    createdByName: string;

    createdAt: Timestamp;
    updatedAt: Timestamp;

    expiresAt?: Timestamp | null;
}

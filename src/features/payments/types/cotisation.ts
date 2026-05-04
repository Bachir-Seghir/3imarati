import { Timestamp } from "firebase/firestore";

export type Cotisation = {
    id: string,
    amount: number;
    fullName: string;
    floor: number;
    door: number;
    createdBy: string;
    status: "pending" | "approved" | "rejected",
    createdAt: Timestamp,
    approvedAt: Timestamp | null,
}
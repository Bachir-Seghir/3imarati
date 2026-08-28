export type UserProfile = {
    email: string;
    fullName: string;
    phone: string;
    role: "resident" | "admin" | "budgetManager";
    floor: number;
    door: number;
    identityImage: string | null;
    approved: boolean;
    createdAt: any; // Firestore timestamp
};
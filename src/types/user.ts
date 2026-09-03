export type UserRole =
    "resident" | "admin" | "budgetManager" | "superAdmin";


export type UserProfile = {
    email: string;
    fullName: string;
    phone: string;
    roles: UserRole[];
    floor: number;
    door: number;
    identityImage: string | null;
    approved: boolean;
    createdAt: any; // Firestore timestamp
};
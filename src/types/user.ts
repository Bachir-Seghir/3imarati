export type UserProfile = {
    email: string;
    fullName: string;
    role: "resident" | "admin";
    floor: number;
    door: number;
    identityImage: string | null;
    approved: boolean;
    createdAt: any; // Firestore timestamp
};
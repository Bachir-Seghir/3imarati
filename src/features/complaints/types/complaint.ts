export type Complaint = {
    id: string;
    userId: string;
    title: string;
    userName: string;
    floor: number;
    door: number;

    description: string;

    category: "Maintenance" | "Bruit" | "Nettoyage" | "Securité" | "Autre";

    status: "En Attente" | "En Traitement" | "Résolue";

    priority: "Normale" | "Importante";

    imageUrl?: string | null;

    createdAt: any;
    updatedAt: any;
};
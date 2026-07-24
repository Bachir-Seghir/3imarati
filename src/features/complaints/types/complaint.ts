export type Complaint = {
    id: string;
    userId: string;
    title: string;
    userName: string;
    floor: number;
    door: number;

    assignedToId?: string | null;
    assignedToName?: string | null;
    assignedAt?: any;

    description: string;

    category: "Maintenance" | "Bruit" | "Nettoyage" | "Securité" | "Autre";

    status: "En_Attente" | "En_Traitement" | "Validée" | "Résolue";

    priority: "Normale" | "Importante";

    imageUrl?: string | null;

    createdAt: any;
    updatedAt: any;
};
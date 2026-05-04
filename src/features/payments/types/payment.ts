export type Payment = {
    id?: string;
    userId: string;
    month: string;
    amount: number;
    paid: boolean;
    fullName: string;
    floor: string;
    door: string;
    paidAt: any | null;
};
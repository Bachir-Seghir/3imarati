export type Payment = {
    id: string;

    userId: string;

    fullName: string;

    floor: number;

    door: number;

    month: string;

    amount: number;

    paid: boolean;

    paidAt: any;

    createdAt?: any;

    updatedAt?: any;

    paymentType?: "monthly" | "advance";
};
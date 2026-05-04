export type BudgetRequest = {
    approvedAt: any;
    id: string;
    amount: number;
    status: "pending" | "approved" | "rejected";
    createdBy: string;
};
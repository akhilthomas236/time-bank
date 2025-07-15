export interface UserCredits {
    id?: string;
    userId: string;
    userName: string;
    totalCredits: number;
    lastUpdated: Date;
}

export interface RedemptionHistory {
    id?: string;
    userId: string;
    userName: string;
    benefit: string;
    creditsSpent: number;
    dateRedeemed: Date;
    status: "Pending" | "Approved" | "Rejected" | "Completed";
}

export interface Benefit {
    name: string;
    description: string;
    creditsRequired: number;
    category: "Family" | "Wellness" | "Professional" | "Team";
    isActive: boolean;
}

export interface Admin {
    id: number;
    name: string;
    email: string;
    role: string;
    createdAt: Date;
    updatedAt: Date;
    balance: number;
    isActive: boolean;
}


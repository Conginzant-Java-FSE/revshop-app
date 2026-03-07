export interface Wallet {
    walletId: number;
    balance: number;
    isActive: boolean;
    kycVerified: boolean;
    mobileNumber?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface WalletTransaction {
    transactionId: number;
    amount: number;
    transactionType: 'CREDIT' | 'DEBIT';
    description: string;
    referenceId: string;
    createdAt: string;
}

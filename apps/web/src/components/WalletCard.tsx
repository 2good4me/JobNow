import React from 'react';

interface WalletCardProps {
    balance: number;
    currency?: string;
}

export const WalletCard: React.FC<WalletCardProps> = ({ balance, currency = 'VND' }) => {
    const formattedBalance = new Intl.NumberFormat('vi-VN').format(balance);
    
    return (
        <div className="p-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-lg">
            <h3 className="text-sm font-medium opacity-80">Số dư khả dụng</h3>
            <div className="text-2xl font-bold mt-1">
                {formattedBalance} <span className="text-lg font-normal">{currency}</span>
            </div>
        </div>
    );
};

import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { ArrowLeft, Wallet, ArrowUpRight, ArrowDownLeft, CreditCard, TrendingUp, Plus } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useWalletBalance, useTransactionHistory } from '@/features/wallet/hooks/useWallet';
import { DepositBottomSheet } from './-components/wallet/DepositBottomSheet';
import { WithdrawBottomSheet } from './-components/wallet/WithdrawBottomSheet';


export const Route = createFileRoute('/employer/wallet')({
  component: EmployerWalletPage,
});

function EmployerWalletPage() {
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const userId = userProfile?.uid;
  
  const [showDepositSheet, setShowDepositSheet] = useState(false);
  const [showWithdrawSheet, setShowWithdrawSheet] = useState(false);
  const { data: balance = 0, isLoading: isBalanceLoading } = useWalletBalance(userId);
  const { data: transactions = [], isLoading: isTxLoading } = useTransactionHistory(userId);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

  const typeConfig: Record<string, { icon: React.ReactNode; color: string; label: string; sign: string }> = {
    DEPOSIT: { icon: <ArrowDownLeft className="h-5 w-5" />, color: 'text-emerald-500 bg-emerald-50', label: 'Nạp tiền', sign: '+' },
    WITHDRAW: { icon: <ArrowUpRight className="h-5 w-5" />, color: 'text-red-500 bg-red-50', label: 'Rút tiền', sign: '-' },
    PAYMENT: { icon: <CreditCard className="h-5 w-5" />, color: 'text-blue-500 bg-blue-50', label: 'Thanh toán', sign: '-' },
    REFUND: { icon: <ArrowDownLeft className="h-5 w-5" />, color: 'text-violet-500 bg-violet-50', label: 'Hoàn tiền', sign: '+' },
  };

  const statusLabel: Record<string, string> = {
    PENDING: '⏳ Đang xử lý',
    COMPLETED: '✅ Thành công',
    FAILED: '❌ Thất bại',
  };

  const timeAgo = (date: Date) => {
    const diffMs = Date.now() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins} phút trước`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} giờ trước`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 30) return `${diffDays} ngày trước`;
    return date.toLocaleDateString('vi-VN');
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 pb-24 max-w-lg mx-auto w-full relative shadow-sm">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-white shadow-xl">
        {/* Header with balance */}
        <header className="bg-gradient-to-br from-[#1e3a5f] to-[#2d5a8e] text-white pb-6">
          <div className="flex items-center justify-between p-4">
            <button onClick={() => navigate({ to: '/employer' })} className="p-2 -ml-2 rounded-full hover:bg-white/10 transition cursor-pointer" type="button">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-lg font-bold">Ví của tôi</h1>
            <div className="w-9" />
          </div>

          <div className="px-6 text-center">
            <p className="text-white/60 text-xs font-medium uppercase tracking-wider mb-1">Số dư hiện tại</p>
            {isBalanceLoading ? (
              <div className="h-10 w-40 mx-auto bg-white/10 rounded-lg animate-pulse" />
            ) : (
              <p className="text-3xl font-extrabold tracking-tight">{formatCurrency(balance)}</p>
            )}
          </div>

          {/* Quick Actions */}
          <div className="flex gap-3 px-6 mt-5">
            <button
              type="button"
              onClick={() => setShowDepositSheet(true)}
              className="flex-1 flex items-center justify-center gap-2 bg-white/15 hover:bg-white/25 backdrop-blur-sm rounded-xl py-3 text-sm font-semibold transition cursor-pointer"
            >
              <Plus className="h-4 w-4" /> Nạp tiền
            </button>
            <button
              type="button"
              onClick={() => setShowWithdrawSheet(true)}
              className="flex-1 flex items-center justify-center gap-2 bg-white/15 hover:bg-white/25 backdrop-blur-sm rounded-xl py-3 text-sm font-semibold transition cursor-pointer"
            >
              <ArrowUpRight className="h-4 w-4" /> Rút tiền
            </button>
          </div>
        </header>

        {/* Transaction History */}
        <section className="flex-1 bg-slate-50">
          <div className="px-4 py-3 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Lịch sử giao dịch</h2>
            <TrendingUp className="h-4 w-4 text-slate-400" />
          </div>

          {isTxLoading ? (
            <div className="flex items-center justify-center py-10">
              <div className="w-6 h-6 rounded-full border-2 border-blue-200 border-t-blue-600 animate-spin"></div>
            </div>
          ) : transactions.length === 0 ? (
            <div className="py-16 text-center bg-white mx-4 rounded-xl border border-slate-100">
              <Wallet className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <p className="text-sm text-slate-500">Chưa có giao dịch nào</p>
            </div>
          ) : (
            <div className="bg-white mx-4 rounded-xl border border-slate-100 divide-y divide-slate-50 overflow-hidden">
              {transactions.map((tx) => {
                const config = typeConfig[tx.type] || typeConfig.PAYMENT;
                return (
                  <div key={tx.id} className="flex items-center gap-3 p-3.5">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${config.color}`}>
                      {config.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-slate-800 truncate">{tx.description || config.label}</p>
                        <p className={`text-sm font-bold ml-2 shrink-0 ${config.sign === '+' ? 'text-emerald-600' : 'text-slate-800'}`}>
                          {config.sign}{formatCurrency(tx.amount)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[11px] text-slate-400">{timeAgo(tx.createdAt)}</span>
                        <span className="text-[11px]">{statusLabel[tx.status]}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* Bottom Sheets */}
      {userId && (
        <>
          <DepositBottomSheet
            isOpen={showDepositSheet}
            onClose={() => setShowDepositSheet(false)}
            userId={userId}
          />
          <WithdrawBottomSheet
            isOpen={showWithdrawSheet}
            onClose={() => setShowWithdrawSheet(false)}
            userId={userId}
            balance={balance}
          />
        </>
      )}
    </div>
  );
}

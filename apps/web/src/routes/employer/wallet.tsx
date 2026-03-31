import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useWalletBalance, useTransactionHistory } from '@/features/wallet/hooks/useWallet';
import {
  ArrowLeft,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Clock,
  RefreshCw,
  CreditCard,
  PlusCircle,
  History
} from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useState } from 'react';
import { DepositBottomSheet } from './-components/wallet/DepositBottomSheet';
import { WithdrawBottomSheet } from './-components/wallet/WithdrawBottomSheet';

export const Route = createFileRoute('/employer/wallet')({
  component: EmployerWalletPage,
});

function EmployerWalletPage() {
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const userId = userProfile?.uid;
  const { data: balance = 0, isLoading: isLoadingBalance, refetch: refetchBalance } = useWalletBalance(userId);
  const { data: transactions = [], isLoading: isLoadingTx, refetch: refetchTx } = useTransactionHistory(userId);

  const [showDepositSheet, setShowDepositSheet] = useState(false);
  const [showWithdrawSheet, setShowWithdrawSheet] = useState(false);

  const handleRefresh = () => {
    refetchBalance();
    refetchTx();
  };

  return (
    <div className="flex flex-col min-h-[100dvh] bg-[#F5F7FF] pb-[calc(72px+env(safe-area-inset-bottom))] font-sans relative">
      {/* ── Gradient Header ── */}
      <div className="bg-gradient-to-br from-[#1e3a5f] to-[#1e40af] px-5 pt-10 md:pt-14 pb-16 lg:rounded-b-[3rem] shadow-md relative z-10 overflow-hidden transition-all">
        <div className="max-w-4xl mx-auto">
        {/* Background decorations */}
        <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/5 rounded-full blur-2xl" />
        <div className="absolute top-20 -left-10 w-32 h-32 bg-[#1e40af]/30 rounded-full blur-2xl" />

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={() => navigate({ to: '/employer' })}
              className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white/90 hover:bg-white/20 transition-colors shadow-sm backdrop-blur-sm"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold text-white tracking-tight drop-shadow-sm">Ví của tôi</h1>
            <button
              onClick={handleRefresh}
              className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white/90 hover:bg-white/20 transition-colors shadow-sm backdrop-blur-sm"
            >
              <RefreshCw className={`w-4 h-4 ${(isLoadingBalance || isLoadingTx) ? 'animate-spin border-transparent' : ''}`} />
            </button>
          </div>

          <div className="flex flex-col items-center">
            <p className="text-white/70 text-[11px] font-bold uppercase tracking-[0.15em] mb-1.5 drop-shadow-sm">Số dư hiện tại</p>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-extrabold text-white drop-shadow-md">{balance.toLocaleString()}</span>
              <span className="text-xl font-bold text-white/70">VNĐ</span>
            </div>

            <div className="mt-8 flex gap-3 w-full max-w-[320px]">
              <button
                onClick={() => setShowDepositSheet(true)}
                className="flex-1 bg-white text-[#1e3a5f] py-3.5 px-4 rounded-2xl font-black text-sm shadow-[0_8px_16px_rgba(255,255,255,0.15)] active:scale-95 transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer"
              >
                <PlusCircle className="w-5 h-5" />
                Nạp tiền
              </button>
              <button
                onClick={() => setShowWithdrawSheet(true)}
                className="flex-1 bg-white/15 backdrop-blur-md border border-white/20 text-white py-3.5 px-4 rounded-2xl font-bold text-sm shadow-sm active:scale-95 transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer hover:bg-white/20"
              >
                <CreditCard className="w-5 h-5" />
                Rút tiền
              </button>
            </div>
          </div>
        </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="flex-1 w-full max-w-[800px] mx-auto px-5 -mt-8 relative z-40 space-y-6">

        {/* Quick Actions / Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-[#1e3a5f] uppercase tracking-wider mb-0.5">Thu nhập</p>
              <p className="text-[14px] font-black text-slate-400">0đ</p>
            </div>
          </div>
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
              <TrendingDown className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-[#1e3a5f] uppercase tracking-wider mb-0.5">Chi tiêu</p>
              <p className="text-[14px] font-black text-slate-400">0đ</p>
            </div>
          </div>
        </div>

        {/* Transaction History */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="flex items-center gap-1.5 text-[15px] font-black text-[#1e3a5f]">
              Lịch sử giao dịch
            </h3>
            <span className="text-[10px] font-bold text-[#1e40af] bg-white px-2.5 py-1 rounded-md shadow-sm border border-slate-100 uppercase tracking-wider">Mới nhất</span>
          </div>

          <div className="space-y-3">
            {isLoadingTx ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 flex items-center gap-4 animate-pulse">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100" />
                  <div className="flex-1 space-y-2">
                     <div className="h-4 bg-slate-100 rounded w-1/2" />
                     <div className="h-3 bg-slate-100 rounded w-1/3" />
                  </div>
                  <div className="h-5 bg-slate-100 rounded w-16" />
                </div>
              ))
            ) : transactions.length === 0 ? (
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center mb-4">
                  <History className="w-7 h-7 text-slate-300" />
                </div>
                <p className="text-[15px] font-bold text-[#1e3a5f] mb-1">Chưa có giao dịch</p>
                <p className="text-[13px] text-slate-400 font-medium">Lịch sử thanh toán và nạp tiền sẽ được hiển thị tại đây.</p>
              </div>
            ) : (
              transactions.map((tx) => (
                <div key={tx.id} className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 flex items-center gap-4 active:scale-[0.98] transition-all cursor-pointer hover:shadow-md">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${tx.type === 'DEPOSIT' || tx.type === 'REFUND'
                    ? 'bg-emerald-50 text-emerald-600 border-emerald-100/50'
                    : 'bg-rose-50 text-rose-600 border-rose-100/50'
                    }`}>
                    {tx.type === 'DEPOSIT' || tx.type === 'REFUND' ? <TrendingUp className="w-6 h-6" /> : <TrendingDown className="w-6 h-6" />}
                  </div>

                  <div className="flex-1 min-w-0 pr-2">
                     <p className="text-[15px] font-bold text-[#1e3a5f] truncate mb-0.5">{tx.description || (tx.type === 'DEPOSIT' ? 'Nạp tiền vào ví' : 'Giao dịch thanh toán')}</p>
                     <p className="text-[12px] text-slate-500 font-medium flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {format(tx.createdAt, 'HH:mm • dd/MM/yyyy', { locale: vi })}
                     </p>
                  </div>

                  <div className="text-right flex flex-col items-end gap-1">
                    <p className={`text-[15px] font-black ${tx.type === 'DEPOSIT' || tx.type === 'REFUND' ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {tx.type === 'DEPOSIT' || tx.type === 'REFUND' ? '+' : '-'}{Math.abs(tx.amount).toLocaleString()}đ
                    </p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm uppercase tracking-wider ${tx.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                      {tx.status === 'COMPLETED' ? 'Thành công' : 'Đang xử lý'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Support Card */}
        <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-3xl p-6 shadow-lg shadow-indigo-200 relative overflow-hidden mt-6 mb-8 group cursor-pointer hover:shadow-indigo-300 transition-shadow">
          <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/10 rounded-full transition-transform group-hover:scale-110" />
          <div className="relative z-10 flex items-center justify-between">
            <div className="pr-4">
              <h4 className="text-white font-black mb-1.5 text-[15px]">Cần hỗ trợ về thanh toán?</h4>
              <p className="text-indigo-100 text-[13px] font-medium leading-relaxed max-w-[200px]">Liên hệ ngay với CSKH để được giải đáp thắc mắc.</p>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); navigate({ to: '/support-center' }); }}
              className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-indigo-600 shrink-0 shadow-lg group-hover:scale-105 transition-transform"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>
        
        {/* SPACING AT BOTTOM */}
        <div className="h-4" />
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

import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useWalletBalance, useTransactionHistory } from '@/features/wallet/hooks/useWallet';
import { 
  ArrowDownLeft,
  ArrowUpRight,
  ArrowUpFromLine,
  ChevronRight,
  Clock,
  WalletCards,
  PlusCircle,
  TrendingUp,
  CreditCard
} from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useState } from 'react';
import { WithdrawBottomSheet } from './-components/wallet/WithdrawBottomSheet';
import { toast } from 'sonner';

export const Route = createFileRoute('/candidate/wallet')({
  component: CandidateWalletPage,
});

function CandidateWalletPage() {
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const userId = userProfile?.uid;
  const { data: balance = 0 } = useWalletBalance(userId);
  const { data: transactions = [], isLoading: isLoadingTx } = useTransactionHistory(userId);

  const [showWithdrawSheet, setShowWithdrawSheet] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'INCOME' | 'WITHDRAW'>('ALL');
  const [timeFilter, setTimeFilter] = useState<'MONTH' | 'ALL'>('ALL');

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const isIncomeTransaction = (type: string) => ['DEPOSIT', 'PAYMENT', 'REFUND', 'SALARY', 'INCOME'].includes(type.toUpperCase());
  const isWithdrawTransaction = (type: string) => type === 'WITHDRAW';

  const monthlyIncome = transactions.reduce((sum, tx) => {
    if (!isIncomeTransaction(tx.type) || tx.status !== 'COMPLETED') return sum;
    if (timeFilter === 'MONTH' && tx.createdAt < startOfMonth) return sum;
    return sum + Math.abs(tx.amount);
  }, 0);

  const pendingAmount = transactions.reduce((sum, tx) => {
    if (tx.status !== 'PENDING') return sum;
    if (timeFilter === 'MONTH' && tx.createdAt < startOfMonth) return sum;
    return sum + Math.abs(tx.amount);
  }, 0);

  const withdrawnAmount = transactions.reduce((sum, tx) => {
    if (!isWithdrawTransaction(tx.type) || tx.status !== 'COMPLETED') return sum;
    if (timeFilter === 'MONTH' && tx.createdAt < startOfMonth) return sum;
    return sum + Math.abs(tx.amount);
  }, 0);

  const filteredTransactions = transactions.filter((tx) => {
    if (activeFilter === 'INCOME') return isIncomeTransaction(tx.type);
    if (activeFilter === 'WITHDRAW') return isWithdrawTransaction(tx.type);
    return true;
  });


  const formatAmount = (amount: number) => `${amount.toLocaleString('vi-VN')}đ`;

  return (
    <div className="min-h-[100dvh] bg-[#f7f9fb] pb-[calc(84px+env(safe-area-inset-bottom))] text-slate-900">
      <div className="mx-auto w-full max-w-lg px-5 pt-12">
        <div className="mb-5" />

        <section className="relative overflow-hidden rounded-[32px] bg-[#0f172a] p-1 shadow-[0_32px_64px_-16px_rgba(15,23,42,0.3)]">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-transparent to-indigo-600/20" />
          
          <div className="relative rounded-[31px] bg-gradient-to-br from-[#1e293b] to-[#0f172a] p-7 overflow-hidden">
            {/* Decorative background elements */}
            <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-blue-500/10 blur-3xl" />
            <div className="absolute -left-12 bottom-0 h-32 w-32 rounded-full bg-indigo-500/10 blur-3xl" />
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
                  <WalletCards className="h-4 w-4 text-blue-400" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60">Main Balance</span>
                </div>
                <CreditCard className="h-6 w-6 text-white/20" />
              </div>
  
              <div className="flex items-baseline gap-2">
                <span className="text-[44px] font-black leading-none tracking-tight text-white">
                  {balance.toLocaleString('vi-VN')}
                </span>
                <span className="text-xl font-bold text-white/50">VND</span>
              </div>
  
              <div className="mt-8 grid grid-cols-2 gap-3">
                <button
                  onClick={() => setShowWithdrawSheet(true)}
                  className="group relative flex items-center justify-center gap-2 rounded-2xl bg-white px-4 py-4 text-sm font-black text-[#0f172a] transition-all active:scale-95 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  <ArrowUpFromLine className="relative h-4 w-4" />
                  <span className="relative">Rút tiền</span>
                </button>
                <button
                  onClick={() => toast.info('Tính năng nạp tiền đang được phát triển')}
                  className="flex items-center justify-center gap-2 rounded-2xl bg-white/10 border border-white/10 px-4 py-4 text-sm font-bold text-white backdrop-blur-md transition-all active:scale-95"
                >
                  <PlusCircle className="h-4 w-4 text-blue-400" />
                  <span>Nạp tiền</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ── Filter Tab ── */}
        <section className="mt-4 px-1">
          <div className="bg-white/80 backdrop-blur-xl p-1 rounded-2xl shadow-sm border border-slate-200/60 flex gap-1">
            <button
              onClick={() => setTimeFilter('ALL')}
              className={`flex-1 py-2 rounded-xl text-[12px] font-black transition-all ${
                timeFilter === 'ALL' 
                  ? 'bg-[#0f172a] text-white shadow-md' 
                  : 'text-slate-400'
              }`}
            >
              Tất cả
            </button>
            <button
              onClick={() => setTimeFilter('MONTH')}
              className={`flex-1 py-2 rounded-xl text-[12px] font-black transition-all ${
                timeFilter === 'MONTH' 
                  ? 'bg-[#0f172a] text-white shadow-md' 
                  : 'text-slate-400'
              }`}
            >
              Tháng này
            </button>
          </div>
        </section>

        <section className="mt-5 grid grid-cols-3 gap-3">
          <div className="rounded-[24px] bg-white p-4 shadow-sm border border-slate-100 flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center mb-3">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-slate-400">Thu nhập</p>
            <p className="mt-1 text-[13px] font-black text-emerald-600">
              {monthlyIncome > 0 ? '+' : ''}{formatAmount(monthlyIncome)}
            </p>
          </div>
          <div className="rounded-[24px] bg-white p-4 shadow-sm border border-slate-100 flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center mb-3">
              <Clock className="w-4 h-4 text-amber-600" />
            </div>
            <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-slate-400">Chờ duyệt</p>
            <p className="mt-1 text-[13px] font-black text-amber-500">{formatAmount(pendingAmount)}</p>
          </div>
          <div className="rounded-[24px] bg-white p-4 shadow-sm border border-slate-100 flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center mb-3">
              <ArrowUpFromLine className="w-4 h-4 text-slate-600" />
            </div>
            <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-slate-400">Đã rút</p>
            <p className="mt-1 text-[13px] font-black text-slate-700">{formatAmount(withdrawnAmount)}</p>
          </div>
        </section>

        <section id="wallet-transactions" className="mt-7 space-y-4">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">Wallet Ledger</p>
              <h2 className="mt-1 text-[20px] font-black tracking-tight text-slate-900">Lịch sử giao dịch</h2>
            </div>
            <button
              onClick={() => setActiveFilter('ALL')}
              className="text-sm font-bold text-[#0369a1]"
            >
              Xem tất cả
            </button>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1">
            {[
              { key: 'ALL', label: 'Tất cả' },
              { key: 'INCOME', label: 'Nhận lương' },
              { key: 'WITHDRAW', label: 'Rút tiền' },
            ].map((chip) => (
              <button
                key={chip.key}
                onClick={() => setActiveFilter(chip.key as 'ALL' | 'INCOME' | 'WITHDRAW')}
                className={`shrink-0 rounded-full px-4 py-2 text-[13px] font-bold transition-colors ${
                  activeFilter === chip.key
                    ? 'bg-[#0f172a] text-white'
                    : 'bg-white text-slate-500 shadow-sm shadow-slate-200/60'
                }`}
              >
                {chip.label}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {isLoadingTx ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 rounded-[24px] bg-white p-4 shadow-[0_12px_32px_rgba(15,23,42,0.06)] animate-pulse">
                  <div className="h-12 w-12 rounded-full bg-slate-100" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-1/2 rounded bg-slate-100" />
                    <div className="h-3 w-1/3 rounded bg-slate-100" />
                  </div>
                  <div className="h-4 w-16 rounded bg-slate-100" />
                </div>
              ))
            ) : filteredTransactions.length === 0 ? (
              <div className="rounded-[28px] bg-white px-6 py-10 text-center shadow-[0_12px_32px_rgba(15,23,42,0.06)]">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-300">
                  <Clock className="h-8 w-8" />
                </div>
                <h3 className="mt-4 text-lg font-black tracking-tight text-slate-900">Chưa có giao dịch nào</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">
                  Hoàn thành ca làm để nhận lương đầu tiên hoặc thử đổi bộ lọc để xem giao dịch khác.
                </p>
              </div>
            ) : (
              filteredTransactions.map((tx) => {
                const incomeTypes = ['DEPOSIT', 'PAYMENT', 'REFUND', 'SALARY', 'INCOME'];
                const isIncome = incomeTypes.includes(tx.type.toUpperCase()) || tx.amount > 0;
                const isPending = tx.status === 'PENDING';

                return (
                  <div
                    key={tx.id}
                    onClick={() => navigate({ 
                      to: '/candidate/wallet_/transactions/$transactionId' as any, 
                      params: { transactionId: tx.id } as any
                    })}
                    className="group flex items-center gap-4 rounded-[28px] bg-white p-4 shadow-sm border border-slate-100 transition-all active:scale-[0.98] cursor-pointer hover:border-blue-200"
                  >
                    <div
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl transition-colors ${
                        isIncome ? 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100' : 'bg-rose-50 text-rose-600 group-hover:bg-rose-100'
                      }`}
                    >
                      {isIncome ? <ArrowDownLeft className="h-6 w-6" /> : <ArrowUpRight className="h-6 w-6" />}
                    </div>
 
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[15px] font-bold text-slate-900 leading-tight">{tx.description || 'Giao dịch ví'}</p>
                      <div className="mt-1.5 flex items-center gap-2">
                        <span className="text-[11px] font-medium text-slate-400">
                          {format(tx.createdAt, 'HH:mm, dd MMM', { locale: vi })}
                        </span>
                        <div
                          className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            isPending ? 'bg-amber-50 text-amber-600' : 
                            tx.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600' : 
                            'bg-rose-50 text-rose-600'
                          }`}
                        >
                           <div className={`w-1.5 h-1.5 rounded-full ${
                             isPending ? 'bg-amber-500' : 
                             tx.status === 'COMPLETED' ? 'bg-emerald-500' : 
                             'bg-rose-500'
                           }`} />
                           {isPending ? 'Processing' : tx.status === 'COMPLETED' ? 'Success' : 'Failed'}
                        </div>
                      </div>
                    </div>
 
                    <div className="text-right">
                      <p className={`text-[16px] font-black tracking-tight ${isIncome ? 'text-emerald-600' : 'text-slate-900'}`}>
                        {isIncome ? '+' : '-'}{formatAmount(Math.abs(tx.amount))}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        <section className="mt-7 rounded-[28px] bg-[#0f172a] px-5 py-5 text-white shadow-[0_24px_60px_rgba(15,23,42,0.18)]">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/50">Support</p>
              <h3 className="mt-1 text-[18px] font-black tracking-tight">Cần hỗ trợ thanh toán?</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/65">
                Đội ngũ CSKH sẽ hỗ trợ khi giao dịch rút tiền bị chậm hoặc cần xác minh thêm.
              </p>
            </div>
            <button
              onClick={() => navigate({ to: '/support-center' })}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-[#0f172a]"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </section>
      </div>

      {userId && (
        <WithdrawBottomSheet 
          isOpen={showWithdrawSheet}
          onClose={() => setShowWithdrawSheet(false)}
          userId={userId}
          balance={balance}
        />
      )}
    </div>
  );
}

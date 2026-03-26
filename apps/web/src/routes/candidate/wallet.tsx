import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useWalletBalance, useTransactionHistory } from '@/features/wallet/hooks/useWallet';
import { 
  ArrowDownLeft,
  ArrowUpRight,
  ArrowUpFromLine,
  ChevronRight,
  Clock,
  History,
  WalletCards,
} from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useState } from 'react';
import { WithdrawBottomSheet } from './-components/wallet/WithdrawBottomSheet';

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

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const isIncomeTransaction = (type: string) => ['DEPOSIT', 'PAYMENT', 'REFUND'].includes(type);
  const isWithdrawTransaction = (type: string) => type === 'WITHDRAW';

  const monthlyIncome = transactions.reduce((sum, tx) => {
    if (!isIncomeTransaction(tx.type) || tx.status !== 'COMPLETED') return sum;
    if (tx.createdAt < startOfMonth) return sum;
    return sum + Math.abs(tx.amount);
  }, 0);

  const pendingAmount = transactions.reduce((sum, tx) => {
    if (tx.status !== 'PENDING') return sum;
    return sum + Math.abs(tx.amount);
  }, 0);

  const withdrawnAmount = transactions.reduce((sum, tx) => {
    if (!isWithdrawTransaction(tx.type) || tx.status !== 'COMPLETED') return sum;
    return sum + Math.abs(tx.amount);
  }, 0);

  const filteredTransactions = transactions.filter((tx) => {
    if (activeFilter === 'INCOME') return isIncomeTransaction(tx.type);
    if (activeFilter === 'WITHDRAW') return isWithdrawTransaction(tx.type);
    return true;
  });

  const scrollToTransactions = () => {
    document.getElementById('wallet-transactions')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const formatAmount = (amount: number) => `${amount.toLocaleString('vi-VN')}đ`;

  return (
    <div className="min-h-[100dvh] bg-[#f7f9fb] pb-[calc(84px+env(safe-area-inset-bottom))] text-slate-900">
      <div className="mx-auto w-full max-w-lg px-5 pt-12">
        <div className="mb-5" />

        <section className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-[#0f172a] via-[#15345e] to-[#0369a1] p-6 text-white shadow-[0_24px_80px_rgba(15,23,42,0.22)]">
          <div className="absolute -right-12 -top-10 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute bottom-0 left-0 h-28 w-28 rounded-full bg-sky-300/10 blur-2xl" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.18em] text-white/70">
              <WalletCards className="h-4 w-4" />
              <span>Số dư khả dụng</span>
            </div>

            <div className="mt-4 flex items-end gap-2">
              <span className="text-[38px] font-black leading-none tracking-[-0.04em]">
                {balance.toLocaleString('vi-VN')}
              </span>
              <span className="pb-1 text-xl font-bold text-white/70">đ</span>
            </div>

            <p className="mt-3 max-w-[240px] text-[13px] leading-relaxed text-white/70">
              Theo dõi số dư, trạng thái thanh toán ca làm và rút tiền về tài khoản của bạn.
            </p>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                onClick={() => setShowWithdrawSheet(true)}
                className="flex items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3.5 text-sm font-bold text-[#0f172a] shadow-lg shadow-black/10 active:scale-[0.98]"
              >
                <ArrowUpFromLine className="h-4 w-4" />
                Rút tiền
              </button>
              <button
                onClick={scrollToTransactions}
                className="flex items-center justify-center gap-2 rounded-2xl bg-white/12 px-4 py-3.5 text-sm font-bold text-white backdrop-blur-md active:scale-[0.98]"
              >
                <History className="h-4 w-4" />
                Lịch sử
              </button>
            </div>
          </div>
        </section>

        <section className="mt-5 grid grid-cols-3 gap-3">
          <div className="rounded-[24px] bg-white p-4 text-center shadow-[0_12px_32px_rgba(15,23,42,0.06)]">
            <p className="whitespace-nowrap text-[9px] font-bold uppercase leading-none tracking-[0.14em] text-slate-400">
              Tháng này
            </p>
            <p className="mt-3 whitespace-nowrap text-[14px] font-black tracking-tight text-emerald-600">+{formatAmount(monthlyIncome)}</p>
          </div>
          <div className="rounded-[24px] bg-white p-4 text-center shadow-[0_12px_32px_rgba(15,23,42,0.06)]">
            <p className="whitespace-nowrap text-[9px] font-bold uppercase leading-none tracking-[0.14em] text-slate-400">
              Đang chờ
            </p>
            <p className="mt-3 whitespace-nowrap text-[14px] font-black tracking-tight text-amber-500">{formatAmount(pendingAmount)}</p>
          </div>
          <div className="rounded-[24px] bg-white p-4 text-center shadow-[0_12px_32px_rgba(15,23,42,0.06)]">
            <p className="whitespace-nowrap text-[9px] font-bold uppercase leading-none tracking-[0.14em] text-slate-400">
              Đã rút
            </p>
            <p className="mt-3 whitespace-nowrap text-[14px] font-black tracking-tight text-slate-700">{formatAmount(withdrawnAmount)}</p>
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
                const isIncome = isIncomeTransaction(tx.type);
                const isPending = tx.status === 'PENDING';

                return (
                  <div
                    key={tx.id}
                    className="flex items-center gap-4 rounded-[24px] bg-white p-4 shadow-[0_12px_32px_rgba(15,23,42,0.06)] transition-transform active:scale-[0.99]"
                  >
                    <div
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${
                        isIncome ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                      }`}
                    >
                      {isIncome ? <ArrowDownLeft className="h-5 w-5" /> : <ArrowUpRight className="h-5 w-5" />}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[14px] font-bold text-slate-900">{tx.description || 'Giao dịch ví'}</p>
                      <div className="mt-1 flex items-center gap-2 text-[11px] font-medium text-slate-500">
                        <span>{format(tx.createdAt, 'HH:mm, dd/MM/yyyy', { locale: vi })}</span>
                        <span
                          className={`h-2 w-2 rounded-full ${
                            isPending ? 'bg-amber-400' : tx.status === 'COMPLETED' ? 'bg-emerald-500' : 'bg-rose-400'
                          }`}
                        />
                        <span>{isPending ? 'Đang xử lý' : tx.status === 'COMPLETED' ? 'Thành công' : 'Thất bại'}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className={`text-[15px] font-black ${isIncome ? 'text-emerald-600' : 'text-rose-600'}`}>
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

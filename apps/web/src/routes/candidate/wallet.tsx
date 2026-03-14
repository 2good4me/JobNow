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

export const Route = createFileRoute('/candidate/wallet')({
  component: CandidateWalletPage,
});

function CandidateWalletPage() {
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const { data: balance = 0, isLoading: isLoadingBalance, refetch: refetchBalance } = useWalletBalance(userProfile?.uid);
  const { data: transactions = [], isLoading: isLoadingTx, refetch: refetchTx } = useTransactionHistory(userProfile?.uid);

  const handleRefresh = () => {
    refetchBalance();
    refetchTx();
  };

  return (
    <div className="pb-24 bg-slate-50 min-h-[100dvh]">
      {/* ── Navy Header ── */}
      <div className="bg-gradient-to-br from-[#1e3a5f] to-[#0f172a] pt-12 pb-20 px-5 rounded-b-[2.5rem] shadow-xl relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl" />
        <div className="absolute top-24 -left-12 w-40 h-40 bg-cyan-400/15 rounded-full blur-3xl" />

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-8">
            <button 
              onClick={() => navigate({ to: '/candidate/profile' })}
              className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white/90"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-bold text-white/90 tracking-tight">Ví của tôi</h1>
            <button 
              onClick={handleRefresh}
              className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white/90"
            >
              <RefreshCw className={`w-4 h-4 ${(isLoadingBalance || isLoadingTx) ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="flex flex-col items-center">
            <p className="text-blue-200/80 text-[13px] font-bold uppercase tracking-[0.1em] mb-2">Số dư hiện tại</p>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-extrabold text-white">{balance.toLocaleString()}</span>
              <span className="text-xl font-bold text-blue-300">đ</span>
            </div>
            
            <div className="mt-8 flex gap-3 w-full max-w-[280px]">
              <button disabled className="flex-1 bg-white text-[#1e3a5f] p-3 rounded-2xl font-bold text-sm shadow-xl shadow-blue-900/20 active:scale-95 transition-all flex flex-col items-center gap-1 opacity-50 cursor-not-allowed">
                <PlusCircle className="w-5 h-5" />
                Nạp tiền
              </button>
              <button disabled className="flex-1 bg-white/10 backdrop-blur-md border border-white/20 text-white p-3 rounded-2xl font-bold text-sm active:scale-95 transition-all flex flex-col items-center gap-1 opacity-50 cursor-not-allowed">
                <CreditCard className="w-5 h-5" />
                Rút tiền
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="px-5 -mt-8 relative z-20 space-y-6">
        
        {/* Quick Actions / Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Thu nhập</p>
              <p className="text-sm font-bold text-emerald-600">Sắp có</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <TrendingDown className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Chi tiêu</p>
              <p className="text-sm font-bold text-rose-600">Sắp có</p>
            </div>
          </div>
        </div>

        {/* Transaction History */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-[15px] font-bold text-slate-800">
              <History className="w-4 h-4 text-slate-400" />
              Lịch sử giao dịch
            </h3>
            <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg uppercase tracking-wider">Mới nhất</span>
          </div>

          <div className="space-y-3">
            {isLoadingTx ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center gap-4 animate-pulse">
                  <div className="w-12 h-12 rounded-xl bg-slate-100" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-slate-100 rounded w-1/2" />
                    <div className="h-3 bg-slate-100 rounded w-1/3" />
                  </div>
                  <div className="h-5 bg-slate-100 rounded w-16" />
                </div>
              ))
            ) : transactions.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-4">
                  <Clock className="w-8 h-8 text-slate-300" />
                </div>
                <p className="text-slate-500 font-medium">Chưa có giao dịch nào được thực hiện.</p>
                <p className="text-slate-400 text-xs mt-1">Các khoản thanh toán ca làm sẽ được hiển thị tại đây.</p>
              </div>
            ) : (
              transactions.map((tx) => (
                <div key={tx.id} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center gap-4 active:scale-[0.98] transition-all">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                    tx.type === 'DEPOSIT' || tx.type === 'PAYMENT' 
                      ? 'bg-emerald-50 text-emerald-600' 
                      : 'bg-rose-50 text-rose-600'
                  }`}>
                    {tx.type === 'DEPOSIT' || tx.type === 'PAYMENT' ? <TrendingUp className="w-6 h-6" /> : <TrendingDown className="w-6 h-6" />}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-bold text-slate-900 truncate">{tx.description}</p>
                    <p className="text-[11px] text-slate-500 font-medium">{format(tx.createdAt, 'HH:mm, dd/MM/yyyy', { locale: vi })}</p>
                  </div>

                  <div className="text-right">
                    <p className={`text-[15px] font-extrabold ${
                      tx.type === 'DEPOSIT' || tx.type === 'PAYMENT' ? 'text-emerald-600' : 'text-rose-600'
                    }`}>
                      {tx.type === 'DEPOSIT' || tx.type === 'PAYMENT' ? '+' : '-'}{tx.amount.toLocaleString()}đ
                    </p>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${
                      tx.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
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
        <div className="bg-indigo-600 rounded-2xl p-5 shadow-lg shadow-indigo-200 relative overflow-hidden">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-white/10 rounded-full" />
          <div className="relative z-10 flex items-center justify-between">
            <div className="pr-4">
              <h4 className="text-white font-bold mb-1">Cần hỗ trợ về thanh toán?</h4>
              <p className="text-indigo-100 text-[12px]">Liên hệ ngay với bộ phận CSKH để được giải đáp thắc mắc.</p>
            </div>
            <button 
              onClick={() => navigate({ to: '/support-center' })}
              className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-indigo-600 shrink-0 shadow-lg"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

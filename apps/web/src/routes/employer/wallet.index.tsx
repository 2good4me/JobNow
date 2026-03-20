import { createFileRoute, useNavigate, Link } from '@tanstack/react-router';
import { ArrowLeft, Wallet, Eye, EyeOff, LayoutList, History, ChevronRight } from 'lucide-react';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useWalletBalance } from '@/features/wallet/hooks/useWallet';
import { useState } from 'react';

export const Route = createFileRoute('/employer/wallet/')({
  component: EmployerWalletPage,
});

function EmployerWalletPage() {
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const userId = userProfile?.uid;
  const { data: balance = 0, isLoading: isBalanceLoading } = useWalletBalance(userId);
  const [showBalance, setShowBalance] = useState(true);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

  return (
    <div className="min-h-[100dvh] bg-slate-50 dark:bg-[#0f172a] pb-24 transition-colors duration-300">
      <div className="mx-auto flex min-h-[100dvh] w-full max-w-md flex-col bg-slate-50 dark:bg-[#0f172a] shadow-xl transition-colors duration-300">

        {/* Header */}
        <header className="bg-white dark:bg-[#1e293b] sticky top-0 z-50 border-b border-slate-100 dark:border-slate-800 transition-colors">
          <div className="flex items-center justify-between p-4">
            <button
              onClick={() => navigate({ to: '/employer/profile' })}
              className="p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              type="button"
            >
              <ArrowLeft className="h-5 w-5 text-slate-700 dark:text-slate-300" />
            </button>
            <h1 className="text-[17px] font-bold text-slate-800 dark:text-slate-100">Danh sách tài khoản</h1>
            <div className="w-9" /> {/* Spacer */}
          </div>

          {/* Tabs */}
          <div className="flex border-t border-slate-100 dark:border-slate-800/50">
            <div className="flex-1 text-center py-3 border-b-2 border-blue-600 dark:border-blue-500">
              <span className="text-sm font-bold text-blue-600 dark:text-blue-400">Tài khoản VND</span>
            </div>
            <div className="flex-1 text-center py-3 border-b-2 border-transparent">
              <span className="text-sm font-medium text-slate-400 dark:text-slate-500">Tài khoản ngoại tệ</span>
            </div>
          </div>
        </header>

        <div className="flex-1 flex flex-col p-4 space-y-5">
          {/* Khối Tổng số dư */}
          <div className="bg-gradient-to-br from-[#1e3a5f] to-[#0f172a] rounded-2xl p-5 shadow-lg text-white relative overflow-hidden flex flex-col items-center justify-center min-h-[140px]">
            <div className="absolute -top-20 -right-20 w-48 h-48 bg-blue-400/10 rounded-full blur-2xl" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-cyan-400/10 rounded-full blur-2xl" />
            
            <div className="relative z-10 w-full text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <p className="text-white/70 text-sm font-medium uppercase tracking-wider">Tổng số dư VND</p>
                <button
                  type="button"
                  onClick={() => setShowBalance(!showBalance)}
                  className="text-white/60 hover:text-white transition-colors"
                >
                  {showBalance ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
              </div>
              
              {isBalanceLoading ? (
                <div className="h-10 w-48 mx-auto bg-white/10 rounded-lg animate-pulse mt-2" />
              ) : (
                <div className="flex justify-center items-baseline gap-1.5">
                  <p className="text-3xl font-extrabold tracking-tight">
                    {showBalance ? formatCurrency(balance).replace('₫', '') : '********'}
                  </p>
                  <span className="text-lg font-bold opacity-90">VND</span>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions (Quản lý ví & Lịch sử) */}
          <div className="flex gap-3">
            <button
              type="button"
              className="flex-1 flex items-center justify-center gap-2 bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl py-3 text-sm font-semibold transition cursor-pointer shadow-sm"
            >
              <LayoutList className="h-4 w-4 text-blue-500" /> Quản lý ví
            </button>
            <button
              type="button"
              onClick={() => navigate({ 
                to: '/employer/wallet/$accountId',
                params: { accountId: 'primary' }
              })}
              className="flex-1 flex items-center justify-center gap-2 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-xl py-3 text-sm font-semibold transition cursor-pointer shadow-sm border border-transparent"
            >
              <History className="h-4 w-4" /> Lịch sử giao dịch
            </button>
          </div>

          {/* Card Tài khoản thanh toán */}
          <div className="mt-4">
            <h2 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3 ml-1">
              Tài khoản thanh toán
            </h2>
            <Link 
              to="/employer/wallet/$accountId"
              params={{ accountId: 'primary' }}
              className="block bg-white dark:bg-[#1e293b] border border-slate-100 dark:border-slate-800/60 rounded-[20px] p-5 shadow-sm hover:shadow-md transition-all active:scale-[0.98] group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                    <Wallet className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Ví thanh toán chính</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5 tracking-wide">
                      {userId ? userId.substring(0, 10).toUpperCase() : 'W-00000000'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-end justify-between mt-6">
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md inline-block mb-1.5">Số dư</p>
                  {isBalanceLoading ? (
                    <div className="h-6 w-24 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
                  ) : (
                    <div className="flex items-baseline gap-1">
                      <span className="text-xl font-extrabold text-slate-800 dark:text-slate-100">
                        {showBalance ? formatCurrency(balance).replace('₫', '') : '******'}
                      </span>
                      <span className="text-xs font-bold text-slate-500 dark:text-slate-400">VND</span>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center gap-1 text-sm font-semibold text-blue-600 dark:text-blue-400 ml-4 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/30 px-3 py-1.5 rounded-full transition-colors">
                  Xem <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}

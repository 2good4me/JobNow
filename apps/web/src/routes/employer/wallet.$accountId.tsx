import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { ArrowLeft, ArrowRightLeft, PlusCircle, ArrowDownLeft, FileCheck2, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useWalletBalance } from '@/features/wallet/hooks/useWallet';
import { useState } from 'react';
import { DepositBottomSheet } from './-components/wallet/DepositBottomSheet';

export const Route = createFileRoute('/employer/wallet/$accountId')({
  component: WalletDetailPage,
});

function WalletDetailPage() {
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const { accountId } = Route.useParams();
  const userId = userProfile?.uid || (accountId !== 'primary' ? accountId : 'test-employer-id');
  const { data: balance = 0, isLoading: isBalanceLoading } = useWalletBalance(userId);
  const [showBalance, setShowBalance] = useState(true);
  const [showDepositSheet, setShowDepositSheet] = useState(false);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

  return (
    <div className="min-h-[100dvh] bg-slate-50 dark:bg-[#0f172a] pb-24 transition-colors duration-300 animate-in slide-in-from-right fade-in duration-300">
      <div className="mx-auto flex min-h-[100dvh] w-full max-w-md flex-col bg-slate-50 dark:bg-[#0f172a] shadow-xl transition-colors duration-300">

        {/* Header */}
        <header className="bg-white dark:bg-[#1e293b] sticky top-0 z-50 border-b border-slate-100 dark:border-slate-800 transition-colors">
          <div className="flex items-center justify-between p-4">
            <button
              onClick={() => navigate({ to: '/employer/wallet' })}
              className="p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              type="button"
            >
              <ArrowLeft className="h-5 w-5 text-slate-700 dark:text-slate-300" />
            </button>
            <h1 className="text-[17px] font-bold text-slate-800 dark:text-slate-100">Chi tiết tài khoản</h1>
            <div className="w-9" /> {/* Spacer */}
          </div>
        </header>

        <div className="flex-1 flex flex-col p-4 space-y-6 overflow-y-auto">
          {/* Card Thông tin tài khoản (MB Bank style but JobNow colors) */}
          <div className="bg-white dark:bg-[#1e293b] rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-slate-800 transition-colors">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wide">
                  {userProfile?.full_name || 'JOBNOW EMPLOYER'}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-lg font-semibold text-slate-600 dark:text-slate-300">
                    {userId ? userId.substring(0, 10).toUpperCase() : 'W-00000000'}
                  </p>
                  <button
                    className="text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors p-1"
                    title="Copy account number"
                    onClick={() => navigator.clipboard.writeText(userId ? userId.substring(0, 10).toUpperCase() : '')}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2" /><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" /></svg>
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800/60">
              <div className="flex justify-between items-center mb-1">
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Số dư tài khoản</p>
                <button
                  type="button"
                  onClick={() => setShowBalance(!showBalance)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors p-1"
                >
                  {showBalance ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
              </div>

              <div className="flex items-center justify-between">
                {isBalanceLoading ? (
                  <div className="h-9 w-40 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse" />
                ) : (
                  <div className="flex items-baseline gap-1.5">
                    <p className="text-[32px] font-extrabold text-blue-900 dark:text-blue-100 tracking-tight">
                      {showBalance ? formatCurrency(balance).replace('₫', '') : '********'}
                    </p>
                    <span className="text-sm font-bold text-slate-500 dark:text-slate-400">VND</span>
                  </div>
                )}

                {/* Fake QR Icon Button styled like MB */}
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center cursor-pointer hover:bg-blue-200 dark:hover:bg-blue-900/60 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="5" height="5" x="3" y="3" rx="1" /><rect width="5" height="5" x="16" y="3" rx="1" /><rect width="5" height="5" x="3" y="16" rx="1" /><path d="M21 16h-3a2 2 0 0 0-2 2v3" /><path d="M21 21v.01" /><path d="M12 7v3a2 2 0 0 1-2 2H7" /><path d="M3 12h.01" /><path d="M12 3h.01" /><path d="M12 16v.01" /><path d="M16 12h1" /><path d="M21 12v.01" /><path d="M12 21v-1" /></svg>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions Grid (4 items) */}
          <div className="grid grid-cols-4 gap-3">
            {/* Chuyển tiền */}
            <div className="flex flex-col items-center gap-2 cursor-pointer active:scale-95 transition-transform group">
              <div className="w-14 h-14 bg-white dark:bg-[#1e293b] border border-slate-100 dark:border-slate-800 rounded-[18px] flex items-center justify-center shadow-sm group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 group-hover:border-blue-200 dark:group-hover:border-blue-800 transition-colors">
                <ArrowRightLeft className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300 text-center">Chuyển tiền</span>
            </div>

            {/* Nạp tiền */}
            <div 
              onClick={() => setShowDepositSheet(true)}
              className="flex flex-col items-center gap-2 cursor-pointer active:scale-95 transition-transform group"
            >
              <div className="w-14 h-14 bg-white dark:bg-[#1e293b] border border-slate-100 dark:border-slate-800 rounded-[18px] flex items-center justify-center shadow-sm group-hover:bg-emerald-50 dark:group-hover:bg-emerald-900/20 group-hover:border-emerald-200 dark:group-hover:border-emerald-800 transition-colors">
                <PlusCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300 text-center">Nạp tiền</span>
            </div>

            {/* Rút tiền */}
            <div className="flex flex-col items-center gap-2 cursor-pointer active:scale-95 transition-transform group">
              <div className="w-14 h-14 bg-white dark:bg-[#1e293b] border border-slate-100 dark:border-slate-800 rounded-[18px] flex items-center justify-center shadow-sm group-hover:bg-amber-50 dark:group-hover:bg-amber-900/20 group-hover:border-amber-200 dark:group-hover:border-amber-800 transition-colors">
                <ArrowDownLeft className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              </div>
              <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300 text-center">Rút tiền</span>
            </div>

            {/* Trạng thái thanh toán */}
            <div className="flex flex-col items-center gap-2 cursor-pointer active:scale-95 transition-transform group">
              <div className="w-14 h-14 bg-white dark:bg-[#1e293b] border border-slate-100 dark:border-slate-800 rounded-[18px] flex items-center justify-center shadow-sm group-hover:bg-violet-50 dark:group-hover:bg-violet-900/20 group-hover:border-violet-200 dark:group-hover:border-violet-800 transition-colors">
                <FileCheck2 className="w-6 h-6 text-violet-600 dark:text-violet-400" />
              </div>
              <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300 text-center">Trạng thái<br />thanh toán</span>
            </div>
          </div>

          {/* Section: Truy vấn giao dịch */}
          <div className="mt-8 bg-white dark:bg-[#1e293b] rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-slate-800">
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-4">Truy vấn giao dịch</h3>

            <div className="grid grid-cols-2 gap-3 mb-5">
              {/* Date Input 1 */}
              <div className="border border-slate-200 dark:border-slate-700 rounded-xl p-3 relative group focus-within:border-blue-500 dark:focus-within:border-blue-400 transition-colors">
                <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-1">Từ ngày</label>
                <div className="relative">
                  <input
                    type="date"
                    defaultValue={new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]} // Mặc định 7 ngày trước
                    className="w-full bg-transparent text-sm font-semibold text-slate-800 dark:text-slate-100 focus:outline-none appearance-none cursor-pointer"
                  />
                  {/* Optional: Add custom calendar icon via pointer-events-none if native date picker icon is hidden via CSS, but normally we rely on native */}
                </div>
              </div>

              {/* Date Input 2 */}
              <div className="border border-slate-200 dark:border-slate-700 rounded-xl p-3 relative group focus-within:border-blue-500 dark:focus-within:border-blue-400 transition-colors">
                <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-1">Đến ngày</label>
                <div className="relative">
                  <input
                    type="date"
                    defaultValue={new Date().toISOString().split('T')[0]} // Hôm nay
                    className="w-full bg-transparent text-sm font-semibold text-slate-800 dark:text-slate-100 focus:outline-none appearance-none cursor-pointer"
                  />
                </div>
              </div>
            </div>

            <button className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-bold py-3.5 rounded-xl transition-colors shadow-md active:scale-[0.98]">
              Truy vấn
            </button>

            <p className="text-center text-[11px] text-slate-500 dark:text-slate-500 mt-4 leading-relaxed">
              Hệ thống hỗ trợ truy vấn lịch sử giao dịch trong vòng 1 năm kể từ ngày hiện tại
            </p>
          </div>
        </div>
      </div>

      {userId && (
        <DepositBottomSheet
          isOpen={showDepositSheet}
          onClose={() => setShowDepositSheet(false)}
          userId={userId}
        />
      )}
    </div>
  );
}

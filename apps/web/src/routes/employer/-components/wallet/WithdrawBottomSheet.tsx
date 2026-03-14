import { useState } from 'react';
import { X } from 'lucide-react';
import { useWithdraw } from '@/features/wallet/hooks/useWallet';
import { toast } from 'sonner';

interface WithdrawBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  balance: number;
}

export function WithdrawBottomSheet({ isOpen, onClose, userId, balance }: WithdrawBottomSheetProps) {
  const [amount, setAmount] = useState<number>(0);
  const [customAmount, setCustomAmount] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [password, setPassword] = useState('');

  const { mutate: withdraw, isPending } = useWithdraw();

  if (!isOpen) return null;

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    let num = val ? parseInt(val, 10) : 0;
    
    // Prevent overdrawing directly in input
    if (num > balance) {
      num = balance;
    }
    
    setCustomAmount(num ? num.toString() : '');
    setAmount(num);
  };

  const setMaxAmount = () => {
    setAmount(balance);
    setCustomAmount(balance.toString());
  };

  const handleSubmit = () => {
    if (amount < 50000) {
      toast.error('Số tiền rút tối thiểu là 50.000đ');
      return;
    }
    if (amount > balance) {
      toast.error('Số dư không đủ');
      return;
    }
    if (!bankAccount.trim()) {
      toast.error('Vui lòng nhập số tài khoản ngân hàng');
      return;
    }
    if (!password) {
      toast.error('Vui lòng nhập mật khẩu xác nhận');
      return;
    }

    withdraw(
      { userId, amount, bankAccount },
      {
        onSuccess: () => {
          toast.success('Rút tiền thành công (Demo)');
          onClose();
          // Reset state
          setAmount(0);
          setCustomAmount('');
          setBankAccount('');
          setPassword('');
        },
        onError: (err) => {
          toast.error(err.message || 'Có lỗi xảy ra khi rút tiền');
        },
      }
    );
  };

  return (
    <>
      <div className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm transition-opacity" onClick={onClose} />
      <div className="fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-3xl shadow-2xl p-6 transform transition-transform animate-in slide-in-from-bottom pb-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-800">Rút tiền về tài khoản</h2>
          <button onClick={onClose} className="p-2 -mr-2 rounded-full hover:bg-slate-100 text-slate-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-5">
          {/* Amount Selection */}
          <div className="space-y-3">
            <div className="flex justify-between items-end">
              <label className="text-sm font-semibold text-slate-700">Số tiền rút</label>
              <div className="text-xs text-slate-500">
                Số dư: <span className="font-bold text-slate-700">{balance.toLocaleString('vi-VN')}đ</span>
              </div>
            </div>
            <div className="relative">
              <input
                type="text"
                value={customAmount}
                onChange={handleCustomAmountChange}
                placeholder="0"
                className="w-full text-right text-3xl font-bold text-slate-900 border-b-2 border-slate-200 focus:border-red-500 bg-transparent py-2 pr-12 outline-none transition-colors placeholder:text-slate-300"
              />
              <span className="absolute right-0 top-1/2 -translate-y-1/2 text-lg font-bold text-slate-500">
                đ
              </span>
            </div>
            
            <div className="flex justify-end">
              <button
                type="button"
                onClick={setMaxAmount}
                className="text-sm font-semibold text-red-600 hover:text-red-700"
              >
                Rút toàn bộ
              </button>
            </div>
          </div>

          {/* Form */}
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Tài khoản ngân hàng</label>
              <input
                type="text"
                value={bankAccount}
                onChange={(e) => setBankAccount(e.target.value)}
                placeholder="Số TK hoặc STK đã lưu..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Mật khẩu xác nhận / OTP</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập 6 số OTP (Mock)..."
                maxLength={6}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all font-mono tracking-widest placeholder:tracking-normal placeholder:font-sans"
              />
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={isPending || amount < 50000 || !bankAccount || !password}
            className="w-full py-4 mt-2 bg-red-600 hover:bg-red-700 disabled:bg-slate-300 text-white font-bold rounded-xl shadow-lg shadow-red-600/20 active:scale-[0.98] transition-all"
          >
            {isPending ? 'Đang xử lý...' : `Xác nhận rút ${amount.toLocaleString('vi-VN')}đ`}
          </button>
        </div>
      </div>
    </>
  );
}

import { useState } from 'react';
import { X, Check } from 'lucide-react';
import { useDeposit } from '@/features/wallet/hooks/useWallet';
import { toast } from 'sonner';

interface DepositBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

const PAYMENT_METHODS = [
  { id: 'vnpay', name: 'Thanh toán qua VNPAY', icon: '🏦' },
  { id: 'momo', name: 'Ví MoMo', icon: '📱' },
  { id: 'bank_transfer', name: 'Chuyển khoản ngân hàng', icon: '💳' },
];

const PRESET_AMOUNTS = [100000, 200000, 500000, 1000000, 2000000, 5000000];

export function DepositBottomSheet({ isOpen, onClose, userId }: DepositBottomSheetProps) {
  const [amount, setAmount] = useState<number>(0);
  const [customAmount, setCustomAmount] = useState('');
  const [method, setMethod] = useState(PAYMENT_METHODS[0].id);

  const { mutate: deposit, isPending } = useDeposit();

  if (!isOpen) return null;

  const handleAmountSelect = (val: number) => {
    setAmount(val);
    setCustomAmount(val.toString());
  };

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    setCustomAmount(val);
    setAmount(val ? parseInt(val, 10) : 0);
  };

  const handleSubmit = () => {
    if (amount < 10000) {
      toast.error('Số tiền nạp tối thiểu là 10.000đ');
      return;
    }

    const selectedMethod = PAYMENT_METHODS.find((m) => m.id === method)?.name || method;

    deposit(
      { userId, amount, method: selectedMethod },
      {
        onSuccess: () => {
          toast.success('Nạp tiền thành công (Demo)');
          onClose();
          // Reset state
          setAmount(0);
          setCustomAmount('');
        },
        onError: (err) => {
          toast.error(err.message || 'Có lỗi xảy ra khi nạp tiền');
        },
      }
    );
  };

  return (
    <>
      <div className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm transition-opacity" onClick={onClose} />
      <div className="fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-3xl shadow-2xl p-6 transform transition-transform animate-in slide-in-from-bottom pb-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-800">Nạp tiền vào ví</h2>
          <button onClick={onClose} className="p-2 -mr-2 rounded-full hover:bg-slate-100 text-slate-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Amount Selection */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-slate-700">Nhập số tiền</label>
            <div className="relative">
              <input
                type="text"
                value={customAmount}
                onChange={handleCustomAmountChange}
                placeholder="0"
                className="w-full text-right text-3xl font-bold text-slate-900 border-b-2 border-slate-200 focus:border-indigo-600 bg-transparent py-2 pr-12 outline-none transition-colors placeholder:text-slate-300"
              />
              <span className="absolute right-0 top-1/2 -translate-y-1/2 text-lg font-bold text-slate-500">
                đ
              </span>
            </div>
            
            <div className="grid grid-cols-3 gap-2 mt-4">
              {PRESET_AMOUNTS.map((amt) => (
                <button
                  key={amt}
                  onClick={() => handleAmountSelect(amt)}
                  className={`py-2 px-1 text-sm font-semibold rounded-lg border transition-colors ${
                    amount === amt
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                      : 'border-slate-200 text-slate-600 hover:border-indigo-300 hover:bg-slate-50'
                  }`}
                >
                  {(amt / 1000).toLocaleString('vi-VN')}k
                </button>
              ))}
            </div>
          </div>

          {/* Payment Method */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-slate-700">Phương thức thanh toán</label>
            <div className="space-y-2">
              {PAYMENT_METHODS.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setMethod(m.id)}
                  className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                    method === m.id
                      ? 'border-indigo-600 bg-indigo-50/50 shadow-sm'
                      : 'border-slate-100 hover:border-slate-200 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{m.icon}</span>
                    <span className="font-semibold text-slate-700">{m.name}</span>
                  </div>
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center border-2 ${
                    method === m.id ? 'border-indigo-600 bg-indigo-600' : 'border-slate-300'
                  }`}>
                    {method === m.id && <Check className="w-3 h-3 text-white" />}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={isPending || amount < 10000}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/20 active:scale-[0.98] transition-all"
          >
            {isPending ? 'Đang xử lý...' : `Nạp ${amount.toLocaleString('vi-VN')}đ`}
          </button>
        </div>
      </div>
    </>
  );
}

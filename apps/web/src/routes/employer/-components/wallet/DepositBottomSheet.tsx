import { useState, useEffect, useRef } from 'react';
import { X, Check, Copy, ArrowLeft, Clock, ShieldCheck, Wallet, Landmark, Smartphone, Loader2, Info } from 'lucide-react';
import { useDeposit } from '@/features/wallet/hooks/useWallet';
import { toast } from 'sonner';

interface DepositBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

const PAYMENT_METHODS = [
  { id: 'bank_transfer', name: 'Chuyển khoản NH', icon: Landmark, color: 'text-blue-600', bg: 'bg-blue-50' },
  { id: 'momo', name: 'Ví MoMo', icon: Smartphone, color: 'text-pink-600', bg: 'bg-pink-50' },
  { id: 'vnpay', name: 'VNPAY-QR', icon: Wallet, color: 'text-red-600', bg: 'bg-red-50' },
];

const PRESET_AMOUNTS = [100000, 200000, 500000, 1000000, 2000000, 5000000];

type Step = 'input' | 'qr' | 'verifying';

export function DepositBottomSheet({ isOpen, onClose, userId }: DepositBottomSheetProps) {
  const [amount, setAmount] = useState<number>(0);
  const [customAmount, setCustomAmount] = useState('');
  const [method, setMethod] = useState(PAYMENT_METHODS[0].id);
  const [step, setStep] = useState<Step>('input');
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes
  const [isRedirecting, setIsRedirecting] = useState(false);
  const timerRef = useRef<any>(null);

  const { mutate: deposit, isPending } = useDeposit();

  useEffect(() => {
    if (step === 'qr' && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [step, timeLeft]);

  // Reset state on close
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setStep('input');
        setAmount(0);
        setCustomAmount('');
        setTimeLeft(600);
      }, 300);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleClose = () => {
    onClose();
  };

  const handleAmountSelect = (val: number) => {
    setAmount(val);
    setCustomAmount(val.toLocaleString('en-US'));
  };

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    const num = val ? parseInt(val, 10) : 0;
    setCustomAmount(num ? num.toLocaleString('en-US') : '');
    setAmount(num);
  };

  const handleContinue = async () => {
    if (amount < 10000) {
      toast.error('Số tiền nạp tối thiểu là 10.000đ');
      return;
    }

    if (method === 'vnpay') {
      setIsRedirecting(true);
      try {
        const res = await fetch('/api/vnpay/create-payment-url', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount, userId })
        });
        const data = await res.json();
        if (data.url) {
          window.location.href = data.url;
        } else {
          toast.error('Lỗi khởi tạo cổng VNPay');
          setIsRedirecting(false);
        }
      } catch (err) {
        toast.error('Lỗi kết nối máy chủ thanh toán');
        setIsRedirecting(false);
      }
      return;
    }

    setStep('qr');
    setTimeLeft(600);
  };

  const simulateVerify = () => {
    setStep('verifying');
    // Simulate checking backend
    setTimeout(() => {
      handleSubmit();
    }, 3000);
  };

  const handleSubmit = () => {
    const selectedMethod = PAYMENT_METHODS.find((m) => m.id === method)?.name || method;

    deposit(
      { userId, amount, method: selectedMethod },
      {
        onSuccess: () => {
          toast.success('Nạp tiền thành công');
          handleClose();
        },
        onError: (err) => {
          toast.error(err.message || 'Có lỗi xảy ra khi nạp tiền');
          setStep('qr');
        },
      }
    );
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`Đã sao chép ${label}`);
  };

  const formatTime = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  };

  const accountNumber = '0123456789';
  const transferContent = `JobNow ${userId.slice(0, 6).toUpperCase()}`;
  const qrUrl = `https://img.vietqr.io/image/970422-${accountNumber}-compact2.png?amount=${amount}&addInfo=${encodeURIComponent(transferContent)}&accountName=JOBNOW`;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm transition-opacity" onClick={handleClose} />
      <div className="fixed inset-x-0 bottom-0 z-60 bg-white rounded-t-[2.5rem] shadow-2xl p-6 pb-[calc(10px+env(safe-area-inset-bottom))] transform transition-transform animate-in slide-in-from-bottom max-h-[95dvh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6 shrink-0">
          <div className="flex items-center gap-3">
            {step === 'qr' && (
              <button 
                onClick={() => setStep('input')}
                className="p-2 -ml-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors"
                disabled={isPending}
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <h2 className="text-xl font-bold text-slate-800">
              {step === 'input' ? 'Nạp tiền vào ví' : step === 'qr' ? 'Thanh toán' : 'Xác thực'}
            </h2>
          </div>
          <button onClick={handleClose} className="p-2 -mr-2 rounded-full hover:bg-slate-100 text-slate-500" disabled={step === 'verifying' || isPending}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto min-h-0 custom-scrollbar pb-6">
          {/* STEP 1: INPUT */}
          {step === 'input' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="space-y-3">
                <label className="text-sm font-bold text-slate-500 uppercase tracking-wider ml-1">Số tiền muốn nạp</label>
                <div className="relative bg-slate-50 rounded-2xl p-6 border-2 border-transparent focus-within:border-indigo-500 focus-within:bg-white transition-all">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={customAmount}
                    onChange={handleCustomAmountChange}
                    placeholder="0"
                    className="w-full text-center text-4xl font-black text-slate-900 bg-transparent outline-none placeholder:text-slate-200"
                  />
                  <span className="absolute right-6 top-1/2 -translate-y-1/2 text-xl font-bold text-slate-400">đ</span>
                </div>
                
                <div className="grid grid-cols-3 gap-2 mt-4">
                  {PRESET_AMOUNTS.map((amt) => (
                    <button
                      key={amt}
                      onClick={() => handleAmountSelect(amt)}
                      className={`py-3 px-1 rounded-xl border-2 font-bold text-sm transition-all ${
                        amount === amt
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                          : 'border-slate-50 bg-slate-50 text-slate-600 hover:border-indigo-200 active:scale-95'
                      }`}
                    >
                      {(amt / 1000).toLocaleString('vi-VN')}k
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-bold text-slate-500 uppercase tracking-wider ml-1">Phương thức thanh toán</label>
                <div className="grid grid-cols-1 gap-2">
                  {PAYMENT_METHODS.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setMethod(m.id)}
                      className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all group ${
                        method === m.id
                          ? 'border-indigo-600 bg-indigo-50/30'
                          : 'border-slate-50 bg-slate-50 hover:bg-slate-100/50'
                      }`}
                    >
                      <div className="flex items-center gap-4 text-left">
                        <div className={`w-12 h-12 rounded-xl ${m.bg} flex items-center justify-center`}>
                          <m.icon className={`w-6 h-6 ${m.color}`} />
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">{m.name}</p>
                          <p className="text-[11px] text-slate-400 font-medium">Hỗ trợ nhận tiền ngay</p>
                        </div>
                      </div>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all ${
                        method === m.id ? 'border-indigo-600 bg-indigo-600 scale-110' : 'border-slate-200'
                      }`}>
                        {method === m.id && <Check className="w-3.5 h-3.5 text-white" />}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleContinue}
                disabled={amount < 10000 || isRedirecting}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:grayscale transition-all text-white font-black rounded-2xl shadow-xl shadow-indigo-600/20 active:scale-[0.98] flex items-center justify-center gap-2"
              >
                {isRedirecting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" /> Đang chuyển hường...
                  </>
                ) : (
                  <>
                    Tiếp tục <ArrowLeft className="w-5 h-5 rotate-180" />
                  </>
                )}
              </button>
            </div>
          )}

          {/* STEP 2: QR PAYMENT */}
          {step === 'qr' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="flex flex-col items-center">
                <div className="relative mb-6">
                  <div className="bg-white p-3 rounded-2xl border-4 border-slate-100 shadow-xl">
                    <img src={qrUrl} alt="QR Code Payment" className="w-56 h-56 object-contain rounded-lg" />
                  </div>
                  <div className="absolute -bottom-3 -right-3 bg-red-600 text-white p-2 rounded-xl shadow-lg flex items-center gap-1.5 border-4 border-white animate-pulse">
                    <Clock className="w-4 h-4" />
                    <span className="text-xs font-black tracking-tighter">{formatTime(timeLeft)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 rounded-full border border-amber-100 mb-6">
                  <Info className="w-4 h-4 text-amber-600" />
                  <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wide">Quét mã bằng App Ngân hàng hoặc MoMo</span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-2">
                <div className="bg-slate-50 p-4 rounded-2xl">
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-2 ml-1">Thông tin thanh toán</p>
                  <div className="space-y-1">
                    <div className="flex justify-between items-center py-2 px-3 bg-white rounded-xl border border-slate-100">
                      <span className="text-sm text-slate-500 font-medium">Số tiền</span>
                      <div className="flex items-center gap-3">
                        <span className="font-black text-slate-800">{amount.toLocaleString('en-US')} đ</span>
                        <button onClick={() => copyToClipboard(amount.toString(), 'số tiền')} className="p-1.5 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                          <Copy className="w-3.5 h-3.5 text-slate-400" />
                        </button>
                      </div>
                    </div>
                    <div className="flex justify-between items-center py-2 px-3 bg-white rounded-xl border border-slate-100">
                      <span className="text-sm text-slate-500 font-medium">Số tài khoản</span>
                      <div className="flex items-center gap-3">
                        <span className="font-black text-slate-800 tracking-tight">{accountNumber}</span>
                        <button onClick={() => copyToClipboard(accountNumber, 'số tài khoản')} className="p-1.5 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                          <Copy className="w-3.5 h-3.5 text-slate-400" />
                        </button>
                      </div>
                    </div>
                    <div className="flex justify-between items-center py-2 px-3 bg-white rounded-xl border border-slate-100">
                      <span className="text-sm text-slate-500 font-medium">Nội dung</span>
                      <div className="flex items-center gap-3">
                        <span className="font-black text-slate-800 text-xs tracking-wider uppercase">{transferContent}</span>
                        <button onClick={() => copyToClipboard(transferContent, 'nội dung')} className="p-1.5 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                          <Copy className="w-3.5 h-3.5 text-slate-400" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 px-4 py-3 bg-slate-900 rounded-2xl text-white/90">
                <ShieldCheck className="w-5 h-5 text-indigo-400 shrink-0" />
                <p className="text-[11px] font-medium leading-tight">Giao dịch được bảo mật bởi hệ thống thanh toán liên ngân hàng Napas 24/7.</p>
              </div>

              <button
                onClick={simulateVerify}
                disabled={isPending}
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl shadow-xl shadow-emerald-600/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />} 
                {isPending ? 'Đang thực hiện...' : 'Tôi đã chuyển khoản thành công'}
              </button>
            </div>
          )}

          {/* STEP 3: VERIFYING */}
          {step === 'verifying' && (
            <div className="flex flex-col items-center justify-center py-12 space-y-6 animate-in zoom-in-95 duration-300">
              <div className="relative">
                <div className="w-24 h-24 rounded-full border-4 border-slate-100 border-t-indigo-600 animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <ShieldCheck className="w-8 h-8 text-indigo-600" />
                </div>
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-xl font-bold text-slate-800">Đang kiểm tra giao dịch</h3>
                <p className="text-sm text-slate-500 max-w-[240px] mx-auto">Vui lòng không đóng cửa sổ này, hệ thống đang xác thực khoản thanh toán của bạn.</p>
              </div>
              
              <div className="w-full max-w-[280px] space-y-3">
                <div className="flex items-center gap-3 py-3 px-4 bg-slate-50 rounded-xl text-slate-400 grayscale">
                  <div className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
                  <span className="text-xs font-bold uppercase tracking-wider">Khởi tạo kết nối...</span>
                  <Check className="w-4 h-4 ml-auto text-emerald-500" />
                </div>
                <div className="flex items-center gap-3 py-3 px-4 bg-slate-50 rounded-xl text-slate-800">
                  <div className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
                  <span className="text-xs font-bold uppercase tracking-wider">Đang chờ xác nhận từ NH...</span>
                  <Loader2 className="w-4 h-4 ml-auto animate-spin" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

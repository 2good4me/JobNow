import { useState, useEffect } from 'react';
import { X, ChevronRight, Search, Building2, User, ShieldCheck, ArrowLeft, Check } from 'lucide-react';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useWithdraw } from '@/features/wallet/hooks/useWallet';
import { toast } from 'sonner';

interface WithdrawBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  balance: number;
}

const BANKS = [
  { id: 'vnpay', name: 'Ví VNPAY', fullName: 'Ví điện tử VNPAY', color: 'bg-red-600' },
  { id: 'vcb', name: 'Vietcombank', fullName: 'NH TMCP Ngoại Thương Việt Nam', color: 'bg-emerald-600' },
  { id: 'tcb', name: 'Techcombank', fullName: 'NH TMCP Kỹ Thương Việt Nam', color: 'bg-red-600' },
  { id: 'bidv', name: 'BIDV', fullName: 'NH TMCP Đầu tư và Phát triển VN', color: 'bg-blue-800' },
  { id: 'mb', name: 'MB Bank', fullName: 'NH TMCP Quân Đội', color: 'bg-blue-600' },
  { id: 'acb', name: 'ACB', fullName: 'NH TMCP Á Châu', color: 'bg-blue-500' },
  { id: 'vpb', name: 'VPBank', fullName: 'NH TMCP Việt Nam Thịnh Vượng', color: 'bg-emerald-500' },
  { id: 'ctg', name: 'VietinBank', fullName: 'NH TMCP Công Thương Việt Nam', color: 'bg-sky-700' },
  { id: 'scb', name: 'Sacombank', fullName: 'NH TMCP Sài Gòn Thương Tín', color: 'bg-red-700' },
  { id: 'tpv', name: 'TPBank', fullName: 'NH TMCP Tiên Phong', color: 'bg-purple-600' },
  { id: 'vib', name: 'VIB', fullName: 'NH TMCP Quốc Tế Việt Nam', color: 'bg-orange-500' },
];

const PRESET_AMOUNTS = [50000, 100000, 200000, 500000, 1000000, 2000000];

type Step = 'amount' | 'bank' | 'account' | 'confirm';

function removeVietnameseTones(str: string) {
  if (!str) return '';
  str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
  str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
  str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
  str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
  str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
  str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
  str = str.replace(/đ/g, "d");
  str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, "A");
  str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, "E");
  str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, "I");
  str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, "O");
  str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, "U");
  str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, "Y");
  str = str.replace(/Đ/g, "D");
  return str.toUpperCase();
}

export function WithdrawBottomSheet({ isOpen, onClose, userId, balance }: WithdrawBottomSheetProps) {
  const { userProfile } = useAuth();
  const [step, setStep] = useState<Step>('amount');
  const [amount, setAmount] = useState<number>(0);
  const [customAmount, setCustomAmount] = useState('');
  const [selectedBank, setSelectedBank] = useState<typeof BANKS[0] | null>(null);
  const [bankAccount, setBankAccount] = useState('');
  const [accountHolder, setAccountHolder] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [password, setPassword] = useState('');
  const [searchBank, setSearchBank] = useState('');

  const { mutate: withdraw, isPending } = useWithdraw();

  // Reset state when closed
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setStep('amount');
        setAmount(0);
        setCustomAmount('');
        setSelectedBank(null);
        setBankAccount('');
        setAccountHolder('');
        setPassword('');
      }, 300);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    let num = val ? parseInt(val, 10) : 0;
    if (num > balance) num = balance;
    setCustomAmount(num ? num.toLocaleString('en-US') : '');
    setAmount(num);
  };

  const handleSelectPreset = (val: number) => {
    const finalVal = val > balance ? balance : val;
    setAmount(finalVal);
    setCustomAmount(finalVal.toLocaleString('en-US'));
  };

  const handleBankSelect = (bank: typeof BANKS[0]) => {
    setSelectedBank(bank);
    setStep('account');
  };

  const verifyAccount = () => {
    if (bankAccount.length < 6) return;
    setIsVerifying(true);
    // Simulate Napas Banking API call
    setTimeout(() => {
      const name = userProfile?.full_name ? removeVietnameseTones(userProfile?.full_name) : 'NGUYEN VAN A';
      setAccountHolder(name);
      setIsVerifying(false);
    }, 1200);
  };

  const handleSubmit = () => {
    if (!password) {
      toast.error('Vui lòng nhập mã OTP/Mật khẩu');
      return;
    }

    withdraw(
      { 
        userId, 
        amount, 
        bankAccount: `${selectedBank?.name} - ${bankAccount}` 
      },
      {
        onSuccess: () => {
          toast.success('Giao dịch đang được xử lý');
          onClose();
        },
        onError: (err) => {
          toast.error(err.message || 'Có lỗi xảy ra');
        },
      }
    );
  };

  const withdrawFee = 1100;
  const filteredBanks = BANKS.filter(b => 
    b.name.toLowerCase().includes(searchBank.toLowerCase()) || 
    b.fullName.toLowerCase().includes(searchBank.toLowerCase())
  );

  return (
    <>
      <div className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm transition-opacity" onClick={onClose} />
      <div className="fixed inset-x-0 bottom-0 z-60 bg-white rounded-t-[2.5rem] shadow-2xl p-6 pb-[calc(10px+env(safe-area-inset-bottom))] transform transition-transform animate-in slide-in-from-bottom max-h-[90dvh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6 shrink-0">
          <div className="flex items-center gap-3">
            {step !== 'amount' && (
              <button 
                onClick={() => setStep(step === 'bank' ? 'amount' : step === 'account' ? 'bank' : 'account')}
                className="p-2 -ml-2 rounded-full hover:bg-slate-100 text-slate-500"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <h2 className="text-xl font-bold text-slate-800">
              {step === 'amount' ? 'Rút tiền' : 
               step === 'bank' ? 'Chọn ngân hàng' :
               step === 'account' ? 'Thông tin thẻ' : 'Xác nhận'}
            </h2>
          </div>
          <button onClick={onClose} className="p-2 -mr-2 rounded-full hover:bg-slate-100 text-slate-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto min-h-0 custom-scrollbar pb-20">
          {/* STEP 1: AMOUNT */}
          {step === 'amount' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm font-medium text-slate-500">Số dư khả dụng</span>
                  <span className="font-bold text-slate-900">{balance.toLocaleString('en-US')}đ</span>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={customAmount}
                    onChange={handleAmountChange}
                    placeholder="0"
                    className="w-full text-center text-4xl font-black text-slate-900 bg-transparent py-4 outline-none placeholder:text-slate-200"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xl font-bold text-slate-400">đ</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {PRESET_AMOUNTS.map(amt => (
                  <button
                    key={amt}
                    onClick={() => handleSelectPreset(amt)}
                    className={`py-3 px-1 rounded-xl border-2 font-bold text-sm transition-all ${
                      amount === amt 
                        ? 'border-red-500 bg-red-50 text-red-600' 
                        : 'border-slate-100 text-slate-600 active:bg-slate-50'
                    }`}
                  >
                    {amt >= 1000000 ? `${amt/1000000}M` : `${amt/1000}k`}
                  </button>
                ))}
                <button
                  onClick={() => handleSelectPreset(balance)}
                  className="col-span-3 py-3 rounded-xl border-2 border-slate-100 font-bold text-sm text-red-600 text-center"
                >
                  Rút tối đa
                </button>
              </div>

              <button
                disabled={amount < 50000}
                onClick={() => setStep('bank')}
                className="w-full py-4 bg-slate-900 text-white font-bold rounded-2xl shadow-lg disabled:opacity-30 transition-all flex items-center justify-center gap-2"
              >
                Tiếp tục <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* STEP 2: BANK LIST */}
          {step === 'bank' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm ngân hàng..."
                  value={searchBank}
                  onChange={(e) => setSearchBank(e.target.value)}
                  className="w-full bg-slate-50 border-none rounded-xl py-3 pl-11 pr-4 text-sm focus:ring-2 focus:ring-red-500/20 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 gap-2">
                {filteredBanks.map(bank => (
                  <button
                    key={bank.id}
                    onClick={() => handleBankSelect(bank)}
                    className="flex items-center gap-4 p-4 rounded-2xl border border-slate-100 hover:bg-slate-50 transition-all text-left group"
                  >
                    <div className={`w-12 h-12 rounded-xl ${bank.color} flex items-center justify-center text-white font-black text-xs shrink-0 shadow-sm`}>
                      {bank.id.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-800 text-[15px]">{bank.name}</p>
                      <p className="text-[11px] text-slate-400 truncate font-medium">{bank.fullName}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-red-500 transition-colors" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3: ACCOUNT INFO */}
          {step === 'account' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className={`w-12 h-12 rounded-xl ${selectedBank?.color} flex items-center justify-center text-white font-black text-xs shrink-0`}>
                  {selectedBank?.id.toUpperCase()}
                </div>
                <div>
                  <p className="font-bold text-slate-800">{selectedBank?.name}</p>
                  <p className="text-xs text-slate-500">Chuyển tiền nhanh 24/7</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Số tài khoản / Số thẻ</label>
                  <div className="relative">
                    <input
                      type="text"
                      inputMode="numeric"
                      value={bankAccount}
                      onChange={(e) => setBankAccount(e.target.value)}
                      onBlur={verifyAccount}
                      placeholder="Nhập số tài khoản..."
                      className="w-full bg-white border-2 border-slate-100 rounded-xl px-4 py-4 text-lg font-bold focus:border-red-500 outline-none transition-all pr-12"
                    />
                    <Building2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                  </div>
                </div>

                {isVerifying ? (
                  <div className="flex items-center gap-3 p-4 bg-blue-50 text-blue-600 rounded-xl border border-blue-100 animate-pulse">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span className="text-sm font-bold uppercase tracking-tight">Đang xác thực tài khoản...</span>
                  </div>
                ) : accountHolder ? (
                  <div className="flex items-center gap-3 p-4 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-100 animate-in zoom-in-95">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase opacity-60">Tên chủ tài khoản</p>
                      <p className="font-black tracking-tight">{accountHolder}</p>
                    </div>
                    <Check className="w-5 h-5 ml-auto" />
                  </div>
                ) : null}
              </div>

              <button
                disabled={!accountHolder || isVerifying}
                onClick={() => setStep('confirm')}
                className="w-full py-4 bg-slate-900 text-white font-bold rounded-2xl shadow-lg disabled:opacity-30 transition-all flex items-center justify-center gap-2"
              >
                Tiếp tục <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* STEP 4: CONFIRMATION */}
          {step === 'confirm' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
                <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/5 rounded-full" />
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-4">Tóm tắt giao dịch</p>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-400">Số tiền rút</span>
                    <span className="font-bold">{amount.toLocaleString()}đ</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-400">Phí dịch vụ</span>
                    <span className="font-bold">{withdrawFee.toLocaleString()}đ</span>
                  </div>
                  <div className="pt-4 border-t border-white/10 flex justify-between items-end">
                    <span className="text-slate-400 text-sm">Tổng thanh toán</span>
                    <span className="text-2xl font-black text-red-400">{(amount + withdrawFee).toLocaleString()}đ</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-2xl space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400 font-medium">Ngân hàng thụ hưởng</span>
                    <span className="font-bold text-slate-800">{selectedBank?.name}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400 font-medium">Chủ tài khoản</span>
                    <span className="font-bold text-slate-800">{accountHolder}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 ml-1 text-slate-400 font-bold text-[10px] uppercase tracking-widest">
                    <ShieldCheck className="w-3 h-3" /> Bảo mật 2 lớp
                  </div>
                  <input
                    type="password"
                    maxLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Nhập mã OTP (6 chữ số)"
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-4 text-center text-2xl font-black tracking-[1em] focus:border-red-500 outline-none transition-all placeholder:tracking-normal placeholder:font-sans placeholder:text-sm placeholder:font-bold"
                  />
                </div>
              </div>

              <button
                disabled={isPending || !password}
                onClick={handleSubmit}
                className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-black rounded-2xl shadow-xl shadow-red-500/20 active:scale-[0.98] transition-all"
              >
                {isPending ? 'Đang xác thực...' : 'Xác nhận rút tiền'}
              </button>
            </div>
          )}
        </div>

        {/* Floating Nav hint for step 1 & 2 */}
        {(step === 'amount' || step === 'bank') && (
           <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-1.5 pointer-events-none">
             {[1,2,3,4].map(idx => (
               <div key={idx} className={`h-1.5 rounded-full transition-all duration-300 ${
                 (step === 'amount' && idx === 1) || (step === 'bank' && idx === 2) 
                 ? 'w-6 bg-red-500' : 'w-1.5 bg-slate-200'
               }`} />
             ))}
           </div>
        )}
      </div>
    </>
  );
}

function RefreshCw(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
      <path d="M3 21v-5h5" />
    </svg>
  );
}

import { useState, useEffect } from 'react';
import { X, Search, Building2, Landmark, WalletCards, ShieldCheck, ArrowRight, ArrowLeft } from 'lucide-react';
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

type Step = 'AMOUNT' | 'BANK' | 'ACCOUNT' | 'VERIFY';

export function WithdrawBottomSheet({ isOpen, onClose, userId, balance }: WithdrawBottomSheetProps) {
  const { userProfile } = useAuth();
  const [step, setStep] = useState<Step>('AMOUNT');
  const [amount, setAmount] = useState<number>(0);
  const [customAmount, setCustomAmount] = useState('');
  const [selectedBank, setSelectedBank] = useState<typeof BANKS[0] | null>(null);
  const [bankAccount, setBankAccount] = useState('');
  const [accountHolder, setAccountHolder] = useState('');
  const [searchBank, setSearchBank] = useState('');
  const [otp, setOtp] = useState('');
  const [isVerifyingAccount, setIsVerifyingAccount] = useState(false);
  const WITHDRAW_FEE = 1100;

  const { mutate: withdraw, isPending } = useWithdraw();

  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setStep('AMOUNT');
        setAmount(0);
        setCustomAmount('');
        setSelectedBank(null);
        setBankAccount('');
        setAccountHolder(userProfile?.full_name ? removeVietnameseTones(userProfile.full_name) : '');
        setSearchBank('');
        setOtp('');
      }, 300);
      return;
    }
    setAccountHolder(userProfile?.full_name ? removeVietnameseTones(userProfile.full_name) : '');
  }, [isOpen, userProfile?.full_name]);

  if (!isOpen) return null;

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    let num = val ? parseInt(val, 10) : 0;
    if (num > (balance - WITHDRAW_FEE)) num = balance - WITHDRAW_FEE;
    setCustomAmount(num ? num.toLocaleString('en-US') : '');
    setAmount(num);
  };

  const verifyAccount = async () => {
    if (bankAccount.trim().length < 6) {
      toast.error('Số tài khoản chưa hợp lệ');
      return;
    }
    if (!accountHolder.trim()) {
      toast.error('Vui lòng nhập tên chủ tài khoản');
      return;
    }

    setIsVerifyingAccount(true);
    // Simulate Napas API check
    setTimeout(() => {
      setIsVerifyingAccount(false);
      setStep('VERIFY');
    }, 1200);
  };

  const handleWithdraw = () => {
    if (otp !== '123456') {
      toast.error('Mã xác thực không chính xác (Thử nhập: 123456)');
      return;
    }

    withdraw(
      { 
        userId, 
        amount, 
        bankAccount: `${selectedBank?.name} - ${bankAccount} - ${accountHolder.trim()}`
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

  const presetAmounts = [50000, 100000, 200000, 500000];
  const filteredBanks = BANKS.filter(b => 
    b.name.toLowerCase().includes(searchBank.toLowerCase()) || 
    b.fullName.toLowerCase().includes(searchBank.toLowerCase())
  );

  const totalAmount = amount > 0 ? amount + WITHDRAW_FEE : 0;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm transition-opacity" onClick={onClose} />
      <div className="fixed inset-x-0 bottom-0 z-50 max-h-[90dvh] rounded-t-[32px] bg-[#f7f9fb] px-5 pb-[calc(18px+env(safe-area-inset-bottom))] pt-5 shadow-2xl animate-in slide-in-from-bottom flex flex-col">
        {/* Header Slider */}
        <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-4" />
        
        {/* Top Navigation */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
             {step !== 'AMOUNT' && (
                <button 
                  onClick={() => {
                     setStep(s => s === 'VERIFY' ? 'ACCOUNT' : s === 'ACCOUNT' ? 'BANK' : 'AMOUNT');
                  }} 
                  className="rounded-full p-1.5 text-slate-500 hover:bg-slate-200"
                >
                   <ArrowLeft className="w-5 h-5" />
                </button>
             )}
             <div>
               <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                 Bước {step === 'AMOUNT' ? '1/4' : step === 'BANK' ? '2/4' : step === 'ACCOUNT' ? '3/4' : '4/4'}
               </p>
               <h2 className="text-[20px] font-black tracking-tight text-slate-900">
                 {step === 'AMOUNT' && 'Nhập số tiền'}
                 {step === 'BANK' && 'Chọn ngân hàng'}
                 {step === 'ACCOUNT' && 'Thông tin nhận tiền'}
                 {step === 'VERIFY' && 'Xác thực bảo mật'}
               </h2>
             </div>
          </div>
          <button onClick={onClose} className="rounded-full p-2 bg-slate-100 text-slate-500 hover:bg-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto pb-4 no-scrollbar">
          
          {/* STEP 1: AMOUNT */}
          {step === 'AMOUNT' && (
            <div className="space-y-4 animate-in slide-in-from-right-4">
              <div className="rounded-[28px] bg-slate-50 p-5 shadow-[0_12px_32px_rgba(15,23,42,0.06)] border border-slate-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">Số dư hiện tại</p>
                    <p className="mt-1 text-[24px] font-black tracking-tight text-slate-900">
                      {balance.toLocaleString('vi-VN')}đ
                    </p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#006399]/10 text-[#006399]">
                    <WalletCards className="h-6 w-6" />
                  </div>
                </div>
              </div>

              <div className="rounded-[28px] bg-white p-5 shadow-[0_12px_32px_rgba(15,23,42,0.03)] border border-slate-100">
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-[12px] font-bold text-slate-500">Số tiền muốn rút</label>
                  <button
                    onClick={() => {
                      const max = balance > WITHDRAW_FEE ? balance - WITHDRAW_FEE : 0;
                      setAmount(max);
                      setCustomAmount(max ? max.toLocaleString('en-US') : '');
                    }}
                    className="text-xs font-bold text-[#006399] uppercase tracking-wider"
                  >
                    Tối đa
                  </button>
                </div>
                <div className="rounded-[20px] bg-slate-50 px-4 py-4">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={customAmount}
                    onChange={handleAmountChange}
                    placeholder="0"
                    className="w-full bg-transparent text-[32px] font-black tracking-tight text-[#006399] outline-none placeholder:text-slate-300"
                  />
                  <p className="mt-2 text-xs text-slate-400 font-medium">Tối thiểu: 50.000đ</p>
                </div>
                
                <div className="mt-4 grid grid-cols-4 gap-2">
                  {presetAmounts.map((preset) => (
                    <button
                      key={preset}
                      onClick={() => {
                        const finalAmount = preset > (balance - WITHDRAW_FEE) ? (balance - WITHDRAW_FEE) : preset;
                        if (finalAmount > 0) {
                          setAmount(finalAmount);
                          setCustomAmount(finalAmount.toLocaleString('en-US'));
                        }
                      }}
                      className={`py-3 px-1 rounded-xl border-2 font-bold text-xs transition-all tracking-wide ${
                        amount === preset
                          ? 'border-[#006399] bg-sky-50 text-[#006399]'
                          : 'border-transparent bg-slate-50 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {preset >= 1000000 ? `${preset / 1000000}M` : `${preset / 1000}K`}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-[24px] bg-sky-50 p-4 border border-sky-100">
                 <div className="flex justify-between text-[13px] font-medium text-slate-600 mb-2">
                    <span>Số tiền rút</span>
                    <span className="font-bold">{amount.toLocaleString('vi-VN')}đ</span>
                 </div>
                 <div className="flex justify-between text-[13px] font-medium text-slate-600 mb-3 pb-3 border-b border-sky-100">
                    <span>Phí giao dịch</span>
                    <span className="font-bold text-rose-600">{amount > 0 ? WITHDRAW_FEE.toLocaleString('vi-VN') : '0'}đ</span>
                 </div>
                 <div className="flex justify-between">
                    <span className="text-sm font-bold text-[#006399]">Tổng trừ</span>
                    <span className="text-lg font-black text-[#006399]">{totalAmount.toLocaleString('vi-VN')}đ</span>
                 </div>
              </div>

              <button
                disabled={amount < 50000 || totalAmount > balance}
                onClick={() => setStep('BANK')}
                className="w-full rounded-[22px] bg-[#006399] flex items-center justify-center gap-2 px-4 py-4 mt-2 text-sm font-black text-white shadow-lg shadow-[#006399]/30 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none disabled:active:scale-100"
              >
                Tiếp tục: Bấm chọn ngân hàng <ArrowRight className="w-4 h-4"/>
              </button>
            </div>
          )}

          {/* STEP 2: BANK */}
          {step === 'BANK' && (
            <div className="space-y-4 animate-in slide-in-from-right-4">
               <div className="rounded-2xl bg-white p-2 flex items-center gap-3">
                  <div className="flex-1 relative">
                     <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                     <input
                        type="text"
                        placeholder="Tìm kiếm ngân hàng..."
                        value={searchBank}
                        onChange={(e) => setSearchBank(e.target.value)}
                        className="w-full bg-slate-50 rounded-xl py-3 pl-11 pr-4 text-sm font-medium outline-none focus:ring-2 ring-[#006399]/20"
                     />
                  </div>
               </div>
               
               <div className="grid grid-cols-1 gap-2">
                 {filteredBanks.map((bank) => (
                   <button
                     key={bank.id}
                     onClick={() => {
                        setSelectedBank(bank);
                        setStep('ACCOUNT');
                     }}
                     className="flex w-full items-center gap-4 rounded-[20px] bg-white p-4 text-left shadow-sm border border-slate-100 active:scale-95 transition-transform"
                   >
                     <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${bank.color} text-white shadow-sm`}>
                       <Landmark className="h-5 w-5" />
                     </div>
                     <div className="min-w-0 flex-1">
                       <p className="truncate text-[15px] font-bold text-slate-900">{bank.name}</p>
                       <p className="truncate text-[12px] font-medium text-slate-500 mt-0.5">{bank.fullName}</p>
                     </div>
                     <ChevronRight className="w-5 h-5 text-slate-300" />
                   </button>
                 ))}
               </div>
            </div>
          )}

          {/* STEP 3: ACCOUNT INPUT */}
          {step === 'ACCOUNT' && (
            <div className="space-y-4 animate-in slide-in-from-right-4">
              <div className="flex items-center gap-4 rounded-[24px] bg-white p-4 shadow-sm border border-slate-100">
                 <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${selectedBank?.color} text-white`}>
                   <Landmark className="h-6 w-6" />
                 </div>
                 <div>
                    <h3 className="font-bold text-slate-900">{selectedBank?.name}</h3>
                    <button onClick={() => setStep('BANK')} className="text-[11px] font-bold uppercase text-[#006399] tracking-wider mt-1">Đổi ngân hàng</button>
                 </div>
              </div>

              <div className="rounded-[28px] bg-white p-5 shadow-sm border border-slate-100">
                <div className="space-y-5">
                  <div>
                    <label className="mb-2 block text-[12px] font-bold text-slate-500">Số tài khoản thụ hưởng</label>
                    <div className="relative">
                      <input
                        type="text"
                        inputMode="numeric"
                        value={bankAccount}
                        onChange={(e) => setBankAccount(e.target.value.replace(/[^0-9]/g, ''))}
                        placeholder="Nhập số tài khoản"
                        className="w-full rounded-[20px] bg-slate-50 px-4 py-4 pr-12 text-[16px] font-bold tracking-widest text-slate-900 outline-none focus:bg-sky-50 focus:ring-2 ring-[#006399]/20 transition-all"
                      />
                      <Building2 className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-[12px] font-bold text-slate-500">Tên người nhận (In hoa không dấu)</label>
                    <input
                      type="text"
                      value={accountHolder}
                      onChange={(e) => setAccountHolder(removeVietnameseTones(e.target.value))}
                      placeholder="VD: NGUYEN VAN A"
                      className="w-full rounded-[20px] bg-slate-50 px-4 py-4 text-[15px] font-bold uppercase tracking-[0.04em] text-slate-900 outline-none focus:bg-sky-50 focus:ring-2 ring-[#006399]/20 transition-all"
                    />
                  </div>
                </div>
              </div>

              <button
                disabled={isVerifyingAccount || bankAccount.trim().length < 6 || !accountHolder.trim()}
                onClick={verifyAccount}
                className="w-full rounded-[22px] bg-[#006399] flex justify-center items-center gap-2 px-4 py-4 mt-2 text-sm font-black text-white shadow-lg shadow-[#006399]/30 transition-all active:scale-95 disabled:opacity-40"
              >
                {isVerifyingAccount ? 'Đang kiểm tra Napas...' : 'Tiếp tục: Xác nhận cuối'}
                {!isVerifyingAccount && <ArrowRight className="w-4 h-4"/>}
              </button>
            </div>
          )}

          {/* STEP 4: VERIFY AND CONFIRM */}
          {step === 'VERIFY' && (
             <div className="space-y-4 animate-in slide-in-from-right-4">
                <div className="bg-white p-5 rounded-[28px] border border-slate-100 text-center shadow-sm">
                   <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4">
                     <ShieldCheck className="w-8 h-8" />
                   </div>
                   <h3 className="font-black text-2xl text-slate-900 mb-1">{amount.toLocaleString('vi-VN')}đ</h3>
                   <p className="text-sm text-slate-500 font-medium">chuyển đến {selectedBank?.name}</p>
                   
                   <div className="bg-slate-50 p-4 rounded-2xl mt-4 text-left">
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Người nhận</p>
                      <p className="font-bold text-slate-900 uppercase">{accountHolder}</p>
                      <p className="text-sm font-medium tracking-widest text-[#006399] mt-1">{bankAccount}</p>
                   </div>
                </div>

                <div className="bg-white p-5 rounded-[28px] border border-slate-100 shadow-sm">
                   <label className="mb-2 block text-[13px] font-bold text-slate-700">Mã xác nhận bảo mật</label>
                   <p className="text-xs text-slate-500 mb-4 font-medium">Vì lý do bảo mật, vui lòng nhập mã PIN hoặc OTP của bạn. (Mã test: <strong className="text-slate-900">123456</strong>)</p>
                   
                   <input
                     type="password"
                     inputMode="numeric"
                     value={otp}
                     onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                     placeholder="••••••"
                     className="w-full rounded-[20px] bg-slate-50 text-center px-4 py-4 text-[24px] tracking-[0.5em] font-black text-slate-900 outline-none focus:bg-sky-50 focus:ring-2 ring-[#006399]/20 transition-all font-mono"
                   />
                </div>

                <button
                  disabled={isPending || otp.length !== 6}
                  onClick={handleWithdraw}
                  className="w-full rounded-[22px] bg-[#0f172a] px-4 py-4 mt-2 text-sm font-black text-white shadow-lg shadow-slate-300/60 transition-all active:scale-95 disabled:opacity-40"
                >
                  {isPending ? 'Đang thực hiện giao dịch...' : 'Xác nhận Rút tiền ngay'}
                </button>
             </div>
          )}
        </div>
      </div>
    </>
  );
}

// Additional Chevron component for step 2
function ChevronRight(props: any) {
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
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

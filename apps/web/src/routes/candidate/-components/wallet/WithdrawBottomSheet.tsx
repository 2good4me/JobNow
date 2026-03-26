import { useState, useEffect } from 'react';
import { X, Search, Building2, Landmark, WalletCards } from 'lucide-react';
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

export function WithdrawBottomSheet({ isOpen, onClose, userId, balance }: WithdrawBottomSheetProps) {
  const { userProfile } = useAuth();
  const [amount, setAmount] = useState<number>(0);
  const [customAmount, setCustomAmount] = useState('');
  const [selectedBank, setSelectedBank] = useState<typeof BANKS[0] | null>(null);
  const [bankAccount, setBankAccount] = useState('');
  const [accountHolder, setAccountHolder] = useState('');
  const [searchBank, setSearchBank] = useState('');
  const [showBankPicker, setShowBankPicker] = useState(false);

  const { mutate: withdraw, isPending } = useWithdraw();

  // Reset state when closed
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setAmount(0);
        setCustomAmount('');
        setSelectedBank(null);
        setBankAccount('');
        setAccountHolder(userProfile?.full_name ? removeVietnameseTones(userProfile.full_name) : '');
        setSearchBank('');
        setShowBankPicker(false);
      }, 300);
      return;
    }

    setAccountHolder(userProfile?.full_name ? removeVietnameseTones(userProfile.full_name) : '');
  }, [isOpen, userProfile?.full_name]);

  if (!isOpen) return null;

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    let num = val ? parseInt(val, 10) : 0;
    if (num > balance) num = balance;
    setCustomAmount(num ? num.toLocaleString('en-US') : '');
    setAmount(num);
  };

  const handleBankSelect = (bank: typeof BANKS[0]) => {
    setSelectedBank(bank);
    setShowBankPicker(false);
  };

  const handleSubmit = () => {
    if (!selectedBank) {
      toast.error('Vui lòng chọn ngân hàng nhận tiền');
      return;
    }

    if (bankAccount.trim().length < 6) {
      toast.error('Số tài khoản chưa hợp lệ');
      return;
    }

    if (!accountHolder.trim()) {
      toast.error('Vui lòng nhập tên chủ tài khoản');
      return;
    }

    if (amount < 50000) {
      toast.error('Số tiền rút tối thiểu là 50.000đ');
      return;
    }

    withdraw(
      { 
        userId, 
        amount, 
        bankAccount: `${selectedBank.name} - ${bankAccount} - ${accountHolder.trim()}`
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

  return (
    <>
      <div className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm transition-opacity" onClick={onClose} />
      <div className="fixed inset-x-0 bottom-0 z-50 max-h-[88dvh] rounded-t-[2rem] bg-white px-5 pb-[calc(18px+env(safe-area-inset-bottom))] pt-5 shadow-2xl animate-in slide-in-from-bottom">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">Withdraw</p>
            <h2 className="mt-1 text-[22px] font-black tracking-tight text-slate-900">Rút tiền về tài khoản</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-500">
              Tiền sẽ về tài khoản trong 1-3 ngày làm việc sau khi giao dịch được duyệt.
            </p>
          </div>
          <button onClick={onClose} className="rounded-full p-2 text-slate-500 hover:bg-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="max-h-[calc(88dvh-110px)] overflow-y-auto pb-4">
          <div className="space-y-5">
            <div className="rounded-[28px] bg-slate-50 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">Số dư khả dụng</p>
                  <p className="mt-2 text-[28px] font-black tracking-tight text-slate-900">
                    {balance.toLocaleString('vi-VN')}đ
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0f172a] text-white">
                  <WalletCards className="h-5 w-5" />
                </div>
              </div>

              <div className="mt-5">
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-[12px] font-bold text-slate-500">Số tiền rút</label>
                  <button
                    onClick={() => {
                      setAmount(balance);
                      setCustomAmount(balance ? balance.toLocaleString('en-US') : '');
                    }}
                    className="text-sm font-bold text-emerald-600"
                  >
                    Tối đa
                  </button>
                </div>
                <div className="rounded-[24px] bg-white px-4 py-4 shadow-sm shadow-slate-200/60">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={customAmount}
                    onChange={handleAmountChange}
                    placeholder="0"
                    className="w-full bg-transparent text-[30px] font-black tracking-tight text-slate-900 outline-none placeholder:text-slate-300"
                  />
                  <p className="mt-2 text-xs text-slate-400">Số tiền rút tối thiểu 50.000đ</p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {presetAmounts.map((preset) => (
                  <button
                    key={preset}
                    onClick={() => {
                      const finalAmount = preset > balance ? balance : preset;
                      setAmount(finalAmount);
                      setCustomAmount(finalAmount ? finalAmount.toLocaleString('en-US') : '');
                    }}
                    className={`py-3 px-1 rounded-xl border-2 font-bold text-sm transition-all ${
                      amount === preset
                        ? 'border-[#0369a1] bg-sky-50 text-[#0369a1]'
                        : 'border-transparent bg-white text-slate-600'
                    }`}
                  >
                    {preset >= 1000000 ? `${preset / 1000000}M` : `${preset / 1000}k`}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-[28px] bg-white p-5 shadow-[0_12px_32px_rgba(15,23,42,0.06)]">
              <div className="flex items-center justify-between">
                <label className="text-[12px] font-bold text-slate-500">Ngân hàng nhận tiền</label>
                <button
                  onClick={() => setShowBankPicker((prev) => !prev)}
                  className="text-sm font-bold text-[#0369a1]"
                >
                  {showBankPicker ? 'Đóng' : 'Chọn'}
                </button>
              </div>

              <button
                onClick={() => setShowBankPicker((prev) => !prev)}
                className="mt-3 flex w-full items-center gap-3 rounded-[22px] bg-slate-50 px-4 py-4 text-left"
              >
                <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${selectedBank?.color ?? 'bg-slate-200'} text-white`}>
                  <Landmark className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14px] font-bold text-slate-900">{selectedBank?.name ?? 'Chọn ngân hàng thụ hưởng'}</p>
                  <p className="truncate text-[12px] text-slate-500">{selectedBank?.fullName ?? 'Hỗ trợ rút tiền về tài khoản nội địa'}</p>
                </div>
              </button>

              {showBankPicker && (
                <div className="mt-3 space-y-3 rounded-[24px] bg-slate-50 p-4">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Tìm ngân hàng"
                      value={searchBank}
                      onChange={(e) => setSearchBank(e.target.value)}
                      className="w-full rounded-2xl bg-white py-3 pl-11 pr-4 text-sm outline-none"
                    />
                  </div>
                  <div className="max-h-52 space-y-2 overflow-y-auto">
                    {filteredBanks.map((bank) => (
                      <button
                        key={bank.id}
                        onClick={() => handleBankSelect(bank)}
                        className={`flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition-colors ${
                          selectedBank?.id === bank.id ? 'bg-white shadow-sm shadow-slate-200/60' : 'bg-transparent hover:bg-white/70'
                        }`}
                      >
                        <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${bank.color} text-white`}>
                          <Landmark className="h-4 w-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-bold text-slate-900">{bank.name}</p>
                          <p className="truncate text-[11px] text-slate-500">{bank.fullName}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="rounded-[28px] bg-white p-5 shadow-[0_12px_32px_rgba(15,23,42,0.06)]">
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-[12px] font-bold text-slate-500">Số tài khoản</label>
                  <div className="relative">
                    <input
                      type="text"
                      inputMode="numeric"
                      value={bankAccount}
                      onChange={(e) => setBankAccount(e.target.value.replace(/[^0-9]/g, ''))}
                      placeholder="Nhập số tài khoản ngân hàng"
                      className="w-full rounded-[22px] bg-slate-50 px-4 py-4 pr-12 text-[15px] font-bold text-slate-900 outline-none"
                    />
                    <Building2 className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-300" />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-[12px] font-bold text-slate-500">Tên chủ tài khoản</label>
                  <input
                    type="text"
                    value={accountHolder}
                    onChange={(e) => setAccountHolder(removeVietnameseTones(e.target.value))}
                    placeholder="NGUYEN VAN A"
                    className="w-full rounded-[22px] bg-slate-50 px-4 py-4 text-[15px] font-bold uppercase tracking-[0.04em] text-slate-900 outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-[28px] bg-emerald-50 p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[12px] font-bold text-emerald-700">Phí rút: 0đ (miễn phí)</p>
                  <p className="mt-2 text-sm leading-relaxed text-emerald-800/80">
                    Tiền sẽ về tài khoản trong 1-3 ngày làm việc. Với giao dịch lỗi, số dư sẽ được hoàn lại tự động.
                  </p>
                </div>
                <div className="rounded-full bg-white/80 px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-emerald-700">
                  Free
                </div>
              </div>
            </div>

            <button
              disabled={isPending || amount < 50000 || !selectedBank || bankAccount.trim().length < 6 || !accountHolder.trim()}
              onClick={handleSubmit}
              className="w-full rounded-[22px] bg-[#0f172a] px-4 py-4 text-sm font-black text-white shadow-lg shadow-slate-300/60 transition-opacity disabled:opacity-40"
            >
              {isPending ? 'Đang xử lý...' : 'Xác nhận rút tiền'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithPhoneNumber,
  RecaptchaVerifier,
  ConfirmationResult,
  updateProfile,
} from 'firebase/auth';
import { auth } from '@/config/firebase';
import { createUserDocument } from '@/lib/firestore';
import { useAuth } from '@/features/auth/context/AuthContext';
import type { UserRole } from '@/features/auth/types/user';
import {
  UserPlus, Eye, EyeOff, Mail, Lock, Loader2,
  BriefcaseBusiness, User, Search, Building2, ArrowLeft,
  Phone, ArrowRight, ShieldCheck,
} from 'lucide-react';

export const Route = createFileRoute('/register')({
  component: RegisterPage,
});

const googleProvider = new GoogleAuthProvider();

function getFirebaseErrorVi(code: string): string {
  const map: Record<string, string> = {
    'auth/email-already-in-use': 'Email này đã được đăng ký. Vui lòng đăng nhập.',
    'auth/invalid-email': 'Địa chỉ email không hợp lệ.',
    'auth/weak-password': 'Mật khẩu quá yếu. Cần tối thiểu 6 ký tự.',
    'auth/operation-not-allowed': 'Phương thức đăng ký này chưa được bật.',
    'auth/popup-closed-by-user': 'Bạn đã đóng cửa sổ đăng nhập Google.',
    'auth/network-request-failed': 'Lỗi mạng. Vui lòng kiểm tra kết nối.',
    'auth/invalid-phone-number': 'Số điện thoại không hợp lệ.',
    'auth/invalid-verification-code': 'Mã OTP không đúng. Vui lòng thử lại.',
    'auth/code-expired': 'Mã OTP đã hết hạn. Vui lòng gửi lại.',
    'auth/missing-phone-number': 'Vui lòng nhập số điện thoại.',
  };
  return map[code] ?? 'Đăng ký thất bại. Vui lòng thử lại.';
}

/* ──────────────────────────────────────────────
   Step 1: Role Selection (Mobile)
   ────────────────────────────────────────────── */
function RoleSelector({ onSelect }: { onSelect: (role: UserRole) => void }) {
  return (
    <div className="min-h-[100dvh] bg-white flex flex-col">
      {/* Gradient Header */}
      <div className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-purple-700 px-6 pt-12 pb-10 rounded-b-[32px] overflow-hidden">
        <div className="absolute top-6 right-6 w-20 h-20 rounded-full bg-white/5" />
        <div className="absolute -bottom-4 -left-4 w-28 h-28 rounded-full bg-white/5" />

        <Link to="/login" className="absolute top-4 left-4 p-2 bg-white/10 rounded-full backdrop-blur-sm">
          <ArrowLeft className="w-5 h-5 text-white" />
        </Link>

        <div className="text-center mt-4">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center mb-4 shadow-lg">
            <BriefcaseBusiness className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white font-heading">Tạo tài khoản</h1>
          <p className="text-sm text-white/60 mt-1">Bạn muốn sử dụng JobNow để...</p>
        </div>
      </div>

      {/* Cards */}
      <div className="flex-1 px-6 -mt-4">
        <div className="space-y-3 animate-fade-in-up">
          {/* Candidate */}
          <button
            type="button"
            onClick={() => onSelect('CANDIDATE')}
            className="w-full flex items-center gap-4 p-5 bg-white rounded-2xl border-2 border-slate-200 shadow-sm hover:border-primary-400 hover:shadow-md active:scale-[0.98] transition-all cursor-pointer"
          >
            <div className="w-14 h-14 rounded-xl bg-primary-50 flex items-center justify-center shrink-0">
              <Search className="w-7 h-7 text-primary-600" />
            </div>
            <div className="text-left">
              <h3 className="font-bold text-slate-900">Tìm việc</h3>
              <p className="text-xs text-slate-500 mt-0.5">Tìm việc thời vụ gần bạn, ứng tuyển nhanh chóng</p>
            </div>
          </button>

          {/* Employer */}
          <button
            type="button"
            onClick={() => onSelect('EMPLOYER')}
            className="w-full flex items-center gap-4 p-5 bg-white rounded-2xl border-2 border-slate-200 shadow-sm hover:border-emerald-400 hover:shadow-md active:scale-[0.98] transition-all cursor-pointer"
          >
            <div className="w-14 h-14 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
              <Building2 className="w-7 h-7 text-emerald-600" />
            </div>
            <div className="text-left">
              <h3 className="font-bold text-slate-900">Tuyển dụng</h3>
              <p className="text-xs text-slate-500 mt-0.5">Đăng tin & tìm ứng viên phù hợp cho cửa hàng</p>
            </div>
          </button>
        </div>

        <p className="text-center text-sm text-slate-500 mt-6 mb-8">
          Đã có tài khoản?{' '}
          <Link to="/login" className="font-semibold text-primary-600">Đăng nhập</Link>
        </p>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────
   Step 2: Registration Form (Mobile)
   ────────────────────────────────────────────── */
function RegisterForm({ selectedRole, onBack }: { selectedRole: UserRole; onBack: () => void }) {
  const [tab, setTab] = useState<'email' | 'phone'>('email');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [confirmResult, setConfirmResult] = useState<ConfirmationResult | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const navigate = useNavigate();
  const { refreshProfile } = useAuth();

  const busy = loading || googleLoading;
  const isCandidate = selectedRole === 'CANDIDATE';

  /* reCAPTCHA */
  useEffect(() => {
    if (tab === 'phone') {
      try {
        if (!(window as any).recaptchaVerifier) {
          (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container-reg', {
            size: 'invisible',
            callback: () => { },
          });
        }
      } catch (err) {
        console.error('reCAPTCHA init error:', err);
      }
    }
    return () => {
      if ((window as any).recaptchaVerifier) {
        try { (window as any).recaptchaVerifier.clear(); } catch (e) { }
        (window as any).recaptchaVerifier = null;
      }
    };
  }, [tab]);

  const validate = (): string | null => {
    if (name.trim().length < 2) return 'Vui lòng nhập họ tên (tối thiểu 2 ký tự).';
    if (password.length < 6) return 'Mật khẩu cần tối thiểu 6 ký tự.';
    if (password !== confirmPw) return 'Mật khẩu xác nhận không khớp.';
    return null;
  };

  /* Email register */
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const validationError = validate();
    if (validationError) { setError(validationError); return; }

    setLoading(true);
    try {
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCred.user, { displayName: name.trim() });
      await createUserDocument(userCred.user.uid, {
        email, full_name: name.trim(), role: selectedRole, avatar_url: userCred.user.photoURL,
      });
      await refreshProfile();
      navigate({ to: '/' });
    } catch (err: any) {
      setError(getFirebaseErrorVi(err.code));
    } finally {
      setLoading(false);
    }
  };

  /* Phone: Send OTP */
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (name.trim().length < 2) { setError('Vui lòng nhập họ tên (tối thiểu 2 ký tự).'); return; }
    if (!phone.trim()) { setError('Vui lòng nhập số điện thoại.'); return; }

    setLoading(true);
    try {
      if (!(window as any).recaptchaVerifier) {
        (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container-reg', {
          size: 'invisible',
          callback: () => { },
        });
      }
      const appVerifier = (window as any).recaptchaVerifier;
      const formattedPhone = phone.startsWith('0')
        ? `+84${phone.slice(1)}`
        : phone.startsWith('+') ? phone : `+84${phone}`;
      const result = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
      setConfirmResult(result);
      setOtpSent(true);
    } catch (err: any) {
      console.error('Phone send OTP error:', err);
      setError(getFirebaseErrorVi(err.code));
      if ((window as any).recaptchaVerifier) {
        try { (window as any).recaptchaVerifier.clear(); } catch (e) { }
        (window as any).recaptchaVerifier = null;
      }
    } finally {
      setLoading(false);
    }
  };

  /* Phone: Verify OTP */
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!otp.trim() || otp.length < 6) { setError('Vui lòng nhập đủ 6 số mã OTP.'); return; }
    if (!confirmResult) { setError('Phiên xác thực hết hạn. Vui lòng gửi lại mã.'); return; }

    setLoading(true);
    try {
      const userCred = await confirmResult.confirm(otp);
      if (userCred.user) {
        await updateProfile(userCred.user, { displayName: name.trim() });
        const formattedPhone = phone.startsWith('0')
          ? `+84${phone.slice(1)}`
          : phone.startsWith('+') ? phone : `+84${phone}`;
        await createUserDocument(userCred.user.uid, {
          email: '', full_name: name.trim(), role: selectedRole,
          avatar_url: null, phone_number: formattedPhone,
        });
        await refreshProfile();
        navigate({ to: '/' });
      }
    } catch (err: any) {
      console.error('Phone verify OTP error:', err);
      setError(getFirebaseErrorVi(err.code));
    } finally {
      setLoading(false);
    }
  };

  /* Google */
  const handleGoogle = async () => {
    setError('');
    setGoogleLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      await createUserDocument(result.user.uid, {
        email: result.user.email || '', full_name: result.user.displayName || '',
        role: selectedRole, avatar_url: result.user.photoURL,
      });
      await refreshProfile();
      navigate({ to: '/' });
    } catch (err: any) {
      setError(getFirebaseErrorVi(err.code));
    } finally {
      setGoogleLoading(false);
    }
  };

  /* Password strength */
  const pwStrength = (() => {
    if (!password) return { level: 0, label: '', color: '' };
    let score = 0;
    if (password.length >= 6) score++;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    if (score <= 2) return { level: score, label: 'Yếu', color: 'bg-red-400' };
    if (score <= 3) return { level: score, label: 'Trung bình', color: 'bg-amber-400' };
    return { level: score, label: 'Mạnh', color: 'bg-emerald-400' };
  })();

  const gradientColor = isCandidate
    ? 'from-primary-600 via-primary-700 to-purple-700'
    : 'from-emerald-600 via-emerald-700 to-teal-700';

  return (
    <div className="min-h-[100dvh] bg-white flex flex-col">
      {/* Gradient Header */}
      <div className={`relative bg-gradient-to-br ${gradientColor} px-6 pt-12 pb-10 rounded-b-[32px] overflow-hidden`}>
        <div className="absolute top-6 right-6 w-20 h-20 rounded-full bg-white/5" />
        <div className="absolute -bottom-4 -left-4 w-28 h-28 rounded-full bg-white/5" />

        <button onClick={onBack} className="absolute top-4 left-4 p-2 bg-white/10 rounded-full backdrop-blur-sm" type="button">
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>

        {/* Role badge */}
        <div className="absolute top-4 right-4">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-white/15 rounded-full text-[11px] font-bold text-white backdrop-blur-sm">
            {isCandidate ? <><Search className="w-3 h-3" /> Tìm việc</> : <><Building2 className="w-3 h-3" /> Tuyển dụng</>}
          </span>
        </div>

        <div className="text-center mt-4">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center mb-4 shadow-lg">
            <UserPlus className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white font-heading">Đăng ký</h1>
          <p className="text-sm text-white/60 mt-1">
            {isCandidate ? 'Bắt đầu tìm việc ngay hôm nay' : 'Tìm ứng viên phù hợp nhanh chóng'}
          </p>
        </div>
      </div>

      {/* Form Area */}
      <div className="flex-1 px-6 -mt-4 pb-8 overflow-y-auto">
        <div className="bg-white rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-100 p-6 animate-fade-in-up">
          {/* Error */}
          {error && (
            <div className="flex items-start gap-2 bg-red-50 text-red-700 text-sm p-3 rounded-xl border border-red-100 mb-4" role="alert">
              <svg className="w-4 h-4 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
              <span>{error}</span>
            </div>
          )}

          {/* Google */}
          <button type="button" onClick={handleGoogle} disabled={busy}
            className="w-full flex items-center justify-center gap-3 py-3 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition-all cursor-pointer shadow-sm">
            {googleLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
            )}
            Tiếp tục với Google
          </button>

          {/* Divider */}
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200" /></div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-3 text-slate-400 uppercase tracking-wider font-medium">hoặc</span>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex bg-slate-100 rounded-xl p-1 mb-5">
            <button type="button" onClick={() => { setTab('email'); setError(''); }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${tab === 'email' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}>
              <Mail className="w-4 h-4" /> Email
            </button>
            <button type="button" onClick={() => { setTab('phone'); setError(''); setOtpSent(false); setOtp(''); }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${tab === 'phone' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}>
              <Phone className="w-4 h-4" /> Điện thoại
            </button>
          </div>

          {/* ── Email Form ─── */}
          {tab === 'email' && (
            <form className="space-y-3 animate-fade-in-up" onSubmit={handleRegister} noValidate>
              <div>
                <label htmlFor="reg-name" className="block text-xs font-semibold text-slate-600 mb-1">
                  {isCandidate ? 'Họ và tên' : 'Tên người đại diện'}
                </label>
                <div className="relative">
                  <User className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input id="reg-name" type="text" autoComplete="name" required disabled={busy}
                    placeholder="Nguyễn Văn A" value={name} onChange={e => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-primary-500 outline-none transition-all disabled:opacity-50" />
                </div>
              </div>

              <div>
                <label htmlFor="reg-email" className="block text-xs font-semibold text-slate-600 mb-1">Email</label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input id="reg-email" type="email" autoComplete="email" required disabled={busy}
                    placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-primary-500 outline-none transition-all disabled:opacity-50" />
                </div>
              </div>

              <div>
                <label htmlFor="reg-pw" className="block text-xs font-semibold text-slate-600 mb-1">Mật khẩu</label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input id="reg-pw" type={showPw ? 'text' : 'password'} autoComplete="new-password" required disabled={busy}
                    placeholder="Tối thiểu 6 ký tự" value={password} onChange={e => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-primary-500 outline-none transition-all disabled:opacity-50" />
                  <button type="button" tabIndex={-1} onClick={() => setShowPw(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer">
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {password && (
                  <div className="mt-1.5 flex items-center gap-2">
                    <div className="flex gap-1 flex-1">
                      {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i <= pwStrength.level ? pwStrength.color : 'bg-slate-200'}`} />
                      ))}
                    </div>
                    <span className="text-[10px] font-medium text-slate-500">{pwStrength.label}</span>
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="reg-confirm" className="block text-xs font-semibold text-slate-600 mb-1">Xác nhận mật khẩu</label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input id="reg-confirm" type={showPw ? 'text' : 'password'} autoComplete="new-password" required disabled={busy}
                    placeholder="Nhập lại mật khẩu" value={confirmPw} onChange={e => setConfirmPw(e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 bg-slate-50 border rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-primary-500 outline-none transition-all disabled:opacity-50 ${confirmPw && confirmPw !== password ? 'border-red-300' : 'border-slate-200'}`} />
                </div>
                {confirmPw && confirmPw !== password && <p className="mt-1 text-[11px] text-red-500">Mật khẩu không khớp</p>}
              </div>

              <button type="submit" disabled={busy}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-primary-600 to-primary-500 shadow-lg shadow-primary-500/25 disabled:opacity-50 transition-all cursor-pointer mt-1">
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Đang tạo tài khoản…</> : <><UserPlus className="w-4 h-4" /> Tạo tài khoản</>}
              </button>
            </form>
          )}

          {/* ── Phone Form ─── */}
          {tab === 'phone' && !otpSent && (
            <form className="space-y-3 animate-fade-in-up" onSubmit={handleSendOtp} noValidate>
              <div>
                <label htmlFor="reg-phone-name" className="block text-xs font-semibold text-slate-600 mb-1">
                  {isCandidate ? 'Họ và tên' : 'Tên người đại diện'}
                </label>
                <div className="relative">
                  <User className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input id="reg-phone-name" type="text" autoComplete="name" required disabled={busy}
                    placeholder="Nguyễn Văn A" value={name} onChange={e => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-primary-500 outline-none transition-all disabled:opacity-50" />
                </div>
              </div>
              <div>
                <label htmlFor="reg-phone" className="block text-xs font-semibold text-slate-600 mb-1">Số điện thoại</label>
                <div className="relative">
                  <Phone className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input id="reg-phone" type="tel" autoComplete="tel" required disabled={busy}
                    placeholder="0912 345 678" value={phone} onChange={e => setPhone(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-primary-500 outline-none transition-all disabled:opacity-50" />
                </div>
                <p className="mt-1 text-[11px] text-slate-400">Mã xác thực 6 số sẽ được gửi qua SMS</p>
              </div>
              <button type="submit" disabled={busy}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-primary-600 to-primary-500 shadow-lg shadow-primary-500/25 disabled:opacity-50 transition-all cursor-pointer">
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Đang gửi mã…</> : <><ArrowRight className="w-4 h-4" /> Gửi mã OTP</>}
              </button>
            </form>
          )}

          {/* ── OTP Verify ─── */}
          {tab === 'phone' && otpSent && (
            <form className="space-y-3 animate-fade-in-up" onSubmit={handleVerifyOtp} noValidate>
              <div className="text-center mb-2">
                <div className="mx-auto w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center mb-2">
                  <ShieldCheck className="w-6 h-6 text-emerald-600" />
                </div>
                <p className="text-sm text-slate-600">
                  Nhập mã 6 số đã gửi đến <strong className="text-slate-800">{phone}</strong>
                </p>
              </div>
              <input id="reg-otp" type="text" inputMode="numeric" maxLength={6} autoComplete="one-time-code"
                required disabled={busy} placeholder="000000" value={otp}
                onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                className="w-full text-center text-2xl font-bold tracking-[0.4em] py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-300 focus:bg-white focus:ring-2 focus:ring-primary-500 outline-none transition-all disabled:opacity-50" />
              <button type="submit" disabled={busy || otp.length < 6}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-emerald-600 to-emerald-500 shadow-lg shadow-emerald-500/25 disabled:opacity-50 transition-all cursor-pointer">
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Đang xác thực…</> : <><ShieldCheck className="w-4 h-4" /> Xác thực & Tạo tài khoản</>}
              </button>
              <button type="button"
                onClick={() => { setOtpSent(false); setOtp(''); setError(''); (window as any).recaptchaVerifier = null; }}
                className="w-full text-center text-sm font-semibold text-slate-500 hover:text-slate-700 cursor-pointer py-1">
                ← Nhập lại số điện thoại
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-sm text-slate-500 mt-5">
          Đã có tài khoản?{' '}
          <Link to="/login" className="font-semibold text-primary-600">Đăng nhập</Link>
        </p>
      </div>

      <div id="recaptcha-container-reg" />
    </div>
  );
}

/* ── Main Orchestrator ─── */
function RegisterPage() {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);

  if (!selectedRole) {
    return <RoleSelector onSelect={setSelectedRole} />;
  }

  return (
    <RegisterForm
      selectedRole={selectedRole}
      onBack={() => setSelectedRole(null)}
    />
  );
}

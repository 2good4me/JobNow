import { createFileRoute, Link } from '@tanstack/react-router';
import { useState } from 'react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/config/firebase';
import {
  BriefcaseBusiness, Mail, Loader2, ArrowLeft, CheckCircle2,
} from 'lucide-react';

export const Route = createFileRoute('/forgot-password')({
  component: ForgotPasswordPage,
});

function getFirebaseErrorVi(code: string): string {
  const map: Record<string, string> = {
    'auth/invalid-email': 'Địa chỉ email không hợp lệ.',
    'auth/user-not-found': 'Không tìm thấy tài khoản với email này.',
    'auth/too-many-requests': 'Quá nhiều lần thử. Vui lòng đợi vài phút.',
    'auth/network-request-failed': 'Lỗi mạng. Vui lòng kiểm tra kết nối.',
  };
  return map[code] ?? 'Gửi email thất bại. Vui lòng thử lại.';
}

function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.trim()) { setError('Vui lòng nhập email.'); return; }

    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setSent(true);
    } catch (err: any) {
      setError(getFirebaseErrorVi(err.code));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[100dvh]">

      {/* ── Left: Brand Panel ── */}
      <div className="hidden lg:flex relative w-[48%] min-h-screen items-center justify-center overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 40%, #7c3aed 70%, #a855f7 100%)' }}>
        <div className="absolute top-16 left-16 w-72 h-72 rounded-full bg-white/5 animate-float-slow" />
        <div className="absolute bottom-24 right-12 w-56 h-56 rounded-full bg-white/8 animate-float-slow delay-200" />
        <div className="absolute top-1/3 right-24 w-20 h-20 rounded-full bg-white/10 animate-float-slow delay-400" />
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        <div className="relative z-10 px-12 text-center max-w-md">
          <div className="mx-auto w-20 h-20 rounded-3xl bg-white/15 backdrop-blur-sm flex items-center justify-center mb-8 shadow-2xl shadow-black/20 animate-fade-in-up">
            <BriefcaseBusiness className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-4xl font-extrabold text-white mb-4 font-heading leading-tight animate-fade-in-up delay-100">
            Khôi phục<br />
            <span className="text-white/80">tài khoản của bạn</span>
          </h2>
          <p className="text-white/60 text-base leading-relaxed animate-fade-in-up delay-200">
            Chúng tôi sẽ gửi hướng dẫn đặt lại mật khẩu qua email đăng ký của bạn.
          </p>
        </div>
      </div>

      {/* ── Right: Form Panel ── */}
      <div className="flex-1 flex items-center justify-center bg-slate-50 px-5 py-12 lg:px-12">
        <div className="w-full max-w-[440px]">

          {/* Logo (mobile) */}
          <div className="lg:hidden text-center mb-8 animate-fade-in-up">
            <Link to="/" className="inline-flex items-center gap-2.5">
              <div className="bg-primary-600 p-2.5 rounded-2xl text-white shadow-lg shadow-primary-500/20">
                <BriefcaseBusiness className="w-6 h-6" />
              </div>
              <span className="font-heading font-extrabold text-2xl tracking-tight text-slate-900">
                Job<span className="text-primary-600">Now</span>
              </span>
            </Link>
          </div>

          {/* Card */}
          <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100/80 p-8 sm:p-10 animate-fade-in-up delay-100">

            {/* Back */}
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-700 transition-colors mb-6"
            >
              <ArrowLeft className="w-4 h-4" />
              Quay lại đăng nhập
            </Link>

            {!sent ? (
              <>
                {/* Header */}
                <div className="mb-8">
                  <h1 className="text-2xl sm:text-[28px] font-extrabold tracking-tight text-slate-900">
                    Quên mật khẩu?
                  </h1>
                  <p className="mt-1.5 text-slate-500 text-sm leading-relaxed">
                    Nhập email đăng ký, chúng tôi sẽ gửi link đặt lại mật khẩu cho bạn.
                  </p>
                </div>

                {/* Error */}
                {error && (
                  <div className="flex items-start gap-2.5 bg-red-50 text-red-700 text-sm p-3.5 rounded-2xl border border-red-100 mb-6 animate-fade-in-up" role="alert">
                    <svg className="w-4 h-4 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
                    <span>{error}</span>
                  </div>
                )}

                {/* Form */}
                <form className="space-y-4" onSubmit={handleSubmit} noValidate>
                  <div>
                    <label htmlFor="fp-email" className="block text-sm font-semibold text-slate-700 mb-1.5">Email</label>
                    <div className="relative">
                      <Mail className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-slate-400" />
                      <input
                        id="fp-email"
                        type="email"
                        autoComplete="email"
                        autoFocus
                        required
                        disabled={loading}
                        placeholder="you@example.com"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all disabled:opacity-50"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl text-sm font-bold text-white bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 shadow-lg shadow-primary-500/25 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
                  >
                    {loading ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Đang gửi…</>
                    ) : (
                      <><Mail className="w-4 h-4" /> Gửi link đặt lại mật khẩu</>
                    )}
                  </button>
                </form>
              </>
            ) : (
              /* Success state */
              <div className="text-center py-4 animate-fade-in-up">
                <div className="mx-auto w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-5">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                </div>
                <h2 className="text-xl font-extrabold text-slate-900 mb-2">Email đã được gửi!</h2>
                <p className="text-sm text-slate-500 leading-relaxed mb-6">
                  Kiểm tra hộp thư <strong className="text-slate-700">{email}</strong> và
                  làm theo hướng dẫn để đặt lại mật khẩu.
                </p>
                <p className="text-xs text-slate-400 mb-6">
                  Không thấy email? Kiểm tra thư mục spam hoặc thử lại.
                </p>
                <button
                  type="button"
                  onClick={() => { setSent(false); setEmail(''); setError(''); }}
                  className="text-sm font-semibold text-primary-600 hover:text-primary-500 transition-colors cursor-pointer"
                >
                  Gửi lại email
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

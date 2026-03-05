import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import {
  MapPin,
  Zap,
  ShieldCheck,
  ArrowRight,
  BriefcaseBusiness,
  ChevronRight,
  Search,
  Building2,
  Loader2,
  UserRoundCheck,
} from 'lucide-react';
import { useAuth } from '@/features/auth/context/AuthContext';
import { createUserDocument } from '@/lib/firestore';
import type { UserRole } from '@/features/auth/types/user';

export const Route = createFileRoute('/onboarding')({
  component: OnboardingPage,
});

const STORAGE_KEY = 'jobnow_onboarding_seen';

const SLIDES = [
  {
    icon: MapPin,
    iconBg: 'from-blue-500 to-cyan-400',
    title: 'Tìm việc',
    titleAccent: 'xung quanh bạn',
    desc: 'Hàng trăm việc làm part-time hiển thị trực tiếp trên bản đồ GPS',
    illustration: '🗺️',
  },
  {
    icon: Zap,
    iconBg: 'from-emerald-500 to-green-400',
    title: 'Nhận việc chỉ trong',
    titleAccent: '30 giây',
    desc: 'Chọn ca, bấm ứng tuyển, chờ duyệt. Không cần gọi điện',
    illustration: '📱',
  },
  {
    icon: ShieldCheck,
    iconBg: 'from-amber-500 to-yellow-400',
    title: 'Chấm công GPS,',
    titleAccent: 'lương về tay',
    desc: 'Check-in bằng GPS tại quán, xong ca là nhận tiền ngay',
    illustration: '💰',
  },
] as const;

function SplashScreen({ onReady }: { onReady: () => void }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(onReady, 300);
          return 100;
        }
        return prev + 2;
      });
    }, 30);
    return () => clearInterval(timer);
  }, [onReady]);

  return (
    <div
      className="min-h-[100dvh] flex flex-col items-center justify-center px-8"
      style={{ background: 'linear-gradient(160deg, #080c18 0%, #0d1530 50%, #121a3d 100%)' }}
    >
      <div className="mb-6 animate-fade-in-up">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/20 backdrop-blur flex items-center justify-center shadow-2xl shadow-blue-500/10">
          <BriefcaseBusiness className="w-10 h-10 text-blue-400" />
        </div>
      </div>

      <h1 className="text-3xl font-bold text-white font-heading mb-2 animate-fade-in-up delay-100">
        Job<span className="text-blue-400">Now</span>
      </h1>
      <p className="text-sm text-slate-400 mb-10 animate-fade-in-up delay-200">Việc làm quanh bạn, chỉ 1 chạm</p>

      <div className="w-48 animate-fade-in-up delay-300">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] text-slate-500 uppercase tracking-wider font-medium">Loading assets</span>
          <span className="text-[10px] text-blue-400 font-mono font-bold">{progress}%</span>
        </div>
        <div className="h-1 bg-white/5 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all duration-100" style={{ width: `${progress}%` }} />
        </div>
      </div>
    </div>
  );
}

function OnboardingSlide({
  slide,
  isLast,
  onNext,
  onSkip,
  currentIndex,
}: {
  slide: (typeof SLIDES)[number];
  isLast: boolean;
  onNext: () => void;
  onSkip: () => void;
  currentIndex: number;
}) {
  const Icon = slide.icon;

  return (
    <div className="min-h-[100dvh] flex flex-col px-6 py-8" style={{ background: 'linear-gradient(160deg, #080c18 0%, #0d1530 50%, #121a3d 100%)' }}>
      {!isLast && (
        <div className="flex justify-end">
          <button onClick={onSkip} className="text-sm font-medium text-slate-500 hover:text-slate-300 transition-colors cursor-pointer py-1 px-2">
            Bỏ qua
          </button>
        </div>
      )}
      {isLast && <div className="h-8" />}

      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="relative mb-10">
          <div className={`absolute inset-0 bg-gradient-to-br ${slide.iconBg} rounded-full blur-3xl opacity-15 scale-150`} />
          <div className="relative w-44 h-44 rounded-full bg-white/3 border border-white/5 flex items-center justify-center backdrop-blur-sm">
            <div className="w-32 h-32 rounded-full bg-white/5 border border-white/5 flex items-center justify-center">
              <span className="text-6xl">{slide.illustration}</span>
            </div>
          </div>
          <div className={`absolute -bottom-2 -right-2 w-14 h-14 rounded-2xl bg-gradient-to-br ${slide.iconBg} flex items-center justify-center shadow-xl`}>
            <Icon className="w-7 h-7 text-white" />
          </div>
        </div>

        <div className="text-center max-w-[300px]">
          <h2 className="text-2xl font-bold text-white font-heading leading-tight mb-3">
            {slide.title}
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">{slide.titleAccent}</span>
          </h2>
          <p className="text-sm text-slate-400 leading-relaxed">{slide.desc}</p>
        </div>
      </div>

      <div className="pb-4">
        <div className="flex items-center justify-center gap-2 mb-6">
          {SLIDES.map((_, i) => (
            <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === currentIndex ? 'w-6 bg-blue-500' : 'w-1.5 bg-white/15'}`} />
          ))}
        </div>

        <button
          onClick={onNext}
          className={`w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-sm font-bold transition-all cursor-pointer ${
            isLast
              ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/30'
              : 'bg-white/8 border border-white/10 text-white hover:bg-white/12'
          }`}
        >
          {isLast ? (
            <>
              BẮT ĐẦU NGAY <ChevronRight className="w-4 h-4" />
            </>
          ) : (
            <>
              Tiếp tục <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}

function ProfileSetupCard({
  onSelect,
  submitting,
}: {
  onSelect: (role: UserRole) => void;
  submitting: boolean;
}) {
  return (
    <div className="min-h-[100dvh] bg-white flex flex-col">
      <div className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-purple-700 px-6 pt-12 pb-10 rounded-b-[32px] overflow-hidden">
        <div className="absolute top-6 right-6 w-20 h-20 rounded-full bg-white/5" />
        <div className="absolute -bottom-4 -left-4 w-28 h-28 rounded-full bg-white/5" />

        <div className="text-center mt-4">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center mb-4 shadow-lg">
            <UserRoundCheck className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white font-heading">Bạn là ai?</h1>
          <p className="text-sm text-white/60 mt-1">Chọn vai trò để hoàn tất thiết lập hồ sơ</p>
        </div>
      </div>

      <div className="flex-1 px-6 -mt-4">
        <div className="space-y-3 animate-fade-in-up">
          <button
            type="button"
            disabled={submitting}
            onClick={() => onSelect('CANDIDATE')}
            className="w-full flex items-center gap-4 p-5 bg-white rounded-2xl border-2 border-slate-200 shadow-sm hover:border-primary-400 hover:shadow-md active:scale-[0.98] transition-all cursor-pointer disabled:opacity-70"
          >
            <div className="w-14 h-14 rounded-xl bg-primary-50 flex items-center justify-center shrink-0">
              <Search className="w-7 h-7 text-primary-600" />
            </div>
            <div className="text-left">
              <h3 className="font-bold text-slate-900">Tôi là Ứng viên</h3>
              <p className="text-xs text-slate-500 mt-0.5">Tìm việc part-time, ứng tuyển và nhận ca</p>
            </div>
          </button>

          <button
            type="button"
            disabled={submitting}
            onClick={() => onSelect('EMPLOYER')}
            className="w-full flex items-center gap-4 p-5 bg-white rounded-2xl border-2 border-slate-200 shadow-sm hover:border-emerald-400 hover:shadow-md active:scale-[0.98] transition-all cursor-pointer disabled:opacity-70"
          >
            <div className="w-14 h-14 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
              <Building2 className="w-7 h-7 text-emerald-600" />
            </div>
            <div className="text-left">
              <h3 className="font-bold text-slate-900">Tôi là Nhà tuyển dụng</h3>
              <p className="text-xs text-slate-500 mt-0.5">Đăng tin tuyển dụng và quản lý ứng viên</p>
            </div>
          </button>
        </div>

        {submitting && (
          <div className="mt-5 flex items-center justify-center gap-2 text-sm text-slate-500">
            <Loader2 className="w-4 h-4 animate-spin" /> Đang hoàn tất thiết lập hồ sơ...
          </div>
        )}
      </div>
    </div>
  );
}

function OnboardingPage() {
  const navigate = useNavigate();
  const { user, userProfile, loading, refreshProfile } = useAuth();

  const [phase, setPhase] = useState<'splash' | 'slides'>('splash');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [submittingRole, setSubmittingRole] = useState(false);

  const isProfileSetupMode = !!user && !userProfile;

  useEffect(() => {
    if (loading) return;

    if (user && userProfile?.role) {
      navigate({ to: userProfile.role === 'EMPLOYER' ? '/employer' : '/candidate', replace: true });
      return;
    }

    if (!user) {
      const seen = localStorage.getItem(STORAGE_KEY) === 'true';
      if (seen) {
        navigate({ to: '/register', replace: true });
      }
    }
  }, [loading, user, userProfile, navigate]);

  const markSeen = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
  };

  const handleFinishGuestOnboarding = () => {
    markSeen();
    navigate({ to: '/register', replace: true });
  };

  const handleSkipGuestOnboarding = () => {
    markSeen();
    navigate({ to: '/register', replace: true });
  };

  const handleSelectRole = async (role: UserRole) => {
    if (!user) return;

    try {
      setSubmittingRole(true);
      await createUserDocument(user.uid, {
        email: user.email ?? '',
        full_name: user.displayName || user.phoneNumber || 'Người dùng JobNow',
        role,
        avatar_url: user.photoURL,
        phone_number: user.phoneNumber ?? '',
      });

      await refreshProfile(user);
      navigate({ to: role === 'EMPLOYER' ? '/employer' : '/candidate', replace: true });
    } catch (error) {
      console.error('Failed to complete profile setup:', error);
    } finally {
      setSubmittingRole(false);
    }
  };

  const [touchStart, setTouchStart] = useState(0);
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStart - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0 && currentSlide < SLIDES.length - 1) {
        setCurrentSlide((prev) => prev + 1);
      } else if (diff < 0 && currentSlide > 0) {
        setCurrentSlide((prev) => prev - 1);
      }
    }
  };

  const handleNextSlide = () => {
    if (currentSlide < SLIDES.length - 1) {
      setCurrentSlide((prev) => prev + 1);
    } else {
      handleFinishGuestOnboarding();
    }
  };

  if (loading) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-slate-50">
        <div className="animate-pulse rounded-2xl border border-slate-200 bg-white p-5 shadow-sm w-[90%] max-w-sm">
          <div className="h-4 w-28 rounded bg-slate-200 mb-3" />
          <div className="h-3 w-full rounded bg-slate-200 mb-2" />
          <div className="h-3 w-4/5 rounded bg-slate-200" />
        </div>
      </div>
    );
  }

  if (isProfileSetupMode) {
    return <ProfileSetupCard onSelect={handleSelectRole} submitting={submittingRole} />;
  }

  if (phase === 'splash') {
    return <SplashScreen onReady={() => setPhase('slides')} />;
  }

  return (
    <div onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd} className="animate-fade-in-up">
      <OnboardingSlide
        key={currentSlide}
        slide={SLIDES[currentSlide]}
        isLast={currentSlide === SLIDES.length - 1}
        onNext={handleNextSlide}
        onSkip={handleSkipGuestOnboarding}
        currentIndex={currentSlide}
      />
    </div>
  );
}

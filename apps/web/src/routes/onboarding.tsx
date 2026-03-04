import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import {
  MapPin, Zap, ShieldCheck, ArrowRight,
  BriefcaseBusiness, ChevronRight,
} from 'lucide-react';

export const Route = createFileRoute('/onboarding')({
  component: OnboardingPage,
});

const STORAGE_KEY = 'jobnow_onboarding_seen';

/* ── Slide data ──────────────────────────────── */
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

/* ── Splash Screen ───────────────────────────── */
function SplashScreen({ onReady }: { onReady: () => void }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prev => {
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
    <div className="min-h-[100dvh] flex flex-col items-center justify-center px-8"
      style={{ background: 'linear-gradient(160deg, #080c18 0%, #0d1530 50%, #121a3d 100%)' }}>

      {/* Logo */}
      <div className="mb-6 animate-fade-in-up">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/20 backdrop-blur flex items-center justify-center shadow-2xl shadow-blue-500/10">
          <BriefcaseBusiness className="w-10 h-10 text-blue-400" />
        </div>
      </div>

      <h1 className="text-3xl font-bold text-white font-heading mb-2 animate-fade-in-up delay-100">
        Job<span className="text-blue-400">Now</span>
      </h1>
      <p className="text-sm text-slate-400 mb-10 animate-fade-in-up delay-200">
        Việc làm quanh bạn, chỉ 1 chạm
      </p>

      {/* Progress bar */}
      <div className="w-48 animate-fade-in-up delay-300">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] text-slate-500 uppercase tracking-wider font-medium">Loading assets</span>
          <span className="text-[10px] text-blue-400 font-mono font-bold">{progress}%</span>
        </div>
        <div className="h-1 bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all duration-100"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}

/* ── Slide Component ─────────────────────────── */
function OnboardingSlide({
  slide,
  isLast,
  onNext,
  onSkip,
  currentIndex,
}: {
  slide: typeof SLIDES[number];
  isLast: boolean;
  onNext: () => void;
  onSkip: () => void;
  currentIndex: number;
}) {
  const Icon = slide.icon;

  return (
    <div className="min-h-[100dvh] flex flex-col px-6 py-8"
      style={{ background: 'linear-gradient(160deg, #080c18 0%, #0d1530 50%, #121a3d 100%)' }}>

      {/* Skip button */}
      {!isLast && (
        <div className="flex justify-end">
          <button onClick={onSkip} className="text-sm font-medium text-slate-500 hover:text-slate-300 transition-colors cursor-pointer py-1 px-2">
            Bỏ qua
          </button>
        </div>
      )}
      {isLast && <div className="h-8" />}

      {/* Illustration area */}
      <div className="flex-1 flex flex-col items-center justify-center">
        {/* Decorative background */}
        <div className="relative mb-10">
          {/* Glow ring */}
          <div className={`absolute inset-0 bg-gradient-to-br ${slide.iconBg} rounded-full blur-3xl opacity-15 scale-150`} />

          {/* Main illustration circle */}
          <div className="relative w-44 h-44 rounded-full bg-white/3 border border-white/5 flex items-center justify-center backdrop-blur-sm">
            <div className="w-32 h-32 rounded-full bg-white/5 border border-white/5 flex items-center justify-center">
              <span className="text-6xl">{slide.illustration}</span>
            </div>
          </div>

          {/* Floating icon */}
          <div className={`absolute -bottom-2 -right-2 w-14 h-14 rounded-2xl bg-gradient-to-br ${slide.iconBg} flex items-center justify-center shadow-xl`}>
            <Icon className="w-7 h-7 text-white" />
          </div>
        </div>

        {/* Text */}
        <div className="text-center max-w-[300px]">
          <h2 className="text-2xl font-bold text-white font-heading leading-tight mb-3">
            {slide.title}<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
              {slide.titleAccent}
            </span>
          </h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            {slide.desc}
          </p>
        </div>
      </div>

      {/* Bottom section */}
      <div className="pb-4">
        {/* Dots indicator */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {SLIDES.map((_, i) => (
            <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === currentIndex ? 'w-6 bg-blue-500' : 'w-1.5 bg-white/15'
              }`} />
          ))}
        </div>

        {/* CTA Button */}
        <button
          onClick={onNext}
          className={`w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-sm font-bold transition-all cursor-pointer ${isLast
              ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/30'
              : 'bg-white/8 border border-white/10 text-white hover:bg-white/12'
            }`}
        >
          {isLast ? (
            <>BẮT ĐẦU NGAY <ChevronRight className="w-4 h-4" /></>
          ) : (
            <>Tiếp tục <ArrowRight className="w-4 h-4" /></>
          )}
        </button>
      </div>
    </div>
  );
}

/* ── Main Onboarding Page ────────────────────── */
function OnboardingPage() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<'splash' | 'slides'>('splash');
  const [currentSlide, setCurrentSlide] = useState(0);

  // Check if already seen
  useEffect(() => {
    const seen = localStorage.getItem(STORAGE_KEY);
    if (seen) {
      navigate({ to: '/login' });
    }
  }, [navigate]);

  const markSeen = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
  };

  const handleFinish = () => {
    markSeen();
    navigate({ to: '/login' });
  };

  const handleSkip = () => {
    markSeen();
    navigate({ to: '/login' });
  };

  const handleNext = () => {
    if (currentSlide < SLIDES.length - 1) {
      setCurrentSlide(prev => prev + 1);
    } else {
      handleFinish();
    }
  };

  // Touch/swipe handling
  const [touchStart, setTouchStart] = useState(0);
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStart - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0 && currentSlide < SLIDES.length - 1) {
        setCurrentSlide(prev => prev + 1);
      } else if (diff < 0 && currentSlide > 0) {
        setCurrentSlide(prev => prev - 1);
      }
    }
  };

  if (phase === 'splash') {
    return <SplashScreen onReady={() => setPhase('slides')} />;
  }

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="animate-fade-in-up"
    >
      <OnboardingSlide
        key={currentSlide}
        slide={SLIDES[currentSlide]}
        isLast={currentSlide === SLIDES.length - 1}
        onNext={handleNext}
        onSkip={handleSkip}
        currentIndex={currentSlide}
      />
    </div>
  );
}

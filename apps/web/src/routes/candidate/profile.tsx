import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useAuth } from '@/features/auth/context/AuthContext';
import { type ComponentType, useState } from 'react';
import {
  User, ShieldCheck, ChevronRight, Settings,
  LogOut, Wallet, Briefcase, Bell, HelpCircle,
  Award, FileText
} from 'lucide-react';

export const Route = createFileRoute('/candidate/profile')({
  component: CandidateProfilePage,
});

/* ── Menu Item Component ─────────────────────── */
function MenuItem({
  icon: Icon,
  title,
  subtitle,
  onClick,
  variant = 'default',
  disabled = false,
}: {
  icon: ComponentType<{ className?: string }>;
  title: string;
  subtitle?: string;
  onClick?: () => void;
  variant?: 'default' | 'danger';
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full flex items-center justify-between p-4 bg-white mb-2 rounded-2xl shadow-sm border border-slate-100 active:scale-[0.98] transition-all ${variant === 'danger' ? 'hover:bg-red-50 text-red-600' : 'hover:bg-slate-50 text-slate-700'
        } ${disabled ? 'cursor-not-allowed opacity-70' : ''}`}
    >
      <div className="flex items-center gap-4">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${variant === 'danger' ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-500'
          }`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="text-left">
          <p className={`font-semibold text-[15px] ${variant === 'danger' ? 'text-red-600' : 'text-slate-800'}`}>
            {title}
          </p>
          {subtitle && <p className="text-[13px] text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {variant !== 'danger' && <ChevronRight className="w-5 h-5 text-slate-300" />}
    </button>
  );
}

function CandidateProfilePage() {
  const { userProfile, signOut } = useAuth();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Example stats
  const trustScore = userProfile?.reputation_score || 85;
  const completedShifts = 12;

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await signOut();
      await navigate({ to: '/login' });
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="pb-24 bg-slate-50 min-h-[100dvh]">
      {/* ── Header Area ────────────────────────── */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 pt-12 pb-6 px-5 rounded-b-[2.5rem] shadow-lg relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute top-20 -left-10 w-40 h-40 bg-cyan-400/20 rounded-full blur-3xl"></div>

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-xl font-bold text-white tracking-tight">Tài khoản</h1>
            <button className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-md">
              <Bell className="w-5 h-5 text-white" />
            </button>
          </div>

          <div className="flex flex-col items-center">
            {/* Avatar */}
            <div className="relative mb-3">
              <div className="w-24 h-24 bg-white rounded-full p-1 shadow-xl">
                <img
                  src={`https://api.dicebear.com/7.x/notionists/svg?seed=${userProfile?.full_name || 'User'}&backgroundColor=e2e8f0`}
                  alt="Avatar"
                  className="w-full h-full rounded-full object-cover bg-slate-100"
                />
              </div>
              {trustScore > 80 && (
                <div className="absolute -bottom-2 right-0 bg-emerald-500 text-white p-1.5 rounded-full border-2 border-white shadow-md">
                  <ShieldCheck className="w-5 h-5" />
                </div>
              )}
            </div>

            {/* Name & Role */}
            <h2 className="text-2xl font-bold text-white mb-1">
              {userProfile?.full_name || 'Người dùng'}
            </h2>
            <p className="text-blue-100/80 text-sm font-medium px-3 py-1 bg-white/10 rounded-full backdrop-blur">
              Ứng viên part-time
            </p>
          </div>
        </div>
      </div>

      <div className="px-5 -mt-6 relative z-20">

        {/* ── Stats Row ──────────────────────────── */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center justify-between mb-6">
          <div className="flex-1 text-center border-r border-slate-100 pb-1">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Điểm uy tín</p>
            <div className="flex items-center justify-center gap-1.5 text-emerald-600">
              <Award className="w-5 h-5" />
              <span className="text-xl font-extrabold">{trustScore}</span>
            </div>
          </div>
          <div className="flex-1 text-center">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Ca hoàn thành</p>
            <div className="flex items-center justify-center gap-1.5 text-blue-600">
              <Briefcase className="w-5 h-5" />
              <span className="text-xl font-extrabold">{completedShifts}</span>
            </div>
          </div>
        </div>

        {/* ── Menu Categories ────────────────────── */}
        <div className="mb-6 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          <h3 className="text-[13px] font-bold text-slate-400 uppercase tracking-wider pl-2 mb-3">Hồ sơ của bạn</h3>

          <MenuItem
            icon={User}
            title="Thông tin cá nhân"
            subtitle="Cập nhật tên, số điện thoại, CMND"
          />
          <MenuItem
            icon={FileText}
            title="Kinh nghiệm & Kỹ năng"
            subtitle="Tăng 40% cơ hội nhận việc"
          />
          <MenuItem
            icon={ShieldCheck}
            title="Xác thực danh tính (eKYC)"
            subtitle="Chưa xác thực"
          />
        </div>

        <div className="mb-6 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          <h3 className="text-[13px] font-bold text-slate-400 uppercase tracking-wider pl-2 mb-3">Tiện ích</h3>

          <MenuItem
            icon={Wallet}
            title="Ví JobNow"
            subtitle="Rút tiền, xem lịch sử giao dịch"
          />
          <MenuItem
            icon={Settings}
            title="Cài đặt ứng dụng"
          />
          <MenuItem
            icon={HelpCircle}
            title="Trung tâm hỗ trợ"
            onClick={() => navigate({ to: '/support-center' })}
          />
        </div>

        <div className="animate-fade-in-up" style={{ animationDelay: '300ms' }}>
          <MenuItem
            icon={LogOut}
            title={isLoggingOut ? 'Đang đăng xuất...' : 'Đăng xuất'}
            variant="danger"
            onClick={handleLogout}
            disabled={isLoggingOut}
          />
        </div>

        <p className="text-center text-xs text-slate-400 mt-8 mb-4 font-medium">JobNow Phiên bản 1.0.0</p>
      </div>
    </div>
  );
}

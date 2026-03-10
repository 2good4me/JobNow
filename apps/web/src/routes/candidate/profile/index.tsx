import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useState } from 'react';
import {
  BadgeCheck,
  Bell,
  Briefcase,
  ChevronRight,
  FileCheck2,
  Heart,
  LifeBuoy,
  LogOut,
  MapPin,
  Pencil,
  Phone,
  Settings,
  ShieldCheck,
  Star,
} from 'lucide-react';
import { useMyApplicationsRealtime } from '@/features/jobs/hooks/useMyApplicationsRealtime';

export const Route = createFileRoute('/candidate/profile/')({
  component: CandidateProfilePage,
});

function ProfileSkeleton() {
  return (
    <div className="animate-pulse pb-24">
      <div className="bg-gradient-to-br from-[#1e3a5f] to-[#0f172a] pt-14 pb-16 px-5 rounded-b-[2.5rem]">
        <div className="h-6 w-40 bg-white/20 rounded-lg mb-6" />
        <div className="flex flex-col items-center gap-3">
          <div className="w-24 h-24 bg-white/20 rounded-full" />
          <div className="h-6 w-44 bg-white/20 rounded-lg" />
          <div className="h-5 w-32 bg-white/10 rounded-full" />
        </div>
      </div>
      <div className="px-5 -mt-6 space-y-4">
        <div className="h-20 bg-white rounded-2xl" />
        <div className="h-40 bg-white rounded-2xl" />
        <div className="h-48 bg-white rounded-2xl" />
      </div>
    </div>
  );
}

function CandidateProfilePage() {
  const { userProfile, signOut } = useAuth();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Fetch real applications data
  const { data: applications = [] } = useMyApplicationsRealtime({
    candidateId: userProfile?.uid,
    limit: 100,
  });

  const activeShiftsCount = applications.filter((app) => app.status === 'APPROVED' || app.status === 'CHECKED_IN').length;
  const completedShiftsCount = applications.filter((app) => app.status === 'COMPLETED').length;

  // Mock data for Rating (since there's no reviews feature yet)
  const stats = {
    rating: 4.8,
    activeShifts: activeShiftsCount,
    completedShifts: completedShiftsCount
  };

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

  if (!userProfile) {
    return <ProfileSkeleton />;
  }

  const verificationStatus = userProfile.verification_status || 'UNVERIFIED';
  const verificationBadge = verificationStatus === 'VERIFIED'
    ? { color: 'bg-emerald-500', text: 'Đã xác minh' }
    : verificationStatus === 'PENDING'
      ? { color: 'bg-amber-500', text: 'Đang xét duyệt' }
      : { color: 'bg-slate-400', text: 'Chưa xác minh' };

  const displayName = userProfile.full_name || 'Ứng viên';
  const avatarInitial = (userProfile.full_name?.[0] || 'U').toUpperCase();

  return (
    <div className="pb-24 bg-slate-50 min-h-[100dvh]">
      {/* ── Navy Header ── */}
      <div className="bg-gradient-to-br from-[#1e3a5f] to-[#0f172a] pt-12 pb-16 px-5 rounded-b-[2.5rem] shadow-xl relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl" />
        <div className="absolute top-24 -left-12 w-40 h-40 bg-cyan-400/15 rounded-full blur-3xl" />

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-lg font-bold text-white/90 tracking-tight">Tài khoản</h1>
          </div>

          <div className="flex flex-col items-center">
            <div className="relative mb-4">
              <div className="w-[88px] h-[88px] bg-white rounded-2xl p-1 shadow-xl">
                {userProfile.avatar_url ? (
                  <img
                    src={userProfile.avatar_url}
                    alt="Avatar"
                    className="w-full h-full rounded-xl object-cover bg-slate-100"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center">
                    <span className="text-3xl font-bold text-white">{avatarInitial}</span>
                  </div>
                )}
              </div>
              <div className={`absolute -bottom-1.5 -right-1.5 ${verificationBadge.color} text-white p-1.5 rounded-full border-2 border-[#1e3a5f] shadow-md`}>
                <BadgeCheck className="w-4 h-4" />
              </div>
            </div>

            <h2 className="text-xl font-bold text-white mb-1.5">{displayName}</h2>
            <span className={`text-[11px] font-bold px-3 py-1 rounded-full ${verificationBadge.color} text-white`}>
              {verificationBadge.text}
            </span>
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="px-5 -mt-7 relative z-20 space-y-4">

        {/* Trust + Rating card */}
        <div className="bg-white/90 backdrop-blur-md rounded-2xl p-4 shadow-sm border border-slate-100 grid grid-cols-3 divide-x divide-slate-100">
          <div className="text-center px-2">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Uy tín</p>
            <div className="flex items-center justify-center gap-1 text-emerald-600">
              <ShieldCheck className="w-4 h-4" />
              <span className="text-lg font-extrabold">{userProfile.reputation_score || 0}</span>
            </div>
          </div>
          <div className="text-center px-2">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Đánh giá</p>
            <div className="flex items-center justify-center gap-1 text-amber-500">
              <Star className="w-4 h-4 fill-amber-400" />
              <span className="text-lg font-extrabold">{stats.rating}</span>
            </div>
          </div>
          <div className="text-center px-2">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Ca làm</p>
            <div className="flex items-center justify-center gap-1 text-blue-600">
              <Briefcase className="w-4 h-4" />
              <span className="text-lg font-extrabold">{stats.completedShifts}</span>
            </div>
          </div>
        </div>

        {/* Verification badges & Info */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
          <div className="flex flex-wrap gap-2 mb-3">
            {verificationStatus === 'VERIFIED' && (
              <span className="inline-flex items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                <FileCheck2 className="h-3.5 w-3.5" /> CCCD đã xác minh
              </span>
            )}
            {verificationStatus === 'PENDING' && (
              <span className="inline-flex items-center gap-1 rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700">
                <FileCheck2 className="h-3.5 w-3.5" /> Đang xét duyệt CCCD
              </span>
            )}
            {verificationStatus === 'UNVERIFIED' && (
              <span className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-500">
                <FileCheck2 className="h-3.5 w-3.5" /> Chưa xác minh CCCD
              </span>
            )}
            <span className="inline-flex items-center gap-1 rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-700">
              <ShieldCheck className="h-3.5 w-3.5" /> eKYC cá nhân
            </span>
          </div>

          <Link
            to="/candidate/verification"
            className="mb-3 flex items-center justify-between gap-3 rounded-xl border border-indigo-100 bg-gradient-to-r from-indigo-50 to-cyan-50 px-3.5 py-3 transition-colors hover:from-indigo-100 hover:to-cyan-100"
          >
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-indigo-600 shadow-sm">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">Trung tâm xác thực</p>
                <p className="text-xs text-slate-500">Gửi hồ sơ e-KYC và theo dõi trạng thái realtime</p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-indigo-500" />
          </Link>

          <div className="space-y-2.5 text-sm text-slate-700">
            {userProfile.address_text && (
              <div className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="truncate">{userProfile.address_text}</span>
              </div>
            )}
            {userProfile.phone_number && (
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                {userProfile.phone_number}
              </div>
            )}
          </div>
        </div>

        {/* Active Jobs / Shifts */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[13px] font-bold text-slate-400 uppercase tracking-wider">
              Ca làm sắp tới ({stats.activeShifts})
            </h3>
            <Link to="/candidate/shifts" className="text-xs font-semibold text-blue-600">
              Xem ca làm
            </Link>
          </div>

          <div className="space-y-3">
            <Link
              to="/candidate/applications"
              className="w-full flex items-center justify-between p-3 rounded-xl border border-indigo-100 bg-indigo-50/50 hover:bg-indigo-50 text-slate-700 transition-colors"
            >
              <span className="flex items-center gap-2.5 text-sm font-semibold">
                <Briefcase className="w-4 h-4 text-indigo-500" /> Xem việc làm đã ứng tuyển
              </span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </Link>

            <Link
              to="/candidate/wishlist"
              className="w-full flex items-center justify-between p-3 rounded-xl border border-red-100 bg-red-50/50 hover:bg-red-50 text-slate-700 transition-colors"
            >
              <span className="flex items-center gap-2.5 text-sm font-semibold">
                <Heart className="w-4 h-4 text-red-500" /> Việc làm đã lưu
              </span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </Link>
          </div>
        </div>

        {/* Admin Actions */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
          <h3 className="text-[13px] font-bold text-slate-400 uppercase tracking-wider mb-3">Quản trị</h3>
          <div className="space-y-1.5">
            <Link
              to="/candidate/profile/edit"
              className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:bg-slate-50 text-slate-700 transition-colors"
            >
              <span className="flex items-center gap-2.5 text-sm font-semibold">
                <Pencil className="w-4 h-4 text-blue-500" /> Chỉnh sửa hồ sơ
              </span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </Link>
            <Link
              to="/candidate/profile/settings"
              className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:bg-slate-50 text-slate-700 transition-colors"
            >
              <span className="flex items-center gap-2.5 text-sm font-semibold">
                <Settings className="w-4 h-4 text-slate-500" /> Cài đặt & Bảo mật
              </span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </Link>
            <Link
              to="/support-center"
              className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:bg-slate-50 text-slate-700 transition-colors"
            >
              <span className="flex items-center gap-2.5 text-sm font-semibold">
                <LifeBuoy className="w-4 h-4 text-emerald-500" /> Trung tâm hỗ trợ
              </span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </Link>
          </div>
        </div>

        {/* Logout */}
        <button
          type="button"
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="w-full flex items-center justify-center gap-2 p-4 bg-white rounded-2xl shadow-sm border border-red-100 active:scale-[0.98] transition-all hover:bg-red-50 text-red-600 disabled:cursor-not-allowed disabled:opacity-70"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-semibold text-[15px]">{isLoggingOut ? 'Đang đăng xuất...' : 'Đăng xuất'}</span>
        </button>

        <p className="text-center text-xs text-slate-400 mt-6 mb-4 font-medium">
          JobNow v1.0.0
        </p>
      </div>
    </div>
  );
}

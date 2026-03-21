import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useGetEmployerJobs } from '@/features/jobs/hooks/useEmployerJobs';
import { useGetEmployerApplications } from '@/features/jobs/hooks/useManageApplicants';
import { useMemo, useState, useEffect } from 'react';
import { getFollowerCount, getFollowingCount } from '@/features/auth/services/followService';
import type { ComponentType } from 'react';
import {
  BadgeCheck,
  Briefcase,
  Building2,
  ChevronRight,
  FileCheck2,
  LogOut,
  MapPin,
  Pencil,
  Phone,
  Settings,
  ShieldCheck,
  Wallet,
} from 'lucide-react';
import { ReputationStatsCard } from '@/features/auth/components/ReputationStatsCard';
import { AchievementBadges, PREDEFINED_ACHIEVEMENTS } from '@/features/auth/components/AchievementBadges';
import { FollowListDialog } from '@/components/ui/FollowListDialog';
import { Box, Typography } from '@mui/material';

export const Route = createFileRoute('/employer/profile/')({
  component: EmployerProfilePage,
});

type ProfileAchievement = {
  id: string;
  name: string;
  description: string;
  icon?: ComponentType<{ className?: string }>;
  color?: 'blue' | 'amber' | 'emerald' | 'purple' | 'rose';
  unlocked?: boolean;
};

/* ── Skeleton placeholder ── */
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

/* ── Inline Skeleton for data sections ── */
function StatsSkeleton() {
  return (
    <div className="animate-pulse bg-white/90 backdrop-blur-md rounded-2xl p-4 shadow-sm border border-slate-100 grid grid-cols-3 divide-x divide-slate-100">
      {[1, 2, 3].map(i => (
        <div key={i} className="text-center px-2 space-y-2">
          <div className="h-3 w-10 bg-slate-200 rounded mx-auto" />
          <div className="h-6 w-8 bg-slate-200 rounded mx-auto" />
        </div>
      ))}
    </div>
  );
}

function JobsSkeleton() {
  return (
    <div className="animate-pulse bg-white rounded-2xl p-4 shadow-sm border border-slate-100 space-y-3">
      <div className="h-4 w-28 bg-slate-200 rounded" />
      {[1, 2].map(i => (
        <div key={i} className="h-14 bg-slate-100 rounded-xl" />
      ))}
    </div>
  );
}

/* ── Main Component ── */
function EmployerProfilePage() {
  const { userProfile, signOut } = useAuth();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const employerId = userProfile?.uid;

  const { data: jobs = [], isLoading: isJobsLoading } = useGetEmployerJobs(employerId || '');
  const { data: applications = [], isLoading: isAppsLoading } = useGetEmployerApplications(employerId);
  
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [followDialog, setFollowDialog] = useState<{ isOpen: boolean; type: 'followers' | 'following' }>({
    isOpen: false,
    type: 'followers'
  });

  useEffect(() => {
    if (employerId) {
      getFollowerCount(employerId).then(setFollowerCount);
      getFollowingCount(employerId).then(setFollowingCount);
    }
  }, [employerId]);

  const stats = useMemo(() => ({
    activeJobs: jobs.filter(j => j.status === 'ACTIVE').length,
    totalApplicants: applications.length,
    pendingApps: applications.filter(a => a.status === 'NEW').length,
  }), [jobs, applications]);

  const recentJobs = useMemo(() => [...jobs].slice(0, 3), [jobs]);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await signOut();
      await navigate({ to: '/' });
    } catch (error) {
      console.error('Employer logout failed:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Fix B: Chỉ cần userProfile là đủ render header — phần data sections render progressive
  if (!userProfile) {
    return <ProfileSkeleton />;
  }

  const verificationStatus = userProfile.verification_status || 'UNVERIFIED';
  const verificationBadge = verificationStatus === 'VERIFIED'
    ? { color: 'bg-emerald-500', text: 'Đã xác minh' }
    : verificationStatus === 'PENDING'
      ? { color: 'bg-amber-500', text: 'Đang xét duyệt' }
      : { color: 'bg-slate-400', text: 'Chưa xác minh' };

  const displayName = userProfile.company_name || userProfile.full_name || 'Doanh nghiệp';
  const avatarInitial = (userProfile.company_name?.[0] || userProfile.full_name?.[0] || 'D').toUpperCase();
  const profileAchievements = ((userProfile as any).achievementBadges || (userProfile as any).achievementsData || []) as ProfileAchievement[];
  const achievements = profileAchievements.length > 0
    ? profileAchievements.map((achievement) => {
      const fallback = PREDEFINED_ACHIEVEMENTS.find(item => item.id === achievement.id);
      return {
        id: achievement.id,
        name: achievement.name || fallback?.name || achievement.id,
        description: achievement.description || fallback?.description || '',
        icon: achievement.icon || fallback?.icon || PREDEFINED_ACHIEVEMENTS[0].icon,
        color: achievement.color || fallback?.color || 'blue',
        unlocked: achievement.unlocked ?? true,
      };
    })
    : PREDEFINED_ACHIEVEMENTS.map(item => ({
      ...item,
      unlocked: userProfile.achievements?.includes(item.id) ?? false,
    }));

  return (
    <div className="flex flex-col min-h-[100dvh] bg-slate-50 pb-24 max-w-lg mx-auto w-full relative shadow-sm">
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
                {userProfile.company_logo_url ? (
                  <img
                    src={userProfile.company_logo_url}
                    alt="Company logo"
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

        {/* Trust + Rating card — progressive skeleton */}
        {isAppsLoading ? <StatsSkeleton /> : (
          <ReputationStatsCard
            reputationScore={userProfile.reputation_score || 0}
            averageRating={userProfile.average_rating || 0}
            statValue={followerCount}
            statLabel="Followers"
            onViewDetails={() => setFollowDialog({ isOpen: true, type: 'followers' })}
          />
        )}

        <Box sx={{ mt: 2, px: 1, display: 'flex', gap: 2 }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 'bold' }}>
                {followerCount} Người theo dõi
            </Typography>
            <Typography 
                variant="caption" 
                sx={{ color: 'text.secondary', fontWeight: 'bold', cursor: 'pointer', '&:hover': { color: 'primary.main' } }}
                onClick={() => setFollowDialog({ isOpen: true, type: 'following' })}
            >
                {followingCount} Đang theo dõi
            </Typography>
        </Box>

        {/* Verification badges */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
          <div className="flex flex-wrap gap-2 mb-3">
            {verificationStatus === 'VERIFIED' && (
              <span className="inline-flex items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                <FileCheck2 className="h-3.5 w-3.5" /> GPKD đã xác minh
              </span>
            )}
            {verificationStatus === 'PENDING' && (
              <span className="inline-flex items-center gap-1 rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700">
                <FileCheck2 className="h-3.5 w-3.5" /> Đang xét duyệt GPKD
              </span>
            )}
            {verificationStatus === 'UNVERIFIED' && (
              <span className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-500">
                <FileCheck2 className="h-3.5 w-3.5" /> Chưa xác minh GPKD
              </span>
            )}
            <span className="inline-flex items-center gap-1 rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-700">
              <ShieldCheck className="h-3.5 w-3.5" /> eKYC doanh nghiệp
            </span>
          </div>

          <Link
            to="/employer/verification"
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
            {userProfile.company_website && (
              <div className="flex items-center gap-2.5">
                <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="truncate text-blue-600">{userProfile.company_website}</span>
              </div>
            )}
          </div>
        </div>

        {/* Achievement Badges Section */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[13px] font-bold text-slate-400 uppercase tracking-wider">
              Huy Hiệu & Thành Tựu
            </h3>
            <Link
              to="/employer/profile/settings"
              className="text-xs font-semibold text-blue-600"
            >
              Xem tất cả
            </Link>
          </div>
          <AchievementBadges
            achievements={achievements}
            maxDisplay={6}
            size="md"
          />
        </div>

        {/* Active Jobs — progressive skeleton */}
        {isJobsLoading ? <JobsSkeleton /> : (
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[13px] font-bold text-slate-400 uppercase tracking-wider">
                Đang tuyển ({stats.activeJobs})
              </h3>
              <Link to="/employer/applicants" search={{ jobId: undefined }} className="text-xs font-semibold text-blue-600">
                Xem tất cả
              </Link>
            </div>

            {recentJobs.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-4">Chưa có tin tuyển dụng</p>
            ) : (
              <div className="space-y-2">
                {recentJobs.map(job => (
                  <Link
                    key={job.id}
                    to="/employer/applicants"
                    search={{ jobId: job.id }}
                    className="block rounded-xl border border-slate-200 bg-slate-50/80 p-3 hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                          <Briefcase className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-800 line-clamp-1">{job.title}</h4>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {job.salary ? `${Number(job.salary).toLocaleString('vi-VN')}đ` : 'Thỏa thuận'}
                            {job.salaryType === 'HOURLY' ? '/giờ' : job.salaryType === 'PER_SHIFT' ? '/ca' : '/tháng'}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400 shrink-0 mt-1" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Admin Actions */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
          <h3 className="text-[13px] font-bold text-slate-400 uppercase tracking-wider mb-3">Quản trị</h3>
          <div className="space-y-1.5">
            <Link
              to="/employer/wallet"
              className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:bg-slate-50 text-slate-700 transition-colors"
            >
              <span className="flex items-center gap-2.5 text-sm font-semibold">
                <Wallet className="w-4 h-4 text-emerald-500" /> Ví JobNow của tôi
              </span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </Link>
            <Link
              to="/employer/profile/edit"
              className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:bg-slate-50 text-slate-700 transition-colors"
            >
              <span className="flex items-center gap-2.5 text-sm font-semibold">
                <Pencil className="w-4 h-4 text-blue-500" /> Chỉnh sửa hồ sơ
              </span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </Link>
            <Link
              to="/employer/profile/settings"
              className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:bg-slate-50 text-slate-700 transition-colors"
            >
              <span className="flex items-center gap-2.5 text-sm font-semibold">
                <Settings className="w-4 h-4 text-slate-500" /> Cài đặt & Bảo mật
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

      <FollowListDialog
        isOpen={followDialog.isOpen}
        onClose={() => setFollowDialog(prev => ({ ...prev, isOpen: false }))}
        userId={employerId || ''}
        type={followDialog.type}
        title={followDialog.type === 'followers' ? 'Người đang theo dõi bạn' : 'Những người bạn đang theo dõi'}
      />
    </div>
  );
}

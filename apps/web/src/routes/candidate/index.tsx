import { createFileRoute, Link } from '@tanstack/react-router';
import { useMemo } from 'react';
import type { ReactNode } from 'react';
import { Briefcase, CalendarDays, CheckCircle2, Clock3, Search } from 'lucide-react';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useGeolocation } from '@/features/jobs/hooks/useGeolocation';
import { useJobSearch } from '@/features/jobs/hooks/useJobSearch';
import { useMyApplicationsRealtime } from '@/features/jobs/hooks/useMyApplicationsRealtime';

export const Route = createFileRoute('/candidate/')({
  component: CandidateDashboard,
});

function CandidateDashboard() {
  const { userProfile } = useAuth();
  const geo = useGeolocation();

  const { data: jobsData } = useJobSearch({
    lat: geo.latitude,
    lng: geo.longitude,
    enabled: !geo.loading,
    filters: {
      radius_m: 5000,
      limit: 8,
    },
  });

  const { data: applications = [] } = useMyApplicationsRealtime({
    candidateId: userProfile?.uid,
    limit: 50,
  });

  const nearbyJobsCount = useMemo(() => jobsData?.pages.flatMap((page) => page.items).length ?? 0, [jobsData]);
  const approvedCount = applications.filter((item) => item.status === 'APPROVED').length;
  const completedCount = applications.filter((item) => item.status === 'COMPLETED').length;

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <div className="max-w-lg mx-auto px-4 pt-6 space-y-4">
        <section className="rounded-2xl bg-gradient-to-br from-primary-600 to-primary-800 p-5 text-white shadow-lg">
          <p className="text-primary-100 text-sm">Xin chào</p>
          <h1 className="text-2xl font-bold mt-1">{userProfile?.full_name || 'Ứng viên JobNow'}</h1>
          <p className="text-primary-100 text-sm mt-2">Tìm việc nhanh, đi làm đúng giờ, tăng điểm uy tín mỗi ngày.</p>
        </section>

        <section className="grid grid-cols-3 gap-3">
          <StatCard icon={<Search className="w-4 h-4" />} label="Việc gần bạn" value={nearbyJobsCount} />
          <StatCard icon={<CalendarDays className="w-4 h-4" />} label="Đã nhận" value={approvedCount} />
          <StatCard icon={<CheckCircle2 className="w-4 h-4" />} label="Hoàn thành" value={completedCount} />
        </section>

        <section className="rounded-2xl bg-white p-4 border border-slate-100 shadow-sm">
          <h2 className="text-sm font-bold text-slate-700 mb-3">Lối tắt</h2>
          <div className="grid grid-cols-1 gap-2">
            <Link to="/jobs" className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-3 hover:bg-slate-100 transition-colors">
              <span className="flex items-center gap-2 text-sm font-medium text-slate-700"><Briefcase className="w-4 h-4" /> Tìm việc mới</span>
              <span className="text-xs text-slate-400">/jobs</span>
            </Link>
            <Link to="/candidate/shifts" className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-3 hover:bg-slate-100 transition-colors">
              <span className="flex items-center gap-2 text-sm font-medium text-slate-700"><Clock3 className="w-4 h-4" /> Việc làm của tôi</span>
              <span className="text-xs text-slate-400">Realtime</span>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: ReactNode; label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-white border border-slate-100 p-3 shadow-sm">
      <div className="flex items-center gap-1 text-primary-600">{icon}</div>
      <p className="text-lg font-extrabold text-slate-900 mt-1">{value}</p>
      <p className="text-[11px] text-slate-500 font-medium">{label}</p>
    </div>
  );
}

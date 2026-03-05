import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { ArrowLeft, QrCode, Clock, CheckCircle2, AlertCircle, Users, ChevronRight } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useGetEmployerJobs } from '@/features/jobs/hooks/useEmployerJobs';
import { useGetEmployerApplications } from '@/features/jobs/hooks/useManageApplicants';

export const Route = createFileRoute('/employer/shift-management')({
  component: ShiftManagementPage,
});

function ShiftManagementPage() {
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const employerId = userProfile?.uid || '';
  const { data: jobs = [], isLoading: isJobsLoading } = useGetEmployerJobs(employerId);
  const { data: applications = [] } = useGetEmployerApplications(employerId);

  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

  // Only show active jobs that have shifts
  const activeJobs = useMemo(() =>
    jobs.filter(j => (j.status === 'ACTIVE' || j.status === 'OPEN') && j.shifts && j.shifts.length > 0),
    [jobs]
  );

  const selectedJob = activeJobs.find(j => j.id === selectedJobId);

  // Count approved candidates per job
  const approvedCountByJob = useMemo(() => {
    const map: Record<string, number> = {};
    applications.forEach(app => {
      if (app.status === 'APPROVED' || app.status === 'REVIEWED') {
        map[app.jobId] = (map[app.jobId] || 0) + 1;
      }
    });
    return map;
  }, [applications]);

  const formatTime = (time: string) => {
    if (!time) return '--:--';
    return time;
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-white shadow-xl">
        <header className="sticky top-0 z-20 bg-[#1e3a5f] text-white">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center">
              <button
                onClick={() => navigate({ to: '/employer' })}
                className="p-2 -ml-2 rounded-full hover:bg-white/10 transition cursor-pointer"
                type="button"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <h1 className="text-lg font-bold ml-2">Quản lý Ca làm</h1>
            </div>
          </div>
        </header>

        <section className="flex-1 bg-slate-50 p-4 space-y-4">
          {isJobsLoading ? (
            <div className="flex items-center justify-center py-10">
              <div className="w-6 h-6 rounded-full border-2 border-blue-200 border-t-blue-600 animate-spin"></div>
            </div>
          ) : activeJobs.length === 0 ? (
            <div className="py-16 text-center">
              <Clock className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <p className="text-sm text-slate-500">Chưa có tin tuyển dụng nào có ca làm</p>
              <button
                type="button"
                onClick={() => navigate({ to: '/employer/post-job' })}
                className="mt-4 text-sm font-medium text-blue-600 hover:text-blue-700 cursor-pointer"
              >
                Đăng tin mới →
              </button>
            </div>
          ) : !selectedJobId ? (
            // Job selection view
            <>
              <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Chọn tin tuyển dụng</h2>
              {activeJobs.map((job) => (
                <button
                  key={job.id}
                  type="button"
                  onClick={() => setSelectedJobId(job.id)}
                  className="w-full text-left rounded-xl border border-slate-100 bg-white p-4 shadow-sm hover:shadow-md transition cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-[15px] font-bold text-slate-900 line-clamp-1">{job.title}</h3>
                      <div className="mt-1 flex items-center gap-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {job.shifts?.length || 0} ca
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" /> {approvedCountByJob[job.id] || 0} NV
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-slate-400" />
                  </div>
                </button>
              ))}
            </>
          ) : (
            // Shift detail view for selected job
            <>
              <div className="flex items-center gap-2 mb-2">
                <button
                  type="button"
                  onClick={() => setSelectedJobId(null)}
                  className="text-sm font-medium text-blue-600 hover:text-blue-700 cursor-pointer"
                >
                  ← Quay lại
                </button>
              </div>

              <div className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm mb-4">
                <h2 className="text-base font-bold text-slate-900">{selectedJob?.title}</h2>
                <p className="text-xs text-slate-500 mt-1">
                  {selectedJob?.shifts?.length || 0} ca làm | {approvedCountByJob[selectedJobId] || 0} nhân viên đã duyệt
                </p>
              </div>

              <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-2">Danh sách ca</h3>

              {selectedJob?.shifts?.map((shift, index) => (
                <div key={index} className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm mb-3">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-sm font-bold text-slate-900">Ca {index + 1}</p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        <Clock className="inline h-3 w-3 mr-1" />
                        {formatTime(shift.startTime)} — {formatTime(shift.endTime)}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 text-xs">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                      <span className="text-emerald-600 font-medium">Đang mở</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => navigate({
                        to: '/employer/qr-display',
                        search: { jobId: selectedJobId, shiftIndex: index.toString() }
                      })}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-200 hover:bg-blue-700 transition cursor-pointer"
                    >
                      <QrCode className="h-4 w-4" /> Hiện QR Code
                    </button>
                  </div>
                </div>
              ))}

              {(!selectedJob?.shifts || selectedJob.shifts.length === 0) && (
                <div className="py-8 text-center text-sm text-slate-400">
                  <AlertCircle className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                  Tin này chưa có ca làm nào.
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
}

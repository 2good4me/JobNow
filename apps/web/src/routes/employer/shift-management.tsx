import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { ArrowLeft, QrCode, Clock, CheckCircle2, AlertCircle, Users, ChevronRight, UserCheck, XCircle } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useGetEmployerJobs } from '@/features/jobs/hooks/useEmployerJobs';
import { useGetEmployerApplications } from '@/features/jobs/hooks/useManageApplicants';
import type { Application } from '@jobnow/types';

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
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');

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

  // Group applications by shift for attendance tracking
  const getShiftAttendance = (jobId: string, shiftId: string): Application[] => {
    return applications.filter(app =>
      app.jobId === jobId &&
      app.shiftId === shiftId &&
      (app.status === 'APPROVED' || app.status === 'CHECKED_IN' || app.status === 'COMPLETED')
    );
  };

  const getShiftStatus = (startTime: string, endTime: string) => {
    const now = new Date();
    const today = now.toISOString().slice(0, 10);
    const start = new Date(`${today}T${startTime}:00`);
    const end = new Date(`${today}T${endTime}:00`);

    if (now < start) return { label: 'Chưa bắt đầu', color: 'text-slate-500', icon: Clock, bg: '' };
    if (now >= start && now <= end) return { label: 'Đang diễn ra', color: 'text-emerald-600', icon: CheckCircle2, bg: 'bg-emerald-50' };
    return { label: 'Đã kết thúc', color: 'text-slate-400', icon: XCircle, bg: '' };
  };

  const formatTime = (time: string) => {
    if (!time) return '--:--';
    return time;
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 pb-24 max-w-lg mx-auto w-full relative shadow-sm">
      <div className="flex-1 flex flex-col w-full bg-white">
        <header className="sticky top-0 z-40 bg-[#1e3a5f] text-white">
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
                onClick={() => navigate({ to: '/employer/post-job', search: { editJobId: undefined } })}
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

              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Danh sách ca</h3>
                <div className="flex bg-slate-200/60 p-1 rounded-lg">
                  <button 
                    onClick={() => setViewMode('list')} 
                    className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    Danh sách
                  </button>
                  <button 
                    onClick={() => setViewMode('calendar')} 
                    className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${viewMode === 'calendar' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    Lịch biểu
                  </button>
                </div>
              </div>

              {viewMode === 'calendar' && selectedJob?.shifts && selectedJob.shifts.length > 0 && (
                <div className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm mb-6 overflow-x-auto">
                  <p className="text-xs text-slate-500 mb-4 font-medium italic">* Hiển thị lịch trình ca làm trong ngày (Từ 06:00 đến 24:00)</p>
                  <div className="min-w-[300px] relative mt-2 border-l-2 border-slate-100 ml-12" style={{ height: `${(24 - 6) * 48}px` }}>
                    {Array.from({ length: 24 - 6 + 1 }).map((_, i) => (
                      <div key={i} className="absolute w-full border-t border-slate-100/50 flex items-center" style={{ top: `${i * 48}px` }}>
                        <span className="absolute -left-12 text-[10px] text-slate-400 font-bold px-1 bg-white -mt-2">{String(i + 6).padStart(2, '0')}:00</span>
                      </div>
                    ))}
                    
                    {selectedJob.shifts.map((shift, index) => {
                       const [startH, startM] = (shift.startTime || '00:00').split(':').map(Number);
                       const [endH, endM] = (shift.endTime || '00:00').split(':').map(Number);
                       
                       const startOffset = (Math.max(6, startH) - 6 + (startM || 0)/60) * 48;
                       const duration = (endH - startH + ((endM || 0) - (startM || 0))/60) * 48;
                       
                       const attendance = getShiftAttendance(selectedJobId, shift.id);
                       const checkedInCount = attendance.filter(a => a.status === 'CHECKED_IN' || a.status === 'COMPLETED').length;

                       return (
                         <div 
                           key={index} 
                           className="absolute left-2 right-2 rounded-lg bg-blue-50/80 border-l-4 border-blue-500 p-2 overflow-hidden shadow-sm hover:shadow-md transition-all hover:bg-blue-100 cursor-pointer" 
                           style={{ top: `${startOffset}px`, height: `${Math.max(30, duration)}px` }}
                         >
                           <div className="flex justify-between items-start">
                             <p className="text-xs font-black text-blue-900 line-clamp-1">Ca {index + 1}: {shift.name}</p>
                             <p className="text-[10px] font-bold text-blue-700 bg-white/60 px-1 rounded">{shift.startTime} - {shift.endTime}</p>
                           </div>
                           {duration > 40 && (
                             <div className="mt-1 flex items-center gap-1 opacity-80">
                               <Users className="w-3 h-3 text-blue-600" />
                               <span className="text-[10px] text-blue-800 font-medium">{checkedInCount}/{attendance.length} NV</span>
                             </div>
                           )}
                         </div>
                       );
                    })}
                  </div>
                </div>
              )}

              {viewMode === 'list' && selectedJob?.shifts?.map((shift, index) => {
                const attendance = getShiftAttendance(selectedJobId, shift.id);
                const shiftStatus = getShiftStatus(shift.startTime, shift.endTime);
                const StatusIcon = shiftStatus.icon;
                const checkedInCount = attendance.filter(a => a.status === 'CHECKED_IN' || a.status === 'COMPLETED').length;

                return (
                <div key={index} className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm mb-3">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-sm font-bold text-slate-900">Ca {index + 1}: {shift.name || ''}</p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        <Clock className="inline h-3 w-3 mr-1" />
                        {formatTime(shift.startTime)} — {formatTime(shift.endTime)}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 text-xs">
                      <StatusIcon className={`h-3.5 w-3.5 ${shiftStatus.color}`} />
                      <span className={`font-medium ${shiftStatus.color}`}>{shiftStatus.label}</span>
                    </div>
                  </div>

                  {/* Attendance Summary */}
                  <div className="flex items-center gap-2 mb-3 bg-slate-50 rounded-lg px-3 py-2">
                    <UserCheck className="h-4 w-4 text-blue-500" />
                    <span className="text-xs font-semibold text-slate-600">
                      {checkedInCount}/{attendance.length} đã check-in
                    </span>
                  </div>

                  {/* Employee List */}
                  {attendance.length > 0 && (
                    <div className="space-y-2 mb-3">
                      {attendance.map((app) => (
                        <div key={app.id} className="flex items-center gap-3 rounded-lg border border-slate-100 px-3 py-2">
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0 overflow-hidden">
                            {app.candidateAvatar ? (
                              <img src={app.candidateAvatar} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-xs font-bold text-blue-600">
                                {(app.candidateName || '?').charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-800 truncate">{app.candidateName || app.candidateId}</p>
                          </div>
                          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                            app.status === 'CHECKED_IN' ? 'bg-emerald-100 text-emerald-700' :
                            app.status === 'COMPLETED' ? 'bg-blue-100 text-blue-700' :
                            'bg-amber-100 text-amber-700'
                          }`}>
                            {app.status === 'CHECKED_IN' ? 'Đã vào' : app.status === 'COMPLETED' ? 'Hoàn thành' : 'Đã duyệt'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {attendance.length === 0 && (
                    <p className="text-xs text-slate-400 mb-3 italic">Chưa có nhân viên nào được duyệt cho ca này.</p>
                  )}

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
              );
              })}

              {viewMode === 'list' && (!selectedJob?.shifts || selectedJob.shifts.length === 0) && (
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

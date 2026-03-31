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
    <div className="flex flex-col min-h-[100dvh] bg-[#F5F7FF] pb-24 font-sans text-slate-800 relative">
      {/* ── Gradient Header ── */}
      <div className="bg-gradient-to-br from-[#1e3a5f] to-[#1e40af] px-5 pt-10 md:pt-14 pb-8 lg:rounded-b-[3rem] shadow-md relative z-10 transition-all">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate({ to: '/employer' })}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors shadow-sm backdrop-blur-sm"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex-1 text-center pr-10">
               <h1 className="text-xl font-bold text-white drop-shadow-sm">Quản lý Ca làm</h1>
               <p className="text-[11px] font-bold tracking-[0.1em] uppercase text-white/70 mt-0.5">Theo dõi chấm công hiển thị lịch</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 w-full max-w-4xl mx-auto space-y-4 pt-6 px-4">
        {isJobsLoading ? (
          <div className="flex items-center justify-center py-10">
            <div className="w-8 h-8 rounded-full border-4 border-[#1e3a5f]/20 border-t-[#1e3a5f] animate-spin"></div>
          </div>
        ) : activeJobs.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
            <div className="w-16 h-16 rounded-3xl bg-slate-50 flex items-center justify-center mx-auto mb-4 border border-slate-100 rotate-3">
              <Clock className="h-8 w-8 text-slate-400" />
            </div>
            <p className="text-sm font-bold text-slate-700 mb-2">Chưa có tin tuyển dụng nào có ca làm</p>
            <p className="text-xs text-slate-500 mb-6 px-4">Bạn có thể tạo tin mới và thêm thông tin ca làm việc để quản lý.</p>
            <button
              type="button"
              onClick={() => navigate({ to: '/employer/post-job', search: { editJobId: undefined } })}
              className="inline-flex items-center justify-center px-6 py-2.5 bg-[#1e3a5f] text-white font-bold rounded-xl text-sm shadow-md hover:bg-[#1e40af] transition-colors"
            >
              Đăng tin mới ngay
            </button>
          </div>
        ) : !selectedJobId ? (
          // ── Job selection view ──
          <>
            <h2 className="text-[12px] font-bold text-slate-500 uppercase tracking-widest pl-1 mb-2">Chọn công việc</h2>
            <div className="space-y-3">
              {activeJobs.map((job) => (
                <button
                  key={job.id}
                  type="button"
                  onClick={() => setSelectedJobId(job.id)}
                  className="w-full text-left rounded-3xl border border-slate-100 bg-white p-5 shadow-sm hover:shadow-md transition-shadow cursor-pointer relative overflow-hidden group"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-[#1e3a5f]/5 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110" />
                  <div className="relative z-10 flex items-center justify-between">
                    <div className="flex-1 min-w-0 pr-4">
                      <h3 className="text-[15px] font-bold text-[#1e3a5f] line-clamp-1 mb-2 leading-snug">{job.title}</h3>
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1.5 bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-lg text-xs font-bold">
                          <Clock className="h-3.5 w-3.5" /> {job.shifts?.length || 0} ca
                        </span>
                        <span className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-lg text-xs font-bold">
                          <Users className="h-3.5 w-3.5" /> {approvedCountByJob[job.id] || 0} NV
                        </span>
                      </div>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-[#1e3a5f]/10 transition-colors">
                      <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-[#1e3a5f]" />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </>
        ) : (
          // ── Shift detail view for selected job ──
          <>
            <div className="flex items-center gap-2 mb-2">
              <button
                type="button"
                onClick={() => setSelectedJobId(null)}
                className="flex items-center gap-1.5 text-[13px] font-bold text-slate-500 hover:text-slate-800 transition-colors bg-white px-3 py-1.5 rounded-full shadow-sm"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Trở về danh sách
              </button>
            </div>

            <div className="bg-white rounded-3xl border border-slate-100 p-5 shadow-sm mb-4">
              <h2 className="text-[15px] font-bold text-[#1e3a5f] leading-snug mb-2">{selectedJob?.title}</h2>
              <div className="flex items-center gap-2 text-[12px] font-medium text-slate-500">
                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-indigo-500" /> {selectedJob?.shifts?.length || 0} ca</span>
                <span>•</span>
                <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5 text-emerald-500" /> {approvedCountByJob[selectedJobId] || 0} NV đã chọn</span>
              </div>
            </div>

            <div className="flex items-center justify-between mb-4 px-1">
              <h3 className="text-[12px] font-bold text-slate-500 uppercase tracking-widest">Danh sách ca</h3>
              <div className="flex bg-[#1e3a5f]/5 p-1 rounded-xl">
                <button 
                  onClick={() => setViewMode('list')} 
                  className={`px-4 py-1.5 text-[12px] font-bold rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-[#1e3a5f]' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Danh sách
                </button>
                <button 
                  onClick={() => setViewMode('calendar')} 
                  className={`px-4 py-1.5 text-[12px] font-bold rounded-lg transition-all ${viewMode === 'calendar' ? 'bg-white shadow-sm text-[#1e3a5f]' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Lịch biểu
                </button>
              </div>
            </div>

            {viewMode === 'calendar' && selectedJob?.shifts && selectedJob.shifts.length > 0 && (
              <div className="bg-white rounded-3xl border border-slate-100 p-5 shadow-sm mb-6 overflow-x-auto">
                <p className="text-[11px] text-slate-500 mb-5 font-medium"><span className="text-amber-500 mr-1">*</span>Hiển thị lịch trình ca làm trong ngày (06:00 - 24:00)</p>
                <div className="min-w-[300px] relative mt-2 border-l-2 border-dashed border-slate-200 ml-12" style={{ height: `${(24 - 6) * 48}px` }}>
                  {Array.from({ length: 24 - 6 + 1 }).map((_, i) => (
                    <div key={i} className="absolute w-full border-t border-slate-100 flex items-center" style={{ top: `${i * 48}px` }}>
                      <span className="absolute -left-12 text-[10px] text-slate-400 font-bold px-1 bg-white -mt-2.5 tracking-wider">{String(i + 6).padStart(2, '0')}:00</span>
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
                         className="absolute left-3 right-2 rounded-xl bg-[#1e3a5f]/5 border-l-[3px] border-[#1e40af] p-2.5 overflow-hidden shadow-sm hover:shadow-md transition-all hover:bg-[#1e3a5f]/10 cursor-pointer" 
                         style={{ top: `${startOffset}px`, height: `${Math.max(40, duration)}px` }}
                       >
                         <div className="flex justify-between items-start">
                           <p className="text-[12px] font-black text-[#1e3a5f] line-clamp-1">Ca {index + 1}: {shift.name}</p>
                           <p className="text-[10px] font-bold text-[#1e40af] bg-white/80 px-1.5 py-0.5 rounded-md backdrop-blur-sm whitespace-nowrap ml-2 shadow-sm border border-white/50">{shift.startTime} - {shift.endTime}</p>
                         </div>
                         {duration > 40 && (
                           <div className="mt-1.5 flex items-center gap-1.5 opacity-90">
                             <div className="w-5 h-5 rounded-md bg-white flex items-center justify-center shadow-sm">
                               <Users className="w-3.5 h-3.5 text-[#1e40af]" />
                             </div>
                             <span className="text-[10px] text-[#1e3a5f] font-bold">{checkedInCount}/{attendance.length} NV đã vào</span>
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
              <div key={index} className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm mb-4">
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="w-2 h-2 rounded-full bg-indigo-500" />
                      <p className="text-[15px] font-black text-[#1e3a5f]">Ca {index + 1}: {shift.name || ''}</p>
                    </div>
                    <p className="text-[13px] text-slate-500 font-medium">
                      <Clock className="inline h-3.5 w-3.5 mr-1 text-indigo-400" />
                      {formatTime(shift.startTime)} — {formatTime(shift.endTime)}
                    </p>
                  </div>
                  <div className={`flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1.5 rounded-lg ${
                    shiftStatus.label === 'Đang diễn ra' ? 'bg-emerald-50 text-emerald-700' :
                    shiftStatus.label === 'Chưa bắt đầu' ? 'bg-slate-50 text-slate-600' :
                    'bg-rose-50 text-rose-600'
                  }`}>
                    <StatusIcon className="h-3.5 w-3.5" />
                    <span className="tracking-wide">{shiftStatus.label}</span>
                  </div>
                </div>

                {/* Attendance Summary */}
                <div className="flex items-center justify-between gap-2 mb-3 bg-indigo-50/50 rounded-xl px-4 py-3 border border-indigo-100/50">
                  <div className="flex items-center gap-2">
                    <UserCheck className="h-5 w-5 text-indigo-500" />
                    <span className="text-[13px] font-bold text-[#1e3a5f]">Điểm danh</span>
                  </div>
                  <span className="text-[13px] font-black text-indigo-600 bg-white px-2.5 py-0.5 rounded-md shadow-sm">
                    {checkedInCount}/{attendance.length}
                  </span>
                </div>

                {/* Employee List */}
                {attendance.length > 0 && (
                  <div className="space-y-2.5 mb-5">
                    {attendance.map((app) => (
                      <div key={app.id} className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/50 px-3 py-2.5">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center shrink-0 overflow-hidden border border-indigo-50">
                          {app.candidateAvatar ? (
                            <img src={app.candidateAvatar} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-sm font-bold text-indigo-600">
                              {(app.candidateName || '?').charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-bold text-slate-800 truncate mb-0.5">{app.candidateName || app.candidateId}</p>
                          <span className={`inline-block text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${
                            app.status === 'CHECKED_IN' ? 'bg-emerald-100 text-emerald-700' :
                            app.status === 'COMPLETED' ? 'bg-blue-100 text-blue-700' :
                            'bg-amber-100 text-amber-700'
                          }`}>
                            {app.status === 'CHECKED_IN' ? 'Đã vào' : app.status === 'COMPLETED' ? 'Hoàn thành' : 'Đã duyệt'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {attendance.length === 0 && (
                  <p className="text-[13px] text-slate-400 mb-5 italic text-center py-2 bg-slate-50 rounded-xl border border-dashed border-slate-200">Chưa có NV nào được duyệt cho ca này.</p>
                )}

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => navigate({
                      to: '/employer/qr-display' as any,
                      search: { jobId: selectedJobId || '', shiftIndex: index.toString() } as any
                    })}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-200 hover:from-indigo-600 hover:to-indigo-700 transition cursor-pointer active:scale-95"
                  >
                    <QrCode className="h-5 w-5" /> Hiện mã QR điểm danh
                  </button>
                </div>
              </div>
            );
            })}

            {viewMode === 'list' && (!selectedJob?.shifts || selectedJob.shifts.length === 0) && (
              <div className="py-12 bg-white rounded-3xl border border-slate-100 text-center shadow-sm">
                <AlertCircle className="h-10 w-10 mx-auto mb-3 text-rose-300" />
                <p className="text-[13px] font-bold text-slate-500">Tin này chưa có ca làm nào được cấu hình.</p>
              </div>
            )}
            
            {/* SPACING AT BOTTOM */}
            <div className="h-6" />
          </>
        )}
      </div>
    </div>
  );
}

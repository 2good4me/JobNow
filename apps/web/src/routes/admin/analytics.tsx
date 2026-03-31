import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
    LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
    Tooltip, Legend, ResponsiveContainer, AreaChart, Area, ComposedChart 
} from 'recharts';
import { TrendingUp, Users, Briefcase, FileText, Loader2, AlertCircle, Calendar } from 'lucide-react';
import { fetchTimeSeriesData, TimeSeriesData } from '@/features/admin/services/adminTimeSeriesService';

export const Route = createFileRoute('/admin/analytics')({
    component: AdminAnalyticsPage,
});

function AdminAnalyticsPage() {
    const [activeDate, setActiveDate] = useState<TimeSeriesData | null>(null);

    const { data: timeSeries = [], isLoading, error } = useQuery({
        queryKey: ['admin_analytics'],
        queryFn: () => fetchTimeSeriesData(14), // Last 14 days
    });

    return (
        <div className="space-y-6 pb-20">
            {/* Header */}
            <div>
                <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <TrendingUp className="w-6 h-6 text-indigo-600" />
                    Thống kê Phân tích (14 ngày gần nhất)
                </h1>
                <p className="text-sm text-slate-500 mt-1">Biểu đồ tổng hợp dữ liệu toàn hệ thống. Bấm vào điểm mốc thời gian để xem chi tiết.</p>
            </div>

            {isLoading && (
                <div className="flex justify-center py-20">
                    <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
                </div>
            )}

            {error && (
                <div className="bg-rose-50 text-rose-600 p-4 rounded-xl flex items-center gap-2 shadow-sm border border-rose-100">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <p className="font-semibold text-sm">Không thể tải dữ liệu thống kê. Vui lòng thử lại sau.</p>
                </div>
            )}

            {!isLoading && !error && timeSeries.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* CHART 1: Mức độ tương tác (Apps vs Jobs) */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm w-full lg:col-span-2">
                        <h2 className="text-[15px] font-bold text-slate-800 flex items-baseline gap-2 mb-6">
                            Đăng tin & Ứng tuyển
                        </h2>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart data={timeSeries} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                                    onClick={(e) => {
                                        if (e && e.activePayload) setActiveDate(e.activePayload[0].payload);
                                    }}
                                    className="cursor-pointer"
                                >
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                    <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} dy={10} />
                                    <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                                    <Tooltip 
                                        contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                        cursor={{ fill: '#f8fafc' }}
                                    />
                                    <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '13px', fontWeight: 'bold' }} />
                                    
                                    <Bar dataKey="jobs" name="Việc mới" fill="#818cf8" radius={[4, 4, 0, 0]} maxBarSize={40} />
                                    <Line type="monotone" dataKey="applications" name="Lượt ứng tuyển" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* CHART 2: Users Growth */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm w-full lg:col-span-1">
                        <h2 className="text-[15px] font-bold text-slate-800 flex items-baseline gap-2 mb-6">
                            Tăng trưởng Người dùng
                        </h2>
                        <div className="h-[250px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={timeSeries} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
                                    onClick={(e) => {
                                        if (e && e.activePayload) setActiveDate(e.activePayload[0].payload);
                                    }}
                                    className="cursor-pointer"
                                >
                                    <defs>
                                        <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                    <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} dy={8}/>
                                    <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                    <Area type="monotone" dataKey="users" name="Đăng ký mới" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorUsers)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* DETAIL PANEL (Tương tác click) */}
                    <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-6 rounded-3xl border border-indigo-100 shadow-sm w-full lg:col-span-1 relative overflow-hidden transition-all h-[330px]">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/40 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
                        
                        {!activeDate ? (
                            <div className="h-full flex flex-col items-center justify-center text-center opacity-60">
                                <Calendar className="w-12 h-12 text-indigo-300 mb-3" />
                                <p className="text-[15px] font-bold text-indigo-900">Chi tiết theo ngày</p>
                                <p className="text-xs text-indigo-600 mt-1 max-w-[200px]">Bấm vào biểu đồ bên cạnh để xem báo cáo chi tiết cho từng ngày cụ thể.</p>
                            </div>
                        ) : (
                            <div className="h-full flex flex-col animate-in fade-in slide-in-from-bottom-2">
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <h3 className="text-lg font-black text-indigo-900 drop-shadow-sm">Báo cáo ngày {activeDate.label}</h3>
                                        <p className="text-xs font-bold text-indigo-500 mt-1">{activeDate.rawDate.toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                    </div>
                                    <button 
                                        onClick={() => setActiveDate(null)}
                                        className="text-[10px] font-bold bg-white text-indigo-600 px-2 py-1.5 rounded-lg shadow-sm hover:shadow-md transition active:scale-95 border border-indigo-100"
                                    >
                                        Đóng lại
                                    </button>
                                </div>

                                <div className="grid grid-cols-2 gap-3 flex-1">
                                    <div className="bg-white rounded-2xl p-4 shadow-sm border border-indigo-50 flex flex-col justify-center relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-125 transition">
                                            <Users className="w-10 h-10 text-emerald-500" />
                                        </div>
                                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Người dùng mới</p>
                                        <p className="text-3xl font-black text-emerald-600 mt-1">{activeDate.users}</p>
                                    </div>
                                    
                                    <div className="bg-white rounded-2xl p-4 shadow-sm border border-indigo-50 flex flex-col justify-center relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-125 transition">
                                            <Briefcase className="w-10 h-10 text-indigo-500" />
                                        </div>
                                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Việc làm mới</p>
                                        <p className="text-3xl font-black text-indigo-600 mt-1">{activeDate.jobs}</p>
                                    </div>

                                    <div className="bg-white rounded-2xl p-4 shadow-sm border border-indigo-50 flex flex-col justify-center col-span-2 relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-125 transition">
                                            <FileText className="w-12 h-12 text-amber-500" />
                                        </div>
                                        <div className="flex items-center justify-between z-10">
                                            <div>
                                                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Lượt ứng tuyển</p>
                                                <p className="text-3xl font-black text-amber-600 mt-1">{activeDate.applications}</p>
                                            </div>
                                            <div className="bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-100">
                                                <span className="text-xs font-bold text-amber-700">Hiệu suất cao</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

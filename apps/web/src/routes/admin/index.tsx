import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import {
    Users, Briefcase, FileText, AlertTriangle,
    TrendingUp, UserPlus, ClipboardList,
} from 'lucide-react';
import {
    fetchDashboardStats, fetchWeeklyApplications, fetchRecentActivity,
    type DashboardStats, type WeeklyChartData, type RecentActivity,
} from '@/features/admin/services/adminStatsService';
import { Link } from '@tanstack/react-router';

export const Route = createFileRoute('/admin/')({
    component: AdminDashboard,
});

/* ── Stats Card ───────────────────────────────────── */

function StatsCard({ icon: Icon, label, value, color, to }: {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    value: number;
    color: 'blue' | 'emerald' | 'amber' | 'rose';
    to?: string;
}) {
    const colorMap = {
        blue: 'bg-blue-50 border-blue-100 text-blue-700',
        emerald: 'bg-emerald-50 border-emerald-100 text-emerald-700',
        amber: 'bg-amber-50 border-amber-100 text-amber-700',
        rose: 'bg-rose-50 border-rose-100 text-rose-700',
    };
    const valueColorMap = {
        blue: 'text-blue-900',
        emerald: 'text-emerald-900',
        amber: 'text-amber-900',
        rose: 'text-rose-900',
    };

    const content = (
        <div className={`rounded-2xl border p-5 ${colorMap[color]} transition-all hover:shadow-md hover:scale-[1.02] cursor-pointer`}>
            <div className="flex items-center justify-between mb-3">
                <Icon className="w-5 h-5" />
            </div>
            <p className={`text-3xl font-bold ${valueColorMap[color]}`}>{value.toLocaleString('vi-VN')}</p>
            <p className="text-xs font-semibold uppercase tracking-wider mt-1 opacity-80">{label}</p>
        </div>
    );

    if (to) return <Link to={to}>{content}</Link>;
    return content;
}

/* ── Mini Bar Chart ───────────────────────────────── */

function MiniBarChart({ data }: { data: WeeklyChartData[] }) {
    const max = Math.max(...data.map(d => d.count), 1);

    return (
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-500" />
                Ứng tuyển 7 ngày gần nhất
            </h3>
            <div className="flex items-end gap-2 h-32">
                {data.map((d, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                        <span className="text-[10px] font-bold text-slate-500">{d.count}</span>
                        <div
                            className="w-full rounded-t-lg bg-gradient-to-t from-indigo-500 to-indigo-400 transition-all duration-300"
                            style={{ height: `${Math.max((d.count / max) * 100, 4)}%` }}
                        />
                        <span className="text-[10px] font-medium text-slate-400">{d.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

/* ── Activity Feed ────────────────────────────────── */

function ActivityFeed({ activities }: { activities: RecentActivity[] }) {
    const iconMap = {
        NEW_USER: UserPlus,
        NEW_JOB: Briefcase,
        NEW_APPLICATION: ClipboardList,
        NEW_REPORT: AlertTriangle,
    };
    const colorMap = {
        NEW_USER: 'bg-blue-100 text-blue-600',
        NEW_JOB: 'bg-emerald-100 text-emerald-600',
        NEW_APPLICATION: 'bg-amber-100 text-amber-600',
        NEW_REPORT: 'bg-rose-100 text-rose-600',
    };

    function timeAgo(date: Date): string {
        const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
        if (seconds < 60) return 'Vừa xong';
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes} phút trước`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours} giờ trước`;
        const days = Math.floor(hours / 24);
        return `${days} ngày trước`;
    }

    return (
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <h3 className="text-sm font-bold text-slate-700 mb-4">🕐 Hoạt động gần đây</h3>
            <div className="space-y-3">
                {activities.length === 0 && (
                    <p className="text-sm text-slate-400 text-center py-4">Chưa có hoạt động nào</p>
                )}
                {activities.map((a) => {
                    const Icon = iconMap[a.type];
                    return (
                        <div key={a.id} className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${colorMap[a.type]}`}>
                                <Icon className="w-4 h-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-sm text-slate-700 font-medium truncate">{a.title}</p>
                                <p className="text-xs text-slate-400 truncate">{a.description}</p>
                            </div>
                            <span className="text-[10px] text-slate-400 whitespace-nowrap">{timeAgo(a.timestamp)}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

/* ── Dashboard Page ───────────────────────────────── */

function AdminDashboard() {
    const [stats, setStats] = useState<DashboardStats>({ totalUsers: 0, totalJobs: 0, todayApplications: 0, pendingReports: 0 });
    const [chartData, setChartData] = useState<WeeklyChartData[]>([]);
    const [activities, setActivities] = useState<RecentActivity[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            try {
                const [s, c, a] = await Promise.all([
                    fetchDashboardStats(),
                    fetchWeeklyApplications(),
                    fetchRecentActivity(),
                ]);
                setStats(s);
                setChartData(c);
                setActivities(a);
            } catch (err) {
                console.error('Dashboard load error:', err);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    if (loading) {
        return (
            <div className="space-y-6 animate-pulse">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-28 bg-slate-100 rounded-2xl border border-slate-200" />
                    ))}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="h-48 bg-slate-100 rounded-2xl border border-slate-200" />
                    <div className="h-48 bg-slate-100 rounded-2xl border border-slate-200" />
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-xl font-bold text-slate-900">Tổng quan hệ thống</h1>
                <p className="text-sm text-slate-500 mt-0.5">Theo dõi tình hình hoạt động của JobNow</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatsCard icon={Users} label="Người dùng" value={stats.totalUsers} color="blue" to="/admin/users" />
                <StatsCard icon={Briefcase} label="Việc làm đang mở" value={stats.totalJobs} color="emerald" to="/admin/jobs" />
                <StatsCard icon={FileText} label="Ứng tuyển hôm nay" value={stats.todayApplications} color="amber" />
                <StatsCard icon={AlertTriangle} label="Báo cáo chờ xử lý" value={stats.pendingReports} color="rose" to="/admin/reports" />
            </div>

            {/* Charts + Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <MiniBarChart data={chartData} />
                <ActivityFeed activities={activities} />
            </div>
        </div>
    );
}

import { createFileRoute } from '@tanstack/react-router';
import { useCallback, useEffect, useState } from 'react';
import { Search, ChevronLeft, ChevronRight, EyeOff, Eye, Check, X } from 'lucide-react';
import {
    fetchAdminJobs, hideJob, reviewJobModeration,
    type AdminJobFilters, type PaginatedJobs,
} from '@/features/admin/services/adminJobService';
import { useAuth } from '@/features/auth/context/AuthContext';
import type { DocumentSnapshot } from 'firebase/firestore';
import { toast } from 'sonner';

export const Route = createFileRoute('/admin/jobs')({
    component: AdminJobsPage,
});

function AdminJobsPage() {
    const { userProfile } = useAuth();
    const [data, setData] = useState<PaginatedJobs>({ jobs: [], total: 0, lastDoc: null, hasMore: false });
    const [filters, setFilters] = useState<AdminJobFilters>({
        status: 'ALL',
        moderationStatus: 'ALL',
        sortBy: 'created_at',
        sortDir: 'desc',
    });
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [pageHistory, setPageHistory] = useState<(DocumentSnapshot | null)[]>([null]);

    const pageSize = 20;

    const loadJobs = useCallback(async (afterDoc?: DocumentSnapshot | null) => {
        setLoading(true);
        try {
            const result = await fetchAdminJobs(filters, pageSize, afterDoc);
            setData(result);
        } catch (err) {
            console.error('Error loading jobs:', err);
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        setPage(1);
        setPageHistory([null]);
        loadJobs(null);
    }, [filters, loadJobs]);

    const filteredJobs = search.trim()
        ? data.jobs.filter(j => j.title?.toLowerCase().includes(search.toLowerCase()) || j.employer_name?.toLowerCase().includes(search.toLowerCase()))
        : data.jobs;

    const handleNextPage = () => {
        if (!data.hasMore || !data.lastDoc) return;
        setPageHistory(prev => [...prev, data.lastDoc]);
        setPage(p => p + 1);
        loadJobs(data.lastDoc);
    };

    const handlePrevPage = () => {
        if (page <= 1) return;
        const newHistory = [...pageHistory];
        newHistory.pop();
        setPageHistory(newHistory);
        setPage(p => p - 1);
        loadJobs(newHistory[newHistory.length - 1]);
    };

    const handleHide = async (jobId: string) => {
        if (!userProfile?.uid) return;
        const reason = prompt('Nhập lý do ẩn tin tuyển dụng:');
        if (!reason) return;
        try {
            await hideJob(jobId, userProfile.uid, reason);
            toast.success('Đã ẩn tin tuyển dụng');
            loadJobs(pageHistory[pageHistory.length - 1]);
        } catch (err) {
            console.error(err);
            toast.error('Không thể ẩn tin tuyển dụng');
        }
    };

    const handleReview = async (jobId: string, action: 'APPROVE' | 'REJECT') => {
        const reason = action === 'REJECT'
            ? prompt('Nhập lý do từ chối tin tuyển dụng:')
            : undefined;

        if (action === 'REJECT' && !reason?.trim()) {
            return;
        }

        try {
            await reviewJobModeration(jobId, action, reason?.trim());
            toast.success(action === 'APPROVE' ? 'Đã phê duyệt tin tuyển dụng' : 'Đã từ chối tin tuyển dụng');
            loadJobs(pageHistory[pageHistory.length - 1]);
        } catch (err) {
            console.error(err);
            toast.error(action === 'APPROVE' ? 'Không thể phê duyệt tin' : 'Không thể từ chối tin');
        }
    };

    const statusBadge = (status: string) => {
        const map: Record<string, { cls: string; label: string }> = {
            OPEN: { cls: 'bg-emerald-100 text-emerald-700', label: 'Đang mở' },
            ACTIVE: { cls: 'bg-blue-100 text-blue-700', label: 'Active' },
            FULL: { cls: 'bg-amber-100 text-amber-700', label: 'Đã đủ' },
            CLOSED: { cls: 'bg-slate-100 text-slate-600', label: 'Đã đóng' },
            HIDDEN: { cls: 'bg-rose-100 text-rose-700', label: 'Bị ẩn' },
        };
        const s = map[status] ?? { cls: 'bg-slate-100 text-slate-600', label: status };
        return <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${s.cls}`}>{s.label}</span>;
    };

    const moderationBadge = (status?: string) => {
        const map: Record<string, { cls: string; label: string }> = {
            PENDING_REVIEW: { cls: 'bg-amber-100 text-amber-700', label: 'Chờ duyệt' },
            APPROVED: { cls: 'bg-emerald-100 text-emerald-700', label: 'Đã duyệt' },
            REJECTED: { cls: 'bg-rose-100 text-rose-700', label: 'Từ chối' },
        };
        const s = map[String(status ?? 'APPROVED').toUpperCase()] ?? { cls: 'bg-slate-100 text-slate-600', label: String(status ?? '—') };
        return <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${s.cls}`}>{s.label}</span>;
    };

    const formatSalary = (salary: number, type: string) => {
        const formatted = (salary ?? 0).toLocaleString('vi-VN');
        const unit = type === 'HOURLY' ? '/giờ' : type === 'DAILY' ? '/ngày' : '';
        return `${formatted}đ${unit}`;
    };

    return (
        <div className="space-y-5">
            <div>
                <h1 className="text-xl font-bold text-slate-900">Quản lý việc làm</h1>
                <p className="text-sm text-slate-500">Tổng: {data.total.toLocaleString('vi-VN')} việc làm</p>
            </div>

            <div className="flex flex-wrap gap-2">
                {[
                    { key: 'ALL', label: 'Tất cả' },
                    { key: 'PENDING_REVIEW', label: 'Chờ duyệt' },
                    { key: 'APPROVED', label: 'Đã duyệt' },
                    { key: 'REJECTED', label: 'Từ chối' },
                ].map((tab) => (
                    <button
                        key={tab.key}
                        type="button"
                        onClick={() => setFilters((current) => ({ ...current, moderationStatus: tab.key as AdminJobFilters['moderationStatus'] }))}
                        className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                            (filters.moderationStatus ?? 'ALL') === tab.key
                                ? 'bg-indigo-600 text-white'
                                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Filters */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4">
                <div className="flex flex-wrap gap-3">
                    <div className="relative flex-1 min-w-[200px]">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text" value={search} onChange={e => setSearch(e.target.value)}
                            placeholder="Tìm theo tiêu đề, nhà tuyển dụng..."
                            className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
                        />
                    </div>
                    <select
                        value={filters.status}
                        onChange={e => setFilters(f => ({ ...f, status: e.target.value as any }))}
                        className="border border-slate-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200"
                    >
                        <option value="ALL">Tất cả trạng thái</option>
                        <option value="OPEN">Đang mở</option>
                        <option value="ACTIVE">Active</option>
                        <option value="FULL">Đã đủ</option>
                        <option value="CLOSED">Đã đóng</option>
                        <option value="HIDDEN">Bị ẩn</option>
                    </select>
                    <select
                        value={filters.moderationStatus ?? 'ALL'}
                        onChange={e => setFilters(f => ({ ...f, moderationStatus: e.target.value as AdminJobFilters['moderationStatus'] }))}
                        className="border border-slate-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200"
                    >
                        <option value="ALL">Tất cả moderation</option>
                        <option value="PENDING_REVIEW">Chờ duyệt</option>
                        <option value="APPROVED">Đã duyệt</option>
                        <option value="REJECTED">Từ chối</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Tiêu đề</th>
                                <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">NTD</th>
                                <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Mức lương</th>
                                <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Trạng thái</th>
                                <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Kiểm duyệt</th>
                                <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Ngày đăng</th>
                                <th className="text-right px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        {[1,2,3,4,5,6,7].map(j => (<td key={j} className="px-4 py-3"><div className="h-4 w-20 bg-slate-100 rounded" /></td>))}
                                    </tr>
                                ))
                            ) : filteredJobs.length === 0 ? (
                                <tr><td colSpan={7} className="text-center py-12 text-slate-400">Không tìm thấy việc làm nào</td></tr>
                            ) : (
                                filteredJobs.map(job => (
                                    <tr key={job.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-4 py-3">
                                            <p className="font-semibold text-slate-800 truncate max-w-[200px]">{job.title}</p>
                                            <p className="text-[11px] text-slate-400">{job.category || '—'}</p>
                                        </td>
                                        <td className="px-4 py-3 text-slate-600 text-xs">{job.employer_name || job.employer_id?.slice(0, 8)}</td>
                                        <td className="px-4 py-3 text-slate-700 font-medium text-xs">{formatSalary(job.salary, job.salary_type)}</td>
                                        <td className="px-4 py-3">{statusBadge(job.status)}</td>
                                        <td className="px-4 py-3">{moderationBadge(job.moderation_status)}</td>
                                        <td className="px-4 py-3 text-xs text-slate-500">{job.created_at?.toLocaleDateString?.('vi-VN') ?? '—'}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-end gap-1">
                                                {job.moderation_status === 'PENDING_REVIEW' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleReview(job.id, 'APPROVE')}
                                                            className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                                                            title="Phê duyệt"
                                                        >
                                                            <Check className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleReview(job.id, 'REJECT')}
                                                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                                            title="Từ chối"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    </>
                                                )}
                                                {job.status !== 'HIDDEN' && (
                                                    <button onClick={() => handleHide(job.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors" title="Ẩn">
                                                        <EyeOff className="w-4 h-4" />
                                                    </button>
                                                )}
                                                 <button className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors" title="Xem">
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 bg-slate-50/50">
                    <p className="text-xs text-slate-500">Trang {page}</p>
                    <div className="flex gap-2">
                        <button onClick={handlePrevPage} disabled={page <= 1}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-colors">
                            <ChevronLeft className="w-3 h-3" /> Trước
                        </button>
                        <button onClick={handleNextPage} disabled={!data.hasMore}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-colors">
                            Tiếp <ChevronRight className="w-3 h-3" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

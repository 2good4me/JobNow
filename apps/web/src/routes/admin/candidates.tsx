import { createFileRoute } from '@tanstack/react-router';
import { useCallback, useEffect, useState } from 'react';
import { 
    Check, X, Search, 
    Clock,  
    ChevronLeft, ChevronRight,
    Loader2, AlertCircle, RefreshCw
} from 'lucide-react';
import { 
    fetchCandidateUsers, 
    updateUserVerificationDirectly,
    type PaginatedCandidates
} from '@/features/admin/services/adminCandidateService';
import { toast } from 'sonner';
import type { DocumentSnapshot } from 'firebase/firestore';

import { useAuth } from '@/features/auth/context/AuthContext';

export const Route = createFileRoute('/admin/candidates')({
    component: AdminCandidatesPage,
});

function AdminCandidatesPage() {
    const { userProfile } = useAuth();
    useEffect(() => {
        console.log('DEBUG: Current User Profile:', userProfile);
    }, [userProfile]);

    const [data, setData] = useState<PaginatedCandidates>({ users: [], total: 0, lastDoc: null, hasMore: false });
    const [filters, setFilters] = useState({ verificationStatus: 'ALL', search: '' });
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [pageHistory, setPageHistory] = useState<(DocumentSnapshot | null)[]>([null]);
    const [processingId, setProcessingId] = useState<string | null>(null);

    const pageSize = 12;

    const loadCandidates = useCallback(async (afterDoc?: DocumentSnapshot | null) => {
        setLoading(true);
        try {
            const result = await fetchCandidateUsers(filters, pageSize, afterDoc);
            setData(result);
        } catch (err) {
            console.error(err);
            toast.error('Không thể tải danh sách ứng viên.');
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        setPage(1);
        setPageHistory([null]);
        loadCandidates(null);
    }, [filters, loadCandidates]);

    const handleUpdateStatus = async (userId: string, status: any) => {
        let reason = '';
        if (status === 'REJECTED') {
            const promptReason = prompt('Nhập lý do từ chối:');
            if (promptReason === null) return;
            reason = promptReason.trim();
        }

        setProcessingId(userId);
        try {
            await updateUserVerificationDirectly(userId, status, reason);
            toast.success(`Đã cập nhật trạng thái: ${status}`);
            loadCandidates(pageHistory[pageHistory.length - 1]);
        } catch (err) {
            console.error(err);
            toast.error('Lỗi khi cập nhật trạng thái.');
        } finally {
            setProcessingId(null);
        }
    };

    const handleNextPage = () => {
        if (!data.hasMore || !data.lastDoc) return;
        setPageHistory(prev => [...prev, data.lastDoc]);
        setPage(p => p + 1);
        loadCandidates(data.lastDoc);
    };

    const handlePrevPage = () => {
        if (page <= 1) return;
        const newPage = page - 1;
        const newHistory = [...pageHistory];
        newHistory.pop();
        setPageHistory(newHistory);
        setPage(newPage);
        loadCandidates(newHistory[newHistory.length - 1]);
    };

    const statusBadge = (status: string) => {
        const map: Record<string, { cls: string; label: string }> = {
            VERIFIED: { cls: 'bg-emerald-100 text-emerald-700', label: '✓ Đã xác thực' },
            PENDING: { cls: 'bg-amber-100 text-amber-700', label: '⌛ Đang chờ' },
            REJECTED: { cls: 'bg-rose-100 text-rose-700', label: '✕ Từ chối' },
            UNVERIFIED: { cls: 'bg-slate-100 text-slate-600', label: '○ Chưa xác thực' },
        };
        const s = map[status] || map.UNVERIFIED;
        return <span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${s.cls}`}>{s.label}</span>;
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Quản lý xác thực ứng viên</h1>
                    <p className="text-sm text-slate-500">Tổng cộng: {data.total} ứng viên</p>
                </div>
                <button 
                    onClick={() => loadCandidates(null)}
                    className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
                    title="Làm mới"
                >
                    <RefreshCw className={`w-5 h-5 text-slate-500 ${loading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4 items-center bg-white p-4 rounded-3xl border border-slate-200 shadow-sm">
                <div className="flex-1 min-w-[240px] relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                        type="text" 
                        placeholder="Tìm theo tên (Client-side)..." 
                        value={filters.search}
                        onChange={(e) => setFilters(f => ({ ...f, search: e.target.value }))}
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                    />
                </div>
                <select 
                    value={filters.verificationStatus}
                    onChange={(e) => setFilters(f => ({ ...f, verificationStatus: e.target.value }))}
                    className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 font-medium text-slate-600"
                >
                    <option value="ALL">Tất cả trạng thái</option>
                    <option value="UNVERIFIED">Chưa xác thực</option>
                    <option value="PENDING">Đang chờ duyệt</option>
                    <option value="VERIFIED">Đã xác thực</option>
                    <option value="REJECTED">Bị từ chối</option>
                </select>
            </div>

            {loading ? (
                <div className="flex items-center justify-center p-20">
                    <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
                </div>
            ) : data.users.length === 0 ? (
                <div className="bg-white rounded-3xl border border-slate-200 p-16 text-center shadow-sm">
                    <AlertCircle className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-slate-800">Không tìm thấy ứng viên nào</h3>
                    <p className="text-slate-500">Thử thay đổi bộ lọc hoặc tìm kiếm.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {data.users
                        .filter(u => u.full_name?.toLowerCase().includes(filters.search.toLowerCase()))
                        .map((u) => (
                        <div key={u.uid} className="bg-white rounded-3xl border border-slate-200 overflow-hidden flex flex-col shadow-sm transition-all hover:shadow-md">
                            <div className="p-4 flex items-center gap-4">
                                {u.avatar_url ? (
                                    <img src={u.avatar_url} className="w-12 h-12 rounded-2xl object-cover bg-slate-100" alt="" />
                                ) : (
                                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold border border-indigo-100">
                                        {u.full_name?.[0] || 'U'}
                                    </div>
                                )}
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-slate-800 truncate">{u.full_name || 'Anonymous'}</h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        {statusBadge(u.verification_status as any)}
                                    </div>
                                </div>
                            </div>

                            <div className="px-5 py-4 space-y-3 flex-1 bg-slate-50/30">
                                <div className="flex items-center gap-2 text-xs text-slate-500">
                                    <div className="w-5 h-5 rounded-lg bg-white flex items-center justify-center border border-slate-100 shadow-sm">
                                        <Clock className="w-3 h-3" />
                                    </div>
                                    Tham gia: {u.created_at ? new Date(u.created_at).toLocaleDateString('vi-VN') : '—'}
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Hành động nhanh</p>
                                    <div className="grid grid-cols-2 gap-2">
                                        <button 
                                            onClick={() => handleUpdateStatus(u.uid, 'VERIFIED')}
                                            className="flex items-center justify-center gap-1.5 py-2 rounded-xl bg-white border border-emerald-200 text-emerald-600 font-bold text-[11px] hover:bg-emerald-50 transition-colors disabled:opacity-50"
                                            disabled={processingId === u.uid || u.verification_status === 'VERIFIED'}
                                        >
                                            <Check className="w-3 h-3" /> Xác thực
                                        </button>
                                        <button 
                                            onClick={() => handleUpdateStatus(u.uid, 'REJECTED')}
                                            className="flex items-center justify-center gap-1.5 py-2 rounded-xl bg-white border border-rose-200 text-rose-600 font-bold text-[11px] hover:bg-rose-50 transition-colors disabled:opacity-50"
                                            disabled={processingId === u.uid || (u.verification_status as any) === 'REJECTED'}
                                        >
                                            <X className="w-3 h-3" /> Từ chối
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="p-3 bg-white border-t border-slate-100 flex gap-2">
                                {u.verification_status !== 'UNVERIFIED' && (
                                    <button 
                                        onClick={() => handleUpdateStatus(u.uid, 'UNVERIFIED')}
                                        className="flex-1 py-1.5 rounded-lg bg-slate-50 text-slate-400 font-medium text-[10px] hover:bg-slate-100 transition-colors"
                                    >
                                        Gỡ xác thực
                                    </button>
                                )}
                                <button className="flex-1 py-1.5 rounded-lg bg-indigo-50 text-indigo-600 font-bold text-[10px] hover:bg-indigo-100 transition-colors">
                                    Xem chi tiết
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Pagination */}
            <div className="flex items-center justify-between px-6 py-4 bg-white rounded-3xl border border-slate-200 shadow-sm">
                <p className="text-sm font-medium text-slate-400">Trang {page}</p>
                <div className="flex gap-3">
                    <button 
                        onClick={handlePrevPage}
                        disabled={page <= 1}
                        className="flex items-center gap-2 px-4 py-2 rounded-2xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-all active:scale-95"
                    >
                        <ChevronLeft className="w-4 h-4" /> Trước
                    </button>
                    <button 
                        onClick={handleNextPage}
                        disabled={!data.hasMore}
                        className="flex items-center gap-2 px-4 py-2 rounded-2xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-all active:scale-95"
                    >
                        Sau <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}

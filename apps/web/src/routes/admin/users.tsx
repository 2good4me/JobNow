import { createFileRoute } from '@tanstack/react-router';
import { useCallback, useEffect, useState } from 'react';
import { Search, ChevronLeft, ChevronRight, Lock, Unlock, Ban, Eye } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import {
    fetchAdminUsers, updateUserStatus,
    type AdminUserFilters, type PaginatedUsers,
} from '@/features/admin/services/adminUserService';
import { useAuth } from '@/features/auth/context/AuthContext';
import type { UserProfile } from '@/features/auth/types/user';
import type { DocumentSnapshot } from 'firebase/firestore';

export const Route = createFileRoute('/admin/users')({
    component: AdminUsersPage,
});

/* ── Action Dialog ────────────────────────────────── */

function ActionDialog({ user, action, onConfirm, onCancel }: {
    user: UserProfile;
    action: 'LOCK' | 'BAN' | 'UNLOCK';
    onConfirm: (reason: string) => void;
    onCancel: () => void;
}) {
    const [reason, setReason] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const labels = { LOCK: 'Khóa', BAN: 'Cấm vĩnh viễn', UNLOCK: 'Mở khóa' };
    const colors = { LOCK: 'bg-amber-600 hover:bg-amber-700', BAN: 'bg-rose-600 hover:bg-rose-700', UNLOCK: 'bg-emerald-600 hover:bg-emerald-700' };

    const handleSubmit = async () => {
        if (reason.trim().length < 10 && action !== 'UNLOCK') return;
        setSubmitting(true);
        onConfirm(reason.trim());
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onCancel}>
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full mx-4 p-6" onClick={(e) => e.stopPropagation()}>
                <h3 className="text-lg font-bold text-slate-800 mb-1">{labels[action]} tài khoản</h3>
                <p className="text-sm text-slate-500 mb-4">
                    Bạn sắp {labels[action].toLowerCase()} tài khoản <strong>{user.full_name}</strong>
                </p>

                <label className="block text-sm font-medium text-slate-700 mb-1">Lý do {action !== 'UNLOCK' && '(≥ 10 ký tự)'}</label>
                <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
                    rows={3}
                    placeholder="Nhập lý do..."
                />

                <div className="flex gap-2 mt-4">
                    <button
                        onClick={onCancel}
                        className="flex-1 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                        disabled={submitting}
                    >
                        Hủy
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={submitting || (reason.trim().length < 10 && action !== 'UNLOCK')}
                        className={`flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors disabled:opacity-50 ${colors[action]}`}
                    >
                        {submitting ? 'Đang xử lý...' : labels[action]}
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ── Main Page ────────────────────────────────────── */

function AdminUsersPage() {
    const { userProfile } = useAuth();
    const [data, setData] = useState<PaginatedUsers>({ users: [], total: 0, lastDoc: null, hasMore: false });
    const [filters, setFilters] = useState<AdminUserFilters>({ role: 'ALL', status: 'ALL', sortBy: 'created_at', sortDir: 'desc' });
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [pageHistory, setPageHistory] = useState<(DocumentSnapshot | null)[]>([null]);
    const [actionDialog, setActionDialog] = useState<{ user: UserProfile; action: 'LOCK' | 'BAN' | 'UNLOCK' } | null>(null);

    const pageSize = 20;

    const loadUsers = useCallback(async (afterDoc?: DocumentSnapshot | null) => {
        setLoading(true);
        try {
            const result = await fetchAdminUsers(filters, pageSize, afterDoc);
            setData(result);
        } catch (err) {
            console.error('Error loading users:', err);
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        setPage(1);
        setPageHistory([null]);
        loadUsers(null);
    }, [filters, loadUsers]);

    // Client-side search filter (simple approach)
    const filteredUsers = search.trim()
        ? data.users.filter(u =>
            u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
            u.phone_number?.includes(search) ||
            u.email?.toLowerCase().includes(search.toLowerCase())
        )
        : data.users;

    const handleNextPage = () => {
        if (!data.hasMore || !data.lastDoc) return;
        setPageHistory(prev => [...prev, data.lastDoc]);
        setPage(p => p + 1);
        loadUsers(data.lastDoc);
    };

    const handlePrevPage = () => {
        if (page <= 1) return;
        const newPage = page - 1;
        const newHistory = [...pageHistory];
        newHistory.pop();
        setPageHistory(newHistory);
        setPage(newPage);
        loadUsers(newHistory[newHistory.length - 1]);
    };

    const handleAction = async (reason: string) => {
        if (!actionDialog || !userProfile?.uid) return;
        const statusMap = { LOCK: 'LOCKED' as const, BAN: 'BANNED' as const, UNLOCK: 'ACTIVE' as const };
        try {
            await updateUserStatus(actionDialog.user.uid, statusMap[actionDialog.action], userProfile.uid, reason);
            setActionDialog(null);
            loadUsers(pageHistory[pageHistory.length - 1]);
        } catch (err) {
            console.error('Action error:', err);
        }
    };

    const roleBadge = (role: string) => {
        const map: Record<string, string> = {
            CANDIDATE: 'bg-blue-100 text-blue-700',
            EMPLOYER: 'bg-emerald-100 text-emerald-700',
            ADMIN: 'bg-purple-100 text-purple-700',
        };
        return <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${map[role] ?? 'bg-slate-100 text-slate-600'}`}>{role}</span>;
    };

    const statusBadge = (status: string) => {
        const map: Record<string, { cls: string; label: string }> = {
            ACTIVE: { cls: 'bg-emerald-100 text-emerald-700', label: '✅ Active' },
            LOCKED: { cls: 'bg-amber-100 text-amber-700', label: '🔒 Locked' },
            BANNED: { cls: 'bg-rose-100 text-rose-700', label: '🚫 Banned' },
        };
        const s = map[status] ?? { cls: 'bg-slate-100 text-slate-600', label: status };
        return <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${s.cls}`}>{s.label}</span>;
    };

    return (
        <div className="space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-slate-900">Quản lý người dùng</h1>
                    <p className="text-sm text-slate-500">Tổng: {data.total.toLocaleString('vi-VN')} người dùng</p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4">
                <div className="flex flex-wrap gap-3">
                    {/* Search */}
                    <div className="relative flex-1 min-w-[200px]">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Tìm theo tên, SĐT, email..."
                            className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
                        />
                    </div>
                    {/* Role filter */}
                    <select
                        value={filters.role}
                        onChange={(e) => setFilters(f => ({ ...f, role: e.target.value as any }))}
                        className="border border-slate-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200"
                    >
                        <option value="ALL">Tất cả vai trò</option>
                        <option value="CANDIDATE">Candidate</option>
                        <option value="EMPLOYER">Employer</option>
                    </select>
                    {/* Status filter */}
                    <select
                        value={filters.status}
                        onChange={(e) => setFilters(f => ({ ...f, status: e.target.value as any }))}
                        className="border border-slate-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200"
                    >
                        <option value="ALL">Tất cả trạng thái</option>
                        <option value="ACTIVE">Active</option>
                        <option value="LOCKED">Locked</option>
                        <option value="BANNED">Banned</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Người dùng</th>
                                <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Liên hệ</th>
                                <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Vai trò</th>
                                <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Trạng thái</th>
                                <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Uy tín</th>
                                <th className="text-right px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-4 py-3"><div className="h-4 w-32 bg-slate-100 rounded" /></td>
                                        <td className="px-4 py-3"><div className="h-4 w-24 bg-slate-100 rounded" /></td>
                                        <td className="px-4 py-3"><div className="h-4 w-16 bg-slate-100 rounded" /></td>
                                        <td className="px-4 py-3"><div className="h-4 w-16 bg-slate-100 rounded" /></td>
                                        <td className="px-4 py-3"><div className="h-4 w-12 bg-slate-100 rounded" /></td>
                                        <td className="px-4 py-3"><div className="h-4 w-20 bg-slate-100 rounded ml-auto" /></td>
                                    </tr>
                                ))
                            ) : filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="text-center py-12 text-slate-400">Không tìm thấy người dùng nào</td>
                                </tr>
                            ) : (
                                filteredUsers.map((u) => (
                                    <tr key={u.uid} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                {u.avatar_url ? (
                                                    <img src={u.avatar_url} alt="" className="w-9 h-9 rounded-full object-cover" />
                                                ) : (
                                                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-indigo-700 font-bold text-sm border border-indigo-200">
                                                        {(u.full_name?.[0] ?? 'U').toUpperCase()}
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="font-semibold text-slate-800">{u.full_name || 'Chưa đặt tên'}</p>
                                                    <p className="text-[11px] text-slate-400">ID: {u.uid.slice(0, 8)}...</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-slate-600">
                                            <p className="text-xs">{u.phone_number || '—'}</p>
                                            <p className="text-[11px] text-slate-400">{u.email || '—'}</p>
                                        </td>
                                        <td className="px-4 py-3">{roleBadge(u.role)}</td>
                                        <td className="px-4 py-3">{statusBadge(u.status)}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-indigo-500 rounded-full"
                                                        style={{ width: `${Math.min(u.reputation_score * 20, 100)}%` }}
                                                    />
                                                </div>
                                                <span className="text-xs text-slate-500 font-medium">{u.reputation_score}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-end gap-1">
                                                <Link
                                                    to="/admin/users/$userId"
                                                    params={{ userId: u.uid }}
                                                    className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                                                    title="Xem chi tiết"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </Link>
                                                {u.status === 'ACTIVE' && u.role !== 'ADMIN' && (
                                                    <>
                                                        <button
                                                            onClick={() => setActionDialog({ user: u, action: 'LOCK' })}
                                                            className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                                                            title="Khóa"
                                                        >
                                                            <Lock className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => setActionDialog({ user: u, action: 'BAN' })}
                                                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                                            title="Cấm"
                                                        >
                                                            <Ban className="w-4 h-4" />
                                                        </button>
                                                    </>
                                                )}
                                                {(u.status === 'LOCKED' || u.status === 'BANNED') && (
                                                    <button
                                                        onClick={() => setActionDialog({ user: u, action: 'UNLOCK' })}
                                                        className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                                                        title="Mở khóa"
                                                    >
                                                        <Unlock className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 bg-slate-50/50">
                    <p className="text-xs text-slate-500">Trang {page}</p>
                    <div className="flex gap-2">
                        <button
                            onClick={handlePrevPage}
                            disabled={page <= 1}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-colors"
                        >
                            <ChevronLeft className="w-3 h-3" /> Trước
                        </button>
                        <button
                            onClick={handleNextPage}
                            disabled={!data.hasMore}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-colors"
                        >
                            Tiếp <ChevronRight className="w-3 h-3" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Action Dialog */}
            {actionDialog && (
                <ActionDialog
                    user={actionDialog.user}
                    action={actionDialog.action}
                    onConfirm={handleAction}
                    onCancel={() => setActionDialog(null)}
                />
            )}
        </div>
    );
}

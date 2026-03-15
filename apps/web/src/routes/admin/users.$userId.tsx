import { createFileRoute, useParams, useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { ArrowLeft, Mail, Phone, MapPin, Star, Shield, Lock, Unlock, Ban, Calendar } from 'lucide-react';
import { fetchUserById, updateUserStatus } from '@/features/admin/services/adminUserService';
import { useAuth } from '@/features/auth/context/AuthContext';
import type { UserProfile } from '@/features/auth/types/user';

export const Route = createFileRoute('/admin/users/$userId')({
    component: AdminUserDetail,
});

function AdminUserDetail() {
    const { userId } = useParams({ from: '/admin/users/$userId' });
    const { userProfile: adminProfile } = useAuth();
    const navigate = useNavigate();
    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        fetchUserById(userId).then(u => { setUser(u); setLoading(false); });
    }, [userId]);

    const handleAction = async (action: 'LOCK' | 'BAN' | 'UNLOCK') => {
        if (!user || !adminProfile?.uid) return;
        const statusMap = { LOCK: 'LOCKED' as const, BAN: 'BANNED' as const, UNLOCK: 'ACTIVE' as const };
        const reason = prompt(`Nhập lý do ${action === 'UNLOCK' ? 'mở khóa' : action === 'LOCK' ? 'khóa' : 'cấm'} tài khoản:`);
        if (!reason && action !== 'UNLOCK') return;
        setActionLoading(true);
        try {
            await updateUserStatus(user.uid, statusMap[action], adminProfile.uid, reason || 'Admin action');
            const updated = await fetchUserById(userId);
            setUser(updated);
        } catch (err) {
            console.error(err);
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="max-w-3xl mx-auto animate-pulse space-y-4">
                <div className="h-6 w-24 bg-slate-200 rounded" />
                <div className="h-48 bg-slate-100 rounded-2xl" />
                <div className="h-32 bg-slate-100 rounded-2xl" />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="text-center py-16">
                <p className="text-slate-500">Không tìm thấy người dùng</p>
            </div>
        );
    }

    const statusColor = user.status === 'ACTIVE' ? 'text-emerald-600 bg-emerald-50' : user.status === 'LOCKED' ? 'text-amber-600 bg-amber-50' : 'text-rose-600 bg-rose-50';

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            {/* Back */}
            <button onClick={() => navigate({ to: '/admin/users' })} className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition-colors">
                <ArrowLeft className="w-4 h-4" /> Quay lại danh sách
            </button>

            {/* Profile Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <div className="flex items-start gap-5">
                    {user.avatar_url ? (
                        <img src={user.avatar_url} className="w-20 h-20 rounded-2xl object-cover border border-slate-200" alt="" />
                    ) : (
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-indigo-700 font-bold text-2xl border border-indigo-200">
                            {(user.full_name?.[0] ?? 'U').toUpperCase()}
                        </div>
                    )}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <h1 className="text-xl font-bold text-slate-900">{user.full_name}</h1>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusColor}`}>{user.status}</span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${user.role === 'EMPLOYER' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>{user.role}</span>
                        </div>
                        <div className="mt-2 space-y-1 text-sm text-slate-500">
                            <p className="flex items-center gap-2"><Mail className="w-4 h-4" /> {user.email}</p>
                            <p className="flex items-center gap-2"><Phone className="w-4 h-4" /> {user.phone_number || '—'}</p>
                            {user.address_text && <p className="flex items-center gap-2"><MapPin className="w-4 h-4" /> {user.address_text}</p>}
                            <p className="flex items-center gap-2"><Calendar className="w-4 h-4" /> Đăng ký: {user.created_at?.toLocaleDateString?.('vi-VN') ?? '—'}</p>
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3 mt-5">
                    <div className="bg-amber-50 rounded-xl p-3 text-center border border-amber-100">
                        <Star className="w-4 h-4 text-amber-600 mx-auto mb-1" />
                        <p className="text-lg font-bold text-amber-800">{user.reputation_score}</p>
                        <p className="text-[10px] text-amber-600 font-medium">Uy tín</p>
                    </div>
                    <div className="bg-blue-50 rounded-xl p-3 text-center border border-blue-100">
                        <Shield className="w-4 h-4 text-blue-600 mx-auto mb-1" />
                        <p className="text-lg font-bold text-blue-800">{user.verification_status ?? 'UNVERIFIED'}</p>
                        <p className="text-[10px] text-blue-600 font-medium">Xác minh</p>
                    </div>
                    <div className="bg-emerald-50 rounded-xl p-3 text-center border border-emerald-100">
                        <p className="text-lg font-bold text-emerald-800">{(user.balance ?? 0).toLocaleString('vi-VN')}đ</p>
                        <p className="text-[10px] text-emerald-600 font-medium">Số dư</p>
                    </div>
                </div>

                {/* Bio + Skills */}
                {user.bio && (
                    <div className="mt-4">
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Giới thiệu</h3>
                        <p className="text-sm text-slate-600">{user.bio}</p>
                    </div>
                )}
                {user.skills?.length > 0 && (
                    <div className="mt-3">
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Kỹ năng</h3>
                        <div className="flex flex-wrap gap-1.5">
                            {user.skills.map(s => (
                                <span key={s} className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded-lg font-medium">{s}</span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Employer fields */}
                {user.role === 'EMPLOYER' && (
                    <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Thông tin doanh nghiệp</h3>
                        {user.company_name && <p className="text-sm text-slate-700"><strong>Công ty:</strong> {user.company_name}</p>}
                        {user.company_tax_id && <p className="text-sm text-slate-700"><strong>MST:</strong> {user.company_tax_id}</p>}
                        {user.industry && <p className="text-sm text-slate-700"><strong>Ngành:</strong> {user.industry}</p>}
                    </div>
                )}
            </div>

            {/* Actions */}
            {user.role !== 'ADMIN' && (
                <div className="bg-white rounded-2xl border border-slate-200 p-5">
                    <h3 className="text-sm font-bold text-slate-700 mb-3">Hành động quản trị</h3>
                    <div className="flex flex-wrap gap-2">
                        {user.status === 'ACTIVE' && (
                            <>
                                <button onClick={() => handleAction('LOCK')} disabled={actionLoading}
                                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 transition-colors disabled:opacity-50">
                                    <Lock className="w-4 h-4" /> Khóa tài khoản
                                </button>
                                <button onClick={() => handleAction('BAN')} disabled={actionLoading}
                                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 transition-colors disabled:opacity-50">
                                    <Ban className="w-4 h-4" /> Cấm vĩnh viễn
                                </button>
                            </>
                        )}
                        {(user.status === 'LOCKED' || user.status === 'BANNED') && (
                            <button onClick={() => handleAction('UNLOCK')} disabled={actionLoading}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors disabled:opacity-50">
                                <Unlock className="w-4 h-4" /> Mở khóa tài khoản
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

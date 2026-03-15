import { Outlet, useNavigate } from '@tanstack/react-router';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useEffect } from 'react';
import { AdminSidebar } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';
import { ShieldAlert } from 'lucide-react';

export function AdminLayout() {
    const { role, loading, user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (loading) return;
        if (!user) {
            navigate({ to: '/login', replace: true });
            return;
        }
        if (role !== 'ADMIN') {
            navigate({ to: '/', replace: true });
        }
    }, [role, loading, user, navigate]);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="animate-pulse space-y-3 text-center">
                    <div className="w-12 h-12 bg-slate-200 rounded-xl mx-auto" />
                    <div className="h-4 w-32 bg-slate-200 rounded mx-auto" />
                </div>
            </div>
        );
    }

    if (role !== 'ADMIN') {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
                <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center max-w-sm shadow-sm">
                    <ShieldAlert className="w-12 h-12 text-rose-400 mx-auto mb-4" />
                    <h2 className="text-lg font-bold text-slate-800 mb-2">Truy cập bị từ chối</h2>
                    <p className="text-sm text-slate-500">Bạn không có quyền truy cập trang quản trị.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <AdminSidebar />
            <div className="ml-64">
                <AdminHeader />
                <main className="p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}

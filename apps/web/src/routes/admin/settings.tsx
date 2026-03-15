import { createFileRoute } from '@tanstack/react-router';
import { Construction } from 'lucide-react';

export const Route = createFileRoute('/admin/settings')({
    component: AdminSettingsPage,
});

function AdminSettingsPage() {
    return (
        <div className="space-y-5">
            <div>
                <h1 className="text-xl font-bold text-slate-900">Cài đặt hệ thống</h1>
                <p className="text-sm text-slate-500">Quản lý cấu hình và tùy chỉnh hệ thống</p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-amber-100">
                    <Construction className="w-8 h-8 text-amber-400" />
                </div>
                <h2 className="text-lg font-bold text-slate-800 mb-2">Đang phát triển</h2>
                <p className="text-sm text-slate-500 max-w-sm mx-auto">
                    Trang cài đặt hệ thống sẽ sớm được triển khai.
                </p>
            </div>
        </div>
    );
}

import { createFileRoute } from '@tanstack/react-router';
import { Construction } from 'lucide-react';

export const Route = createFileRoute('/admin/analytics')({
    component: AdminAnalyticsPage,
});

function AdminAnalyticsPage() {
    return (
        <div className="space-y-5">
            <div>
                <h1 className="text-xl font-bold text-slate-900">Thống kê hệ thống</h1>
                <p className="text-sm text-slate-500">Biểu đồ và báo cáo tổng hợp</p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-amber-100">
                    <Construction className="w-8 h-8 text-amber-400" />
                </div>
                <h2 className="text-lg font-bold text-slate-800 mb-2">Đang phát triển</h2>
                <p className="text-sm text-slate-500 max-w-sm mx-auto">
                    Tính năng thống kê chi tiết sẽ được triển khai trong Phase 4.
                </p>
            </div>
        </div>
    );
}

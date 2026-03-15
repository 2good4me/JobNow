import { createFileRoute } from '@tanstack/react-router';
import { Construction } from 'lucide-react';

export const Route = createFileRoute('/admin/reports')({
    component: AdminReportsPage,
});

function AdminReportsPage() {
    return (
        <div className="space-y-5">
            <div>
                <h1 className="text-xl font-bold text-slate-900">Kiểm duyệt báo cáo</h1>
                <p className="text-sm text-slate-500">Xem xét và xử lý các báo cáo vi phạm</p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-amber-100">
                    <Construction className="w-8 h-8 text-amber-400" />
                </div>
                <h2 className="text-lg font-bold text-slate-800 mb-2">Đang phát triển</h2>
                <p className="text-sm text-slate-500 max-w-sm mx-auto">
                    Tính năng kiểm duyệt báo cáo sẽ được triển khai trong Phase 2.
                    Cần tạo collection <code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded">reports</code> trước.
                </p>
            </div>
        </div>
    );
}

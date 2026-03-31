import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { AlertTriangle, Search, CheckCircle, XCircle, Clock, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { fetchAdminReports, updateReportStatus, ReportData } from '@/features/admin/services/adminReportService';

export const Route = createFileRoute('/admin/reports')({
    component: AdminReportsPage,
});

const STATUS_COLORS = {
    PENDING: '#f59e0b', // amber-500
    REVIEWED: '#3b82f6', // blue-500
    RESOLVED: '#10b981', // emerald-500
    REJECTED: '#ef4444', // rose-500
};

const STATUS_LABELS: Record<string, string> = {
    PENDING: 'Chờ xử lý',
    REVIEWED: 'Đang xem xét',
    RESOLVED: 'Đã giải quyết',
    REJECTED: 'Đã từ chối',
};

function AdminReportsPage() {
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState('');
    const [activeStatus, setActiveStatus] = useState<string | null>(null);

    const { data: reports = [], isLoading, error } = useQuery({
        queryKey: ['admin_reports'],
        queryFn: fetchAdminReports,
    });

    const statusMutation = useMutation({
        mutationFn: ({ id, status }: { id: string; status: string }) => updateReportStatus(id, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin_reports'] });
            toast.success('Cập nhật trạng thái thành công!');
        },
        onError: () => toast.error('Lỗi khi cập nhật trạng thái'),
    });

    const handleUpdateStatus = (id: string, newStatus: string) => {
        statusMutation.mutate({ id, status: newStatus });
    };

    // Prepare chart data
    const statsArray = ['PENDING', 'REVIEWED', 'RESOLVED', 'REJECTED'].map(status => ({
        name: STATUS_LABELS[status],
        rawStatus: status,
        value: reports.filter(r => r.status === status).length
    })).filter(s => s.value > 0);

    const filteredReports = reports.filter(r => {
        const matchSearch = String(r.reason + r.details + r.reporterName).toLowerCase().includes(searchTerm.toLowerCase());
        const matchStatus = activeStatus ? r.status === activeStatus : true;
        return matchSearch && matchStatus;
    });

    const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }: any) => {
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
        const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);
        return (
            <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize={12} fontWeight="bold">
                {`${(percent * 100).toFixed(0)}%`}
            </text>
        );
    };

    return (
        <div className="space-y-6 pb-20">
            {/* Header */}
            <div>
                <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <AlertTriangle className="w-6 h-6 text-rose-500" />
                    Kiểm duyệt Báo cáo
                </h1>
                <p className="text-sm text-slate-500 mt-1">Quản lý phản hồi, tố cáo tin tuyển dụng hoặc người dùng vi phạm.</p>
            </div>

            {isLoading && (
                <div className="flex justify-center py-10">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                </div>
            )}
            
            {error && (
                <div className="bg-rose-50 text-rose-600 p-4 rounded-xl flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    <p className="font-semibold">Không thể tải danh sách báo cáo. Vui lòng thử lại.</p>
                </div>
            )}

            {!isLoading && reports.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* CHARTS */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm lg:col-span-1 flex flex-col items-center">
                        <h2 className="text-[15px] font-bold text-slate-800 mb-1 w-full text-left">Phân bổ Trạng thái</h2>
                        <p className="text-xs text-slate-500 mb-4 w-full text-left">Bấm vào biểu đồ để lọc báo cáo</p>
                        
                        {statsArray.length > 0 ? (
                            <div className="h-[250px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={statsArray}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={renderCustomLabel}
                                            outerRadius={100}
                                            innerRadius={40}
                                            paddingAngle={3}
                                            dataKey="value"
                                            onClick={(data) => {
                                                if(activeStatus === data.payload.rawStatus) setActiveStatus(null);
                                                else setActiveStatus(data.payload.rawStatus);
                                            }}
                                            className="cursor-pointer"
                                        >
                                            {statsArray.map((entry, index) => (
                                                <Cell 
                                                    key={`cell-${index}`} 
                                                    fill={STATUS_COLORS[entry.rawStatus as keyof typeof STATUS_COLORS] || '#cbd5e1'} 
                                                    opacity={activeStatus && activeStatus !== entry.rawStatus ? 0.3 : 1}
                                                    strokeWidth={activeStatus === entry.rawStatus ? 3 : 1}
                                                />
                                            ))}
                                        </Pie>
                                        <Tooltip 
                                            formatter={(value) => [`${value} báo cáo`]}
                                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                        />
                                        <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <div className="flex-1 flex items-center justify-center text-slate-400 text-sm italic">
                                Chưa có số liệu
                            </div>
                        )}
                        
                        {activeStatus && (
                            <div className="mt-2 w-full">
                                <button 
                                    onClick={() => setActiveStatus(null)}
                                    className="w-full py-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition"
                                >
                                    Bỏ lọc biểu đồ
                                </button>
                            </div>
                        )}
                    </div>

                    {/* TABLE */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden lg:col-span-2 flex flex-col">
                        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <h2 className="font-bold text-slate-800">Danh sách Báo cáo ({filteredReports.length})</h2>
                            <div className="relative w-64">
                                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Tìm lý do, người gửi..."
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    className="w-full pl-9 pr-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                                />
                            </div>
                        </div>
                        <div className="overflow-x-auto flex-1 h-[400px]">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-slate-50 text-[12px] font-bold text-slate-500 uppercase tracking-wider sticky top-0 z-10 shadow-sm">
                                    <tr>
                                        <th className="px-5 py-3">Người báo cáo</th>
                                        <th className="px-5 py-3">Chi tiết vi phạm</th>
                                        <th className="px-5 py-3">Trạng thái</th>
                                        <th className="px-5 py-3 text-right">Hành động</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-sm">
                                    {filteredReports.map(report => (
                                        <tr key={report.id} className="hover:bg-slate-50/80 transition-colors">
                                            <td className="px-5 py-4">
                                                <p className="font-bold text-slate-800">{report.reporterName}</p>
                                                <p className="text-xs text-slate-500 truncate max-w-[120px]" title={report.reporterId}>{report.reporterId}</p>
                                                <p className="text-[10px] text-slate-400 mt-1">{report.createdAt.toLocaleDateString('vi-VN')} {report.createdAt.toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})}</p>
                                            </td>
                                            <td className="px-5 py-4 max-w-[200px]">
                                                <div className="mb-1">
                                                    <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded uppercase">Target: {report.targetType}</span>
                                                </div>
                                                <p className="font-semibold text-slate-800 break-words">{report.reason}</p>
                                                {report.details && <p className="text-xs text-slate-500 mt-1 line-clamp-2">{report.details}</p>}
                                                <p className="text-[10px] text-indigo-500 font-mono mt-1 w-full truncate">ID: {report.targetId}</p>
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold
                                                    ${report.status === 'PENDING' ? 'bg-amber-100 text-amber-700' :
                                                      report.status === 'REVIEWED' ? 'bg-blue-100 text-blue-700' :
                                                      report.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-700' :
                                                      'bg-rose-100 text-rose-700'}
                                                `}>
                                                    {report.status === 'PENDING' && <Clock className="w-3 h-3" />}
                                                    {report.status === 'REVIEWED' && <Search className="w-3 h-3" />}
                                                    {report.status === 'RESOLVED' && <CheckCircle className="w-3 h-3" />}
                                                    {report.status === 'REJECTED' && <XCircle className="w-3 h-3" />}
                                                    {STATUS_LABELS[report.status] || report.status}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4 text-right">
                                                {statusMutation.isPending ? (
                                                     <Loader2 className="w-4 h-4 animate-spin text-slate-400 inline-block" />
                                                ) : (
                                                    <select 
                                                        className="text-xs font-bold border border-slate-200 rounded-lg px-2 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                                                        value={report.status}
                                                        onChange={(e) => handleUpdateStatus(report.id, e.target.value)}
                                                    >
                                                        <option value="PENDING">Chờ xử lý</option>
                                                        <option value="REVIEWED">Đang xem xét</option>
                                                        <option value="RESOLVED">Đã giải quyết</option>
                                                        <option value="REJECTED">Từ chối</option>
                                                    </select>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredReports.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="px-5 py-10 text-center text-slate-500">
                                                <AlertTriangle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                                                <p>Không có dữ liệu báo cáo.</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {!isLoading && reports.length === 0 && (
                <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm mt-6">
                    <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-8 h-8 text-emerald-400" />
                    </div>
                    <h2 className="text-lg font-bold text-slate-800 mb-2">Hệ thống an toàn</h2>
                    <p className="text-sm text-slate-500 max-w-sm mx-auto">
                        Hiện không có báo cáo vi phạm nào trên hệ thống JobNow.
                    </p>
                </div>
            )}
        </div>
    );
}

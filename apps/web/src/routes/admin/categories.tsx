import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Layers, Plus, Search, Edit2, Trash2, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { fetchAdminCategories, saveCategory, deleteCategory, CategoryData } from '@/features/admin/services/adminCategoryService';

export const Route = createFileRoute('/admin/categories')({
    component: AdminCategoriesPage,
});

function AdminCategoriesPage() {
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState('');
    const [activeCategory, setActiveCategory] = useState<CategoryData | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    
    // Form state
    const [formId, setFormId] = useState('');
    const [formName, setFormName] = useState('');
    const [formDesc, setFormDesc] = useState('');

    const { data: categories = [], isLoading, error } = useQuery({
        queryKey: ['admin_categories'],
        queryFn: fetchAdminCategories,
    });

    const saveMutation = useMutation({
        mutationFn: ({ id, name, desc }: { id: string; name: string; desc: string }) => saveCategory(id, name, desc),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin_categories'] });
            toast.success('Lưu danh mục thành công!');
            handleCloseForm();
        },
        onError: () => toast.error('Lỗi khi lưu danh mục'),
    });

    const deleteMutation = useMutation({
        mutationFn: deleteCategory,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin_categories'] });
            toast.success('Xoá danh mục thành công!');
        },
        onError: () => toast.error('Lỗi khi xoá danh mục'),
    });

    const handleOpenForm = (cat?: CategoryData) => {
        if (cat) {
            setFormId(cat.id);
            setFormName(cat.name);
            setFormDesc(cat.description || '');
        } else {
            setFormId('');
            setFormName('');
            setFormDesc('');
        }
        setIsFormOpen(true);
    };

    const handleCloseForm = () => {
        setIsFormOpen(false);
        setFormId('');
        setFormName('');
        setFormDesc('');
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formName.trim()) return toast.error('Vui lòng nhập tên danh mục');
        saveMutation.mutate({ id: formId, name: formName, desc: formDesc });
    };

    const handleDelete = (id: string, name: string) => {
        if (window.confirm(`Bạn có chắc muốn xoá danh mục "${name}"?`)) {
            deleteMutation.mutate(id);
        }
    };

    const filteredCats = categories.filter(c => 
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
        (!activeCategory || c.id === activeCategory.id)
    );

    const chartData = categories.slice(0, 10); // Top 10 for chart

    return (
        <div className="space-y-6 pb-20">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        <Layers className="w-6 h-6 text-indigo-600" />
                        Quản lý Danh mục
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">Quản lý và thống kê theo nhóm tin tuyển dụng</p>
                </div>
                <button
                    onClick={() => handleOpenForm()}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-indigo-700 transition"
                >
                    <Plus className="w-4 h-4" /> Thêm mới
                </button>
            </div>

            {/* Error / Loading */}
            {isLoading && (
                <div className="flex justify-center py-10">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                </div>
            )}
            {error && (
                <div className="bg-rose-50 text-rose-600 p-4 rounded-xl flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    <p className="font-semibold">Không thể tải danh sách danh mục. {error.message}</p>
                </div>
            )}

            {!isLoading && !error && categories.length > 0 && (
                <>
                    {/* TOP 10 CHART */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                        <h2 className="text-[15px] font-bold text-slate-800 mb-4">Top 10 Danh mục phổ biến nhất (Bấm vào cột để lọc)</h2>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                                    <XAxis dataKey="name" tick={{ fontSize: 12 }} interval={0} angle={-30} textAnchor="end" />
                                    <YAxis tick={{ fontSize: 12 }} />
                                    <Tooltip 
                                        cursor={{ fill: '#f1f5f9' }}
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Bar 
                                        dataKey="jobCount" 
                                        name="Số việc làm" 
                                        radius={[4, 4, 0, 0]} 
                                        onClick={(data) => {
                                            if (activeCategory?.id === data.id) setActiveCategory(null);
                                            else setActiveCategory(data);
                                        }}
                                        className="cursor-pointer"
                                    >
                                        {chartData.map((entry, index) => (
                                            <Cell 
                                                key={`cell-${index}`} 
                                                fill={activeCategory?.id === entry.id ? '#4f46e5' : '#93c5fd'} 
                                            />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        {activeCategory && (
                            <div className="mt-4 flex justify-between items-center bg-indigo-50 px-4 py-2 rounded-lg">
                                <p className="text-sm font-semibold text-indigo-700">
                                    Đang lọc theo: <span className="font-bold">{activeCategory.name}</span>
                                </p>
                                <button onClick={() => setActiveCategory(null)} className="text-xs font-bold text-indigo-600 px-2 py-1 hover:bg-indigo-100 rounded">
                                    Bỏ lọc x
                                </button>
                            </div>
                        )}
                    </div>

                    {/* TABLE */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mt-6">
                        <div className="p-4 border-b border-slate-100 flex justify-between items-center">
                            <h2 className="font-bold text-slate-800">Danh sách ({filteredCats.length})</h2>
                            <div className="relative w-64">
                                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Tìm danh mục..."
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    className="w-full pl-9 pr-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 text-[12px] font-bold text-slate-500 uppercase tracking-wider">
                                    <tr>
                                        <th className="px-5 py-3">Tên danh mục</th>
                                        <th className="px-5 py-3">Mô tả</th>
                                        <th className="px-5 py-3 text-center">Số việc làm</th>
                                        <th className="px-5 py-3 w-32">Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-sm">
                                    {filteredCats.map(cat => (
                                        <tr key={cat.id} className="hover:bg-slate-50">
                                            <td className="px-5 py-3 font-semibold text-slate-800">{cat.name}</td>
                                            <td className="px-5 py-3 text-slate-500">{cat.description || '-'}</td>
                                            <td className="px-5 py-3 text-center">
                                                <span className="bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full text-xs font-bold">
                                                    {cat.jobCount}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3">
                                                <div className="flex gap-2">
                                                    <button onClick={() => handleOpenForm(cat)} className="p-1.5 text-slate-400 hover:text-indigo-600 rounded bg-white border border-slate-200 shadow-sm"><Edit2 className="w-3.5 h-3.5" /></button>
                                                    <button onClick={() => handleDelete(cat.id, cat.name)} className="p-1.5 text-slate-400 hover:text-rose-600 rounded bg-white border border-slate-200 shadow-sm"><Trash2 className="w-3.5 h-3.5" /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredCats.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="px-5 py-10 text-center text-slate-500">Không tìm thấy danh mục phù hợp.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}

            {/* Empty State */}
            {!isLoading && categories.length === 0 && (
                 <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
                    <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Layers className="w-8 h-8 text-indigo-400" />
                    </div>
                    <h2 className="text-lg font-bold text-slate-800 mb-2">Chưa có danh mục nào</h2>
                    <p className="text-sm text-slate-500 max-w-sm mx-auto mb-6">Bạn hãy tạo các danh mục công việc để nhà tuyển dụng có thể gắn vào tin đăng.</p>
                    <button onClick={() => handleOpenForm()} className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-md hover:bg-indigo-700 transition">
                        Tạo danh mục đầu tiên
                    </button>
                 </div>
            )}

            {/* FORM MODAL */}
            {isFormOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="p-5 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="font-bold text-lg text-slate-800">{formId ? 'Cập nhật danh mục' : 'Thêm danh mục mới'}</h3>
                            <button onClick={handleCloseForm} className="text-slate-400 hover:text-slate-600"><AlertCircle className="w-5 h-5 opacity-0" /><span className="text-xl leading-none">&times;</span></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-5 space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Tên danh mục <span className="text-rose-500">*</span></label>
                                <input
                                    type="text"
                                    value={formName}
                                    onChange={e => setFormName(e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    placeholder="Vd: F&B Dịch vụ"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Mô tả ngắn</label>
                                <textarea
                                    value={formDesc}
                                    onChange={e => setFormDesc(e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none h-20"
                                    placeholder="Vd: Nhà hàng, quán cafe, bar..."
                                />
                            </div>
                            <div className="pt-2 flex gap-3">
                                <button type="button" onClick={handleCloseForm} className="flex-1 px-4 py-2 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50">Hủy</button>
                                <button type="submit" disabled={saveMutation.isPending} className="flex-1 px-4 py-2 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 disabled:opacity-50">
                                    {saveMutation.isPending ? 'Đang lưu...' : 'Lưu'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

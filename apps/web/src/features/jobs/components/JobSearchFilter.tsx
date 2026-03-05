import { Search, MapPin, SlidersHorizontal, Map } from 'lucide-react';
import type { ShiftTimeBucket } from '@jobnow/types';

interface JobSearchFilterProps {
    radius: number;
    keyword: string;
    salaryMin?: number;
    salaryMax?: number;
    categoryId?: string;
    shiftTime?: ShiftTimeBucket;
    onRadiusChange: (radius: number) => void;
    onKeywordChange: (keyword: string) => void;
    onSalaryMinChange: (value?: number) => void;
    onSalaryMaxChange: (value?: number) => void;
    onCategoryChange: (value?: string) => void;
    onShiftTimeChange: (value?: ShiftTimeBucket) => void;
}

const RADIUS_OPTIONS = [
    { label: '1 km', value: 1000 },
    { label: '3 km', value: 3000 },
    { label: '5 km', value: 5000 },
    { label: '10 km', value: 10000 },
    { label: '20 km', value: 20000 },
];

const CATEGORY_OPTIONS = [
    { label: 'Tất cả ngành', value: '' },
    { label: 'F&B', value: 'F&B' },
    { label: 'Bán lẻ', value: 'Bán lẻ' },
    { label: 'Sự kiện', value: 'Sự kiện' },
    { label: 'Giao hàng', value: 'Giao hàng' },
];

const SHIFT_OPTIONS: Array<{ label: string; value: '' | ShiftTimeBucket }> = [
    { label: 'Mọi khung giờ', value: '' },
    { label: 'Sáng', value: 'MORNING' },
    { label: 'Chiều', value: 'AFTERNOON' },
    { label: 'Tối', value: 'EVENING' },
    { label: 'Đêm', value: 'NIGHT' },
];

function toOptionalNumber(value: string): number | undefined {
    if (!value.trim()) return undefined;
    const parsed = Number(value);
    return Number.isNaN(parsed) ? undefined : parsed;
}

export function JobSearchFilter({
    radius,
    keyword,
    salaryMin,
    salaryMax,
    categoryId,
    shiftTime,
    onRadiusChange,
    onKeywordChange,
    onSalaryMinChange,
    onSalaryMaxChange,
    onCategoryChange,
    onShiftTimeChange,
}: JobSearchFilterProps) {
    return (
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 mb-8 sticky top-20 z-40">
            <div className="flex flex-col gap-3">
                <div className="flex flex-col md:flex-row gap-3">
                    <div className="relative flex-grow">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-slate-400" />
                        </div>
                        <input
                            type="text"
                            value={keyword}
                            onChange={(e) => onKeywordChange(e.target.value)}
                            className="block w-full pl-10 pr-3 py-3 border-0 bg-slate-50 text-slate-900 rounded-xl focus:ring-2 focus:ring-primary-500 focus:bg-white transition-colors"
                            placeholder="Tìm kiếm công việc, ví dụ: Phục vụ bàn..."
                        />
                    </div>

                    <div className="relative flex-shrink-0 md:w-40">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <MapPin className="h-5 w-5 text-slate-400" />
                        </div>
                        <select
                            value={radius}
                            onChange={(e) => onRadiusChange(Number(e.target.value))}
                            className="block w-full pl-10 pr-3 py-3 border-0 bg-slate-50 text-slate-900 rounded-xl focus:ring-2 focus:ring-primary-500 focus:bg-white transition-colors appearance-none"
                        >
                            {RADIUS_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                    <input
                        type="number"
                        min={0}
                        value={salaryMin ?? ''}
                        onChange={(e) => onSalaryMinChange(toOptionalNumber(e.target.value))}
                        className="py-2 px-3 bg-slate-50 rounded-xl text-sm border border-transparent focus:border-primary-200 focus:bg-white focus:outline-none"
                        placeholder="Lương tối thiểu"
                    />
                    <input
                        type="number"
                        min={0}
                        value={salaryMax ?? ''}
                        onChange={(e) => onSalaryMaxChange(toOptionalNumber(e.target.value))}
                        className="py-2 px-3 bg-slate-50 rounded-xl text-sm border border-transparent focus:border-primary-200 focus:bg-white focus:outline-none"
                        placeholder="Lương tối đa"
                    />
                    <select
                        value={categoryId ?? ''}
                        onChange={(e) => onCategoryChange(e.target.value || undefined)}
                        className="py-2 px-3 bg-slate-50 rounded-xl text-sm border border-transparent focus:border-primary-200 focus:bg-white focus:outline-none"
                    >
                        {CATEGORY_OPTIONS.map((opt) => (
                            <option key={opt.value || 'all'} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                    <select
                        value={shiftTime ?? ''}
                        onChange={(e) => onShiftTimeChange((e.target.value || undefined) as ShiftTimeBucket | undefined)}
                        className="py-2 px-3 bg-slate-50 rounded-xl text-sm border border-transparent focus:border-primary-200 focus:bg-white focus:outline-none"
                    >
                        {SHIFT_OPTIONS.map((opt) => (
                            <option key={opt.value || 'all'} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                </div>

                <div className="flex gap-2">
                    <button className="flex-grow md:flex-none flex items-center justify-center px-6 py-3 bg-primary-600 text-white rounded-xl shadow-sm hover:bg-primary-500 hover:shadow-md transition-all active:scale-[0.98] font-semibold cursor-pointer">
                        Tìm kiếm
                    </button>
                    <button className="flex items-center justify-center p-3 text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors border border-transparent hover:border-slate-200 cursor-pointer" title="Bộ lọc nâng cao">
                        <SlidersHorizontal className="w-5 h-5" />
                    </button>
                    <button className="flex items-center justify-center p-3 text-primary-600 bg-primary-50 border border-primary-100 hover:bg-primary-100 rounded-xl transition-colors cursor-pointer" title="Xem trên bản đồ">
                        <Map className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
}

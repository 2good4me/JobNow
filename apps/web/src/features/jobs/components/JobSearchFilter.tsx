import { useState } from 'react';
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
    const [isExpanded, setIsExpanded] = useState(false);

    const handleClearAll = () => {
        onKeywordChange('');
        onRadiusChange(5000); // Mặc định 5km
        onSalaryMinChange(undefined);
        onSalaryMaxChange(undefined);
        onCategoryChange(undefined);
        onShiftTimeChange(undefined);
    };

    const hasFilters = Boolean(keyword || salaryMin || salaryMax || categoryId || shiftTime || radius !== 5000);

    return (
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 mb-8">
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

                {isExpanded && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
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
                )}

                <div className="flex gap-2 justify-between items-center mt-1">
                    <div className="flex gap-2">
                        <button 
                            onClick={() => setIsExpanded(!isExpanded)}
                            className={`flex items-center justify-center p-3 sm:px-4 sm:py-2.5 rounded-xl transition-colors border cursor-pointer text-sm font-medium ${isExpanded ? 'bg-primary-50 text-primary-600 border-primary-200' : 'text-slate-600 bg-slate-50 hover:bg-slate-100 border-transparent hover:border-slate-200'}`} 
                            title="Bộ lọc nâng cao"
                        >
                            <SlidersHorizontal className="w-5 h-5 sm:w-4 sm:h-4 sm:mr-2" />
                            <span className="hidden sm:inline">Lọc nâng cao</span>
                        </button>
                        
                        {hasFilters && (
                            <button 
                                onClick={handleClearAll}
                                className="flex items-center justify-center px-4 py-2.5 text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors text-sm font-medium cursor-pointer"
                            >
                                Xóa lọc
                            </button>
                        )}
                    </div>
                    
                    <div className="flex gap-2">
                        <button className="flex items-center justify-center p-3 text-primary-600 bg-primary-50 border border-primary-100 hover:bg-primary-100 rounded-xl transition-colors cursor-pointer" title="Xem trên bản đồ">
                            <Map className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

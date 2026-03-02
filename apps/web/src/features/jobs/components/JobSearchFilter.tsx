import React from 'react';
import { Search, MapPin, SlidersHorizontal, Map } from 'lucide-react';

interface JobSearchFilterProps {
    radius: number;
    onRadiusChange: (radius: number) => void;
}

const RADIUS_OPTIONS = [
    { label: '1 km', value: 1000 },
    { label: '3 km', value: 3000 },
    { label: '5 km', value: 5000 },
    { label: '10 km', value: 10000 },
    { label: '20 km', value: 20000 },
];

export function JobSearchFilter({ radius, onRadiusChange }: JobSearchFilterProps) {
    return (
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 mb-8 sticky top-20 z-40">
            <div className="flex flex-col md:flex-row gap-4">
                {/* Search Input */}
                <div className="relative flex-grow">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-10 pr-3 py-3 border-0 bg-slate-50 text-slate-900 rounded-xl focus:ring-2 focus:ring-primary-500 focus:bg-white transition-colors"
                        placeholder="Tìm kiếm công việc, ví dụ: Phục vụ bàn..."
                    />
                </div>

                {/* Radius Select */}
                <div className="relative flex-shrink-0 md:w-40">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MapPin className="h-5 w-5 text-slate-400" />
                    </div>
                    <select
                        value={radius}
                        onChange={(e) => onRadiusChange(Number(e.target.value))}
                        className="block w-full pl-10 pr-3 py-3 border-0 bg-slate-50 text-slate-900 rounded-xl focus:ring-2 focus:ring-primary-500 focus:bg-white transition-colors appearance-none"
                    >
                        {RADIUS_OPTIONS.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                    <button className="flex-grow md:flex-none flex items-center justify-center px-6 py-3 bg-primary-600 text-white rounded-xl shadow-sm hover:bg-primary-500 hover:shadow-md transition-all active:scale-[0.98] font-semibold">
                        Tìm kiếm
                    </button>
                    <button className="flex items-center justify-center p-3 text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors border border-transparent hover:border-slate-200" title="Bộ lọc nâng cao">
                        <SlidersHorizontal className="w-5 h-5" />
                    </button>
                    <button className="flex items-center justify-center p-3 text-primary-600 bg-primary-50 border border-primary-100 hover:bg-primary-100 rounded-xl transition-colors" title="Xem trên bản đồ">
                        <Map className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
}

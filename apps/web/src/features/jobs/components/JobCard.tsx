import React from 'react';
import { MapPin, Clock, DollarSign, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link } from '@tanstack/react-router';

export interface JobCardProps {
    id: string;
    title: string;
    employerName: string;
    salary: number;
    salaryType: 'HOURLY' | 'DAILY' | 'JOB';
    distance?: number; // in meters
    postedAt: Date;
    isHot?: boolean;
    className?: string;
}

export function JobCard({
    id,
    title,
    employerName,
    salary,
    salaryType,
    distance,
    postedAt,
    isHot,
    className
}: JobCardProps) {

    const formatSalaryAmount = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    const formatSalaryType = (type: string) => {
        switch (type) {
            case 'HOURLY': return '/ giờ';
            case 'DAILY': return '/ ngày';
            case 'JOB': return '/ khoán';
            default: return '';
        }
    };

    const formatDistance = (meters?: number) => {
        if (meters === undefined) return '';
        if (meters < 1000) return `${Math.round(meters)}m`;
        return `${(meters / 1000).toFixed(1)}km`;
    };

    // Simple relative time formatting
    const getRelativeTime = (date: Date) => {
        const rtf = new Intl.RelativeTimeFormat('vi', { numeric: 'auto' });
        const daysDifference = Math.round((date.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

        if (daysDifference === 0) return 'Hôm nay';
        if (daysDifference === -1) return 'Hôm qua';
        return rtf.format(daysDifference, 'day');
    };

    return (
        <Link to={`/jobs`} className="block w-full">
            <div className={cn(
                "group bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-xl hover:border-primary-100 transition-all duration-300 relative overflow-hidden h-full flex flex-col",
                className
            )}>
                {/* Top Badges */}
                <div className="flex justify-between items-start mb-4">
                    <div className="flex gap-2 flex-wrap">
                        {isHot && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-accent-50 text-accent-600 border border-accent-100">
                                Lương cao
                            </span>
                        )}
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-50 text-primary-600 border border-primary-100">
                            Part-time
                        </span>
                    </div>

                    <span className="text-xs text-slate-400 font-medium whitespace-nowrap">
                        {getRelativeTime(postedAt)}
                    </span>
                </div>

                {/* Title & Employer */}
                <div className="mb-5 flex-grow">
                    <h3 className="text-xl font-bold font-heading text-slate-900 group-hover:text-primary-600 transition-colors line-clamp-2 mb-1">
                        {title}
                    </h3>
                    <p className="text-sm font-medium text-slate-500 line-clamp-1">{employerName}</p>
                </div>

                {/* Meta Info */}
                <div className="space-y-2.5 mb-6">
                    <div className="flex items-center text-slate-600 text-sm">
                        <DollarSign className="w-4 h-4 mr-2 text-green-500 shrink-0" />
                        <span className="font-semibold text-slate-800">
                            {formatSalaryAmount(salary)}<span className="text-slate-500 font-normal">{formatSalaryType(salaryType)}</span>
                        </span>
                    </div>

                    <div className="flex items-center text-slate-600 text-sm">
                        <MapPin className="w-4 h-4 mr-2 text-slate-400 shrink-0" />
                        <span className="truncate">
                            Khách sạn Mường Thanh {distance !== undefined && <span className="font-medium text-primary-600 ml-1">({formatDistance(distance)})</span>}
                        </span>
                    </div>

                    <div className="flex items-center text-slate-600 text-sm">
                        <Clock className="w-4 h-4 mr-2 text-slate-400 shrink-0" />
                        <span className="truncate">Sáng: 08:00 - 12:00</span>
                    </div>
                </div>

                {/* Footer Action */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-auto">
                    <div className="flex -space-x-2">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="w-7 h-7 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-[10px] font-bold text-slate-500">
                                U
                            </div>
                        ))}
                        <div className="w-7 h-7 rounded-full bg-slate-50 border-2 border-white flex items-center justify-center text-[10px] font-medium text-slate-500">
                            +5
                        </div>
                    </div>
                    <div className="flex items-center text-sm font-semibold text-primary-600 group-hover:translate-x-1 transition-transform">
                        Chi tiết <ChevronRight className="w-4 h-4 ml-0.5" />
                    </div>
                </div>

                {/* Decorative corner accent */}
                <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-gradient-to-br from-primary-50 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            </div>
        </Link>
    );
}

import React from 'react';
import { JobCard, JobCardProps } from './JobCard';

interface JobListProps {
    jobs: JobCardProps[];
    isLoading?: boolean;
}

export function JobList({ jobs, isLoading }: JobListProps) {
    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="bg-white rounded-2xl p-6 border border-slate-100 h-64 animate-pulse flex flex-col">
                        <div className="flex justify-between mb-4">
                            <div className="flex gap-2"><div className="w-16 h-5 bg-slate-200 rounded-full" /></div>
                            <div className="w-12 h-4 bg-slate-100 rounded" />
                        </div>
                        <div className="w-3/4 h-6 bg-slate-200 rounded mb-2" />
                        <div className="w-1/2 h-4 bg-slate-100 rounded mb-6" />
                        <div className="space-y-3 mb-6 flex-grow">
                            <div className="w-full h-4 bg-slate-100 rounded" />
                            <div className="w-5/6 h-4 bg-slate-100 rounded" />
                            <div className="w-4/6 h-4 bg-slate-100 rounded" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (jobs.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                    <span className="text-2xl">🔍</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">Không tìm thấy công việc</h3>
                <p className="text-slate-500 text-center max-w-sm">Rất tiếc, không có công việc nào phù hợp với bộ lọc hiện tại của bạn. Vui lòng thử lại với các tiêu chí khác.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {jobs.map((job) => (
                <JobCard key={job.id} {...job} />
            ))}
        </div>
    );
}

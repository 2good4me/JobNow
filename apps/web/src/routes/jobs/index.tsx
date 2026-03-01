import { createFileRoute } from '@tanstack/react-router';
import React from 'react';
import { JobSearchFilter } from '../../features/jobs/components/JobSearchFilter';
import { JobList } from '../../features/jobs/components/JobList';
import { JobCardProps } from '../../features/jobs/components/JobCard';

export const Route = createFileRoute('/jobs/')({
  component: JobsPage,
});

// Mock data to demonstrate UI before connecting to Firebase API
const MOCK_JOBS: JobCardProps[] = [
  {
    id: '1',
    title: 'Nhân viên Phục vụ bàn Full-time',
    employerName: 'Highlands Coffee - Landmark 81',
    salary: 25000,
    salaryType: 'HOURLY',
    distance: 850,
    postedAt: new Date(),
    isHot: true
  },
  {
    id: '2',
    title: 'Lễ tân Khách sạn ca đêm',
    employerName: 'InterContinental Saigon',
    salary: 400000,
    salaryType: 'DAILY',
    distance: 2100,
    postedAt: new Date(Date.now() - 86400000) // 1 day ago
  },
  {
    id: '3',
    title: 'Giao hàng nội thành Quận 1',
    employerName: 'Giao Hàng Tiết Kiệm',
    salary: 5000000,
    salaryType: 'JOB',
    distance: 1200,
    postedAt: new Date(Date.now() - 86400000 * 2),
    isHot: true
  },
  {
    id: '4',
    title: 'Phụ bếp nhà hàng Nhật Bản',
    employerName: 'Sushi Hokkaido Sachi',
    salary: 30000,
    salaryType: 'HOURLY',
    distance: 3500,
    postedAt: new Date()
  },
  {
    id: '5',
    title: 'Nhân viên bảo vệ (Ca 12 tiếng)',
    employerName: 'Công ty TNHH Dịch vụ Bảo vệ YUKI',
    salary: 350000,
    salaryType: 'DAILY',
    distance: 5400,
    postedAt: new Date(Date.now() - 86400000 * 3)
  },
];

function JobsPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold font-heading text-slate-900 tracking-tight mb-2">
          Tìm việc làm thời vụ <span className="text-primary-600 relative inline-block">
            ngay gần bạn
            <div className="absolute -bottom-1 left-0 w-full h-3 bg-primary-200/50 -rotate-1 skew-x-12 -z-10 rounded-full" />
          </span>
        </h1>
        <p className="text-slate-600 text-lg">Hàng ngàn ca làm việc đang chờ bạn khám phá và ứng tuyển.</p>
      </div>

      <JobSearchFilter />

      {/* Results Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-slate-800">
          Có <span className="text-primary-600">{MOCK_JOBS.length}</span> công việc phù hợp
        </h2>

        <select className="bg-white border-slate-200 text-slate-700 font-medium py-2 px-4 rounded-xl shadow-sm focus:ring-primary-500 focus:border-primary-500 outline-none">
          <option>Gần đây nhất</option>
          <option>Mới đăng</option>
          <option>Lương cao nhất</option>
        </select>
      </div>

      <JobList jobs={MOCK_JOBS} />

      {/* Load More Mock */}
      <div className="mt-10 flex justify-center">
        <button className="px-6 py-3 bg-white border border-slate-200 text-slate-700 font-medium rounded-xl shadow-sm hover:bg-slate-50 hover:text-primary-600 transition-colors">
          Xem thêm công việc
        </button>
      </div>
    </div>
  );
}

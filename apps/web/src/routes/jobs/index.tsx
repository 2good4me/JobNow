import { createFileRoute } from '@tanstack/react-router';
import React, { useState } from 'react';
import { JobSearchFilter } from '../../features/jobs/components/JobSearchFilter';
import { JobList } from '../../features/jobs/components/JobList';
import { useGeolocation } from '../../features/jobs/hooks/useGeolocation';
import { useNearbyJobs } from '../../features/jobs/hooks/useNearbyJobs';
import { getApiBase, seedJobs } from '../../lib/api';
import { MapPin, AlertTriangle, RefreshCw, Database } from 'lucide-react';

export const Route = createFileRoute('/jobs/')({
  component: JobsPage,
});

function JobsPage() {
  const apiBase = getApiBase();
  const geo = useGeolocation();
  const [radius, setRadius] = useState(5000); // default 5km
  const [seeding, setSeeding] = useState(false);

  const { data: jobs = [], isLoading, error, refetch } = useNearbyJobs({
    lat: geo.latitude,
    lng: geo.longitude,
    radius,
    enabled: !geo.loading,
  });

  // Convert API response to JobCard props
  const jobCards = jobs.map(job => ({
    id: job.id,
    title: job.title,
    employerName: job.employer_name,
    salary: job.salary,
    salaryType: job.salary_type,
    distance: job.distance,
    postedAt: new Date(),
    isHot: job.salary >= 35000 && job.salary_type === 'HOURLY' || job.salary >= 300000 && job.salary_type === 'DAILY',
    address: job.address,
    category: job.category,
    shifts: job.shifts,
  }));

  const handleRadiusChange = (newRadius: number) => {
    setRadius(newRadius);
  };

  const handleSeedData = async () => {
    setSeeding(true);
    try {
      const result = await seedJobs();
      alert(`✅ Đã seed thành công ${result.count} công việc mẫu! Đang tải lại...`);
      refetch();
    } catch (err) {
      alert('❌ Lỗi seed data. Hãy đảm bảo backend đang chạy (npm run dev trong apps/api).');
    } finally {
      setSeeding(false);
    }
  };

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

      {/* GPS Status Banner */}
      {geo.isDefault && !geo.loading && (
        <div className="mb-6 flex items-center gap-3 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-sm">
          <AlertTriangle className="w-5 h-5 shrink-0 text-amber-500" />
          <span>{geo.error || 'Đang hiển thị khu vực mặc định: Nam Từ Liêm, Hà Nội. Bật GPS để tìm việc chính xác hơn!'}</span>
        </div>
      )}

      {/* GPS Info Badge */}
      {!geo.loading && (
        <div className="mb-6 flex items-center gap-2 text-sm text-slate-500">
          <MapPin className="w-4 h-4 text-primary-500" />
          <span>Vị trí: {geo.latitude.toFixed(4)}, {geo.longitude.toFixed(4)}</span>
          <span className="text-slate-300">|</span>
          <span>Bán kính: {radius >= 1000 ? `${radius / 1000}km` : `${radius}m`}</span>
        </div>
      )}

      <JobSearchFilter radius={radius} onRadiusChange={handleRadiusChange} />

      {/* Results Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-slate-800">
          {isLoading ? 'Đang tìm kiếm...' : (
            <>Có <span className="text-primary-600">{jobCards.length}</span> công việc {radius >= 1000 ? `trong ${radius / 1000}km` : `trong ${radius}m`}</>
          )}
        </h2>

        <div className="flex gap-2">
          {/* Seed Button (Dev) */}
          <button
            onClick={handleSeedData}
            disabled={seeding}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors disabled:opacity-50"
            title="Seed 25 công việc mẫu vào Firestore (Development)"
          >
            <Database className="w-3.5 h-3.5" />
            {seeding ? 'Đang seed...' : 'Seed Data'}
          </button>

          <button
            onClick={() => refetch()}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium bg-slate-50 text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Tải lại
          </button>

          <select
            className="bg-white border-slate-200 text-slate-700 font-medium py-2 px-4 rounded-xl shadow-sm focus:ring-primary-500 focus:border-primary-500 outline-none text-sm"
            defaultValue="nearest"
          >
            <option value="nearest">Gần đây nhất</option>
            <option value="newest">Mới đăng</option>
            <option value="salary">Lương cao nhất</option>
          </select>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          Lỗi kết nối: {(error as Error).message}. API hiện tại: <code className="bg-red-100 px-1.5 py-0.5 rounded">{apiBase}</code>
        </div>
      )}

      <JobList jobs={jobCards} isLoading={isLoading || geo.loading} />

      {/* Load More */}
      {jobCards.length > 0 && (
        <div className="mt-10 flex justify-center">
          <button
            className="px-6 py-3 bg-white border border-slate-200 text-slate-700 font-medium rounded-xl shadow-sm hover:bg-slate-50 hover:text-primary-600 transition-colors"
            onClick={() => setRadius(prev => Math.min(prev + 5000, 50000))}
          >
            Mở rộng bán kính (+5km)
          </button>
        </div>
      )}
    </div>
  );
}

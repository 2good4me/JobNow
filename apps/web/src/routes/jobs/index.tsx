import { createFileRoute } from '@tanstack/react-router';
import { useMemo, useState } from 'react';
import { JobSearchFilter } from '../../features/jobs/components/JobSearchFilter';
import { JobList } from '../../features/jobs/components/JobList';
import type { JobCardProps } from '../../features/jobs/components/JobCard';
import { useGeolocation } from '../../features/jobs/hooks/useGeolocation';
import { useJobSearch } from '../../features/jobs/hooks/useJobSearch';
import { getApiBase, seedJobs } from '../../lib/api';
import { MapPin, AlertTriangle, RefreshCw, Database } from 'lucide-react';
import type { ShiftTimeBucket } from '@jobnow/types';

export const Route = createFileRoute('/jobs/')({
  component: JobsPage,
});

type SortMode = 'nearest' | 'newest' | 'salary';

function JobsPage() {
  const apiBase = getApiBase();
  const geo = useGeolocation();
  const [radius, setRadius] = useState(5000);
  const [keyword, setKeyword] = useState('');
  const [salaryMin, setSalaryMin] = useState<number | undefined>(undefined);
  const [salaryMax, setSalaryMax] = useState<number | undefined>(undefined);
  const [category, setCategory] = useState<string | undefined>(undefined);
  const [shiftTime, setShiftTime] = useState<ShiftTimeBucket | undefined>(undefined);
  const [sortMode, setSortMode] = useState<SortMode>('nearest');
  const [seeding, setSeeding] = useState(false);

  const {
    data,
    isLoading,
    isFetching,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useJobSearch({
    lat: geo.latitude,
    lng: geo.longitude,
    enabled: !geo.loading,
    filters: {
      radius_m: radius,
      salary_min: salaryMin,
      salary_max: salaryMax,
      category_ids: category ? [category] : undefined,
      shift_time: shiftTime,
      keyword,
      limit: 20,
    },
  });

  const rawJobs = useMemo(() => data?.pages.flatMap((page) => page.items) ?? [], [data]);

  const sortedJobs = useMemo(() => {
    if (sortMode === 'salary') {
      return [...rawJobs].sort((a, b) => b.salary - a.salary);
    }
    if (sortMode === 'newest') {
      return [...rawJobs].sort((a, b) => {
        const aTime = a.createdAt?.toDate?.()?.getTime?.() ?? 0;
        const bTime = b.createdAt?.toDate?.()?.getTime?.() ?? 0;
        return bTime - aTime;
      });
    }
    return rawJobs;
  }, [rawJobs, sortMode]);

  const jobCards: JobCardProps[] = sortedJobs.map((job) => {
    const salaryType: JobCardProps['salaryType'] = job.salaryType === 'HOURLY'
      ? 'HOURLY'
      : job.salaryType === 'DAILY'
        ? 'DAILY'
        : 'JOB';

    return {
    id: job.id,
    title: job.title,
    employerName: job.employerId || 'Nhà tuyển dụng',
    salary: job.salary,
    salaryType,
    postedAt: new Date(),
    isHot: (job.salary >= 35000 && job.salaryType === 'HOURLY') || (job.salary >= 300000 && job.salaryType === 'DAILY'),
    address: job.location.address,
    category: job.categoryId,
    shifts: job.shifts.map((shift) => ({
      id: shift.id,
      name: shift.name,
      start_time: shift.startTime,
      end_time: shift.endTime,
      quantity: shift.quantity,
    })),
  };
  });

  const handleSeedData = async () => {
    setSeeding(true);
    try {
      const result = await seedJobs();
      alert(`✅ Đã seed thành công ${result.count} công việc mẫu! Đang tải lại...`);
      refetch();
    } catch {
      alert('❌ Lỗi seed data. Hãy đảm bảo backend đang chạy (npm run dev trong apps/api).');
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold font-heading text-slate-900 tracking-tight mb-2">
          Tìm việc làm thời vụ <span className="text-primary-600 relative inline-block">ngay gần bạn</span>
        </h1>
        <p className="text-slate-600 text-lg">Hàng ngàn ca làm việc đang chờ bạn khám phá và ứng tuyển.</p>
      </div>

      {geo.isDefault && !geo.loading && (
        <div className="mb-6 flex items-center gap-3 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-sm">
          <AlertTriangle className="w-5 h-5 shrink-0 text-amber-500" />
          <span>{geo.error || 'Đang hiển thị khu vực mặc định: Nam Từ Liêm, Hà Nội. Bật GPS để tìm việc chính xác hơn!'}</span>
        </div>
      )}

      {!geo.loading && (
        <div className="mb-6 flex items-center gap-2 text-sm text-slate-500">
          <MapPin className="w-4 h-4 text-primary-500" />
          <span>Vị trí: {geo.latitude.toFixed(4)}, {geo.longitude.toFixed(4)}</span>
          <span className="text-slate-300">|</span>
          <span>Bán kính: {radius >= 1000 ? `${radius / 1000}km` : `${radius}m`}</span>
        </div>
      )}

      <JobSearchFilter
        radius={radius}
        keyword={keyword}
        salaryMin={salaryMin}
        salaryMax={salaryMax}
        categoryId={category}
        shiftTime={shiftTime}
        onRadiusChange={setRadius}
        onKeywordChange={setKeyword}
        onSalaryMinChange={setSalaryMin}
        onSalaryMaxChange={setSalaryMax}
        onCategoryChange={setCategory}
        onShiftTimeChange={setShiftTime}
      />

      <div className="flex justify-between items-center mb-6 gap-3 flex-wrap">
        <h2 className="text-xl font-bold text-slate-800">
          {isLoading ? 'Đang tìm kiếm...' : <>Có <span className="text-primary-600">{jobCards.length}</span> công việc</>}
        </h2>

        <div className="flex gap-2">
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
            {isFetching ? 'Đang tải...' : 'Tải lại'}
          </button>

          <select
            className="bg-white border-slate-200 text-slate-700 font-medium py-2 px-4 rounded-xl shadow-sm focus:ring-primary-500 focus:border-primary-500 outline-none text-sm"
            value={sortMode}
            onChange={(e) => setSortMode(e.target.value as SortMode)}
          >
            <option value="nearest">Gần đây nhất</option>
            <option value="newest">Mới đăng</option>
            <option value="salary">Lương cao nhất</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          Lỗi kết nối: {(error as Error).message}. API hiện tại: <code className="bg-red-100 px-1.5 py-0.5 rounded">{apiBase}</code>
        </div>
      )}

      <JobList jobs={jobCards} isLoading={isLoading || geo.loading} />

      {jobCards.length > 0 && (
        <div className="mt-10 flex justify-center">
          {hasNextPage ? (
            <button
              className="px-6 py-3 bg-white border border-slate-200 text-slate-700 font-medium rounded-xl shadow-sm hover:bg-slate-50 hover:text-primary-600 transition-colors disabled:opacity-50"
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
            >
              {isFetchingNextPage ? 'Đang tải thêm...' : 'Tải thêm'}
            </button>
          ) : (
            <button
              className="px-6 py-3 bg-white border border-slate-200 text-slate-700 font-medium rounded-xl shadow-sm hover:bg-slate-50 hover:text-primary-600 transition-colors"
              onClick={() => setRadius((prev) => Math.min(prev + 5000, 50000))}
            >
              Mở rộng bán kính (+5km)
            </button>
          )}
        </div>
      )}
    </div>
  );
}

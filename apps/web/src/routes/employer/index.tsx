import { createFileRoute } from '@tanstack/react-router';
import { useAuth } from '@/features/auth/context/AuthContext';
import { Bell, Briefcase, ChevronRight, TrendingUp, Users, Wallet } from 'lucide-react';
import React from 'react';

export const Route = createFileRoute('/employer/')({
  component: EmployerDashboard,
});

function EmployerDashboard() {
  const { userProfile } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 pb-6">
      {/* Header section with curve */}
      <div className="relative pt-12 pb-24 px-4 bg-gradient-to-br from-emerald-600 to-emerald-800 rounded-b-[40px] overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <p className="text-emerald-100 text-sm font-medium mb-1">Xin chào,</p>
            <h1 className="text-white text-2xl font-bold font-heading">
              {userProfile?.business_name || userProfile?.full_name || 'Nhà tuyển dụng'}
            </h1>
          </div>
          <button className="relative p-2 bg-white/20 rounded-full backdrop-blur-md">
            <Bell className="w-6 h-6 text-white" />
            <span className="absolute top-1.5 right-2 w-2 h-2 bg-rose-500 rounded-full border border-emerald-600"></span>
          </button>
        </div>
      </div>

      {/* Main Stats Cards - overlaying the header curve */}
      <div className="px-4 -mt-16 relative z-20 space-y-4">

        {/* Stats row */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center">
                <Briefcase className="w-4 h-4 text-emerald-600" />
              </div>
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">+2</span>
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-1">12</h3>
            <p className="text-xs text-slate-500 font-medium">Tin đang đăng</p>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
                <Users className="w-4 h-4 text-blue-600" />
              </div>
              <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">15 mới</span>
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-1">48</h3>
            <p className="text-xs text-slate-500 font-medium">Ứng viên chờ duyệt</p>
          </div>
        </div>

        {/* Primary Action Card */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-5 text-white shadow-md relative overflow-hidden">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-lg mb-1">Tuyển thêm nhân sự?</h3>
              <p className="text-slate-300 text-sm">Đăng tin nhanh chỉ trong 2 phút.</p>
            </div>
            <div className="w-12 h-12 bg-white text-slate-900 rounded-full flex items-center justify-center font-bold shadow-sm cursor-pointer">
              <ChevronRight className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Performance Chart Placeholder */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-slate-800">Hiệu quả tuyển dụng</h2>
            <select className="text-xs font-medium text-slate-500 bg-slate-50 border-none outline-none rounded-lg py-1 px-2 cursor-pointer">
              <option>Tuần này</option>
              <option>Tháng này</option>
            </select>
          </div>
          {/* Simulated chart */}
          <div className="h-40 flex items-end justify-between gap-2 pt-4">
            {[40, 70, 45, 90, 65, 30, 80].map((h, i) => (
              <div key={i} className="w-full bg-emerald-50 rounded-t-sm relative group">
                <div
                  className="absolute bottom-0 w-full bg-emerald-500 rounded-t-sm transition-all duration-500"
                  style={{ height: `${h}%` }}
                ></div>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-3 text-[10px] text-slate-400 font-medium">
            <span>T2</span><span>T3</span><span>T4</span><span>T5</span><span>T6</span><span>T7</span><span>CN</span>
          </div>
        </div>

        {/* Recent Jobs */}
        <div>
          <div className="flex items-center justify-between mb-3 px-1">
            <h2 className="font-bold text-slate-800 text-lg">Tin tuyển dụng gần đây</h2>
            <button className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 cursor-pointer">Xem tất cả</button>
          </div>

          <div className="space-y-3">
            {/* Sample Job 1 */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center shrink-0">
                <span className="text-2xl">☕</span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-slate-800 text-sm truncate">Nhân viên Phục vụ Part-time</h3>
                <p className="text-xs text-slate-500 mt-1">Hết hạn: 15/10/2026</p>
              </div>
              <div className="text-right shrink-0">
                <div className="text-sm font-bold text-emerald-600">12</div>
                <div className="text-[10px] text-slate-500">Ứng viên</div>
              </div>
            </div>

            {/* Sample Job 2 */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                <span className="text-2xl">🛵</span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-slate-800 text-sm truncate">Shipper Giao hàng</h3>
                <p className="text-xs text-slate-500 mt-1">Hết hạn: 20/10/2026</p>
              </div>
              <div className="text-right shrink-0">
                <div className="text-sm font-bold text-emerald-600">8</div>
                <div className="text-[10px] text-slate-500">Ứng viên</div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

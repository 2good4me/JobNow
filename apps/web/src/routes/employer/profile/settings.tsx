import { createFileRoute } from '@tanstack/react-router';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useUpdateEmployerProfile } from '@/features/auth/hooks/useEmployerProfile';
import { useState } from 'react';
import { ArrowLeft, ShieldCheck, Bell, BellOff, Lock, LogOut, ChevronRight } from 'lucide-react';
import { Link, useNavigate } from '@tanstack/react-router';


export const Route = createFileRoute('/employer/profile/settings')({
  component: EmployerSettingsPage,
});

function EmployerSettingsPage() {
  const { userProfile: user, signOut } = useAuth();
  const navigate = useNavigate();
  const { mutateAsync: updateProfile, isPending: isUpdatingProfile } = useUpdateEmployerProfile();

  const [notifPush, setNotifPush] = useState<boolean>(user?.notification_push ?? true);
  const [notifEmail, setNotifEmail] = useState<boolean>(user?.notification_email ?? true);

  const togglePush = async () => {
    const newVal = !notifPush;
    setNotifPush(newVal);
    await updateProfile({ notification_push: newVal });
  };

  const toggleEmail = async () => {
    const newVal = !notifEmail;
    setNotifEmail(newVal);
    await updateProfile({ notification_email: newVal });
  };

  const handleLogout = async () => {
    try {
      await signOut();
      await navigate({ to: '/login' });
    } catch (err) {
      console.error(err);
    }
  };

  const verificationStatus = user?.verification_status || 'UNVERIFIED';
  const verificationLabel =
    verificationStatus === 'VERIFIED'
      ? 'Đã xác minh'
      : verificationStatus === 'PENDING'
        ? 'Đang xét duyệt'
        : 'Chưa xác minh';
  const verificationClass =
    verificationStatus === 'VERIFIED'
      ? 'text-emerald-700 bg-emerald-50 border-emerald-100'
      : verificationStatus === 'PENDING'
        ? 'text-amber-700 bg-amber-50 border-amber-100'
        : 'text-slate-600 bg-slate-50 border-slate-200';

  return (
    <div className="min-h-screen bg-slate-50 pb-20 font-sans">
      <div className="bg-[#1e3a5f] text-white p-4 sticky top-0 z-10 flex items-center">
        <button onClick={() => navigate({ to: '/employer/profile' })} className="p-2 -ml-2 rounded-full hover:bg-white/10 transition">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-bold ml-2">Cài đặt & Bảo mật</h1>
      </div>

      <div className="max-w-md mx-auto p-4 space-y-6">
        {/* Verification Center */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-800 text-[15px]">Trung tâm Xác thực</h2>
              <p className="text-xs text-slate-500">E-KYC doanh nghiệp tập trung tại một màn hình riêng</p>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-3 py-2">
            <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${verificationClass}`}>
              {verificationLabel}
            </span>
            <Link
              to="/employer/verification"
              className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-700 hover:text-emerald-800"
            >
              Mở trung tâm
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
              <Bell className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="font-semibold text-slate-800 text-[15px]">Thông báo</h2>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="w-4 h-4 text-blue-500" />
                <div>
                  <p className="text-sm font-medium text-slate-800">Thông báo đẩy (Push)</p>
                  <p className="text-xs text-slate-500">Nhận cập nhật ứng viên mới</p>
                </div>
              </div>
              <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                <input type="checkbox" checked={notifPush} onChange={togglePush} disabled={isUpdatingProfile} className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer border-slate-300 checked:right-0 checked:border-blue-600 focus:outline-none transition-all duration-300" style={{ right: notifPush ? '0' : '1.25rem' }} />
                <label className={`toggle-label block overflow-hidden h-5 rounded-full cursor-pointer transition-colors duration-300 ${notifPush ? 'bg-blue-500' : 'bg-slate-300'}`}></label>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {notifEmail ? <Bell className="w-4 h-4 text-blue-500" /> : <BellOff className="w-4 h-4 text-slate-400" />}
                <div>
                  <p className="text-sm font-medium text-slate-800">Thông báo Email</p>
                  <p className="text-xs text-slate-500">Báo cáo tuần & ứng viên mới</p>
                </div>
              </div>
              <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                <input type="checkbox" checked={notifEmail} onChange={toggleEmail} disabled={isUpdatingProfile} className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer border-slate-300 checked:right-0 checked:border-blue-600 focus:outline-none transition-all duration-300" style={{ right: notifEmail ? '0' : '1.25rem' }} />
                <label className={`toggle-label block overflow-hidden h-5 rounded-full cursor-pointer transition-colors duration-300 ${notifEmail ? 'bg-blue-500' : 'bg-slate-300'}`}></label>
              </div>
            </div>
          </div>
        </div>

        {/* Security */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center">
              <Lock className="w-5 h-5 text-purple-600" />
            </div>
            <h2 className="font-semibold text-slate-800 text-[15px]">Bảo mật</h2>
          </div>

          <button className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition">
            <div className="flex items-center gap-3">
              <Lock className="w-4 h-4 text-slate-500" />
              <span className="text-sm font-medium text-slate-700">Đổi mật khẩu</span>
            </div>
            <span className="text-slate-400">&rsaquo;</span>
          </button>
        </div>

        {/* Logout */}
        <button className="flex items-center justify-center p-2 rounded-md font-medium transition duration-200 ease-in-out w-full text-red-600 hover:bg-red-50 hover:text-red-700 border border-red-100 bg-white" onClick={handleLogout}>
          <LogOut className="w-4 h-4 mr-2" />
          Đăng xuất
        </button>
      </div>
    </div>
  );
}

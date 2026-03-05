import { createFileRoute } from '@tanstack/react-router';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useSubmitVerification, useUpdateEmployerProfile } from '@/features/auth/hooks/useEmployerProfile';
import { useState } from 'react';
import { ArrowLeft, ShieldCheck, CheckCircle2, UploadCloud, Bell, BellOff, Lock, LogOut } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';


export const Route = createFileRoute('/employer/profile/settings')({
  component: EmployerSettingsPage,
});

function EmployerSettingsPage() {
  const { userProfile: user } = useAuth();
  const navigate = useNavigate();
  const { mutateAsync: uploadDocs, isPending: isUploading } = useSubmitVerification();
  const { mutateAsync: updateProfile, isPending: isUpdatingProfile } = useUpdateEmployerProfile();

  const [notifPush, setNotifPush] = useState<boolean>(user?.notification_push ?? true);
  const [notifEmail, setNotifEmail] = useState<boolean>(user?.notification_email ?? true);

  const handleUploadLicense = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await uploadDocs(file);
      alert('Tải lên GPKD thành công. Đang chờ xác duyệt.');
    } catch (err) {
      alert('Lỗi khi tải lên GPKD.');
    }
  };

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
      // Implement your auth signout here. Usually connected to Firebase auth.
      navigate({ to: '/login' });
    } catch (err) {
      console.error(err);
    }
  };

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
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-800 text-[15px]">Trung tâm Xác thực</h2>
              <p className="text-xs text-slate-500">E-KYC doanh nghiệp</p>
            </div>
          </div>

          {/* Stepper Progress */}
          {(() => {
            const verStatus = user?.verification_status;
            const currentStep = verStatus === 'VERIFIED' ? 4 : verStatus === 'PENDING' ? 3 : user?.business_license_url ? 2 : 1;
            const steps = [
              { num: 1, label: 'Thông tin' },
              { num: 2, label: 'Upload GPKD' },
              { num: 3, label: 'Chờ duyệt' },
              { num: 4, label: 'Xác minh' },
            ];
            return (
              <div className="flex items-center justify-between mb-4 px-1">
                {steps.map((s, i) => (
                  <div key={s.num} className="flex items-center flex-1">
                    <div className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${s.num <= currentStep
                          ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-200'
                          : 'bg-slate-100 text-slate-400'
                        }`}>
                        {s.num < currentStep ? <CheckCircle2 className="w-4 h-4" /> : s.num}
                      </div>
                      <span className={`text-[10px] mt-1 font-medium ${s.num <= currentStep ? 'text-emerald-600' : 'text-slate-400'}`}>{s.label}</span>
                    </div>
                    {i < steps.length - 1 && (
                      <div className={`flex-1 h-0.5 mx-1 mt-[-12px] rounded ${s.num < currentStep ? 'bg-emerald-400' : 'bg-slate-200'}`} />
                    )}
                  </div>
                ))}
              </div>
            );
          })()}

          {/* GPKD Preview */}
          {user?.business_license_url && (
            <div className="bg-slate-50 rounded-xl p-3 mb-4 border border-slate-100 flex items-center gap-3">
              <img src={user.business_license_url} alt="GPKD" className="w-14 h-14 rounded-lg object-cover border border-slate-200" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-700 truncate">Giấy phép kinh doanh</p>
                <p className="text-xs text-slate-500">
                  {user.verification_status === 'VERIFIED' ? '✅ Đã xác minh' : user.verification_status === 'PENDING' ? '⏳ Đang chờ duyệt' : '📎 Đã tải lên'}
                </p>
              </div>
            </div>
          )}

          {user?.verification_status !== 'VERIFIED' && (
            <div className="relative border-2 border-dashed border-slate-200 rounded-xl p-4 text-center hover:bg-slate-50 transition cursor-pointer">
              <input type="file" accept="image/*,.pdf" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleUploadLicense} disabled={isUploading} />
              <UploadCloud className="w-6 h-6 text-blue-500 mx-auto mb-2" />
              <p className="text-sm font-medium text-slate-700">{isUploading ? 'Đang tải lên...' : user?.business_license_url ? 'Tải lên lại GPKD' : 'Tải lên GPKD'}</p>
              <p className="text-xs text-slate-500 mt-1">PDF, JPG, PNG — tối đa 10MB</p>
            </div>
          )}
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

import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { ArrowLeft } from 'lucide-react';

export const Route = createFileRoute('/employer/profile/settings/privacy')({
  component: EmployerSettingsPrivacyPage,
});

function EmployerSettingsPrivacyPage() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 pb-24 max-w-lg mx-auto w-full relative shadow-sm">
      <div className="bg-[#1e3a5f] text-white p-4 sticky top-0 z-10 flex items-center">
        <button onClick={() => navigate({ to: '/employer/profile/settings' })} className="p-2 -ml-2 rounded-full hover:bg-white/10 transition">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-bold ml-2">Chinh sach bao mat</h1>
      </div>
      <div className="max-w-md mx-auto p-4">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
          Noi dung chinh sach dang duoc cap nhat.
        </div>
      </div>
    </div>
  );
}

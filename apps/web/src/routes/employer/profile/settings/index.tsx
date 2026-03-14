import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { useTheme } from '@/components/ThemeProvider';
import {
  ArrowLeft,
  Check,
  ChevronRight,
  Languages,
  Lock,
  Mail,
  MonitorSmartphone,
  Moon,
  Power,
  ShieldCheck,
  Smartphone,
  Sun,
  Trash2,
} from 'lucide-react';

export const Route = createFileRoute('/employer/profile/settings/')({
  component: EmployerSettingsIndexPage,
});

function EmployerSettingsIndexPage() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const isDarkMode = theme === 'dark';
  const [isPushEnabled, setIsPushEnabled] = useState(true);
  const [isEmailEnabled, setIsEmailEnabled] = useState(true);
  const [isLanguageListOpen, setIsLanguageListOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('Tiếng Việt');

  const languageOptions = ['Tiếng Việt', 'English'];

  const renderToggle = (enabled: boolean) => (
    <div className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ease-in-out ${enabled ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-700'}`}>
      <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-300 ease-in-out ${enabled ? 'translate-x-6' : 'translate-x-0'}`} />
    </div>
  );

  return (
    <div className="min-h-screen pb-24 transition-colors duration-300">
      <div className="bg-[#1e3a5f] text-white p-4 sticky top-0 z-10 flex items-center">
        <button onClick={() => navigate({ to: '/employer/profile' })} className="p-2 -ml-2 rounded-full hover:bg-white/10 transition">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-bold ml-2">Cài đặt & Bảo mật</h1>
      </div>

      <div className="max-w-md mx-auto p-4 space-y-4">
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-700 space-y-1.5 transition-colors duration-300">
          <h3 className="text-[13px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">CÀI ĐẶT</h3>

          <button
            type="button"
            onClick={toggleTheme}
            className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
          >
            <span className="flex items-center gap-2.5 text-sm font-semibold">
              {isDarkMode ? <Moon className="w-4 h-4 text-amber-500" /> : <Sun className="w-4 h-4 text-amber-500" />} Chế độ xem
            </span>
            {renderToggle(isDarkMode)}
          </button>

          <button
            type="button"
            onClick={() => setIsLanguageListOpen(prev => !prev)}
            className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
          >
            <span className="flex items-center gap-2.5 text-sm font-semibold">
              <Languages className="w-4 h-4 text-slate-500 dark:text-slate-400" /> Ngôn ngữ
            </span>
            <span className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
              {selectedLanguage}
              <ChevronRight className={`w-4 h-4 transition-transform ${isLanguageListOpen ? 'rotate-90' : ''}`} />
            </span>
          </button>

          {isLanguageListOpen && (
            <div className="rounded-xl border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 p-1.5 transition-colors duration-300">
              {languageOptions.map(language => (
                <button
                  key={language}
                  type="button"
                  onClick={() => {
                    setSelectedLanguage(language);
                    setIsLanguageListOpen(false);
                  }}
                  className="w-full flex items-center justify-between rounded-lg px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 transition-colors"
                >
                  <span>{language}</span>
                  {selectedLanguage === language ? <Check className="w-4 h-4 text-blue-600" /> : <span className="w-4 h-4" />}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-700 space-y-1.5 transition-colors duration-300">
          <h3 className="text-[13px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">THÔNG BÁO</h3>

          <button
            type="button"
            onClick={() => setIsPushEnabled(prev => !prev)}
            className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
          >
            <span className="flex items-center gap-2.5 text-sm font-semibold">
              <Smartphone className="w-4 h-4 text-blue-500" /> Push notification
            </span>
            <span className="flex items-center gap-2.5">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{isPushEnabled ? 'Bật' : 'Tắt'}</span>
              {renderToggle(isPushEnabled)}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setIsEmailEnabled(prev => !prev)}
            className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
          >
            <span className="flex items-center gap-2.5 text-sm font-semibold">
              <Mail className="w-4 h-4 text-indigo-500 dark:text-indigo-400" /> Email notification
            </span>
            <span className="flex items-center gap-2.5">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{isEmailEnabled ? 'Bật' : 'Tắt'}</span>
              {renderToggle(isEmailEnabled)}
            </span>
          </button>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-700 space-y-1.5 transition-colors duration-300">
          <h3 className="text-[13px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">BẢO MẬT</h3>

          <Link to="/employer/profile/settings/password" className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors">
            <span className="flex items-center gap-2.5 text-sm font-semibold">
              <Lock className="w-4 h-4 text-slate-500 dark:text-slate-400" /> Đổi mật khẩu
            </span>
            <ChevronRight className="w-4 h-4 text-slate-400 dark:text-slate-500" />
          </Link>

          <Link to="/employer/profile/settings/phone" className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors">
            <span className="flex items-center gap-2.5 text-sm font-semibold">
              <ShieldCheck className="w-4 h-4 text-slate-500 dark:text-slate-400" /> Xác minh tài khoản
            </span>
            <ChevronRight className="w-4 h-4 text-slate-400 dark:text-slate-500" />
          </Link>

          <Link to="/employer/profile/settings/devices" className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors">
            <span className="flex items-center gap-2.5 text-sm font-semibold">
              <MonitorSmartphone className="w-4 h-4 text-slate-500 dark:text-slate-400" /> Quản lý thiết bị đăng nhập
            </span>
            <ChevronRight className="w-4 h-4 text-slate-400 dark:text-slate-500" />
          </Link>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-700 space-y-1.5 transition-colors duration-300">
          <h3 className="text-[13px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">TÀI KHOẢN</h3>

          <Link to="/employer/profile/settings/deactivate" className="w-full flex items-center justify-between p-3 rounded-xl border border-amber-100 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-900/10 hover:bg-amber-50 dark:hover:bg-amber-900/20 text-amber-700 dark:text-amber-500 transition-colors">
            <span className="flex items-center gap-2.5 text-sm font-semibold">
              <Power className="w-4 h-4 text-amber-600 dark:text-amber-500" /> Tắt tài khoản
            </span>
            <ChevronRight className="w-4 h-4 text-amber-500 dark:text-amber-600" />
          </Link>

          <Link to="/employer/profile/settings/delete" className="w-full flex items-center justify-between p-3 rounded-xl border border-red-100 dark:border-red-900/50 bg-red-50/50 dark:bg-red-900/10 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-700 dark:text-red-400 transition-colors">
            <span className="flex items-center gap-2.5 text-sm font-semibold">
              <Trash2 className="w-4 h-4 text-red-600 dark:text-red-500" /> Xóa tài khoản
            </span>
            <ChevronRight className="w-4 h-4 text-red-500 dark:text-red-600" />
          </Link>
        </div>
      </div>
    </div>
  );
}

import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
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
import { useAuth } from '@/features/auth/context/AuthContext';
import { updateUserDocument } from '@/lib/firestore';
import { toast } from 'sonner';

export const Route = createFileRoute('/employer/profile/settings/')({
  component: EmployerSettingsIndexPage,
});

const DARK_MODE_STORAGE_KEY = 'employer_settings_dark_mode';
const LANGUAGE_STORAGE_KEY = 'employer_settings_language';

const languageOptions = [
  { value: 'vi', label: 'Tiếng Việt' },
  { value: 'en', label: 'English' },
] as const;

type LanguageCode = (typeof languageOptions)[number]['value'];

function EmployerSettingsIndexPage() {
  const navigate = useNavigate();
  const { userProfile, refreshProfile } = useAuth();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isPushEnabled, setIsPushEnabled] = useState(true);
  const [isEmailEnabled, setIsEmailEnabled] = useState(true);
  const [isLanguageListOpen, setIsLanguageListOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageCode>('vi');

  // Sync initial state from user profile
  useEffect(() => {
    if (userProfile) {
      setIsPushEnabled(userProfile.notification_push ?? true);
      setIsEmailEnabled(userProfile.notification_email ?? true);
      const profileTheme = userProfile.theme_mode;
      if (profileTheme === 'dark' || profileTheme === 'light') {
        setIsDarkMode(profileTheme === 'dark');
      }
      const profileLanguage = userProfile.preferred_language;
      if (profileLanguage === 'vi' || profileLanguage === 'en') {
        setSelectedLanguage(profileLanguage);
      }
    }
  }, [userProfile]);

  useEffect(() => {
    const storedDarkMode = localStorage.getItem(DARK_MODE_STORAGE_KEY);
    if (storedDarkMode === 'true' || storedDarkMode === 'false') {
      setIsDarkMode(storedDarkMode === 'true');
    }
    const storedLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (storedLanguage === 'vi' || storedLanguage === 'en') {
      setSelectedLanguage(storedLanguage);
    }
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  useEffect(() => {
    document.documentElement.lang = selectedLanguage;
  }, [selectedLanguage]);

  const selectedLanguageLabel = languageOptions.find(item => item.value === selectedLanguage)?.label || 'Tiếng Việt';

  const handleToggleDarkMode = async () => {
    const nextState = !isDarkMode;
    setIsDarkMode(nextState);
    localStorage.setItem(DARK_MODE_STORAGE_KEY, String(nextState));

    if (!userProfile?.uid) return;
    try {
      await updateUserDocument(userProfile.uid, { theme_mode: nextState ? 'dark' : 'light' });
      await refreshProfile();
      toast.success('Đã cập nhật chế độ xem');
    } catch (error) {
      console.error(error);
      setIsDarkMode(!nextState);
      localStorage.setItem(DARK_MODE_STORAGE_KEY, String(!nextState));
      toast.error('Không thể lưu chế độ xem, vui lòng thử lại');
    }
  };

  const handleTogglePush = async () => {
    if (!userProfile?.uid) return;
    const nextState = !isPushEnabled;
    setIsPushEnabled(nextState);
    try {
      await updateUserDocument(userProfile.uid, { notification_push: nextState });
      await refreshProfile();
      toast.success('Đã cập nhật cài đặt thông báo');
    } catch (error) {
      console.error(error);
      setIsPushEnabled(!nextState); // Revert on failure
      toast.error('Có lỗi xảy ra, vui lòng thử lại sau');
    }
  };

  const handleToggleEmail = async () => {
    if (!userProfile?.uid) return;
    const nextState = !isEmailEnabled;
    setIsEmailEnabled(nextState);
    try {
      await updateUserDocument(userProfile.uid, { notification_email: nextState });
      await refreshProfile();
      toast.success('Đã cập nhật cài đặt email');
    } catch (error) {
      console.error(error);
      setIsEmailEnabled(!nextState); // Revert on failure
      toast.error('Có lỗi xảy ra, vui lòng thử lại sau');
    }
  };

  const handleLanguageSelect = async (language: LanguageCode) => {
    setSelectedLanguage(language);
    setIsLanguageListOpen(false);
    localStorage.setItem(LANGUAGE_STORAGE_KEY, language);

    if (!userProfile?.uid) return;
    try {
      await updateUserDocument(userProfile.uid, { preferred_language: language });
      await refreshProfile();
      toast.success('Đã cập nhật ngôn ngữ');
    } catch (error) {
      console.error(error);
      toast.error('Không thể lưu ngôn ngữ, vui lòng thử lại');
    }
  };

  const renderToggle = (enabled: boolean) => (
    <div className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ease-in-out ${enabled ? 'bg-blue-600' : 'bg-slate-200'}`}>
      <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-300 ease-in-out ${enabled ? 'translate-x-6' : 'translate-x-0'}`} />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <div className="bg-[#1e3a5f] text-white p-4 sticky top-0 z-10 flex items-center">
        <button onClick={() => navigate({ to: '/employer/profile' })} className="p-2 -ml-2 rounded-full hover:bg-white/10 transition">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-bold ml-2">Cài đặt & Bảo mật</h1>
      </div>

      <div className="max-w-md mx-auto p-4 space-y-4">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 space-y-1.5">
          <h3 className="text-[13px] font-bold text-slate-400 uppercase tracking-wider mb-2">CÀI ĐẶT</h3>

          <button
            type="button"
            onClick={handleToggleDarkMode}
            className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:bg-slate-50 text-slate-700 transition-colors"
          >
            <span className="flex items-center gap-2.5 text-sm font-semibold">
              {isDarkMode ? <Moon className="w-4 h-4 text-slate-500" /> : <Sun className="w-4 h-4 text-amber-500" />} Chế độ xem
            </span>
            {renderToggle(isDarkMode)}
          </button>

          <button
            type="button"
            onClick={() => setIsLanguageListOpen(prev => !prev)}
            className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:bg-slate-50 text-slate-700 transition-colors"
          >
            <span className="flex items-center gap-2.5 text-sm font-semibold">
              <Languages className="w-4 h-4 text-slate-500" /> Ngôn ngữ
            </span>
            <span className="flex items-center gap-2 text-sm text-slate-500">
              {selectedLanguageLabel}
              <ChevronRight className={`w-4 h-4 transition-transform ${isLanguageListOpen ? 'rotate-90' : ''}`} />
            </span>
          </button>

          {isLanguageListOpen && (
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-1.5">
              {languageOptions.map(language => (
                <button
                  key={language.value}
                  type="button"
                  onClick={() => handleLanguageSelect(language.value)}
                  className="w-full flex items-center justify-between rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-white transition-colors"
                >
                  <span>{language.label}</span>
                  {selectedLanguage === language.value ? <Check className="w-4 h-4 text-blue-600" /> : <span className="w-4 h-4" />}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 space-y-1.5">
          <h3 className="text-[13px] font-bold text-slate-400 uppercase tracking-wider mb-2">THÔNG BÁO</h3>

          <button
            type="button"
            onClick={handleTogglePush}
            className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:bg-slate-50 text-slate-700 transition-colors"
          >
            <span className="flex items-center gap-2.5 text-sm font-semibold">
              <Smartphone className="w-4 h-4 text-blue-500" /> Push notification
            </span>
            <span className="flex items-center gap-2.5">
              <span className="text-xs font-semibold text-slate-500">{isPushEnabled ? 'Bật' : 'Tắt'}</span>
              {renderToggle(isPushEnabled)}
            </span>
          </button>

          <button
            type="button"
            onClick={handleToggleEmail}
            className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:bg-slate-50 text-slate-700 transition-colors"
          >
            <span className="flex items-center gap-2.5 text-sm font-semibold">
              <Mail className="w-4 h-4 text-indigo-500" /> Email notification
            </span>
            <span className="flex items-center gap-2.5">
              <span className="text-xs font-semibold text-slate-500">{isEmailEnabled ? 'Bật' : 'Tắt'}</span>
              {renderToggle(isEmailEnabled)}
            </span>
          </button>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 space-y-1.5">
          <h3 className="text-[13px] font-bold text-slate-400 uppercase tracking-wider mb-2">BẢO MẬT</h3>

          <Link to="/employer/profile/settings/password" className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:bg-slate-50 text-slate-700 transition-colors">
            <span className="flex items-center gap-2.5 text-sm font-semibold">
              <Lock className="w-4 h-4 text-slate-500" /> Đổi mật khẩu
            </span>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </Link>

          <Link to="/employer/profile/settings/phone" className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:bg-slate-50 text-slate-700 transition-colors">
            <span className="flex items-center gap-2.5 text-sm font-semibold">
              <ShieldCheck className="w-4 h-4 text-slate-500" /> Xác minh tài khoản
            </span>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </Link>

          <Link to="/employer/profile/settings/devices" className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:bg-slate-50 text-slate-700 transition-colors">
            <span className="flex items-center gap-2.5 text-sm font-semibold">
              <MonitorSmartphone className="w-4 h-4 text-slate-500" /> Quản lý thiết bị đăng nhập
            </span>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </Link>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 space-y-1.5">
          <h3 className="text-[13px] font-bold text-slate-400 uppercase tracking-wider mb-2">TÀI KHOẢN</h3>

          <Link to="/employer/profile/settings/deactivate" className="w-full flex items-center justify-between p-3 rounded-xl border border-amber-100 bg-amber-50/50 hover:bg-amber-50 text-amber-700 transition-colors">
            <span className="flex items-center gap-2.5 text-sm font-semibold">
              <Power className="w-4 h-4 text-amber-600" /> Tắt tài khoản
            </span>
            <ChevronRight className="w-4 h-4 text-amber-500" />
          </Link>

          <Link to="/employer/profile/settings/delete" className="w-full flex items-center justify-between p-3 rounded-xl border border-red-100 bg-red-50/50 hover:bg-red-50 text-red-700 transition-colors">
            <span className="flex items-center gap-2.5 text-sm font-semibold">
              <Trash2 className="w-4 h-4 text-red-600" /> Xóa tài khoản
            </span>
            <ChevronRight className="w-4 h-4 text-red-500" />
          </Link>
        </div>
      </div>
    </div>
  );
}

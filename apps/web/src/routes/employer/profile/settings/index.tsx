import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
<<<<<<< HEAD
import { useState, useEffect } from 'react';
=======
import { useState } from 'react';
import { useTheme } from '@/components/ThemeProvider';
>>>>>>> e623a9a17f54cd0d2fbbcf394a4341aece30ea7b
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
<<<<<<< HEAD
  const { userProfile, refreshProfile } = useAuth();
  const [isDarkMode, setIsDarkMode] = useState(false);
=======
  const { theme, toggleTheme } = useTheme();
  const isDarkMode = theme === 'dark';
>>>>>>> e623a9a17f54cd0d2fbbcf394a4341aece30ea7b
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
    <div className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ease-in-out ${enabled ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-700'}`}>
      <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-300 ease-in-out ${enabled ? 'translate-x-6' : 'translate-x-0'}`} />
    </div>
  );

  return (
<<<<<<< HEAD
    <div className="flex flex-col min-h-screen bg-slate-50 pb-24 max-w-lg mx-auto w-full relative shadow-sm">
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between bg-white/90 px-4 backdrop-blur-md border-b border-slate-100">
        <button
          onClick={() => navigate({ to: '/employer/profile' })}
          className="flex h-10 w-10 items-center justify-center -ml-2 rounded-full text-slate-700 hover:bg-slate-100 active:bg-slate-200 transition-colors"
        >
=======
    <div className="min-h-screen pb-24 transition-colors duration-300">
      <div className="bg-[#1e3a5f] text-white p-4 sticky top-0 z-10 flex items-center">
        <button onClick={() => navigate({ to: '/employer/profile' })} className="p-2 -ml-2 rounded-full hover:bg-white/10 transition">
>>>>>>> e623a9a17f54cd0d2fbbcf394a4341aece30ea7b
          <ArrowLeft className="w-5 h-5" />
        </button>
        <span className="font-bold text-slate-900 text-base flex-1 text-center pr-8 truncate">Cài đặt & Bảo mật</span>
      </header>

      <div className="max-w-md mx-auto p-4 space-y-4">
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-700 space-y-1.5 transition-colors duration-300">
          <h3 className="text-[13px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">CÀI ĐẶT</h3>

          <button
            type="button"
<<<<<<< HEAD
            onClick={handleToggleDarkMode}
            className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:bg-slate-50 text-slate-700 transition-colors"
=======
            onClick={toggleTheme}
            className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
>>>>>>> e623a9a17f54cd0d2fbbcf394a4341aece30ea7b
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
<<<<<<< HEAD
            <span className="flex items-center gap-2 text-sm text-slate-500">
              {selectedLanguageLabel}
=======
            <span className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
              {selectedLanguage}
>>>>>>> e623a9a17f54cd0d2fbbcf394a4341aece30ea7b
              <ChevronRight className={`w-4 h-4 transition-transform ${isLanguageListOpen ? 'rotate-90' : ''}`} />
            </span>
          </button>

          {isLanguageListOpen && (
            <div className="rounded-xl border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 p-1.5 transition-colors duration-300">
              {languageOptions.map(language => (
                <button
                  key={language.value}
                  type="button"
<<<<<<< HEAD
                  onClick={() => handleLanguageSelect(language.value)}
                  className="w-full flex items-center justify-between rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-white transition-colors"
=======
                  onClick={() => {
                    setSelectedLanguage(language);
                    setIsLanguageListOpen(false);
                  }}
                  className="w-full flex items-center justify-between rounded-lg px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 transition-colors"
>>>>>>> e623a9a17f54cd0d2fbbcf394a4341aece30ea7b
                >
                  <span>{language.label}</span>
                  {selectedLanguage === language.value ? <Check className="w-4 h-4 text-blue-600" /> : <span className="w-4 h-4" />}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-700 space-y-1.5 transition-colors duration-300">
          <h3 className="text-[13px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">THÔNG BÁO</h3>

          <button
            type="button"
<<<<<<< HEAD
            onClick={handleTogglePush}
            className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:bg-slate-50 text-slate-700 transition-colors"
=======
            onClick={() => setIsPushEnabled(prev => !prev)}
            className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
>>>>>>> e623a9a17f54cd0d2fbbcf394a4341aece30ea7b
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
<<<<<<< HEAD
            onClick={handleToggleEmail}
            className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:bg-slate-50 text-slate-700 transition-colors"
=======
            onClick={() => setIsEmailEnabled(prev => !prev)}
            className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
>>>>>>> e623a9a17f54cd0d2fbbcf394a4341aece30ea7b
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

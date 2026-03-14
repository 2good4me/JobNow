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

export const Route = createFileRoute('/candidate/profile/settings')({
  component: CandidateSettingsPage,
});

const DARK_MODE_STORAGE_KEY = 'candidate_settings_dark_mode';
const LANGUAGE_STORAGE_KEY = 'candidate_settings_language';

const languageOptions = [
  { value: 'vi', label: 'Tiếng Việt' },
  { value: 'en', label: 'English' },
] as const;

type LanguageCode = (typeof languageOptions)[number]['value'];

function CandidateSettingsPage() {
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
    <div className="flex flex-col min-h-screen bg-slate-50 pb-24 font-sans max-w-lg mx-auto w-full relative shadow-sm">
      {/* Navy Header */}
      <div className="bg-[#1e3a5f] text-white p-4 sticky top-0 z-40 shadow-md">
        <div className="flex items-center">
          <button 
            onClick={() => navigate({ to: '/candidate/profile' })} 
            className="p-2 -ml-2 rounded-full hover:bg-white/10 transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold ml-2">Cài đặt & Bảo mật</h1>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4 space-y-5">
        {/* Section: Cài đặt chung */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 space-y-3">
          <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 border-b border-slate-50 pb-2">CHUNG</h3>

          <button
            type="button"
            onClick={handleToggleDarkMode}
            className="w-full flex items-center justify-between p-3.5 rounded-xl border border-slate-50 bg-slate-50/50 hover:bg-slate-50 text-slate-700 transition-all font-semibold text-[14px]"
          >
            <span className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isDarkMode ? 'bg-slate-700' : 'bg-amber-100'}`}>
                {isDarkMode ? <Moon className="w-4 h-4 text-white" /> : <Sun className="w-4 h-4 text-amber-600" />}
              </div>
              Chế độ tối
            </span>
            {renderToggle(isDarkMode)}
          </button>

          <button
            type="button"
            onClick={() => setIsLanguageListOpen(prev => !prev)}
            className="w-full flex items-center justify-between p-3.5 rounded-xl border border-slate-50 bg-slate-50/50 hover:bg-slate-50 text-slate-700 transition-all font-semibold text-[14px]"
          >
            <span className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                <Languages className="w-4 h-4 text-blue-600" />
              </div>
              Ngôn ngữ
            </span>
            <span className="flex items-center gap-2 text-slate-500 font-medium">
              {selectedLanguageLabel}
              <ChevronRight className={`w-4 h-4 transition-transform ${isLanguageListOpen ? 'rotate-90' : ''}`} />
            </span>
          </button>

          {isLanguageListOpen && (
            <div className="rounded-xl border border-slate-100 bg-white p-1.5 shadow-inner mt-2">
              {languageOptions.map(language => (
                <button
                  key={language.value}
                  type="button"
                  onClick={() => handleLanguageSelect(language.value)}
                  className="w-full flex items-center justify-between rounded-lg px-4 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  <span>{language.label}</span>
                  {selectedLanguage === language.value ? <Check className="w-4 h-4 text-blue-600" /> : <span className="w-4 h-4" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Section: Thông báo */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 space-y-3">
          <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 border-b border-slate-50 pb-2">THÔNG BÁO</h3>

          <button
            type="button"
            onClick={handleTogglePush}
            className="w-full flex items-center justify-between p-3.5 rounded-xl border border-slate-50 bg-slate-50/50 hover:bg-slate-50 text-slate-700 transition-all font-semibold text-[14px]"
          >
            <span className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
                <Smartphone className="w-4 h-4 text-indigo-600" />
              </div>
              Thông báo đẩy
            </span>
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-tight">{isPushEnabled ? 'BẬT' : 'TẮT'}</span>
              {renderToggle(isPushEnabled)}
            </div>
          </button>

          <button
            type="button"
            onClick={handleToggleEmail}
            className="w-full flex items-center justify-between p-3.5 rounded-xl border border-slate-50 bg-slate-50/50 hover:bg-slate-50 text-slate-700 transition-all font-semibold text-[14px]"
          >
            <span className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-sky-50 flex items-center justify-center">
                <Mail className="w-4 h-4 text-sky-600" />
              </div>
              Thông báo Email
            </span>
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-tight">{isEmailEnabled ? 'BẬT' : 'TẮT'}</span>
              {renderToggle(isEmailEnabled)}
            </div>
          </button>
        </div>

        {/* Section: Bảo mật */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 space-y-3">
          <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 border-b border-slate-50 pb-2">BẢO MẬT</h3>

          <Link to="/candidate/profile/settings" className="w-full flex items-center justify-between p-3.5 rounded-xl border border-slate-50 bg-slate-50/50 hover:bg-slate-50 text-slate-700 transition-all font-semibold text-[14px]">
            <span className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                <Lock className="w-4 h-4 text-slate-600" />
              </div>
              Đổi mật khẩu
            </span>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </Link>

          <Link to="/candidate/profile/verify" className="w-full flex items-center justify-between p-3.5 rounded-xl border border-slate-50 bg-slate-50/50 hover:bg-slate-50 text-slate-700 transition-all font-semibold text-[14px]">
            <span className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
              </div>
              Xác minh danh tính
            </span>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </Link>

          <Link to="/candidate/profile/settings" className="w-full flex items-center justify-between p-3.5 rounded-xl border border-slate-50 bg-slate-50/50 hover:bg-slate-50 text-slate-700 transition-all font-semibold text-[14px]">
            <span className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                <MonitorSmartphone className="w-4 h-4 text-slate-600" />
              </div>
              Thiết bị đã đăng nhập
            </span>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </Link>
        </div>

        {/* Section: Nguy hiểm */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 space-y-3">
          <h3 className="text-[11px] font-bold text-red-500 uppercase tracking-wider mb-2 border-b border-red-50 pb-2">VÙNG NGUY HIỂM</h3>

          <Link to="/candidate/profile/settings" className="w-full flex items-center justify-between p-3.5 rounded-xl border border-amber-100 bg-amber-50/30 hover:bg-amber-50 text-amber-700 transition-all font-semibold text-[14px]">
            <span className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white border border-amber-100 flex items-center justify-center">
                <Power className="w-4 h-4 text-amber-600" />
              </div>
              Tạm khóa tài khoản
            </span>
            <ChevronRight className="w-4 h-4 text-amber-500/50" />
          </Link>

          <Link to="/candidate/profile/settings" className="w-full flex items-center justify-between p-3.5 rounded-xl border border-red-100 bg-red-50/30 hover:bg-red-50 text-red-700 transition-all font-semibold text-[14px]">
            <span className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white border border-red-100 flex items-center justify-center">
                <Trash2 className="w-4 h-4 text-red-600" />
              </div>
              Xóa tài khoản vĩnh viễn
            </span>
            <ChevronRight className="w-4 h-4 text-red-500/50" />
          </Link>
        </div>
      </div>
    </div>
  );
}

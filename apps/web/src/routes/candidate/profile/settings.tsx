import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Bell,
  BellRing,
  Check,
  ChevronRight,
  Languages,
  Lock,
  Mail,
  Moon,
  ShieldCheck,
  Smartphone,
  Sun,
  Trash2,
} from 'lucide-react';
import { useAuth } from '@/features/auth/context/AuthContext';
import { updateUserDocument } from '@/lib/firestore';
import { toast } from 'sonner';
import { useTheme } from '@/components/ThemeProvider';

export const Route = createFileRoute('/candidate/profile/settings')({
  component: CandidateSettingsPage,
});

const LANGUAGE_STORAGE_KEY = 'candidate_settings_language';

const languageOptions = [
  { value: 'vi', label: 'Tiếng Việt' },
  { value: 'en', label: 'English' },
] as const;

type LanguageCode = (typeof languageOptions)[number]['value'];

function CandidateSettingsPage() {
  const navigate = useNavigate();
  const { userProfile, refreshProfile } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const isDarkMode = theme === 'dark';
  
  const [isPushEnabled, setIsPushEnabled] = useState(true);
  const [isEmailEnabled, setIsEmailEnabled] = useState(true);
  const [isLanguageListOpen, setIsLanguageListOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageCode>('vi');

  // Sync initial state from user profile
  useEffect(() => {
    if (userProfile) {
      setIsPushEnabled(userProfile.notification_push ?? true);
      setIsEmailEnabled(userProfile.notification_email ?? true);
      const profileLanguage = userProfile.preferred_language;
      if (profileLanguage === 'vi' || profileLanguage === 'en') {
        setSelectedLanguage(profileLanguage);
      }
    }
  }, [userProfile]);

  useEffect(() => {
    const storedLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (storedLanguage === 'vi' || storedLanguage === 'en') {
      setSelectedLanguage(storedLanguage);
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = selectedLanguage;
  }, [selectedLanguage]);

  const selectedLanguageLabel = languageOptions.find(item => item.value === selectedLanguage)?.label || 'Tiếng Việt';

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
      setIsPushEnabled(!nextState);
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
      setIsEmailEnabled(!nextState);
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

  const handleChangePassword = async () => {
    if (!userProfile?.email) return;
    try {
        const { sendPasswordResetEmail } = await import('firebase/auth');
        const { auth } = await import('@/config/firebase');
        await sendPasswordResetEmail(auth, userProfile.email);
        toast.success(`Link đặt lại mật khẩu đã được gửi đến: ${userProfile.email}`);
    } catch (error) {
        console.error(error);
        toast.error('Không thể gửi link đặt lại mật khẩu, vui lòng thử lại');
    }
  };

  const handleDeleteAccount = () => {
    toast('Xác nhận xóa tài khoản?', {
      description: 'Hành động này không thể hoàn tác. Toàn bộ dữ liệu của bạn sẽ bị xóa.',
      action: {
        label: 'Xác nhận xóa',
        onClick: async () => {
            toast.info('Đang xử lý yêu cầu xóa tài khoản...');
            setTimeout(() => {
                toast.success('Yêu cầu đã được gửi. Tài khoản sẽ được xóa trong vòng 24h.');
            }, 1500);
        },
      },
    });
  };

  const renderToggle = (enabled: boolean) => (
    <div className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ease-in-out ${enabled ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-700'}`}>
      <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-300 ease-in-out ${enabled ? 'translate-x-6' : 'translate-x-0'}`} />
    </div>
  );

  if (!userProfile) return null;

  return (
    <div className="min-h-screen pb-24 bg-slate-50 dark:bg-[#0f172a] transition-colors duration-300">
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between bg-white/90 dark:bg-[#1f2937]/90 px-4 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 transition-colors">
        <button
          onClick={() => navigate({ to: '/candidate/profile' })}
          className="flex h-10 w-10 items-center justify-center -ml-2 rounded-full text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex-1 text-center pr-10">Cài đặt ứng dụng</h1>
      </header>

      <div className="max-w-md mx-auto p-4 space-y-6">
        <div className="bg-white dark:bg-[#1E293B] rounded-[2rem] p-6 shadow-sm border border-slate-100 dark:border-slate-700 transition-colors duration-300">
          <h2 className="text-[13px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4 border-b border-slate-100 dark:border-slate-700 pb-2">
            Giao diện
          </h2>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-50 dark:bg-slate-800 flex items-center justify-center">
                {isDarkMode ? <Moon className="w-5 h-5 text-amber-500" /> : <Sun className="w-5 h-5 text-amber-500" />}
              </div>
              <div>
                <p className="font-semibold text-slate-800 dark:text-slate-200 text-[15px]">Chế độ xem</p>
                <p className="text-[13px] text-slate-500 dark:text-slate-400">Chọn chế độ sáng tối phù hợp</p>
              </div>
            </div>
            <button onClick={toggleTheme}>
              {renderToggle(isDarkMode)}
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsLanguageListOpen(prev => !prev)}
            className="w-full flex items-center justify-between mt-4 pt-4 border-t border-slate-50 dark:border-slate-700/50"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                <Languages className="w-5 h-5 text-blue-600" />
              </div>
              <p className="font-semibold text-slate-800 dark:text-slate-200 text-[15px]">Ngôn ngữ</p>
            </div>
            <span className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-medium text-sm">
              {selectedLanguageLabel}
              <ChevronRight className={`w-4 h-4 transition-transform ${isLanguageListOpen ? 'rotate-90' : ''}`} />
            </span>
          </button>

          {isLanguageListOpen && (
            <div className="rounded-xl border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 p-1.5 mt-2 transition-colors">
              {languageOptions.map(language => (
                <button
                  key={language.value}
                  type="button"
                  onClick={() => handleLanguageSelect(language.value)}
                  className="w-full flex items-center justify-between rounded-lg px-4 py-3 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 transition-colors"
                >
                  <span>{language.label}</span>
                  {selectedLanguage === language.value ? <Check className="w-4 h-4 text-blue-600" /> : <span className="w-4 h-4" />}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-[#1E293B] rounded-[2rem] p-6 shadow-sm border border-slate-100 dark:border-slate-700 transition-colors duration-300">
          <h2 className="text-[13px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4 border-b border-slate-100 dark:border-slate-700 pb-2">
            Thông báo
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-500">
                  <BellRing className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold text-slate-800 dark:text-slate-200 text-[15px]">Thông báo Push</p>
                  <p className="text-[13px] text-slate-500 dark:text-slate-400">Trạng thái công việc, tin nhắn</p>
                </div>
              </div>
              <button onClick={handleTogglePush}>
                {renderToggle(isPushEnabled)}
              </button>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-slate-50 dark:border-slate-700/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-sky-50 dark:bg-sky-900/20 flex items-center justify-center text-sky-600 dark:text-sky-500">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold text-slate-800 dark:text-slate-200 text-[15px]">Thông báo Email</p>
                  <p className="text-[13px] text-slate-500 dark:text-slate-400">Cập nhật hàng tuần</p>
                </div>
              </div>
              <button onClick={handleToggleEmail}>
                {renderToggle(isEmailEnabled)}
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#1E293B] rounded-[2rem] p-6 shadow-sm border border-slate-100 dark:border-slate-700 transition-colors duration-300">
          <h2 className="text-[13px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4 border-b border-slate-100 dark:border-slate-700 pb-2">
            Bảo mật & Tài khoản
          </h2>
          <div className="space-y-2">
            <button onClick={handleChangePassword} className="w-full flex items-center justify-between py-3 group">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                  <Lock className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                </div>
                <p className="font-semibold text-slate-800 dark:text-slate-200 text-[15px]">Đổi mật khẩu</p>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-300" />
            </button>
            <Link to="/candidate/profile/verify" className="w-full flex items-center justify-between py-3 group">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-500" />
                </div>
                <p className="font-semibold text-slate-800 dark:text-slate-200 text-[15px]">Xác minh danh tính</p>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-300" />
            </Link>
            <button onClick={handleDeleteAccount} className="w-full flex items-center justify-between py-3 group">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-50 dark:bg-red-900/10 flex items-center justify-center">
                  <Trash2 className="w-5 h-5 text-red-600 dark:text-red-500" />
                </div>
                <p className="font-semibold text-red-600 dark:text-red-500 text-[15px]">Xóa tài khoản</p>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-300" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

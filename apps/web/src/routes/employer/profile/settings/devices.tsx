import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect, useRef, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Globe,
  LogOut,
  Monitor,
  MoreHorizontal,
  ShieldAlert,
  Smartphone,
  Tablet,
} from 'lucide-react';
import { toast } from 'sonner';

export const Route = createFileRoute('/employer/profile/settings/devices')({
  component: EmployerSettingsDevicesPage,
});

// ── Types ────────────────────────────────────────────────────────────────────

type DeviceType = 'mobile' | 'tablet' | 'desktop' | 'browser';
type LoginMethod = 'Mật khẩu' | 'Google' | 'Facebook' | 'QR Code';

interface DeviceSession {
  id: string;
  device_name: string;
  os: string;
  device_type: DeviceType;
  login_method: LoginMethod;
  location: string;
  last_active: Date;
  login_time: Date;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function detectCurrentDevice(): Pick<DeviceSession, 'device_name' | 'os' | 'device_type'> {
  const ua = navigator.userAgent;
  if (/iPhone/i.test(ua)) return { device_name: 'iPhone', os: 'iOS', device_type: 'mobile' };
  if (/iPad/i.test(ua)) return { device_name: 'iPad', os: 'iPadOS', device_type: 'tablet' };
  if (/Android/i.test(ua)) {
    const m = ua.match(/Android [0-9.]+;\s*([^);]+)/);
    const name = m ? m[1].trim() : 'Thiết bị Android';
    return { device_name: name, os: 'Android', device_type: /Mobile/i.test(ua) ? 'mobile' : 'tablet' };
  }
  if (/Windows/i.test(ua)) {
    const browser = /Edg\//.test(ua) ? 'Edge' : /Chrome/i.test(ua) ? 'Chrome' : /Firefox/i.test(ua) ? 'Firefox' : 'Trình duyệt';
    return { device_name: `${browser} · Windows`, os: 'Windows', device_type: 'desktop' };
  }
  if (/Macintosh/i.test(ua)) {
    const browser = /Chrome/i.test(ua) ? 'Chrome' : /Safari/i.test(ua) ? 'Safari' : 'Trình duyệt';
    return { device_name: `${browser} · macOS`, os: 'macOS', device_type: 'desktop' };
  }
  if (/Linux/i.test(ua)) return { device_name: 'Trình duyệt · Linux', os: 'Linux', device_type: 'browser' };
  return { device_name: 'Thiết bị', os: 'Không xác định', device_type: 'browser' };
}

function formatRelative(date: Date): string {
  const m = Math.floor((Date.now() - date.getTime()) / 60_000);
  if (m < 1) return 'Vừa xong';
  if (m < 60) return `${m} phút trước`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} giờ trước`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d} ngày trước`;
  return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

// ── Sub-components ───────────────────────────────────────────────────────────

function DeviceIcon({ type, className }: { type: DeviceType; className?: string }) {
  if (type === 'mobile') return <Smartphone className={className} />;
  if (type === 'tablet') return <Tablet className={className} />;
  if (type === 'desktop') return <Monitor className={className} />;
  return <Globe className={className} />;
}

function ConfirmDialog({
  open, title, message, confirmLabel, danger, onConfirm, onCancel,
}: {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-5 bg-black/40 backdrop-blur-sm"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-sm bg-white dark:bg-slate-800 rounded-3xl shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${danger ? 'bg-red-100 dark:bg-red-900/30' : 'bg-amber-100 dark:bg-amber-900/30'}`}>
            <AlertTriangle className={`w-6 h-6 ${danger ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-400'}`} />
          </div>
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-2">{title}</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{message}</p>
        </div>
        <div className="flex gap-3 px-6 pb-6">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors ${danger ? 'bg-red-600 hover:bg-red-500' : 'bg-amber-600 hover:bg-amber-500'}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

function DeviceCard({
  device, isCurrent, showMenu, onMenuToggle, onLogout, onNotMe, isHistory,
}: {
  device: DeviceSession;
  isCurrent?: boolean;
  showMenu?: boolean;
  onMenuToggle?: () => void;
  onLogout?: () => void;
  onNotMe?: () => void;
  isHistory?: boolean;
}) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showMenu) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) onMenuToggle?.();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showMenu, onMenuToggle]);

  const containerCls = isCurrent
    ? 'border-blue-100 dark:border-blue-800/50 bg-blue-50/40 dark:bg-blue-900/10'
    : isHistory
      ? 'border-slate-100 dark:border-slate-700 bg-slate-50/40 dark:bg-slate-700/20'
      : 'border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/50';

  const iconBg = isCurrent
    ? 'bg-blue-100 dark:bg-blue-800/50'
    : isHistory
      ? 'bg-slate-100 dark:bg-slate-700'
      : 'bg-slate-100 dark:bg-slate-700';

  const iconColor = isCurrent
    ? 'text-blue-600 dark:text-blue-400'
    : isHistory
      ? 'text-slate-400 dark:text-slate-500'
      : 'text-slate-500 dark:text-slate-400';

  return (
    <div className={`flex items-start gap-3 p-3 rounded-xl border transition-colors ${containerCls}`}>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
        <DeviceIcon type={device.device_type} className={`w-5 h-5 ${iconColor}`} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <p className={`text-sm font-semibold truncate ${isHistory ? 'text-slate-500 dark:text-slate-400' : 'text-slate-800 dark:text-slate-100'}`}>
            {device.device_name}
          </p>
          {isCurrent && (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full shrink-0">
              <CheckCircle2 className="w-2.5 h-2.5" /> Thiết bị này
            </span>
          )}
        </div>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
          {device.os} · {device.login_method}
        </p>
        <p className="text-xs text-slate-400 dark:text-slate-500">{device.location}</p>
        <p className={`text-[11px] mt-1 font-medium ${isCurrent ? 'text-green-600 dark:text-green-500' : 'text-slate-400 dark:text-slate-500'}`}>
          {isCurrent
            ? 'Đang hoạt động'
            : isHistory
              ? `Đăng nhập: ${formatDate(device.login_time)}`
              : formatRelative(device.last_active)}
        </p>
      </div>

      {!isCurrent && !isHistory && onMenuToggle && (
        <div className="relative shrink-0" ref={menuRef}>
          <button
            onClick={onMenuToggle}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
          >
            <MoreHorizontal className="w-4 h-4 text-slate-400 dark:text-slate-500" />
          </button>
          {showMenu && (
            <div className="absolute right-0 top-9 z-30 w-56 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden py-1">
              <button
                onClick={onLogout}
                className="w-full flex items-center gap-2.5 px-4 py-3 text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Đăng xuất thiết bị này
              </button>
              <button
                onClick={onNotMe}
                className="w-full flex items-center gap-2.5 px-4 py-3 text-sm font-semibold text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors"
              >
                <ShieldAlert className="w-4 h-4" />
                Không phải tôi
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

function EmployerSettingsDevicesPage() {
  const navigate = useNavigate();

  const detectedDevice = detectCurrentDevice();
  const currentDevice: DeviceSession = {
    id: 'current',
    ...detectedDevice,
    login_method: 'Mật khẩu',
    location: 'Hà Nội, Việt Nam',
    last_active: new Date(),
    login_time: new Date(Date.now() - 2 * 3600_000),
  };

  const [activeDevices, setActiveDevices] = useState<DeviceSession[]>([
    {
      id: 'dev-1',
      device_name: 'Redmi Note 13 Pro+',
      os: 'Android 14',
      device_type: 'mobile',
      login_method: 'Google',
      location: 'TP. Hồ Chí Minh, Việt Nam',
      last_active: new Date(Date.now() - 39 * 60_000),
      login_time: new Date(Date.now() - 3 * 86400_000),
    },
    {
      id: 'dev-2',
      device_name: 'Chrome · Windows',
      os: 'Windows 11',
      device_type: 'desktop',
      login_method: 'Mật khẩu',
      location: 'Đà Nẵng, Việt Nam',
      last_active: new Date(Date.now() - 2 * 3600_000),
      login_time: new Date(Date.now() - 7 * 86400_000),
    },
  ]);

  const [historyDevices, setHistoryDevices] = useState<DeviceSession[]>([
    {
      id: 'hist-1',
      device_name: 'iPhone 15',
      os: 'iOS 17',
      device_type: 'mobile',
      login_method: 'Google',
      location: 'Hà Nội, Việt Nam',
      last_active: new Date(Date.now() - 5 * 86400_000),
      login_time: new Date(2025, 5, 26),
    },
  ]);

  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [showAllHistory, setShowAllHistory] = useState(false);

  type ConfirmKind = { type: 'single' | 'not-me'; deviceId: string; deviceName: string } | { type: 'all' };
  const [confirmState, setConfirmState] = useState<ConfirmKind | null>(null);

  const handleLogoutDevice = (id: string) => {
    const d = activeDevices.find(x => x.id === id);
    if (d) setConfirmState({ type: 'single', deviceId: id, deviceName: d.device_name });
    setOpenMenuId(null);
  };

  const handleNotMe = (id: string) => {
    const d = activeDevices.find(x => x.id === id);
    if (d) setConfirmState({ type: 'not-me', deviceId: id, deviceName: d.device_name });
    setOpenMenuId(null);
  };

  const executeLogout = () => {
    if (!confirmState) return;
    if (confirmState.type === 'all') {
      setHistoryDevices(prev => [...activeDevices.map(d => ({ ...d, last_active: new Date() })), ...prev]);
      setActiveDevices([]);
      toast.success('Đã đăng xuất tất cả thiết bị khác.');
    } else {
      const { deviceId, deviceName, type } = confirmState;
      const device = activeDevices.find(d => d.id === deviceId);
      if (device) {
        setHistoryDevices(prev => [{ ...device, last_active: new Date() }, ...prev]);
        setActiveDevices(prev => prev.filter(d => d.id !== deviceId));
      }
      if (type === 'not-me') {
        toast.success(`Đã báo cáo & đăng xuất "${deviceName}". Hãy đổi mật khẩu ngay.`);
      } else {
        toast.success(`Đã đăng xuất "${deviceName}".`);
      }
    }
    setConfirmState(null);
  };

  const HISTORY_LIMIT = 2;
  const shownHistory = showAllHistory ? historyDevices : historyDevices.slice(0, HISTORY_LIMIT);

  const confirmTitle =
    confirmState?.type === 'all' ? 'Đăng xuất tất cả thiết bị khác?' :
    confirmState?.type === 'not-me' ? 'Báo cáo đăng nhập bất thường?' :
    'Đăng xuất thiết bị này?';

  const confirmMessage =
    confirmState?.type === 'all'
      ? 'Tất cả thiết bị khác sẽ bị đăng xuất. Thiết bị hiện tại của bạn sẽ được giữ lại.'
      : confirmState?.type === 'not-me'
        ? `Hệ thống sẽ đăng xuất "${(confirmState as { deviceName: string }).deviceName}" và ghi nhận báo cáo bảo mật. Bạn nên đổi mật khẩu ngay sau đó.`
        : `Bạn có chắc muốn đăng xuất khỏi "${(confirmState as { deviceName?: string })?.deviceName}" không?`;

  const confirmLabel =
    confirmState?.type === 'not-me' ? 'Báo cáo & Đăng xuất' : 'Đăng xuất';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-24 transition-colors duration-300">
      {/* Header */}
      <div className="bg-[#1e3a5f] text-white p-4 sticky top-0 z-10 flex items-center">
        <button
          onClick={() => navigate({ to: '/employer/profile/settings' })}
          className="p-2 -ml-2 rounded-full hover:bg-white/10 transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-bold ml-2">Quản lý thiết bị đăng nhập</h1>
      </div>

      <div className="max-w-md mx-auto p-4 space-y-4">

        {/* Section 1 – Current Device */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-700 transition-colors duration-300">
          <h3 className="text-[13px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">
            THIẾT BỊ NÀY
          </h3>
          <DeviceCard device={currentDevice} isCurrent />
        </div>

        {/* Section 2 – Other Active Devices */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-700 transition-colors duration-300">
          <h3 className="text-[13px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">
            THIẾT BỊ ĐANG ĐĂNG NHẬP
            {activeDevices.length > 0 && (
              <span className="ml-1.5 normal-case text-blue-500 dark:text-blue-400">({activeDevices.length})</span>
            )}
          </h3>
          {activeDevices.length === 0 ? (
            <div className="py-6 text-center">
              <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="w-6 h-6 text-green-500" />
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Hiện không có thiết bị nào khác đang đăng nhập tài khoản của bạn.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {activeDevices.map(device => (
                <DeviceCard
                  key={device.id}
                  device={device}
                  showMenu={openMenuId === device.id}
                  onMenuToggle={() => setOpenMenuId(prev => prev === device.id ? null : device.id)}
                  onLogout={() => handleLogoutDevice(device.id)}
                  onNotMe={() => handleNotMe(device.id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Section 3 – Logout All */}
        {activeDevices.length > 0 && (
          <button
            type="button"
            onClick={() => setConfirmState({ type: 'all' })}
            className="w-full flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-2xl border border-red-100 dark:border-red-800/50 bg-red-50/50 dark:bg-red-900/10 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 font-semibold text-sm transition-colors active:scale-[0.98]"
          >
            <LogOut className="w-4 h-4" />
            Đăng xuất tất cả thiết bị khác
          </button>
        )}

        {/* Section 4 – History */}
        {historyDevices.length > 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-700 transition-colors duration-300">
            <h3 className="text-[13px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">
              ĐÃ ĐĂNG XUẤT GẦN ĐÂY
            </h3>
            <div className="space-y-2">
              {shownHistory.map(device => (
                <DeviceCard key={device.id} device={device} isHistory />
              ))}
            </div>
            {historyDevices.length > HISTORY_LIMIT && (
              <button
                onClick={() => setShowAllHistory(v => !v)}
                className="mt-3 w-full text-sm font-semibold text-blue-600 dark:text-blue-400 py-2 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl transition-colors"
              >
                {showAllHistory
                  ? 'Thu gọn'
                  : `Xem tất cả thiết bị đã đăng xuất (${historyDevices.length})`}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        open={confirmState !== null}
        danger={confirmState?.type === 'all'}
        title={confirmTitle}
        message={confirmMessage}
        confirmLabel={confirmLabel}
        onConfirm={executeLogout}
        onCancel={() => setConfirmState(null)}
      />
    </div>
  );
}

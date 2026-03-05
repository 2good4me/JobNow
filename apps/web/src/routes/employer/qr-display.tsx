import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { ArrowLeft, RefreshCw, QrCode, Shield } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/features/auth/context/AuthContext';
import { generateQRPayload } from '@/features/checkin/services/checkinService';

export const Route = createFileRoute('/employer/qr-display')({
  validateSearch: (search: Record<string, unknown>) => ({
    jobId: search.jobId as string,
    shiftIndex: search.shiftIndex as string,
  }),
  component: QRDisplayPage,
});

function QRDisplayPage() {
  const { jobId, shiftIndex } = Route.useSearch();
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const employerId = userProfile?.uid || '';

  const [qrPayload, setQrPayload] = useState('');
  const [countdown, setCountdown] = useState(30);

  const refreshQR = useCallback(() => {
    const payload = generateQRPayload(jobId, shiftIndex, employerId);
    setQrPayload(payload);
    setCountdown(30);
  }, [jobId, shiftIndex, employerId]);

  // Initial QR generation
  useEffect(() => {
    refreshQR();
  }, [refreshQR]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          refreshQR();
          return 30;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [refreshQR]);

  // Generate QR SVG (simple implementation using a Google Charts-like API URL)
  // In production, use a QR code library like qrcode.react
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodeURIComponent(qrPayload)}&bgcolor=ffffff&color=1e3a5f`;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1e3a5f] to-[#0f2540] flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between p-4 text-white">
        <button
          onClick={() => navigate({ to: '/employer/shift-management' })}
          className="p-2 rounded-full hover:bg-white/10 transition cursor-pointer"
          type="button"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-lg font-bold">QR Check-in</h1>
        <button
          onClick={refreshQR}
          className="p-2 rounded-full hover:bg-white/10 transition cursor-pointer"
          type="button"
        >
          <RefreshCw className="h-5 w-5" />
        </button>
      </header>

      {/* QR Display */}
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <div className="bg-white rounded-3xl p-6 shadow-2xl shadow-black/20 mb-6 relative">
          <img
            src={qrImageUrl}
            alt="QR Code for check-in"
            className="w-[280px] h-[280px] rounded-lg"
          />
          {/* Corner decorations */}
          <div className="absolute top-3 left-3 w-6 h-6 border-t-3 border-l-3 border-blue-500 rounded-tl-lg" />
          <div className="absolute top-3 right-3 w-6 h-6 border-t-3 border-r-3 border-blue-500 rounded-tr-lg" />
          <div className="absolute bottom-3 left-3 w-6 h-6 border-b-3 border-l-3 border-blue-500 rounded-bl-lg" />
          <div className="absolute bottom-3 right-3 w-6 h-6 border-b-3 border-r-3 border-blue-500 rounded-br-lg" />
        </div>

        {/* Countdown */}
        <div className="flex items-center gap-2 text-white/80 mb-4">
          <RefreshCw className="h-4 w-4" />
          <span className="text-sm font-medium">
            Tự động làm mới sau <span className="text-white font-bold">{countdown}s</span>
          </span>
        </div>

        {/* Info */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 w-full max-w-sm border border-white/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
              <QrCode className="h-5 w-5 text-blue-300" />
            </div>
            <div>
              <p className="text-white font-semibold text-sm">Ca {parseInt(shiftIndex) + 1}</p>
              <p className="text-white/60 text-xs">Ứng viên quét mã để check-in</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-white/60 text-xs">
            <Shield className="h-3.5 w-3.5" />
            <span>Mã QR được mã hóa và tự hết hạn sau 30 giây</span>
          </div>
        </div>
      </div>
    </div>
  );
}

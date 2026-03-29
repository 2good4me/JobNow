import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { CheckCircle2, XCircle, ArrowLeft, Loader2 } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';

export const Route = createFileRoute('/employer/vnpay-return')({
  component: VNPayReturnRoute,
});

function VNPayReturnRoute() {
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(window.location.search);
  const processedRef = useRef(false);
  
  const [verifying, setVerifying] = useState(true);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  
  const responseCode = searchParams.get('vnp_ResponseCode');
  const txnRef = searchParams.get('vnp_TxnRef');
  const amountStr = searchParams.get('vnp_Amount');
  const amount = amountStr ? parseInt(amountStr) / 100 : 0;
  
  const isVnpSuccess = responseCode === '00';

  useEffect(() => {
    // Chỉ chạy 1 lần để tránh gọi API lặp lại
    if (processedRef.current) return;
    processedRef.current = true;

    if (!isVnpSuccess) {
      setVerifying(false);
      return;
    }

    const verifyPayment = async () => {
      try {
        // Gọi endpoint xác nhận thanh toán (không cần checksum, chỉ dùng cho local dev)
        const response = await fetch(`/api/vnpay/complete-payment${window.location.search}`);
        const data = await response.json();
        
        if (data.RspCode === '00' || data.RspCode === '02') {
          // 00: Thành công lần đầu, 02: Đã được xác nhận trước đó (trùng lặp)
          setVerifying(false);
        } else {
          setVerifyError(data.Message || 'Xác thực giao dịch thất bại');
          setVerifying(false);
        }
      } catch (err) {
        console.error('Error verifying payment:', err);
        setVerifyError('Không thể kết nối với máy chủ để xác thực giao dịch.');
        setVerifying(false);
      }
    };

    verifyPayment();
  }, [isVnpSuccess]);
  
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-sm p-8 text-center animate-in zoom-in-95 duration-300">
        <div className="flex justify-center mb-6">
          {verifying ? (
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center">
              <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
            </div>
          ) : isVnpSuccess && !verifyError ? (
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-emerald-600" />
            </div>
          ) : (
            <div className="w-20 h-20 bg-rose-100 rounded-full flex items-center justify-center">
              <XCircle className="w-10 h-10 text-rose-600" />
            </div>
          )}
        </div>
        
        <h2 className={`text-2xl font-black mb-2 ${
          verifying ? 'text-blue-700' : (isVnpSuccess && !verifyError ? 'text-emerald-700' : 'text-rose-700')
        }`}>
          {verifying ? 'Đang xác thực...' : (isVnpSuccess && !verifyError ? 'Nạp tiền thành công!' : 'Giao dịch thất bại')}
        </h2>
        
        <p className="text-slate-500 mb-8 text-sm leading-relaxed">
          {verifying 
            ? 'Vui lòng chờ trong giây lát, chúng tôi đang kết nối với hệ thống để xác nhận số dư của bạn.'
            : (isVnpSuccess && !verifyError)
              ? `Giao dịch ${txnRef ?? ''} đã được xác nhận. ${amount.toLocaleString('vi-VN')}đ đã được cộng vào ví của bạn.` 
              : (verifyError || 'Đã có lỗi xảy ra hoặc bạn đã hủy giao dịch. Vui lòng thử lại sau.')}
        </p>
        
        <button
          onClick={() => navigate({ to: '/employer/wallet' })}
          className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          disabled={verifying}
        >
          <ArrowLeft className="w-5 h-5" /> Về ví của bạn
        </button>
      </div>
    </div>
  );
}

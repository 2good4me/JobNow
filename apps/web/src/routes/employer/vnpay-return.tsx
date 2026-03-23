import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { CheckCircle2, XCircle, ArrowLeft } from 'lucide-react';

export const Route = createFileRoute('/employer/vnpay-return')({
  component: VNPayReturnRoute,
});

function VNPayReturnRoute() {
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(window.location.search);
  
  const responseCode = searchParams.get('vnp_ResponseCode');
  const txnRef = searchParams.get('vnp_TxnRef');
  const amountStr = searchParams.get('vnp_Amount');
  const amount = amountStr ? parseInt(amountStr) / 100 : 0;
  
  const isSuccess = responseCode === '00';
  
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-sm p-8 text-center animate-in zoom-in-95 duration-300">
        <div className="flex justify-center mb-6">
          {isSuccess ? (
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-emerald-600" />
            </div>
          ) : (
            <div className="w-20 h-20 bg-rose-100 rounded-full flex items-center justify-center">
              <XCircle className="w-10 h-10 text-rose-600" />
            </div>
          )}
        </div>
        
        <h2 className={`text-2xl font-black mb-2 ${isSuccess ? 'text-emerald-700' : 'text-rose-700'}`}>
          {isSuccess ? 'Nạp tiền thành công!' : 'Giao dịch thất bại'}
        </h2>
        
        <p className="text-slate-500 mb-8 text-sm leading-relaxed">
          {isSuccess 
            ? `Giao dịch ${txnRef ?? ''} đã được gửi về backend để xác nhận. Sau khi IPN xử lý xong, ${amount.toLocaleString('vi-VN')}đ sẽ xuất hiện trong ví của bạn.` 
            : 'Đã có lỗi xảy ra hoặc bạn đã hủy giao dịch. Vui lòng thử lại sau.'}
        </p>
        
        <button
          onClick={() => navigate({ to: '/employer/wallet' })}
          className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl transition-colors flex items-center justify-center gap-2"
        >
          <ArrowLeft className="w-5 h-5" /> Về ví của bạn
        </button>
      </div>
    </div>
  );
}

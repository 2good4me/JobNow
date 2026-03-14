import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Star, X, MessageSquare, Send } from 'lucide-react';
import { useSubmitRating } from '../hooks/useSubmitRating';
import { useUserProfile } from '@/features/auth/hooks/useUserProfile';
import { toast } from 'sonner';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  applicationId: string;
  reviewerId: string;
  revieweeId: string;
  revieweeName: string;
  jobTitle: string;
}

export function ReviewModal({
  isOpen,
  onClose,
  applicationId,
  reviewerId,
  revieweeId,
  revieweeName,
  jobTitle,
}: ReviewModalProps) {
  const [rating, setRating] = useState<number>(0);
  const [hover, setHover] = useState<number>(0);
  const [comment, setComment] = useState('');
  const submitRatingMutation = useSubmitRating();
  
  // Fallback name fetch if revieweeName is generic or missing
  const { data: fetchedProfile } = useUserProfile((!revieweeName || revieweeName === 'Nhà tuyển dụng') ? revieweeId : undefined);
  const displayName = fetchedProfile?.full_name || fetchedProfile?.company_name || revieweeName;

  // Prevent background scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error('Vui lòng chọn số sao đánh giá');
      return;
    }

    try {
      await submitRatingMutation.mutateAsync({
        applicationId,
        reviewerId,
        revieweeId,
        rating,
        comment,
      });
      toast.success('Gửi đánh giá thành công!');
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Không thể gửi đánh giá');
    }
  };

  const modalContent = (
    <div 
      className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-4 bg-slate-900/60 backdrop-blur-[2px] animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-8 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative p-6 text-center border-b border-slate-100">
          <button 
            onClick={onClose}
            className="absolute right-4 top-4 p-2 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-amber-100 italic font-black text-amber-600 text-2xl">
            JN
          </div>
          <h2 className="text-xl font-bold text-slate-900 leading-tight">Đánh giá đối tác</h2>
          <p className="text-sm text-slate-500 mt-1 font-medium">Đối tượng: {displayName}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">{jobTitle}</p>
        </div>

        <div className="p-6 space-y-8">
          {/* Star Rating Section */}
          <div className="text-center">
            <p className="text-[13px] font-bold text-slate-400 uppercase tracking-widest mb-4">Bạn cảm thấy thế nào?</p>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className="p-1 transition-all active:scale-90"
                  onMouseEnter={() => setHover(star)}
                  onMouseLeave={() => setHover(0)}
                  onClick={() => setRating(star)}
                >
                  <Star
                    className={`w-10 h-10 transition-colors ${
                      (hover || rating) >= star
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-slate-200 fill-slate-50'
                    }`}
                  />
                </button>
              ))}
            </div>
            <p className="mt-4 text-sm font-bold text-amber-600 h-5">
              {rating === 1 && 'Rất tệ'}
              {rating === 2 && 'Tệ'}
              {rating === 3 && 'Bình thường'}
              {rating === 4 && 'Tốt'}
              {rating === 5 && 'Tuyệt vời!'}
            </p>
          </div>

          {/* Comment Section */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-[13px] font-bold text-slate-700">
              <MessageSquare className="w-4 h-4 text-slate-400" /> Nhận xét thêm
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Chia sẻ trải nghiệm của bạn về sự hợp tác này..."
              className="w-full h-32 px-4 py-3 rounded-2xl bg-slate-50 border border-slate-100 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none resize-none text-[15px]"
            />
          </div>

          {/* Action Button */}
          <button
            onClick={handleSubmit}
            disabled={submitRatingMutation.isPending || rating === 0}
            className="w-full bg-[#1e3a5f] hover:bg-[#2c5282] disabled:bg-slate-200 disabled:text-slate-400 text-white p-4 rounded-2xl font-bold transition-all shadow-lg shadow-blue-900/10 flex items-center justify-center gap-2"
          >
            {submitRatingMutation.isPending ? (
              'Đang gửi...'
            ) : (
              <>
                <Send className="w-5 h-5" /> Gửi đánh giá
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

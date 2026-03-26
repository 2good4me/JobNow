import { useNavigate } from '@tanstack/react-router';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useIsJobWishlisted, useToggleWishlist } from '@/features/jobs/hooks/useWishlistJobs';
import { MouseEvent } from 'react';
import { toast } from 'sonner';

export interface JobCardProps {
    id: string;
    companyName: string;
    title: string;
    wage: string;
    distance: string;
    shift: string;
    logoUrl: string;
    hasVerifiedBadge?: boolean;
    detailVariant?: 'candidate' | 'public';
}

export function JobCard({
    id,
    companyName,
    title,
    wage,
    distance,
    shift,
    logoUrl,
    hasVerifiedBadge,
    detailVariant = 'candidate',
}: JobCardProps) {
    const navigate = useNavigate();
    const { userProfile } = useAuth();

    const { data: isWishlisted } = useIsJobWishlisted(userProfile?.uid, id);
    const toggleWishlistMutation = useToggleWishlist();

    const handleToggleWishlist = async (e: MouseEvent) => {
        e.stopPropagation();
        if (!userProfile?.uid) {
            toast.error('Vui lòng đăng nhập để lưu việc làm');
            navigate({ to: '/login' });
            return;
        }

        try {
            await toggleWishlistMutation.mutateAsync({
                userId: userProfile.uid,
                jobId: id,
                isCurrentlyWishlisted: !!isWishlisted
            });
        } catch (error) {
            console.error('Failed to toggle wishlist:', error);
        }
    };

    return (
        <div
            onClick={() => {
                navigate({
                    to: detailVariant === 'public' ? '/jobs/$jobId' : '/candidate/jobs/$jobId',
                    params: { jobId: id },
                } as any);
            }}
            className="group bg-white rounded-3xl p-5 flex items-start gap-4 cursor-pointer hover:bg-slate-50 transition-all duration-300 shadow-sm border border-slate-100/50 active:scale-[0.98]"
        >
            <div className="relative shrink-0">
                <div className="w-16 h-16 rounded-2xl overflow-hidden border border-slate-100 bg-white shadow-sm flex items-center justify-center p-1">
                    <img src={logoUrl} alt={companyName} className="w-full h-full object-contain rounded-xl" />
                </div>
                {hasVerifiedBadge && (
                    <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm">
                        <span className="material-symbols-outlined text-emerald-500 text-[18px] block" style={{ fontVariationSettings: "'FILL' 1" }}>
                            verified
                        </span>
                    </div>
                )}
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1">
                    <h3 className="font-headline font-bold text-[17px] text-slate-900 leading-tight truncate group-hover:text-blue-700 transition-colors">
                        {title}
                    </h3>
                    <button
                        type="button"
                        onClick={handleToggleWishlist}
                        disabled={toggleWishlistMutation.isPending}
                        className={`transition-all shrink-0 p-2 rounded-xl flex items-center justify-center ${isWishlisted
                                ? 'bg-rose-50 text-rose-500'
                                : 'bg-slate-50 text-slate-400 hover:text-rose-500 hover:bg-rose-50'
                            }`}
                    >
                        <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: isWishlisted ? "'FILL' 1" : "'FILL' 0" }}>
                            favorite
                        </span>
                    </button>
                </div>

                <div className="flex items-center gap-1.5 text-[13px] text-slate-500 mb-3 font-medium">
                    <span className="truncate">{companyName}</span>
                    <span className="text-slate-300">•</span>
                    <span className="flex items-center gap-0.5 shrink-0">
                        <span className="material-symbols-outlined text-[14px]">map</span>
                        {distance}
                    </span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <div className="bg-slate-100/80 text-slate-600 text-[11px] px-3 py-1.5 rounded-xl font-bold uppercase tracking-wider flex items-center gap-1">
                        <span className="material-symbols-outlined text-[13px]">schedule</span>
                        {shift}
                    </div>
                    <div className="bg-blue-50 text-blue-700 text-[11px] px-3 py-1.5 rounded-xl font-bold uppercase tracking-wider flex items-center gap-1">
                        <span className="material-symbols-outlined text-[13px]">payments</span>
                        {wage}
                    </div>
                </div>
            </div>
        </div>
    );
}

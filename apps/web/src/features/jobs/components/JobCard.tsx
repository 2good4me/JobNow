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
            className="bg-white rounded-xl p-5 flex flex-col gap-4 relative overflow-hidden group hover:translate-y-[-2px] transition-transform cursor-pointer shadow-[0_4px_24px_-2px_rgba(124,131,155,0.04)]"
        >
            {/* Top Section: Logo + Title + Company + Badge */}
            <div className="flex items-start justify-between">
                <div className="flex gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-[#ECEEF0] overflow-hidden flex-shrink-0">
                        <img src={logoUrl} alt={companyName} className="w-full h-full object-cover" />
                    </div>
                    <div>
                        <h3 className="font-headline font-bold text-lg text-[#191C1E] leading-tight">{title}</h3>
                        <p className="text-[#45464D] text-sm mt-1 font-medium flex items-center gap-1">
                            {companyName}
                            {hasVerifiedBadge && (
                                <span className="text-amber-500 flex items-center">
                                    <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                                    4.8
                                </span>
                            )}
                        </p>
                    </div>
                </div>
            </div>

            {/* Bottom Section: Salary + Meta + Bookmark */}
            <div className="flex items-center justify-between border-t border-[#F2F4F6] pt-4">
                <div className="flex flex-col">
                    <span className="text-[#006399] font-bold text-lg">{wage}</span>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="text-[#45464D] text-xs">{distance}</span>
                        <span className="w-1 h-1 rounded-full bg-[#C6C6CD]" />
                        <span className="text-[#45464D] text-xs">{shift}</span>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={handleToggleWishlist}
                    disabled={toggleWishlistMutation.isPending}
                    className={`p-2.5 rounded-full transition-colors ${
                        isWishlisted
                            ? 'bg-[#006399]/20 text-[#006399]'
                            : 'bg-[#006399]/10 text-[#006399] hover:bg-[#006399]/20'
                    }`}
                >
                    <span
                        className="material-symbols-outlined"
                        style={{ fontVariationSettings: isWishlisted ? "'FILL' 1" : "'FILL' 0" }}
                    >
                        bookmark
                    </span>
                </button>
            </div>
        </div>
    );
}

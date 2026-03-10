import { useNavigate } from '@tanstack/react-router';
import { Heart } from 'lucide-react';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useIsJobWishlisted, useToggleWishlist } from '@/features/jobs/hooks/useWishlistJobs';
import { MouseEvent } from 'react';

export interface JobCardProps {
    id: string;
    companyName: string;
    title: string;
    wage: string;
    distance: string;
    shift: string;
    logoUrl: string;
    hasVerifiedBadge?: boolean;
}

export function JobCard({
    id,
    companyName,
    title,
    wage,
    distance,
    shift,
    logoUrl,
    hasVerifiedBadge
}: JobCardProps) {
    const navigate = useNavigate();
    const { userProfile } = useAuth();

    const { data: isWishlisted } = useIsJobWishlisted(userProfile?.uid, id);
    const toggleWishlistMutation = useToggleWishlist();

    const handleToggleWishlist = async (e: MouseEvent) => {
        e.stopPropagation();
        if (!userProfile?.uid) {
            // Optional: Redirect to login or show toast
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
                navigate({ to: '/candidate/jobs/$jobId', params: { jobId: id } });
            }}
            className="bg-white rounded-2xl p-4 flex items-center gap-4 cursor-pointer hover:bg-slate-50 transition-colors shadow-sm border border-slate-100"
        >
            <div className="relative">
                <div className="w-[60px] h-[60px] rounded-full overflow-hidden shrink-0 border border-slate-200">
                    <img src={logoUrl} alt={companyName} className="w-full h-full object-cover bg-slate-50" />
                </div>
                {hasVerifiedBadge && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full"></div>
                )}
            </div>

            <div className="flex-1 min-w-0 py-1">
                <div className="flex justify-between items-start mb-0.5">
                    <h3 className="font-bold text-[16px] text-slate-900 truncate pr-2">{title}</h3>
                    <button
                        type="button"
                        onClick={handleToggleWishlist}
                        disabled={toggleWishlistMutation.isPending}
                        className={`transition-colors shrink-0 p-1.5 rounded-full ${isWishlisted
                                ? 'bg-red-50 text-red-500 hover:bg-red-100'
                                : 'bg-slate-50 text-slate-400 hover:text-red-500 hover:bg-slate-100'
                            }`}
                    >
                        <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
                    </button>
                </div>

                <p className="text-[13px] text-slate-500 mb-2 truncate">
                    {companyName} <span className="text-slate-300">•</span> {distance}
                </p>

                <div className="flex flex-wrap items-center gap-2">
                    <div className="bg-blue-50 border border-blue-100 text-blue-600 text-[12px] px-2.5 py-1 rounded-md font-medium">
                        {shift}
                    </div>
                    <div className="bg-emerald-50 border border-emerald-100 text-emerald-600 text-[12px] px-2.5 py-1 rounded-md font-medium">
                        {wage}
                    </div>
                </div>
            </div>
        </div>
    );
}

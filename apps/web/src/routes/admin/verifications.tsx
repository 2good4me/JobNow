import { createFileRoute } from '@tanstack/react-router';
import { useMemo, useState } from 'react';
import { CheckCircle2, Clock3, FileText, ShieldAlert, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useReviewVerificationRequest, useVerifications } from '@/features/admin/hooks/useVerifications';

export const Route = createFileRoute('/admin/verifications')({
    component: AdminVerificationsPage,
});

function AdminVerificationsPage() {
    const { data = [], isLoading, isError } = useVerifications();
    const reviewMutation = useReviewVerificationRequest();
    const [rejectingId, setRejectingId] = useState<string | null>(null);
    const [rejectReason, setRejectReason] = useState('');

    const sortedItems = useMemo(
        () => [...data].sort((a, b) => (b.submittedAt?.getTime() ?? 0) - (a.submittedAt?.getTime() ?? 0)),
        [data]
    );

    const handleApprove = async (userId: string, requestId: string) => {
        try {
            await reviewMutation.mutateAsync({ userId, requestId, action: 'APPROVE' });
            toast.success('Đã duyệt hồ sơ xác thực.');
        } catch (error: any) {
            toast.error(error?.message || 'Không thể duyệt hồ sơ.');
        }
    };

    const handleReject = async (userId: string, requestId: string) => {
        if (rejectReason.trim().length < 5) {
            toast.error('Vui lòng nhập lý do từ chối tối thiểu 5 ký tự.');
            return;
        }

        try {
            await reviewMutation.mutateAsync({
                userId,
                requestId,
                action: 'REJECT',
                rejectionReason: rejectReason.trim(),
            });
            toast.success('Đã từ chối hồ sơ xác thực.');
            setRejectingId(null);
            setRejectReason('');
        } catch (error: any) {
            toast.error(error?.message || 'Không thể từ chối hồ sơ.');
        }
    };

    return (
        <div className="space-y-5">
            <div>
                <h1 className="text-xl font-bold text-slate-900">Duyệt hồ sơ eKYC</h1>
                <p className="text-sm text-slate-500">
                    Danh sách hồ sơ xác thực đang chờ xử lý từ ứng viên.
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <MetricCard
                    icon={Clock3}
                    label="Chờ duyệt"
                    value={sortedItems.length.toString()}
                    tone="amber"
                />
                <MetricCard
                    icon={CheckCircle2}
                    label="Đã sẵn sàng"
                    value={sortedItems.filter((item) => !!item.ocrData?.full_name).length.toString()}
                    tone="emerald"
                />
                <MetricCard
                    icon={ShieldAlert}
                    label="Cần xem tay"
                    value={sortedItems.filter((item) => !item.ocrData?.full_name).length.toString()}
                    tone="rose"
                />
            </div>

            {isLoading ? (
                <div className="grid gap-4 lg:grid-cols-2">
                    {Array.from({ length: 4 }).map((_, index) => (
                        <div key={index} className="h-80 rounded-3xl border border-slate-200 bg-white animate-pulse" />
                    ))}
                </div>
            ) : isError ? (
                <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
                    Không thể tải danh sách hồ sơ xác thực. Kiểm tra quyền admin hoặc index Firestore.
                </div>
            ) : sortedItems.length === 0 ? (
                <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center">
                    <FileText className="mx-auto mb-3 h-10 w-10 text-slate-300" />
                    <p className="text-sm font-medium text-slate-500">Không có hồ sơ eKYC nào đang chờ duyệt.</p>
                </div>
            ) : (
                <div className="grid gap-4 lg:grid-cols-2">
                    {sortedItems.map((item) => {
                        const isRejecting = rejectingId === item.id;
                        const isPending = reviewMutation.isPending;

                        return (
                            <article key={item.id} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                                <div className="grid gap-0 md:grid-cols-[240px_minmax(0,1fr)]">
                                    <div className="bg-slate-100">
                                        {item.frontImageUrl ? (
                                            <img
                                                src={item.frontImageUrl}
                                                alt={`CCCD của ${item.candidateName}`}
                                                className="h-full min-h-[260px] w-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-full min-h-[260px] items-center justify-center text-slate-400">
                                                Chưa có ảnh tải lên
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-4 p-5">
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <h2 className="text-lg font-bold text-slate-900">{item.candidateName}</h2>
                                                <p className="text-sm text-slate-500">{item.candidateEmail || 'Chưa có email'}</p>
                                                <p className="text-sm text-slate-500">{item.candidatePhone || 'Chưa có số điện thoại'}</p>
                                            </div>
                                            <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">
                                                {item.status}
                                            </span>
                                        </div>

                                        <div className="grid gap-3 sm:grid-cols-2">
                                            <InfoRow label="User ID" value={item.userId} mono />
                                            <InfoRow
                                                label="Ngày gửi"
                                                value={item.submittedAt?.toLocaleString('vi-VN') ?? 'Chưa xác định'}
                                            />
                                            <InfoRow
                                                label="OCR số CCCD"
                                                value={item.ocrData?.cccd_number || 'Chưa trích xuất'}
                                            />
                                            <InfoRow
                                                label="OCR họ tên"
                                                value={item.ocrData?.full_name || 'Chưa trích xuất'}
                                            />
                                            <InfoRow
                                                label="OCR ngày sinh"
                                                value={item.ocrData?.dob || 'Chưa trích xuất'}
                                            />
                                            <InfoRow
                                                label="Trạng thái user"
                                                value={item.verificationStatus}
                                            />
                                        </div>

                                        {isRejecting && (
                                            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-3">
                                                <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-rose-700">
                                                    Lý do từ chối
                                                </label>
                                                <textarea
                                                    value={rejectReason}
                                                    onChange={(event) => setRejectReason(event.target.value)}
                                                    rows={3}
                                                    placeholder="Ví dụ: Ảnh mờ, thiếu góc, thông tin OCR không khớp..."
                                                    className="w-full rounded-2xl border border-rose-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-rose-400"
                                                />
                                            </div>
                                        )}

                                        <div className="flex flex-wrap gap-2 pt-2">
                                            <button
                                                onClick={() => handleApprove(item.userId, item.id)}
                                                disabled={isPending}
                                                className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                                            >
                                                <CheckCircle2 className="h-4 w-4" />
                                                Duyệt
                                            </button>

                                            {isRejecting ? (
                                                <>
                                                    <button
                                                        onClick={() => handleReject(item.userId, item.id)}
                                                        disabled={isPending}
                                                        className="inline-flex items-center gap-2 rounded-2xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-50"
                                                    >
                                                        <XCircle className="h-4 w-4" />
                                                        Xác nhận từ chối
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setRejectingId(null);
                                                            setRejectReason('');
                                                        }}
                                                        disabled={isPending}
                                                        className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                                                    >
                                                        Hủy
                                                    </button>
                                                </>
                                            ) : (
                                                <button
                                                    onClick={() => {
                                                        setRejectingId(item.id);
                                                        setRejectReason('');
                                                    }}
                                                    disabled={isPending}
                                                    className="inline-flex items-center gap-2 rounded-2xl border border-rose-200 px-4 py-2.5 text-sm font-semibold text-rose-700 hover:bg-rose-50 disabled:opacity-50"
                                                >
                                                    <XCircle className="h-4 w-4" />
                                                    Từ chối
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </article>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

function MetricCard({
    icon: Icon,
    label,
    value,
    tone,
}: {
    icon: typeof Clock3;
    label: string;
    value: string;
    tone: 'amber' | 'emerald' | 'rose';
}) {
    const toneMap = {
        amber: 'border-amber-200 bg-amber-50 text-amber-700',
        emerald: 'border-emerald-200 bg-emerald-50 text-emerald-700',
        rose: 'border-rose-200 bg-rose-50 text-rose-700',
    } as const;

    return (
        <div className={`rounded-3xl border p-4 ${toneMap[tone]}`}>
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-white/70">
                <Icon className="h-5 w-5" />
            </div>
            <p className="text-2xl font-black">{value}</p>
            <p className="text-sm font-medium">{label}</p>
        </div>
    );
}

function InfoRow({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
    return (
        <div className="rounded-2xl border border-slate-100 bg-slate-50 px-3 py-2">
            <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">{label}</p>
            <p className={`mt-1 text-sm text-slate-800 ${mono ? 'font-mono break-all text-[12px]' : ''}`}>{value}</p>
        </div>
    );
}

import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';
import { ArrowLeft, Copy, TrendingDown, TrendingUp } from 'lucide-react';
import { useAuth } from '@/features/auth/context/AuthContext';
import type { ReputationActorRole, ReputationHistoryEntry } from '@jobnow/types';
import {
  getProgressToNextTier,
  getReputationRulesByRole,
  getReputationTier,
} from '../helpers/reputationHelper';
import { subscribeMyReputationHistory, submitReputationAppeal } from '../services/reputationService';
import { ReputationBadge } from './ReputationBadge';

interface ReputationDetailViewProps {
  role: ReputationActorRole;
  backTo: '/candidate/profile' | '/employer/profile';
}

function toDate(value: unknown): Date | null {
  if (!value) return null;
  if (typeof value === 'object' && value && 'toDate' in value && typeof (value as { toDate?: unknown }).toDate === 'function') {
    return (value as { toDate: () => Date }).toDate();
  }

  const parsed = new Date(value as string | number | Date);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function ReputationDetailView({ role, backTo }: ReputationDetailViewProps) {
  const { userProfile } = useAuth();
  const navigate = useNavigate();
  const [history, setHistory] = useState<ReputationHistoryEntry[]>([]);
  const [appealingId, setAppealingId] = useState<string | null>(null);

  useEffect(() => {
    if (!userProfile?.uid) return undefined;
    return subscribeMyReputationHistory(userProfile.uid, setHistory);
  }, [userProfile?.uid]);

  if (!userProfile) {
    return <div>Loading...</div>;
  }

  const reputationScore = userProfile.reputation_score || 0;
  const tierInfo = getReputationTier(reputationScore);
  const progress = getProgressToNextTier(reputationScore);
  const rules = getReputationRulesByRole(role);

  const statsText = useMemo(() => {
    return `Hạng uy tín: ${tierInfo.labelVi}\nĐiểm: ${reputationScore}/500\nMô tả: ${tierInfo.descriptionVi}`;
  }, [reputationScore, tierInfo.descriptionVi, tierInfo.labelVi]);

  const handleCopyInfo = async () => {
    await navigator.clipboard.writeText(statsText);
    toast.success('Đã sao chép thông tin uy tín');
  };

  const handleAppeal = async (entry: ReputationHistoryEntry) => {
    const deadline = toDate(entry.appeal_deadline_at);
    if (!deadline || deadline.getTime() < Date.now()) {
      toast.error('Đã hết thời hạn 24 giờ để khiếu nại');
      return;
    }

    const reason = window.prompt('Nhập lý do khiếu nại (tối thiểu 10 ký tự)');
    if (!reason || reason.trim().length < 10) {
      return;
    }

    try {
      setAppealingId(entry.id);
      await submitReputationAppeal(entry.id, reason.trim());
      toast.success('Đã gửi khiếu nại để admin xem xét');
    } catch (error: any) {
      toast.error(error?.message || 'Không thể gửi khiếu nại');
    } finally {
      setAppealingId(null);
    }
  };

  return (
    <div className="pb-24 bg-slate-50 min-h-[100dvh]">
      <div className={`${tierInfo.bgColor} py-4 px-5 border-b ${tierInfo.borderColor}`}>
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => navigate({ to: backTo })}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/60 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold text-slate-800">Chi Tiết Uy Tín</h1>
        </div>

        <div className="flex items-center justify-between">
          <ReputationBadge score={reputationScore} size="lg" />
          <div className="text-right">
            <p className="text-sm text-slate-600 font-medium">Điểm hiện tại</p>
            <p className="text-3xl font-black text-slate-800 tracking-tight">{reputationScore}</p>
            <p className="text-xs text-slate-500">/500</p>
          </div>
        </div>
      </div>

      <div className="px-5 py-6 space-y-6">
        {progress.nextTier && (
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100">
            <h2 className="text-[13px] font-bold text-slate-400 uppercase tracking-wider mb-4">
              Tiến độ đến hạng {progress.nextTier.labelVi}
            </h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-700">
                  {reputationScore} / {progress.nextTierScore}
                </span>
                <span className="text-sm font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg">
                  {progress.progressPercent}%
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                <div
                  className={`h-full ${progress.nextTier.textColor.replace('text-', 'bg-')} transition-all duration-500 rounded-full`}
                  style={{ width: `${progress.progressPercent}%` }}
                />
              </div>
              <p className="text-xs text-slate-500">
                Cần thêm <span className="font-bold text-blue-600">{progress.pointsNeeded} điểm</span> để lên hạng{' '}
                <span className="font-bold text-slate-800">{progress.nextTier.labelVi}</span>.
              </p>
            </div>
          </div>
        )}

        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100">
          <h2 className="text-[13px] font-bold text-slate-400 uppercase tracking-wider mb-4">
            Lịch sử uy tín realtime
          </h2>

          {history.length === 0 ? (
            <div className="py-12 text-center">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-slate-200" />
              </div>
              <p className="text-sm text-slate-400 font-medium">Chưa có biến động điểm nào.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((entry) => {
                const createdAt = toDate(entry.created_at);
                const isReward = entry.score_change >= 0;
                const canAppeal =
                  entry.score_change < 0 &&
                  !!entry.appeal_deadline_at &&
                  toDate(entry.appeal_deadline_at)?.getTime()! > Date.now() &&
                  !(entry.metadata as Record<string, unknown> | undefined)?.appeal_status;

                return (
                  <div
                    key={entry.id}
                    className="p-4 bg-slate-50/80 rounded-2xl border border-slate-100"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                            isReward
                              ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                              : 'bg-rose-50 text-rose-600 border border-rose-100'
                          }`}
                        >
                          {isReward ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800">
                            {entry.action_label_vi || entry.action_code}
                          </p>
                          <p className="text-[11px] text-slate-400 mt-1">
                            {createdAt?.toLocaleString('vi-VN') ?? 'Đang cập nhật'}
                          </p>
                          <p className="text-xs text-slate-500 mt-2">Số dư sau biến động: {entry.balance_after}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-base font-black ${isReward ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {isReward ? '+' : ''}
                          {entry.score_change}
                        </p>
                        {canAppeal && (
                          <button
                            onClick={() => handleAppeal(entry)}
                            disabled={appealingId === entry.id}
                            className="mt-2 text-[11px] font-bold text-blue-600 hover:text-blue-700 disabled:opacity-50"
                          >
                            {appealingId === entry.id ? 'Đang gửi...' : 'Khiếu nại'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-[#1e3a5f] rounded-3xl p-6 shadow-xl relative overflow-hidden text-white">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-400/10 rounded-full blur-2xl" />
          <h2 className="text-[13px] font-bold text-blue-200 uppercase tracking-widest mb-4">
            Quyền lợi và lưu ý của hạng {tierInfo.labelVi}
          </h2>
          <div className="space-y-4">
            {tierInfo.benefits.map((benefit) => (
              <p key={benefit} className="text-sm font-bold text-blue-50 leading-relaxed">
                {benefit}
              </p>
            ))}
            {tierInfo.restrictions.map((restriction) => (
              <p key={restriction} className="text-sm font-medium text-blue-100/80 leading-relaxed">
                {restriction}
              </p>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
          <h2 className="text-[13px] font-bold text-slate-400 uppercase tracking-wider mb-5">
            Quy tắc theo vai trò
          </h2>

          <div className="space-y-6">
            <div>
              <h3 className="text-xs font-black text-emerald-600 mb-3 uppercase">Cộng điểm</h3>
              <div className="space-y-2">
                {rules.rewards.map((rule) => (
                  <div key={rule.code} className="flex justify-between items-center p-3 bg-emerald-50/30 rounded-2xl border border-emerald-50">
                    <span className="text-xs font-bold text-slate-700">{rule.actionVi}</span>
                    <span className="text-xs font-black text-emerald-600">+{rule.points}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xs font-black text-rose-600 mb-3 uppercase">Trừ điểm</h3>
              <div className="space-y-2">
                {rules.penalties.map((rule) => (
                  <div key={rule.code} className="flex justify-between items-center p-3 bg-rose-50/30 rounded-2xl border border-rose-50">
                    <span className="text-xs font-bold text-slate-700">{rule.actionVi}</span>
                    <span className="text-xs font-black text-rose-600">{rule.points}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={handleCopyInfo}
          className="w-full bg-slate-900 hover:bg-black text-white font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-3 active:scale-95"
        >
          <Copy className="w-5 h-5" />
          Sao chép thông tin uy tín
        </button>
      </div>
    </div>
  );
}

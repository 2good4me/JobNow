import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useAuth } from '@/features/auth/context/AuthContext';
import { ArrowLeft, TrendingUp, TrendingDown, Copy } from 'lucide-react';
import { getReputationTier, getProgressToNextTier, REPUTATION_RULES } from '@/features/auth/helpers/reputationHelper';
import { ReputationBadge } from '@/features/auth/components/ReputationBadge';

export const Route = createFileRoute('/candidate/profile/reputation')({
  component: ReputationDetailPage,
});

// Mock data for Candidate
const mockReputationLogs = [
  {
    id: '1',
    action: 'Hoàn thành ca làm việc',
    type: 'reward' as const,
    points: 10,
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    jobTitle: 'Phục vụ bàn tại Nhà hàng Sen',
  },
  {
    id: '2',
    action: 'Nhận được 5⭐ từ nhà tuyển dụng',
    type: 'reward' as const,
    points: 5,
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    jobTitle: 'Phụ bếp',
    ratedBy: 'Quản lý Nhà hàng ABC',
  },
  {
    id: '3',
    action: 'Bỏ ca không lý do',
    type: 'penalty' as const,
    points: -50,
    timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    jobTitle: 'Tạp vụ',
  },
];

function ReputationDetailPage() {
  const { userProfile } = useAuth();
  const navigate = useNavigate();

  if (!userProfile) {
    return <div>Loading...</div>;
  }

  const reputationScore = userProfile.reputation_score || 0;
  const tierInfo = getReputationTier(reputationScore);
  const progress = getProgressToNextTier(reputationScore);

  const handleCopyInfo = () => {
    const text = `Hạng Uy Tín: ${tierInfo.labelVi}\nĐiểm: ${reputationScore}\nTrạng thái: ${tierInfo.descriptionVi}`;
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="pb-24 bg-slate-50 min-h-[100dvh]">
      {/* Header */}
      <div className={`${tierInfo.bgColor} py-4 px-5 border-b ${tierInfo.borderColor}`}>
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => navigate({ to: '/candidate/profile' })}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/50 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold italic text-slate-800">Chi Tiết Uy Tín</h1>
        </div>

        {/* Tier Badge Large */}
        <div className="flex items-center justify-between">
          <ReputationBadge score={reputationScore} size="lg" />
          <div className="text-right">
            <p className="text-sm text-slate-600 font-medium">Hạng hiện tại</p>
            <p className="text-3xl font-black text-slate-800 tracking-tight">{reputationScore}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-5 py-6 space-y-6">
        {/* Progress Section */}
        {progress.nextTier && (
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100">
            <h2 className="text-[13px] font-bold text-slate-400 uppercase tracking-wider mb-4">
              Tiến độ đến hạng {progress.nextTier.labelVi}
            </h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-700">
                  {reputationScore} / {progress.nextTierScore} <span className="text-slate-300 font-normal">điểm</span>
                </span>
                <span className="text-sm font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg">{progress.progressPercent}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                <div
                  className={`h-full ${progress.nextTier.textColor.replace('text-', 'bg-')} transition-all duration-500 rounded-full shadow-[0_0_10px_rgba(0,0,0,0.1)]`}
                  style={{ width: `${progress.progressPercent}%` }}
                />
              </div>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                Bạn cần tích lũy thêm <span className="font-bold text-blue-600">{progress.pointsNeeded} điểm</span> nữa
                để thăng hạng <span className="font-bold text-slate-800">{progress.nextTier.labelVi}</span>. Hãy tiếp tục cố gắng!
              </p>
            </div>
          </div>
        )}

        {/* Recent Activity */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100">
          <h2 className="text-[13px] font-bold text-slate-400 uppercase tracking-wider mb-4">
            Lịch sử uy tín
          </h2>

          <div className="space-y-3">
            {mockReputationLogs.map((log) => (
              <div
                key={log.id}
                className="flex items-start justify-between p-4 bg-slate-50/50 rounded-2xl border border-slate-100 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm ${
                      log.type === 'reward'
                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                        : 'bg-rose-50 text-rose-600 border border-rose-100'
                    }`}
                  >
                    {log.type === 'reward' ? (
                      <TrendingUp className="w-5 h-5" />
                    ) : (
                      <TrendingDown className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">{log.action}</p>
                    <p className="text-[11px] text-slate-400 font-medium mt-1">
                      {log.timestamp.toLocaleDateString('vi-VN', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                    {log.jobTitle && (
                      <p className="text-xs text-slate-500 mt-2 bg-white px-2 py-1 rounded-lg border border-slate-100 inline-block">
                        {log.jobTitle}
                      </p>
                    )}
                  </div>
                </div>
                <span
                  className={`text-base font-black flex-shrink-0 ${
                    log.type === 'reward' ? 'text-emerald-600' : 'text-rose-600'
                  }`}
                >
                  {log.type === 'reward' ? '+' : ''}
                  {log.points}
                </span>
              </div>
            ))}
          </div>

          {mockReputationLogs.length === 0 && (
            <div className="py-12 text-center">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-slate-200" />
              </div>
              <p className="text-sm text-slate-400 font-medium italic">Chưa có lịch sử biến động điểm</p>
            </div>
          )}
        </div>

        {/* Benefits Section */}
        <div className="bg-[#1e3a5f] rounded-3xl p-6 shadow-xl relative overflow-hidden text-white">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-400/10 rounded-full blur-2xl" />
          <h2 className="text-[13px] font-bold text-blue-200 uppercase tracking-widest mb-4">
            Quyền lợi hạng {tierInfo.labelVi}
          </h2>
          <ul className="space-y-4">
            {tierInfo.benefits.length > 0 ? tierInfo.benefits.map((benefit, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center shrink-0 mt-0.5 shadow-lg shadow-emerald-500/20">
                  <span className="text-[10px] font-bold">✓</span>
                </div>
                <p className="text-sm font-bold text-blue-50 leading-relaxed">{benefit}</p>
              </li>
            )) : (
              <li className="text-sm text-blue-200 italic font-medium">Hạng này chưa có đặc quyền đặc biệt</li>
            )}
          </ul>
        </div>

        {/* Rules Table */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
          <h2 className="text-[13px] font-bold text-slate-400 uppercase tracking-wider mb-5">
            Quy tắc hệ thống
          </h2>

          <div className="space-y-6">
            <div>
              <h3 className="text-xs font-black text-emerald-600 mb-3 uppercase flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Cộng điểm (+)
              </h3>
              <div className="space-y-2">
                {REPUTATION_RULES.rewards.map((rule, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3 bg-emerald-50/30 rounded-2xl border border-emerald-50">
                    <span className="text-xs font-bold text-slate-700">{rule.actionVi}</span>
                    <span className="text-xs font-black text-emerald-600">+{rule.points}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xs font-black text-rose-600 mb-3 uppercase flex items-center gap-2">
                 <span className="w-1.5 h-1.5 rounded-full bg-rose-500" /> Trừ điểm (-)
              </h3>
              <div className="space-y-2">
                {REPUTATION_RULES.penalties.map((rule, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3 bg-rose-50/30 rounded-2xl border border-rose-50">
                    <span className="text-xs font-bold text-slate-700">{rule.actionVi}</span>
                    <span className="text-xs font-black text-rose-600">{rule.points}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Copy Score Button */}
        <button
          onClick={handleCopyInfo}
          className="w-full bg-slate-900 hover:bg-black text-white font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-3 active:scale-95 shadow-lg shadow-slate-900/20"
        >
          <Copy className="w-5 h-5" />
          Sao chép thông tin uy tín
        </button>
      </div>
    </div>
  );
}

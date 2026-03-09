import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useAuth } from '@/features/auth/context/AuthContext';
import { ArrowLeft, TrendingUp, TrendingDown, Copy } from 'lucide-react';
import { getReputationTier, getProgressToNextTier, REPUTATION_RULES } from '@/features/auth/helpers/reputationHelper';
import { ReputationBadge } from '@/features/auth/components/ReputationBadge';

export const Route = createFileRoute('/employer/profile/reputation')({
  component: ReputationDetailPage,
});

// Mock data - Backend sẽ cung cấp từ `reputation_logs` collection
const mockReputationLogs = [
  {
    id: '1',
    action: 'Hoàn thành ca làm việc',
    type: 'reward' as const,
    points: 10,
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    jobTitle: 'Phục vụ bàn',
  },
  {
    id: '2',
    action: 'Nhận được 5⭐ từ ứng viên',
    type: 'reward' as const,
    points: 5,
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    jobTitle: 'Phục vụ bàn',
    ratedBy: 'Trần Minh Hoàng',
  },
  {
    id: '3',
    action: 'Hủy ca sát giờ',
    type: 'penalty' as const,
    points: -30,
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
            onClick={() => navigate({ to: '/employer/profile' })}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-slate-200 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold">Chi Tiết Uy Tín</h1>
        </div>

        {/* Tier Badge Large */}
        <div className="flex items-center justify-between">
          <ReputationBadge score={reputationScore} size="lg" />
          <div className="text-right">
            <p className="text-sm text-slate-600">Hạng hiện tại</p>
            <p className="text-2xl font-bold text-slate-800">{reputationScore}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-5 py-4 space-y-6">
        {/* Progress Section */}
        {progress.nextTier && (
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
            <h2 className="text-sm font-bold text-slate-800 mb-3">
              Tiến độ đến hạng {progress.nextTier.labelVi}
            </h2>
            <div className="space-y-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-600">
                  {reputationScore} / {progress.nextTierScore}
                </span>
                <span className="text-sm font-bold text-slate-400">{progress.progressPercent}%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                <div
                  className={`h-full ${progress.nextTier.textColor.replace('text-', 'bg-')} transition-all duration-300`}
                  style={{ width: `${progress.progressPercent}%` }}
                />
              </div>
              <p className="text-xs text-slate-500 mt-3">
                Cần thêm <span className="font-bold text-slate-700">{progress.pointsNeeded}</span> điểm
                để đạt hạng <span className="font-bold">{progress.nextTier.labelVi}</span>
              </p>
            </div>
          </div>
        )}

        {/* Tier Info Grid */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
            Thông Tin Hạng {tierInfo.labelVi}
          </h2>

          {/* Quyền lợi */}
          {tierInfo.benefits.length > 0 && (
            <div className="bg-white rounded-xl p-4 shadow-sm border border-emerald-100 bg-emerald-50/50">
              <h3 className="text-xs font-bold text-emerald-700 mb-2 uppercase">✅ Quyền Lợi</h3>
              <ul className="space-y-2">
                {tierInfo.benefits.map((benefit, idx) => (
                  <li key={idx} className="text-sm text-emerald-700 flex items-start gap-2">
                    <span className="text-xs mt-0.5">✓</span>
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Hạn chế */}
          {tierInfo.restrictions.length > 0 && (
            <div className="bg-white rounded-xl p-4 shadow-sm border border-amber-100 bg-amber-50/50">
              <h3 className="text-xs font-bold text-amber-700 mb-2 uppercase">⚠️ Hạn Chế</h3>
              <ul className="space-y-2">
                {tierInfo.restrictions.map((restriction, idx) => (
                  <li key={idx} className="text-sm text-amber-700 flex items-start gap-2">
                    <span className="text-xs mt-0.5">!</span>
                    {restriction}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
          <h2 className="text-sm font-bold text-slate-800 mb-4 uppercase tracking-wider">
            Lịch Sử Biến Động Điểm
          </h2>

          <div className="space-y-2">
            {mockReputationLogs.map((log) => (
              <div
                key={log.id}
                className="flex items-start justify-between p-3 bg-slate-50 rounded-lg border border-slate-100 hover:bg-slate-100 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      log.type === 'reward'
                        ? 'bg-emerald-100 text-emerald-600'
                        : 'bg-red-100 text-red-600'
                    }`}
                  >
                    {log.type === 'reward' ? (
                      <TrendingUp className="w-4 h-4" />
                    ) : (
                      <TrendingDown className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{log.action}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {log.timestamp.toLocaleDateString('vi-VN', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                    {log.jobTitle && (
                      <p className="text-xs text-slate-400 mt-1">"{log.jobTitle}"</p>
                    )}
                  </div>
                </div>
                <span
                  className={`text-sm font-bold flex-shrink-0 ${
                    log.type === 'reward' ? 'text-emerald-600' : 'text-red-600'
                  }`}
                >
                  {log.type === 'reward' ? '+' : ''}
                  {log.points}
                </span>
              </div>
            ))}
          </div>

          {mockReputationLogs.length === 0 && (
            <p className="text-sm text-slate-400 text-center py-6">Chưa có hoạt động</p>
          )}
        </div>

        {/* Explanation Table */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
          <h2 className="text-sm font-bold text-slate-800 mb-4 uppercase tracking-wider">
            Quy Tắc Cộng/Trừ Điểm
          </h2>

          <div className="space-y-2">
            {/* Reward Rules */}
            <div>
              <h3 className="text-xs font-semibold text-emerald-700 mb-2">Cộng Điểm (+)</h3>
              <div className="bg-emerald-50 rounded-lg p-3 space-y-1">
                {REPUTATION_RULES.rewards.map((rule, idx) => (
                  <div key={idx} className="flex justify-between text-xs">
                    <span>{rule.actionVi}</span>
                    <span className="font-bold text-emerald-600">+{rule.points}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Penalty Rules */}
            <div>
              <h3 className="text-xs font-semibold text-red-700 mb-2">Trừ Điểm (-)</h3>
              <div className="bg-red-50 rounded-lg p-3 space-y-1">
                {REPUTATION_RULES.penalties.map((rule, idx) => (
                  <div key={idx} className="flex justify-between text-xs">
                    <span>{rule.actionVi}</span>
                    <span className="font-bold text-red-600">{rule.points}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Copy Score Button */}
        <button
          onClick={handleCopyInfo}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 active:scale-95"
        >
          <Copy className="w-4 h-4" />
          Sao chép Thông Tin Uy Tín
        </button>
      </div>
    </div>
  );
}

import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { AppliedJobsView } from '@/features/jobs/components/AppliedJobsView';
import { SavedJobsView } from '@/features/jobs/components/SavedJobsView';

export const Route = createFileRoute('/candidate/jobs/')({
  component: CandidateJobsPage,
});

type Tab = 'APPLIED' | 'SAVED';

function CandidateJobsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('APPLIED');

  return (
    <div className="min-h-[100dvh] bg-[#F2F4F6] pb-24 font-sans selection:bg-[#006399]/20 selection:text-[#006399]">
      {/* Top Tabs */}
      <div className="bg-white sticky top-14 z-40 border-b border-[#F2F4F6]">
        <div className="flex px-4 pt-2">
          <button
            onClick={() => setActiveTab('APPLIED')}
            className={`flex-1 text-center font-bold text-[15px] pb-3 border-b-2 transition-colors ${
              activeTab === 'APPLIED'
                ? 'border-[#006399] text-[#006399]'
                : 'border-transparent text-[#7C839B] hover:text-[#45464D]'
            }`}
          >
            Đã ứng tuyển
          </button>
          <button
            onClick={() => setActiveTab('SAVED')}
            className={`flex-1 text-center font-bold text-[15px] pb-3 border-b-2 transition-colors ${
              activeTab === 'SAVED'
                ? 'border-[#006399] text-[#006399]'
                : 'border-transparent text-[#7C839B] hover:text-[#45464D]'
            }`}
          >
            Đã lưu
          </button>
        </div>
      </div>

      <div className="p-4">
        {activeTab === 'APPLIED' ? <AppliedJobsView /> : <SavedJobsView />}
      </div>
    </div>
  );
}

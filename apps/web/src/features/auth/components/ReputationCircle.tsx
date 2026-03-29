interface ReputationCircleProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  showLabel?: boolean;
}

export function ReputationCircle({
  score,
  size = 80,
  strokeWidth = 6,
  showLabel = true,
}: ReputationCircleProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  
  // Max score is 500 based on reputation.ts
  const maxScore = 500;
  const percentage = Math.min((score / maxScore) * 100, 100);
  const offset = circumference - (percentage / 100) * circumference;

  // Color mapping based on score
  let strokeColor = '#10B981'; // Emerald (Diamond/Gold)
  if (score < 60) strokeColor = '#EF4444'; // Red (Banned/Restricted)
  else if (score < 100) strokeColor = '#F59E0B'; // Amber (Risk)
  else if (score < 150) strokeColor = '#3B82F6'; // Blue (Standard)

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative" style={{ width: size, height: size }}>
        {/* Background Circle */}
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="transparent"
            className="text-slate-100"
          />
          {/* Progress Circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            style={{ 
              strokeDashoffset: offset,
              transition: 'stroke-dashoffset 0.5s ease-out'
            }}
            strokeLinecap="round"
          />
        </svg>
        
        {/* Score Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-black text-slate-800 leading-none">
            {score}
          </span>
          {showLabel && (
             <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mt-1">
               Điểm
             </span>
          )}
        </div>
      </div>
    </div>
  );
}

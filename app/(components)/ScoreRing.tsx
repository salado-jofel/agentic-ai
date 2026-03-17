type ScoreRingProps = {
  score: number;
  label: string;
  size?: number;
};

export default function ScoreRing({ score, label, size = 80 }: ScoreRingProps) {
  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const color = score >= 80 ? "#22c55e" : score >= 60 ? "#f59e0b" : "#ef4444";

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width={size} height={size} viewBox="0 0 80 80">
        <circle
          cx="40"
          cy="40"
          r={radius}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="8"
        />
        <circle
          cx="40"
          cy="40"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 40 40)"
          style={{ transition: "stroke-dashoffset 0.6s ease" }}
        />
        <text
          x="40"
          y="45"
          textAnchor="middle"
          fontSize="14"
          fontWeight="bold"
          fill={color}
        >
          {score}
        </text>
      </svg>
      <p className="text-xs text-gray-500 text-center">{label}</p>
    </div>
  );
}

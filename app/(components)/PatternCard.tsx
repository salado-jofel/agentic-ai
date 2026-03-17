type Pattern = {
  id: string;
  category: string;
  pattern_type: string;
  description: string;
  recommended_codes: string[];
  success_rate: number;
  usage_count: number;
  trend: "up" | "down" | "stable";
  example_note: string;
};

const trendConfig = {
  up: { icon: "↑", color: "text-green-600 bg-green-50" },
  down: { icon: "↓", color: "text-red-600 bg-red-50" },
  stable: { icon: "→", color: "text-gray-600 bg-gray-50" },
};

const successColor = (rate: number) =>
  rate >= 80
    ? "text-green-600"
    : rate >= 60
      ? "text-yellow-600"
      : "text-red-600";

const successBg = (rate: number) =>
  rate >= 80 ? "bg-green-50" : rate >= 60 ? "bg-yellow-50" : "bg-red-50";

export default function PatternCard({
  pattern,
  onApply,
}: {
  pattern: Pattern;
  onApply: (pattern: Pattern) => void;
}) {
  const trend = trendConfig[pattern.trend];

  return (
    <div
      className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 space-y-4
      hover:shadow-md transition-shadow"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs font-semibold text-purple-600 uppercase tracking-wide">
            {pattern.category}
          </p>
          <h4 className="text-sm font-semibold text-gray-800 mt-0.5">
            {pattern.pattern_type}
          </h4>
        </div>
        <span
          className={`text-xs font-medium px-2 py-1 rounded-full ${trend.color}`}
        >
          {trend.icon} {pattern.trend}
        </span>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-600 leading-relaxed">
        {pattern.description}
      </p>

      {/* Stats Row */}
      <div className="grid grid-cols-2 gap-3">
        <div
          className={`rounded-lg p-3 text-center ${successBg(pattern.success_rate)}`}
        >
          <p
            className={`text-xl font-bold ${successColor(pattern.success_rate)}`}
          >
            {pattern.success_rate}%
          </p>
          <p className="text-xs text-gray-500 mt-0.5">Success Rate</p>
        </div>
        <div className="rounded-lg p-3 text-center bg-blue-50">
          <p className="text-xl font-bold text-blue-600">
            {pattern.usage_count}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">Times Used</p>
        </div>
      </div>

      {/* Recommended Codes */}
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase mb-2">
          Recommended Codes
        </p>
        <div className="flex flex-wrap gap-1.5">
          {pattern.recommended_codes.map((code, i) => (
            <span
              key={i}
              className="text-xs bg-gray-100 text-gray-700 px-2.5 py-1
                rounded-full font-mono"
            >
              {code}
            </span>
          ))}
        </div>
      </div>

      {/* Example Note */}
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase mb-1">
          Example Note
        </p>
        <p className="text-xs text-gray-500 bg-gray-50 rounded-lg p-3 italic leading-relaxed">
          "{pattern.example_note}"
        </p>
      </div>

      {/* Apply Button */}
      <button
        onClick={() => onApply(pattern)}
        className="w-full text-sm bg-purple-50 hover:bg-purple-100 text-purple-700
          font-medium py-2 rounded-lg transition-colors"
      >
        Apply to New Report →
      </button>
    </div>
  );
}

type Insights = {
  top_performing_category: string;
  most_common_codes: string[];
  avg_success_rate: number;
  recommendations: string[];
};

export default function InsightsPanel({ insights }: { insights: Insights }) {
  return (
    <div className="space-y-4">
      {/* Top Stats */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h3 className="font-semibold text-gray-800 mb-4">
          📊 Pattern Insights
        </h3>

        <div className="space-y-4">
          <div>
            <p className="text-xs text-gray-500 uppercase font-semibold mb-1">
              Top Performing Category
            </p>
            <p
              className="text-sm font-semibold text-purple-700 bg-purple-50
              px-3 py-2 rounded-lg"
            >
              🏆 {insights.top_performing_category}
            </p>
          </div>

          <div>
            <p className="text-xs text-gray-500 uppercase font-semibold mb-1">
              Avg Success Rate
            </p>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-2.5 bg-gray-100 rounded-full">
                <div
                  className="h-2.5 bg-green-500 rounded-full transition-all duration-700"
                  style={{ width: `${insights.avg_success_rate}%` }}
                />
              </div>
              <span className="text-sm font-bold text-green-600">
                {insights.avg_success_rate}%
              </span>
            </div>
          </div>

          <div>
            <p className="text-xs text-gray-500 uppercase font-semibold mb-2">
              Most Common Codes
            </p>
            <div className="flex flex-wrap gap-1.5">
              {insights.most_common_codes.map((code, i) => (
                <span
                  key={i}
                  className="text-xs bg-blue-50 text-blue-700 px-2.5 py-1
                    rounded-full font-mono"
                >
                  {code}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* AI Recommendations */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h3 className="font-semibold text-gray-800 mb-3">
          💡 AI Recommendations
        </h3>
        <div className="space-y-2">
          {insights.recommendations.map((rec, i) => (
            <div
              key={i}
              className="flex items-start gap-3 bg-amber-50 border border-amber-100
                rounded-lg px-3 py-2.5"
            >
              <span className="text-amber-500 font-bold text-sm mt-0.5">
                {i + 1}.
              </span>
              <p className="text-xs text-amber-800 leading-relaxed">{rec}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

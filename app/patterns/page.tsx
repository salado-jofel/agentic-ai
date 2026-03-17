"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  FiTrendingUp,
  FiCheckCircle,
  FiLoader,
  FiAlertCircle,
} from "react-icons/fi";
import Header from "../(components)/Header";
import InsightsPanel from "../(components)/InsightsPanel";
import PatternCard from "../(components)/PatternCard";

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

type Insights = {
  top_performing_category: string;
  most_common_codes: string[];
  avg_success_rate: number;
  recommendations: string[];
};

type PatternsResult = {
  patterns: Pattern[];
  insights: Insights;
};

const DEPARTMENTS = [
  "All Departments",
  "Cardiology",
  "ICU",
  "Surgery",
  "Emergency",
  "Oncology",
  "Neurology",
];

const DATE_RANGES = [
  "Last 30 days",
  "Last 90 days",
  "Last 6 months",
  "Last 12 months",
];

export default function PatternsPage() {
  const router = useRouter();
  const [department, setDepartment] = useState("All Departments");
  const [dateRange, setDateRange] = useState("Last 90 days");
  const [result, setResult] = useState<PatternsResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [appliedPattern, setAppliedPattern] = useState<string | null>(null);

  // Auto-load on first visit
  useEffect(() => {
    handleLoad();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleLoad = async () => {
    setError("");
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/patterns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ department, date_range: dateRange }),
      });

      if (!res.ok) throw new Error("Request failed");

      const data: PatternsResult = await res.json();
      setResult(data);
    } catch {
      setError(
        "Failed to load patterns. Check your Gemini API key and try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleApply = (pattern: Pattern) => {
    setAppliedPattern(pattern.pattern_type);
    setTimeout(() => {
      router.push("/reports/new");
    }, 1200);
  };

  return (
    <div>
      <Header title="Historical Patterns" />
      <div className="p-6 space-y-6">
        {/* Filter Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h3 className="font-semibold text-gray-800">Pattern Analysis</h3>
              <p className="text-xs text-gray-400 mt-0.5">
                AI-powered insights from historical QA report data
              </p>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              {/* Department filter */}
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm
                  focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>

              {/* Date range filter */}
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm
                  focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {DATE_RANGES.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>

              <button
                onClick={handleLoad}
                disabled={loading}
                className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50
                  disabled:cursor-not-allowed text-white px-5 py-2 rounded-lg
                  text-sm font-medium transition-colors flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <FiLoader className="animate-spin h-4 w-4" />
                    Loading...
                  </>
                ) : (
                  <>
                    <FiTrendingUp className="h-4 w-4" />
                    Load Patterns
                  </>
                )}
              </button>
            </div>
          </div>

          {error && (
            <div
              className="flex items-center gap-2 text-sm text-red-500
              bg-red-50 px-4 py-2 rounded-lg mt-4"
            >
              <FiAlertCircle className="h-4 w-4 flex-shrink-0" />
              {error}
            </div>
          )}
        </div>

        {/* Applied Pattern Toast */}
        {appliedPattern && (
          <div
            className="bg-green-50 border border-green-200 rounded-xl
            px-5 py-3 flex items-center gap-3"
          >
            <FiCheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
            <p className="text-sm text-green-700 font-medium">
              Pattern <span className="font-bold">"{appliedPattern}"</span>{" "}
              applied — redirecting to report editor...
            </p>
          </div>
        )}

        {/* Loading Skeleton */}
        {loading && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl border border-gray-100
                    p-5 space-y-3 animate-pulse"
                >
                  <div className="h-3 bg-gray-200 rounded w-1/3" />
                  <div className="h-4 bg-gray-200 rounded w-2/3" />
                  <div className="h-12 bg-gray-100 rounded" />
                  <div className="grid grid-cols-2 gap-2">
                    <div className="h-16 bg-gray-100 rounded" />
                    <div className="h-16 bg-gray-100 rounded" />
                  </div>
                </div>
              ))}
            </div>
            <div className="space-y-4">
              <div
                className="bg-white rounded-xl border border-gray-100
                p-5 animate-pulse space-y-3"
              >
                <div className="h-4 bg-gray-200 rounded w-1/2" />
                <div className="h-8 bg-gray-100 rounded" />
                <div className="h-4 bg-gray-100 rounded" />
                <div className="h-4 bg-gray-100 rounded w-3/4" />
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        {!loading && result && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
              {result.patterns.map((pattern) => (
                <PatternCard
                  key={pattern.id}
                  pattern={pattern}
                  onApply={handleApply}
                />
              ))}
            </div>
            <div>
              <InsightsPanel insights={result.insights} />
            </div>
          </div>
        )}

        {/* Empty state */}
        {!loading && !result && !error && (
          <div
            className="bg-white rounded-xl shadow-sm border border-gray-100
            p-16 text-center"
          >
            <FiTrendingUp className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 font-medium">No patterns loaded yet</p>
            <p className="text-sm text-gray-400 mt-1">
              Select filters above and click Load Patterns to begin
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

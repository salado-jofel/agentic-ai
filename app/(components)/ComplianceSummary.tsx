"use client";

import { useEffect, useState } from "react";

type AlertCount = {
  missing_field: number;
  vague_description: number;
  contradiction: number;
  coding_error: number;
  total: number;
};

export default function ComplianceSummary() {
  const [counts, setCounts] = useState<AlertCount>({
    missing_field: 0,
    vague_description: 0,
    contradiction: 0,
    coding_error: 0,
    total: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/alerts/summary")
      .then((r) => r.json())
      .then((data) => {
        setCounts(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const complianceScore =
    counts.total === 0
      ? 100
      : Math.max(0, Math.round(100 - counts.total * 4.5));

  const alertItems = [
    {
      type: "Missing Fields",
      count: counts.missing_field,
      icon: "🔴",
      color: "text-red-500",
    },
    {
      type: "Vague Descriptions",
      count: counts.vague_description,
      icon: "🟡",
      color: "text-yellow-500",
    },
    {
      type: "Contradictions",
      count: counts.contradiction,
      icon: "🔴",
      color: "text-red-500",
    },
    {
      type: "Coding Errors",
      count: counts.coding_error,
      icon: "🟠",
      color: "text-orange-500",
    },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="p-6 border-b border-gray-100">
        <h3 className="font-semibold text-gray-800">Compliance Summary</h3>
        <p className="text-xs text-gray-400 mt-1">
          Active alerts across all reports
        </p>
      </div>
      <div className="p-6 space-y-4">
        {loading ? (
          <div className="space-y-3 animate-pulse">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex justify-between">
                <div className="h-3 bg-gray-200 rounded w-1/2" />
                <div className="h-3 bg-gray-200 rounded w-8" />
              </div>
            ))}
          </div>
        ) : (
          alertItems.map((item) => (
            <div key={item.type} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span>{item.icon}</span>
                <span className="text-sm text-gray-600">{item.type}</span>
              </div>
              <span className={`text-sm font-bold ${item.color}`}>
                {item.count}
              </span>
            </div>
          ))
        )}

        <div className="pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-gray-500">Overall Compliance</span>
            <span className="font-bold text-blue-600">{complianceScore}%</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full">
            <div
              className="h-2 bg-blue-500 rounded-full transition-all duration-700"
              style={{ width: `${complianceScore}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

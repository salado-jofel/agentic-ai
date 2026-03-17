"use client";

import { useState } from "react";
import {
  FiCpu,
  FiX,
  FiLoader,
  FiCheckCircle,
  FiAlertCircle,
  FiClipboard,
  FiSearch,
  FiShield,
  FiAlertTriangle,
} from "react-icons/fi";
import Header from "../(components)/Header";
import AlertBadge from "../(components)/AlertBadge";
import ScoreRing from "../(components)/ScoreRing";
import { FaLightbulb } from "react-icons/fa";

type AnalysisResult = {
  consistency: {
    score: number;
    issues: string[]; // ← was "conflicts"
  };
  structured_data: {
    patient_condition: string;
    procedures: string[];
    diagnoses: string[];
    recommended_codes: string[];
    urgency_level: "low" | "medium" | "high" | "critical";
  };
  integrity: {
    missing_fields: string[];
    vague_terms: string[];
    overall_score: number;
  };
  suggestions: string[];
};

const urgencyColors: Record<string, string> = {
  low: "bg-green-100 text-green-700",
  medium: "bg-yellow-100 text-yellow-700",
  high: "bg-orange-100 text-orange-700",
  critical: "bg-red-100 text-red-700",
};

export default function AnalysisPage() {
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [codes, setCodes] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAnalyze = async () => {
    if (!notes.trim()) {
      setError("Please enter clinician notes to analyze.");
      return;
    }
    setError("");
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, notes, codes }),
      });

      if (!res.ok) throw new Error("Request failed");

      const data: AnalysisResult = await res.json();
      setResult(data);
    } catch {
      setError(
        "Analysis failed. Check your Gemini API key in .env.local and try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setTitle("");
    setNotes("");
    setCodes("");
    setResult(null);
    setError("");
  };

  return (
    <div>
      <Header title="AI Analysis" />
      <div className="p-6 space-y-6">
        {/* Input Panel */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-800">
                Analyze Clinical Report
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Paste report data below for AI-powered QA analysis
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Report Title
              </label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Post-Op Cardiac Assessment"
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Classification Codes
              </label>
              <input
                value={codes}
                onChange={(e) => setCodes(e.target.value)}
                placeholder="e.g. ICD-10: I21.0, CPT: 92941"
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Clinician Notes <span className="text-red-500">*</span>
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={5}
              placeholder="Paste unstructured clinician notes here for AI extraction and analysis..."
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-sm text-red-500 bg-red-50 px-4 py-2 rounded-lg">
              <FiAlertCircle className="h-4 w-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={handleAnalyze}
              disabled={loading}
              className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
            >
              {loading ? (
                <>
                  <FiLoader className="animate-spin h-4 w-4" />
                  Analyzing...
                </>
              ) : (
                <>
                  <FiCpu className="h-4 w-4" />
                  Run AI Analysis
                </>
              )}
            </button>
            <button
              onClick={handleClear}
              className="border border-gray-200 text-gray-600 hover:bg-gray-50 px-6 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
            >
              <FiX className="h-4 w-4" />
              Clear
            </button>
          </div>
        </div>

        {/* Results */}
        {result && (
          <div className="space-y-4">
            {/* Score Overview */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-800 mb-6">
                Analysis Scores
              </h3>
              <div className="flex items-center justify-around flex-wrap gap-6">
                <ScoreRing
                  score={result.consistency.score}
                  label="Consistency"
                />
                <ScoreRing
                  score={result.integrity.overall_score}
                  label="Integrity"
                />
                <ScoreRing
                  score={Math.round(
                    (result.consistency.score +
                      result.integrity.overall_score) /
                      2,
                  )}
                  label="Overall QA"
                  size={100}
                />
                <div className="flex flex-col items-center gap-2">
                  <span
                    className={`px-4 py-2 rounded-full text-sm font-semibold capitalize ${urgencyColors[result.structured_data.urgency_level]}`}
                  >
                    {result.structured_data.urgency_level}
                  </span>
                  <p className="text-xs text-gray-500">Urgency Level</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Structured Data Extraction */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
                <div className="flex items-center gap-2">
                  <FiClipboard className="h-4 w-4 text-gray-500" />
                  <h3 className="font-semibold text-gray-800">
                    Structured Data Extraction
                  </h3>
                </div>

                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-1">
                    Patient Condition
                  </p>
                  <p className="text-sm text-gray-700 bg-gray-50 px-3 py-2 rounded-lg">
                    {result.structured_data.patient_condition || "—"}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-2">
                    Procedures
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {(result.structured_data.procedures ?? []).length > 0 ? (
                      (result.structured_data.procedures ?? []).map((p, i) => (
                        <span
                          key={i}
                          className="text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded-full"
                        >
                          {p}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-gray-400">
                        None detected
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-2">
                    Diagnoses
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {(result.structured_data.diagnoses ?? []).length > 0 ? (
                      (result.structured_data.diagnoses ?? []).map((d, i) => (
                        <span
                          key={i}
                          className="text-xs bg-purple-50 text-purple-700 px-3 py-1 rounded-full"
                        >
                          {d}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-gray-400">
                        None detected
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-2">
                    Recommended Codes
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {(result.structured_data.recommended_codes ?? []).length >
                    0 ? (
                      (result.structured_data.recommended_codes ?? []).map(
                        (c, i) => (
                          <span
                            key={i}
                            className="text-xs bg-green-50 text-green-700 px-3 py-1 rounded-full font-mono"
                          >
                            {c}
                          </span>
                        ),
                      )
                    ) : (
                      <span className="text-xs text-gray-400">
                        None suggested
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Consistency + Integrity */}
              <div className="space-y-4">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <FiSearch className="h-4 w-4 text-gray-500" />
                    <h3 className="font-semibold text-gray-800">
                      Consistency Issues
                    </h3>
                  </div>
                  {(result.consistency.issues ?? []).length === 0 ? (
                    <div className="flex items-center gap-2 text-sm text-green-600">
                      <FiCheckCircle className="h-4 w-4" />
                      No consistency issues found
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {(result.consistency.issues ?? []).map((issue, i) => (
                        <AlertBadge
                          key={i}
                          severity="high"
                          type="contradiction"
                          message={issue}
                        />
                      ))}
                    </div>
                  )}
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <FiShield className="h-4 w-4 text-gray-500" />
                    <h3 className="font-semibold text-gray-800">
                      Integrity Check
                    </h3>
                  </div>

                  {(result.integrity.missing_fields ?? []).length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs font-semibold text-gray-500 uppercase mb-2">
                        Missing Fields
                      </p>
                      <div className="space-y-1">
                        {(result.integrity.missing_fields ?? []).map((f, i) => (
                          <AlertBadge
                            key={i}
                            severity="high"
                            type="missing_field"
                            message={f}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {(result.integrity.vague_terms ?? []).length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase mb-2">
                        Vague Terms
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {(result.integrity.vague_terms ?? []).map((t, i) => (
                          <span
                            key={i}
                            className="flex items-center gap-1 text-xs bg-yellow-50 text-yellow-700 px-3 py-1 rounded-full"
                          >
                            <FiAlertTriangle className="h-3 w-3" />
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {(result.integrity.missing_fields ?? []).length === 0 &&
                    (result.integrity.vague_terms ?? []).length === 0 && (
                      <div className="flex items-center gap-2 text-sm text-green-600">
                        <FiCheckCircle className="h-4 w-4" />
                        Integrity check passed
                      </div>
                    )}
                </div>
              </div>
            </div>

            {/* AI Suggestions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-2 mb-4">
                <FaLightbulb className="h-4 w-4 text-gray-500" />
                <h3 className="font-semibold text-gray-800">AI Suggestions</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {(result.suggestions ?? []).map((s, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 bg-purple-50 rounded-lg p-4"
                  >
                    <span className="text-purple-400 font-bold text-sm mt-0.5">
                      {i + 1}.
                    </span>
                    <p className="text-sm text-purple-800">{s}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

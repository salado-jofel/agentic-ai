"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  FiCheckCircle,
  FiXCircle,
  FiInfo,
  FiSave,
  FiLoader,
  FiCpu,
  FiShield,
  FiAlertTriangle,
  FiSearch,
} from "react-icons/fi";
import Header from "@/app/(components)/Header";
import AlertBadge from "@/app/(components)/AlertBadge";
import ScoreRing from "@/app/(components)/ScoreRing";

type Alert = {
  id: string;
  type: string;
  severity: "low" | "medium" | "high";
  message: string;
};

type AIResult = {
  consistency: { score: number; issues: string[] };
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

type FormData = {
  title: string;
  status: string;
  clinician_notes: string;
  classification_codes: string;
  patient_id: string;
  department: string;
  procedure_date: string;
};

const urgencyColors: Record<string, string> = {
  low: "bg-green-100 text-green-700",
  medium: "bg-yellow-100 text-yellow-700",
  high: "bg-orange-100 text-orange-700",
  critical: "bg-red-100 text-red-700",
};

function runComplianceChecks(form: FormData): Alert[] {
  const alerts: Alert[] = [];

  if (!form.title.trim()) {
    alerts.push({
      id: "1",
      type: "missing_field",
      severity: "high",
      message: "Report title is required.",
    });
  }
  if (!form.patient_id.trim()) {
    alerts.push({
      id: "2",
      type: "missing_field",
      severity: "high",
      message: "Patient ID is required for compliance.",
    });
  }
  if (!form.procedure_date) {
    alerts.push({
      id: "3",
      type: "missing_field",
      severity: "high",
      message: "Procedure date must be specified.",
    });
  }
  if (
    form.clinician_notes.trim().length > 0 &&
    form.clinician_notes.trim().length < 30
  ) {
    alerts.push({
      id: "4",
      type: "vague_description",
      severity: "medium",
      message:
        "Clinician notes are too brief. Provide more detail to avoid rejection.",
    });
  }
  if (!form.clinician_notes.trim()) {
    alerts.push({
      id: "5",
      type: "missing_field",
      severity: "high",
      message: "Clinician notes cannot be empty.",
    });
  }
  if (!form.classification_codes.trim()) {
    alerts.push({
      id: "6",
      type: "coding_error",
      severity: "medium",
      message:
        "No classification codes provided. At least one code is required.",
    });
  }
  if (
    form.clinician_notes.toLowerCase().includes("stable") &&
    form.clinician_notes.toLowerCase().includes("critical")
  ) {
    alerts.push({
      id: "7",
      type: "contradiction",
      severity: "high",
      message:
        'Contradiction detected: "stable" and "critical" used together in notes.',
    });
  }
  if (
    form.clinician_notes.toLowerCase().includes("improving") &&
    form.clinician_notes.toLowerCase().includes("deteriorating")
  ) {
    alerts.push({
      id: "8",
      type: "contradiction",
      severity: "high",
      message:
        'Contradiction detected: "improving" and "deteriorating" found in the same note.',
    });
  }
  if (!form.department.trim()) {
    alerts.push({
      id: "9",
      type: "missing_field",
      severity: "low",
      message: "Department field is empty. Recommended for audit trail.",
    });
  }

  return alerts;
}

export default function NewReportPage() {
  const router = useRouter();

  const [form, setForm] = useState<FormData>({
    title: "",
    status: "draft",
    clinician_notes: "",
    classification_codes: "",
    patient_id: "",
    department: "",
    procedure_date: "",
  });

  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(null);

  // AI state
  const [aiResult, setAiResult] = useState<AIResult | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  const [aiAnalyzed, setAiAnalyzed] = useState(false);

  const highCount = alerts.filter((a) => a.severity === "high").length;
  const medCount = alerts.filter((a) => a.severity === "medium").length;
  const lowCount = alerts.filter((a) => a.severity === "low").length;

  const aiPassed = aiResult
    ? aiResult.consistency.score >= 60 && aiResult.integrity.overall_score >= 60
    : false;

  const overallScore = aiResult
    ? Math.round(
        (aiResult.consistency.score + aiResult.integrity.overall_score) / 2,
      )
    : 0;

  const canSave = highCount === 0 && aiAnalyzed && aiPassed;

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const updated = { ...form, [e.target.name]: e.target.value };
    setForm(updated);
    setAlerts(runComplianceChecks(updated));
    setSaved(false);
    setAiResult(null);
    setAiAnalyzed(false);
    setAiError("");
  };

  const handleAIAnalyze = async () => {
    const currentAlerts = runComplianceChecks(form);
    setAlerts(currentAlerts);

    const highAlerts = currentAlerts.filter(
      (a) => a.severity === "high",
    ).length;
    if (highAlerts > 0) {
      setAiError("Fix all critical issues before running AI analysis.");
      return;
    }

    if (!form.clinician_notes.trim()) {
      setAiError("Please enter clinician notes before analyzing.");
      return;
    }

    setAiError("");
    setAiLoading(true);
    setAiResult(null);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          notes: form.clinician_notes,
          codes: form.classification_codes,
        }),
      });

      if (!res.ok) throw new Error("Analysis failed");

      const data: AIResult = await res.json();
      setAiResult(data);
      setAiAnalyzed(true);
    } catch {
      setAiError("AI analysis failed. Check your Gemini API key.");
    } finally {
      setAiLoading(false);
    }
  };

  const handleSave = async () => {
    if (!canSave) return;

    setSaving(true);
    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          structured_data: aiResult?.structured_data ?? null,
        }),
      });

      if (!res.ok) throw new Error("Failed to save");
      const report = await res.json();
      setSavedId(report.id);
      setSaved(true);

      if (alerts.length > 0) {
        await fetch("/api/alerts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ report_id: report.id, alerts }),
        });
      }
    } catch {
      setSaved(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <Header title="New Report" />
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form — left 2/3 */}
          <div className="lg:col-span-2 space-y-5">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-5">
              <h3 className="font-semibold text-gray-800">Report Details</h3>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Report Title <span className="text-red-500">*</span>
                </label>
                <input
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="e.g. Patient Discharge Report — Ward 3B"
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Patient ID + Department */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Patient ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="patient_id"
                    value={form.patient_id}
                    onChange={handleChange}
                    placeholder="e.g. PT-00421"
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Department
                  </label>
                  <input
                    name="department"
                    value={form.department}
                    onChange={handleChange}
                    placeholder="e.g. Cardiology"
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Procedure Date + Status */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Procedure Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="procedure_date"
                    value={form.procedure_date}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="draft">Draft</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>

              {/* Classification Codes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Classification Codes <span className="text-red-500">*</span>
                </label>
                <input
                  name="classification_codes"
                  value={form.classification_codes}
                  onChange={handleChange}
                  placeholder="e.g. ICD-10: I21.0, CPT: 92941"
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Separate multiple codes with commas
                </p>
              </div>

              {/* Clinician Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Clinician Notes <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="clinician_notes"
                  value={form.clinician_notes}
                  onChange={handleChange}
                  rows={6}
                  placeholder="Enter detailed clinical observations, procedures performed, patient condition..."
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
                <p className="text-xs text-gray-400 mt-1">
                  {form.clinician_notes.length} characters
                  {form.clinician_notes.length < 30 &&
                    form.clinician_notes.length > 0 && (
                      <span className="text-yellow-500 ml-2">
                        — minimum 30 recommended
                      </span>
                    )}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-wrap items-center gap-3">
              <button
                onClick={handleAIAnalyze}
                disabled={aiLoading || highCount > 0}
                className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
              >
                {aiLoading ? (
                  <>
                    <FiLoader className="animate-spin h-4 w-4" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <FiCpu className="h-4 w-4" />
                    Step 1: Run AI Analysis
                  </>
                )}
              </button>

              <button
                onClick={handleSave}
                disabled={saving || !canSave}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <FiLoader className="animate-spin h-4 w-4" />
                    Saving...
                  </>
                ) : (
                  <>
                    <FiSave className="h-4 w-4" />
                    Step 2: Save Report
                  </>
                )}
              </button>

              {highCount > 0 && (
                <span className="flex items-center gap-1.5 text-red-500 text-sm">
                  <FiXCircle className="h-4 w-4" />
                  Fix {highCount} critical issue{highCount > 1 ? "s" : ""} first
                </span>
              )}

              {aiError && (
                <span className="flex items-center gap-1.5 text-red-500 text-sm">
                  <FiAlertTriangle className="h-4 w-4" />
                  {aiError}
                </span>
              )}

              {aiAnalyzed && !aiPassed && (
                <span className="flex items-center gap-1.5 text-orange-500 text-sm">
                  <FiAlertTriangle className="h-4 w-4" />
                  AI score too low — improve notes and re-analyze
                </span>
              )}

              {aiAnalyzed && aiPassed && !saved && (
                <span className="flex items-center gap-1.5 text-green-600 text-sm">
                  <FiCheckCircle className="h-4 w-4" />
                  AI analysis passed — ready to save
                </span>
              )}

              {saved && savedId && (
                <span className="flex items-center gap-1.5 text-green-600 text-sm font-medium">
                  <FiCheckCircle className="h-4 w-4" />
                  Saved!{" "}
                  <button
                    onClick={() => router.push("/")}
                    className="underline hover:text-green-700"
                  >
                    Back to Dashboard
                  </button>
                </span>
              )}
            </div>

            {/* AI Analysis Results */}
            {aiResult && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FiCpu className="h-4 w-4 text-purple-500" />
                    <h3 className="font-semibold text-gray-800">
                      AI Analysis Results
                    </h3>
                  </div>
                  <span
                    className={`text-xs px-3 py-1 rounded-full font-medium ${
                      aiPassed
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {aiPassed
                      ? "Passed — Ready to Save"
                      : "Failed — Needs Improvement"}
                  </span>
                </div>

                {/* Score rings */}
                <div className="flex items-center justify-around flex-wrap gap-4 py-2">
                  <ScoreRing
                    score={aiResult.consistency.score}
                    label="Consistency"
                  />
                  <ScoreRing
                    score={aiResult.integrity.overall_score}
                    label="Integrity"
                  />
                  <ScoreRing
                    score={overallScore}
                    label="Overall QA"
                    size={100}
                  />
                  <div className="flex flex-col items-center gap-2">
                    <span
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold capitalize ${urgencyColors[aiResult.structured_data.urgency_level]}`}
                    >
                      {aiResult.structured_data.urgency_level}
                    </span>
                    <p className="text-xs text-gray-500">Urgency</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Extracted Data */}
                  <div className="space-y-3">
                    <p className="text-xs font-semibold text-gray-500 uppercase">
                      Extracted Data
                    </p>

                    <div>
                      <p className="text-xs text-gray-400 mb-1">
                        Patient Condition
                      </p>
                      <p className="text-sm text-gray-700 bg-gray-50 px-3 py-2 rounded-lg">
                        {aiResult.structured_data.patient_condition || "—"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-400 mb-1">Procedures</p>
                      <div className="flex flex-wrap gap-1.5">
                        {(aiResult.structured_data.procedures ?? []).length >
                        0 ? (
                          (aiResult.structured_data.procedures ?? []).map(
                            (p, i) => (
                              <span
                                key={i}
                                className="text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full"
                              >
                                {p}
                              </span>
                            ),
                          )
                        ) : (
                          <span className="text-xs text-gray-400">
                            None detected
                          </span>
                        )}
                      </div>
                    </div>

                    <div>
                      <p className="text-xs text-gray-400 mb-1">
                        Recommended Codes
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {(aiResult.structured_data.recommended_codes ?? [])
                          .length > 0 ? (
                          (
                            aiResult.structured_data.recommended_codes ?? []
                          ).map((c, i) => (
                            <span
                              key={i}
                              className="text-xs bg-green-50 text-green-700 px-2.5 py-1 rounded-full font-mono"
                            >
                              {c}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-gray-400">
                            None suggested
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Issues */}
                  <div className="space-y-3">
                    {/* Consistency */}
                    <div>
                      <div className="flex items-center gap-1.5 mb-2">
                        <FiSearch className="h-3.5 w-3.5 text-gray-400" />
                        <p className="text-xs font-semibold text-gray-500 uppercase">
                          Consistency
                        </p>
                      </div>
                      {(aiResult.consistency.issues ?? []).length === 0 ? (
                        <div className="flex items-center gap-1.5 text-xs text-green-600">
                          <FiCheckCircle className="h-3.5 w-3.5" />
                          No issues found
                        </div>
                      ) : (
                        <div className="space-y-1">
                          {(aiResult.consistency.issues ?? []).map(
                            (issue, i) => (
                              <AlertBadge
                                key={i}
                                severity="high"
                                type="contradiction"
                                message={issue}
                              />
                            ),
                          )}
                        </div>
                      )}
                    </div>

                    {/* Integrity */}
                    <div>
                      <div className="flex items-center gap-1.5 mb-2">
                        <FiShield className="h-3.5 w-3.5 text-gray-400" />
                        <p className="text-xs font-semibold text-gray-500 uppercase">
                          Integrity
                        </p>
                      </div>
                      {(aiResult.integrity.missing_fields ?? []).length === 0 &&
                      (aiResult.integrity.vague_terms ?? []).length === 0 ? (
                        <div className="flex items-center gap-1.5 text-xs text-green-600">
                          <FiCheckCircle className="h-3.5 w-3.5" />
                          Integrity check passed
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {(aiResult.integrity.missing_fields ?? []).map(
                            (f, i) => (
                              <AlertBadge
                                key={i}
                                severity="high"
                                type="missing_field"
                                message={f}
                              />
                            ),
                          )}
                          {/* ✅ FIXED: vague terms as inline wrapping chips */}
                          {(aiResult.integrity.vague_terms ?? []).length >
                            0 && (
                            <div className="flex flex-wrap gap-1.5 pt-1">
                              {(aiResult.integrity.vague_terms ?? []).map(
                                (t, i) => (
                                  <span
                                    key={i}
                                    className="inline-flex items-center gap-1 text-xs font-medium bg-yellow-50 text-yellow-700 border border-yellow-200 px-2.5 py-1 rounded-full whitespace-nowrap"
                                  >
                                    <FiAlertTriangle className="h-3 w-3 flex-shrink-0" />
                                    {t}
                                  </span>
                                ),
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* AI Suggestions */}
                {(aiResult.suggestions ?? []).length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-2">
                      AI Suggestions
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      {(aiResult.suggestions ?? []).map((s, i) => (
                        <div
                          key={i}
                          className="flex items-start gap-2 bg-purple-50 rounded-lg p-3"
                        >
                          <span className="text-purple-400 font-bold text-xs mt-0.5 flex-shrink-0">
                            {i + 1}.
                          </span>
                          <p className="text-xs text-purple-800">{s}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Compliance Panel — right 1/3 */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <h3 className="font-semibold text-gray-800 mb-1">
                Live Compliance Feedback
              </h3>
              <p className="text-xs text-gray-400 mb-4">Updates as you type</p>

              {/* Alert counts */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="text-center p-2 bg-red-50 rounded-lg">
                  <p className="text-xl font-bold text-red-500">{highCount}</p>
                  <p className="text-xs text-red-400">Critical</p>
                </div>
                <div className="text-center p-2 bg-yellow-50 rounded-lg">
                  <p className="text-xl font-bold text-yellow-500">
                    {medCount}
                  </p>
                  <p className="text-xs text-yellow-400">Warning</p>
                </div>
                <div className="text-center p-2 bg-blue-50 rounded-lg">
                  <p className="text-xl font-bold text-blue-500">{lowCount}</p>
                  <p className="text-xs text-blue-400">Info</p>
                </div>
              </div>

              {/* Submission Checklist */}
              <div className="mb-4 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">Submission Checklist</span>
                </div>
                <div
                  className={`flex items-center gap-2 text-xs px-3 py-2 rounded-lg ${
                    highCount === 0
                      ? "bg-green-50 text-green-700"
                      : "bg-red-50 text-red-600"
                  }`}
                >
                  {highCount === 0 ? (
                    <FiCheckCircle className="h-3.5 w-3.5" />
                  ) : (
                    <FiXCircle className="h-3.5 w-3.5" />
                  )}
                  UI Validation{" "}
                  {highCount === 0 ? "Passed" : `(${highCount} issues)`}
                </div>
                <div
                  className={`flex items-center gap-2 text-xs px-3 py-2 rounded-lg ${
                    aiLoading
                      ? "bg-purple-50 text-purple-600"
                      : aiAnalyzed && aiPassed
                        ? "bg-green-50 text-green-700"
                        : aiAnalyzed && !aiPassed
                          ? "bg-red-50 text-red-600"
                          : "bg-gray-50 text-gray-500"
                  }`}
                >
                  {aiLoading ? (
                    <FiLoader className="h-3.5 w-3.5 animate-spin" />
                  ) : aiAnalyzed && aiPassed ? (
                    <FiCheckCircle className="h-3.5 w-3.5" />
                  ) : aiAnalyzed && !aiPassed ? (
                    <FiXCircle className="h-3.5 w-3.5" />
                  ) : (
                    <FiCpu className="h-3.5 w-3.5" />
                  )}
                  AI Analysis{" "}
                  {aiLoading
                    ? "Running..."
                    : aiAnalyzed && aiPassed
                      ? `Passed (${overallScore}/100)`
                      : aiAnalyzed && !aiPassed
                        ? `Failed (${overallScore}/100)`
                        : "Not run yet"}
                </div>
                <div
                  className={`flex items-center gap-2 text-xs px-3 py-2 rounded-lg ${
                    canSave
                      ? "bg-blue-50 text-blue-700"
                      : "bg-gray-50 text-gray-400"
                  }`}
                >
                  {canSave ? (
                    <FiCheckCircle className="h-3.5 w-3.5" />
                  ) : (
                    <FiSave className="h-3.5 w-3.5" />
                  )}
                  Ready to Save{" "}
                  {canSave ? "— Go ahead!" : "— Complete steps above"}
                </div>
              </div>

              {/* Alerts list */}
              <div className="space-y-2">
                {alerts.length === 0 && (
                  <div className="text-center py-6">
                    <FiCheckCircle className="h-8 w-8 text-green-500 mx-auto" />
                    <p className="text-sm text-green-600 font-medium mt-2">
                      No issues detected
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Start filling the form to check compliance
                    </p>
                  </div>
                )}
                {alerts.map((alert) => (
                  <AlertBadge
                    key={alert.id}
                    severity={alert.severity}
                    message={alert.message}
                    type={alert.type}
                  />
                ))}
              </div>
            </div>

            {/* Tips box */}
            <div className="bg-blue-50 rounded-xl border border-blue-100 p-4">
              <div className="flex items-center gap-1.5 mb-2">
                <FiInfo className="h-3.5 w-3.5 text-blue-700" />
                <p className="text-xs font-semibold text-blue-700">
                  Quick Tips
                </p>
              </div>
              <ul className="text-xs text-blue-600 space-y-1 list-disc list-inside">
                <li>Fix all critical issues first</li>
                <li>Run AI Analysis before saving</li>
                <li>AI score must be 60+ to save</li>
                <li>Use specific ICD-10 and CPT codes</li>
                <li>Notes should be at least 30 characters</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

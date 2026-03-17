"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import {
  FiCheckCircle,
  FiXCircle,
  FiAlertTriangle,
  FiInfo,
  FiSave,
  FiLoader,
} from "react-icons/fi";
import Header from "@/app/(components)/Header";
import AlertBadge from "@/app/(components)/AlertBadge";

type Alert = {
  id: string;
  type: string;
  severity: "low" | "medium" | "high";
  message: string;
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
  const router = useRouter();

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const updated = { ...form, [e.target.name]: e.target.value };
    setForm(updated);
    setAlerts(runComplianceChecks(updated));
    setSaved(false);
  };

  const handleSave = async () => {
    const currentAlerts = runComplianceChecks(form);
    setAlerts(currentAlerts);

    const highCount = currentAlerts.filter((a) => a.severity === "high").length;
    if (highCount > 0) return;

    setSaving(true);
    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error("Failed to save");
      const report = await res.json();
      setSavedId(report.id);
      setSaved(true);

      if (currentAlerts.length > 0) {
        await fetch("/api/alerts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            report_id: report.id,
            alerts: currentAlerts,
          }),
        });
      }
    } catch {
      setSaved(false);
    } finally {
      setSaving(false);
    }
  };

  const highCount = alerts.filter((a) => a.severity === "high").length;
  const medCount = alerts.filter((a) => a.severity === "medium").length;
  const lowCount = alerts.filter((a) => a.severity === "low").length;

  return (
    <div>
      <Header title="New Report" />
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form — left 2/3 */}
          <div className="lg:col-span-2 space-y-5">
            <div
              className="bg-white rounded-xl shadow-sm border border-gray-100
              p-6 space-y-5"
            >
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
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5
                    text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5
                      text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5
                      text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5
                      text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5
                      text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5
                    text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5
                    text-sm focus:outline-none focus:ring-2 focus:ring-blue-500
                    resize-none"
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

            {/* Save Button */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50
                  disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-lg
                  text-sm font-medium transition-colors flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <FiLoader className="animate-spin h-4 w-4" />
                    Saving...
                  </>
                ) : (
                  <>
                    <FiSave className="h-4 w-4" />
                    Save Report
                  </>
                )}
              </button>

              {/* Saved confirmation */}
              {saved && savedId && (
                <span
                  className="flex items-center gap-1.5 text-green-600
                  text-sm font-medium"
                >
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

              {/* Critical issues blocker */}
              {highCount > 0 && !saved && (
                <span className="flex items-center gap-1.5 text-red-500 text-sm">
                  <FiXCircle className="h-4 w-4" />
                  Fix {highCount} critical issue{highCount > 1 ? "s" : ""}{" "}
                  before saving
                </span>
              )}
            </div>
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
                <li>Use specific ICD-10 and CPT codes</li>
                <li>Avoid contradicting status terms</li>
                <li>Notes should be at least 30 characters</li>
                <li>Always include Patient ID for audit trail</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

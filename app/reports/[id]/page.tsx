import { notFound } from "next/navigation";
import Link from "next/link";
import { createServerClient } from "@/lib/supabase-server";
import Header from "@/app/(components)/Header";
import AlertBadge from "@/app/(components)/AlertBadge";

export const dynamic = "force-dynamic";

const statusStyles: Record<string, string> = {
  draft: "bg-gray-100 text-gray-600",
  pending: "bg-yellow-100 text-yellow-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
};

export default async function ReportDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // ✅ await params first — required in Next.js 15
  const { id } = await params;

  const supabase = createServerClient();

  const { data: report, error } = await supabase
    .from("reports")
    .select("*, compliance_alerts(*), audit_log(*)")
    .eq("id", id)
    .single();

  if (error || !report) notFound();

  const alerts = report.compliance_alerts ?? [];
  const logs = report.audit_log ?? [];

  return (
    <div>
      <Header title="Report Detail" />
      <div className="p-6 space-y-6">
        {/* Back + Title Row */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-sm text-gray-500 hover:text-gray-700
                flex items-center gap-1 transition-colors"
            >
              ← Back to Dashboard
            </Link>
            <span className="text-gray-300">|</span>
            <span
              className={`text-xs font-medium px-3 py-1 rounded-full
                capitalize ${statusStyles[report.status]}`}
            >
              {report.status}
            </span>
          </div>
          <Link
            href="/analysis"
            className="bg-purple-600 hover:bg-purple-700 text-white
              px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            🤖 Run AI Analysis
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Report Info */}
          <div className="lg:col-span-2 space-y-4">
            <div
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-6
              space-y-5"
            >
              <h2 className="text-xl font-bold text-gray-800">
                {report.title}
              </h2>

              {/* Meta grid */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase mb-1">
                    Patient ID
                  </p>
                  <p className="text-sm text-gray-700 font-medium">
                    {report.patient_id || "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase mb-1">
                    Department
                  </p>
                  <p className="text-sm text-gray-700 font-medium">
                    {report.department || "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase mb-1">
                    Procedure Date
                  </p>
                  <p className="text-sm text-gray-700 font-medium">
                    {report.procedure_date
                      ? new Date(report.procedure_date).toLocaleDateString()
                      : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase mb-1">
                    Created
                  </p>
                  <p className="text-sm text-gray-700 font-medium">
                    {new Date(report.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Classification Codes */}
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase mb-2">
                  Classification Codes
                </p>
                <div className="flex flex-wrap gap-2">
                  {report.classification_codes?.length > 0 ? (
                    report.classification_codes.map(
                      (code: string, i: number) => (
                        <span
                          key={i}
                          className="text-xs bg-blue-50 text-blue-700
                            px-3 py-1 rounded-full font-mono"
                        >
                          {code}
                        </span>
                      ),
                    )
                  ) : (
                    <span className="text-xs text-gray-400">
                      No codes added
                    </span>
                  )}
                </div>
              </div>

              {/* Clinician Notes */}
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase mb-2">
                  Clinician Notes
                </p>
                <div
                  className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700
                  leading-relaxed whitespace-pre-wrap"
                >
                  {report.clinician_notes || "No notes recorded."}
                </div>
              </div>
            </div>

            {/* Audit Log */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-800 mb-4">
                📋 Audit Trail
              </h3>
              {logs.length === 0 ? (
                <p className="text-sm text-gray-400">No audit entries found.</p>
              ) : (
                <div className="space-y-3">
                  {logs.map(
                    (log: {
                      id: string;
                      action: string;
                      performed_at: string;
                      details: Record<string, unknown>;
                    }) => (
                      <div
                        key={log.id}
                        className="flex items-start gap-3 text-sm"
                      >
                        <span className="mt-0.5 text-blue-400">●</span>
                        <div>
                          <span className="font-medium text-gray-700 capitalize">
                            {log.action.replace(/_/g, " ")}
                          </span>
                          <span className="text-gray-400 text-xs ml-2">
                            {new Date(log.performed_at).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ),
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Alerts Sidebar */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-800">
                  Compliance Alerts
                </h3>
                <span
                  className={`text-xs px-2 py-1 rounded-full font-medium
                    ${
                      alerts.length > 0
                        ? "bg-red-50 text-red-600"
                        : "bg-green-50 text-green-600"
                    }`}
                >
                  {alerts.length} total
                </span>
              </div>

              {alerts.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-2xl">✅</p>
                  <p className="text-sm text-green-600 font-medium mt-2">
                    No alerts found
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    This report passed all checks
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {alerts.map(
                    (alert: {
                      id: string;
                      alert_type: string;
                      severity: "low" | "medium" | "high";
                      message: string;
                      resolved: boolean;
                    }) =>
                      !alert.resolved && (
                        <AlertBadge
                          key={alert.id}
                          type={alert.alert_type}
                          severity={alert.severity}
                          message={alert.message}
                        />
                      ),
                  )}
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <h3 className="font-semibold text-gray-800 mb-3">
                Quick Actions
              </h3>
              <div className="space-y-2">
                <Link
                  href="/analysis"
                  className="flex items-center gap-2 w-full text-sm
                    bg-purple-50 hover:bg-purple-100 text-purple-700
                    px-4 py-2.5 rounded-lg transition-colors font-medium"
                >
                  🤖 Analyze with AI
                </Link>
                <Link
                  href="/patterns"
                  className="flex items-center gap-2 w-full text-sm
                    bg-blue-50 hover:bg-blue-100 text-blue-700
                    px-4 py-2.5 rounded-lg transition-colors font-medium"
                >
                  📈 View Patterns
                </Link>
                <Link
                  href="/reports/new"
                  className="flex items-center gap-2 w-full text-sm
                    bg-gray-50 hover:bg-gray-100 text-gray-700
                    px-4 py-2.5 rounded-lg transition-colors font-medium"
                >
                  📝 New Report
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

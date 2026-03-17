import Link from "next/link";

type Report = {
  id: string;
  title: string;
  status: "draft" | "pending" | "approved" | "rejected";
  created_at: string;
  alerts: number;
};

const statusStyles: Record<string, string> = {
  draft: "bg-gray-100 text-gray-600",
  pending: "bg-yellow-100 text-yellow-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
};

export default function RecentReports({ reports }: { reports: Report[] }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="p-6 border-b border-gray-100">
        <h3 className="font-semibold text-gray-800">Recent Reports</h3>
      </div>
      <div className="divide-y divide-gray-50">
        {reports.length === 0 && (
          <p className="text-sm text-gray-400 p-6">No reports yet.</p>
        )}
        {reports.map((report) => (
          <Link
            key={report.id}
            href={`/reports/${report.id}`}
            className="flex items-center justify-between px-6 py-4
              hover:bg-gray-50 transition-colors"
          >
            <div>
              <p className="text-sm font-medium text-gray-800">
                {report.title}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                {new Date(report.created_at).toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {report.alerts > 0 && (
                <span className="text-xs bg-red-50 text-red-500 px-2 py-1 rounded-full">
                  ⚠️ {report.alerts} alerts
                </span>
              )}
              <span
                className={`text-xs font-medium px-3 py-1 rounded-full
                  capitalize ${statusStyles[report.status]}`}
              >
                {report.status}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

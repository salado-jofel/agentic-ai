import { createServerClient } from "@/lib/supabase-server";
import {
  FiFileText,
  FiClock,
  FiCheckCircle,
  FiAlertTriangle,
} from "react-icons/fi";
import ComplianceSummary from "./(components)/ComplianceSummary";
import Header from "./(components)/Header";
import RecentReports from "./(components)/RecentReports";
import StatCard from "./(components)/StatCard";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const supabase = createServerClient();

  const { data: reports = [] } = await supabase
    .from("reports")
    .select("*, compliance_alerts(count)")
    .order("created_at", { ascending: false })
    .limit(10);

  const { data: alerts = [] } = await supabase
    .from("compliance_alerts")
    .select("severity, resolved")
    .eq("resolved", false);

  const total = reports?.length ?? 0;
  const pending = reports?.filter((r) => r.status === "pending").length ?? 0;
  const approved = reports?.filter((r) => r.status === "approved").length ?? 0;
  const activeAlerts = alerts?.length ?? 0;

  const formattedReports =
    reports?.map((r) => ({
      id: r.id,
      title: r.title,
      status: r.status,
      created_at: r.created_at,
      alerts: r.compliance_alerts?.[0]?.count ?? 0,
    })) ?? [];

  return (
    <div>
      <Header title="Dashboard" />
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
        {/* Stat cards — 2 col on mobile, 4 on desktop */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <StatCard
            label="Total Reports"
            value={total}
            icon={<FiFileText className="h-5 w-5 sm:h-6 sm:w-6" />}
            color="bg-blue-50 text-blue-600"
            sub="All time"
          />
          <StatCard
            label="Pending Review"
            value={pending}
            icon={<FiClock className="h-5 w-5 sm:h-6 sm:w-6" />}
            color="bg-yellow-50 text-yellow-600"
            sub="Needs action"
          />
          <StatCard
            label="Approved"
            value={approved}
            icon={<FiCheckCircle className="h-5 w-5 sm:h-6 sm:w-6" />}
            color="bg-green-50 text-green-600"
            sub={`${total > 0 ? Math.round((approved / total) * 100) : 0}% rate`}
          />
          <StatCard
            label="Active Alerts"
            value={activeAlerts}
            icon={<FiAlertTriangle className="h-5 w-5 sm:h-6 sm:w-6" />}
            color="bg-red-50 text-red-600"
            sub="Unresolved"
          />
        </div>

        {/* Reports + compliance — stacked on mobile, side by side on desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <RecentReports reports={formattedReports} />
          </div>
          <div>
            <ComplianceSummary />
          </div>
        </div>
      </div>
    </div>
  );
}

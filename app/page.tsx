
import { createServerClient } from "@/lib/supabase-server";
import Header from "./(components)/Header";
import ComplianceSummary from "./(components)/ComplianceSummary";
import RecentReports from "./(components)/RecentReports";
import StatCard from "./(components)/StatCard";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const supabase = createServerClient();

  // Fetch reports
  const { data: reports = [] } = await supabase
    .from("reports")
    .select("*, compliance_alerts(count)")
    .order("created_at", { ascending: false })
    .limit(10);

  // Fetch alert counts
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
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Total Reports"
            value={total}
            icon="📋"
            color="bg-blue-50 text-blue-600"
            sub="All time"
          />
          <StatCard
            label="Pending Review"
            value={pending}
            icon="⏳"
            color="bg-yellow-50 text-yellow-600"
            sub="Needs action"
          />
          <StatCard
            label="Approved"
            value={approved}
            icon="✅"
            color="bg-green-50 text-green-600"
            sub={`${total > 0 ? Math.round((approved / total) * 100) : 0}% rate`}
          />
          <StatCard
            label="Active Alerts"
            value={activeAlerts}
            icon="⚠️"
            color="bg-red-50 text-red-600"
            sub="Unresolved"
          />
        </div>

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

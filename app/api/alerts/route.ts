import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";

// POST — save compliance alerts for a report
export async function POST(req: NextRequest) {
  const supabase = createServerClient();
  const { report_id, alerts } = await req.json();

  // Clear old unresolved alerts for this report
  await supabase
    .from("compliance_alerts")
    .delete()
    .eq("report_id", report_id)
    .eq("resolved", false);

  if (!alerts || alerts.length === 0) {
    return NextResponse.json({ success: true });
  }

  const rows = alerts.map(
    (a: { type: string; severity: string; message: string }) => ({
      report_id,
      alert_type: a.type,
      message: a.message,
      severity: a.severity,
      resolved: false,
    }),
  );

  const { data, error } = await supabase
    .from("compliance_alerts")
    .insert(rows)
    .select();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

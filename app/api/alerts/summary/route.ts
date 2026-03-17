import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";

export async function GET() {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from("compliance_alerts")
    .select("alert_type")
    .eq("resolved", false);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const counts = {
    missing_field: 0,
    vague_description: 0,
    contradiction: 0,
    coding_error: 0,
    total: data?.length ?? 0,
  };

  data?.forEach((alert) => {
    const type = alert.alert_type as keyof typeof counts;
    if (type in counts) counts[type]++;
  });

  return NextResponse.json(counts);
}

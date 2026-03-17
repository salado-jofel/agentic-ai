import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";

// GET — fetch single report
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from("reports")
    .select("*, compliance_alerts(*)")
    .eq("id", params.id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }

  return NextResponse.json(data);
}

// PATCH — update a report
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const supabase = createServerClient();
  const body = await req.json();

  const { data, error } = await supabase
    .from("reports")
    .update(body)
    .eq("id", params.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await supabase.from("audit_log").insert([
    {
      report_id: params.id,
      action: "report_updated",
      details: body,
    },
  ]);

  return NextResponse.json(data);
}

// DELETE — delete a report
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const supabase = createServerClient();

  const { error } = await supabase.from("reports").delete().eq("id", params.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

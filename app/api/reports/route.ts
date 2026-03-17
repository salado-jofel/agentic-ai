import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";

// GET — fetch all reports
export async function GET() {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from("reports")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// POST — create a new report
export async function POST(req: NextRequest) {
  const supabase = createServerClient();
  const body = await req.json();

  const {
    title,
    status,
    clinician_notes,
    classification_codes,
    patient_id,
    department,
    procedure_date,
    structured_data,
  } = body;

  const { data, error } = await supabase
    .from("reports")
    .insert([
      {
        title,
        status: status || "draft",
        clinician_notes,
        classification_codes: classification_codes
          ? classification_codes.split(",").map((c: string) => c.trim())
          : [],
        patient_id,
        department,
        procedure_date: procedure_date || null,
        structured_data: structured_data || null,
      },
    ])
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Log to audit trail
  await supabase.from("audit_log").insert([
    {
      report_id: data.id,
      action: "report_created",
      details: { title, status },
    },
  ]);

  return NextResponse.json(data);
}

export type ReportStatus = "draft" | "pending" | "approved" | "rejected";

export type AlertType =
  | "missing_field"
  | "vague_description"
  | "contradiction"
  | "coding_error";

export type AlertSeverity = "low" | "medium" | "high";

export type Report = {
  id: string;
  title: string;
  status: ReportStatus;
  clinician_notes: string | null;
  structured_data: Record<string, unknown> | null;
  classification_codes: string[] | null;
  patient_id: string | null;
  department: string | null;
  procedure_date: string | null;
  created_at: string;
  updated_at: string;
};

export type ComplianceAlert = {
  id: string;
  report_id: string;
  alert_type: AlertType;
  field_name: string | null;
  message: string;
  severity: AlertSeverity;
  resolved: boolean;
  created_at: string;
};

export type HistoricalPattern = {
  id: string;
  pattern_type: string | null;
  classification_codes: string[] | null;
  suggested_description: string | null;
  success_rate: number | null;
  usage_count: number;
  created_at: string;
};

export type AuditLog = {
  id: string;
  report_id: string;
  action: string;
  details: Record<string, unknown> | null;
  performed_at: string;
};

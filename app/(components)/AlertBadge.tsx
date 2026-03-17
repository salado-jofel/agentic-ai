type AlertBadgeProps = {
  severity: "low" | "medium" | "high";
  message: string;
  type: string;
};

const severityStyles = {
  low: "bg-blue-50 border-blue-200 text-blue-700",
  medium: "bg-yellow-50 border-yellow-200 text-yellow-700",
  high: "bg-red-50 border-red-200 text-red-700",
};

const severityIcons = {
  low: "ℹ️",
  medium: "⚠️",
  high: "🚨",
};

export default function AlertBadge({
  severity,
  message,
  type,
}: AlertBadgeProps) {
  return (
    <div
      className={`flex items-start gap-2 px-4 py-3 rounded-lg border text-sm ${severityStyles[severity]}`}
    >
      <span className="mt-0.5">{severityIcons[severity]}</span>
      <div>
        <span className="font-semibold capitalize">
          {type.replace("_", " ")}:{" "}
        </span>
        {message}
      </div>
    </div>
  );
}

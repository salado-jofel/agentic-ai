import { ReactNode } from "react";

type StatCardProps = {
  label: string;
  value: string | number;
  icon: ReactNode;
  color: string;
  sub?: string;
};

export default function StatCard({
  label,
  value,
  icon,
  color,
  sub,
}: StatCardProps) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <span className="text-2xl text-gray-400">{icon}</span>
        <span className={`text-xs font-medium px-2 py-1 rounded-full ${color}`}>
          {sub}
        </span>
      </div>
      <p className="text-3xl font-bold text-gray-800">{value}</p>
      <p className="text-sm text-gray-500 mt-1">{label}</p>
    </div>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { label: "Dashboard", href: "/", icon: "📊" },
  { label: "New Report", href: "/reports/new", icon: "📝" },
  { label: "AI Analysis", href: "/analysis", icon: "🤖" },
  // { label: "Historical Patterns", href: "/patterns", icon: "📈" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 min-h-screen bg-gray-900 text-white flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-700">
        <h1 className="text-xl font-bold text-blue-400">QA Report AI</h1>
        <p className="text-xs text-gray-400 mt-1">Quality Assurance System</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg
                text-sm transition-colors ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : "text-gray-300 hover:bg-gray-800 hover:text-white"
                }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
              {isActive && (
                <span
                  className="ml-auto w-1.5 h-1.5 rounded-full bg-white
                  opacity-70"
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Help Box */}
      <div className="p-4 mx-4 mb-4 bg-gray-800 rounded-xl">
        <p className="text-xs font-semibold text-gray-300 mb-1">💡 Quick Tip</p>
        <p className="text-xs text-gray-400 leading-relaxed">
          Use AI Analysis to extract codes and check consistency before
          submitting reports.
        </p>
      </div>
    </aside>
  );
}

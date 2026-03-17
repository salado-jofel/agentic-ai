"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { FiMenu, FiX } from "react-icons/fi";

const navItems = [
  { label: "Dashboard", href: "/", icon: "📊" },
  { label: "New Report", href: "/reports/new", icon: "📝" },
  { label: "AI Analysis", href: "/analysis", icon: "🤖" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const NavLinks = ({ onNavigate }: { onNavigate?: () => void }) => (
    <>
      {navItems.map((item) => {
        const isActive =
          pathname === item.href ||
          (item.href !== "/" && pathname.startsWith(item.href));
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
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
              <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white opacity-70" />
            )}
          </Link>
        );
      })}
    </>
  );

  return (
    <>
      {/* ── Desktop sidebar ── */}
      <aside className="hidden lg:flex w-64 min-h-screen bg-gray-900 text-white flex-col flex-shrink-0">
        <div className="p-6 border-b border-gray-700">
          <h1 className="text-xl font-bold text-blue-400">QA Report AI</h1>
          <p className="text-xs text-gray-400 mt-1">Quality Assurance System</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <NavLinks />
        </nav>

        <div className="p-4 mx-4 mb-4 bg-gray-800 rounded-xl">
          <p className="text-xs font-semibold text-gray-300 mb-1">
            💡 Quick Tip
          </p>
          <p className="text-xs text-gray-400 leading-relaxed">
            Use AI Analysis to extract codes and check consistency before
            submitting reports.
          </p>
        </div>
      </aside>

      {/* ── Mobile top bar ── */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-gray-900 text-white flex items-center justify-between px-4 py-3 shadow-md">
        <h1 className="text-lg font-bold text-blue-400">QA Report AI</h1>
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 rounded-lg hover:bg-gray-700 transition-colors"
          aria-label="Open menu"
        >
          <FiMenu className="h-5 w-5" />
        </button>
      </div>

      {/* ── Mobile top bar spacer ── */}
      <div className="lg:hidden h-[52px] flex-shrink-0" />

      {/* ── Mobile drawer overlay ── */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 flex"
          onClick={() => setMobileOpen(false)}
        >
          {/* backdrop */}
          <div className="absolute inset-0 bg-black/50" />

          {/* drawer panel */}
          <aside
            className="relative w-72 max-w-[85vw] bg-gray-900 text-white flex flex-col h-full shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* drawer header */}
            <div className="p-5 border-b border-gray-700 flex items-center justify-between">
              <div>
                <h1 className="text-lg font-bold text-blue-400">
                  QA Report AI
                </h1>
                <p className="text-xs text-gray-400 mt-0.5">
                  Quality Assurance System
                </p>
              </div>
              <button
                onClick={() => setMobileOpen(false)}
                className="p-2 rounded-lg hover:bg-gray-700 transition-colors"
                aria-label="Close menu"
              >
                <FiX className="h-5 w-5" />
              </button>
            </div>

            {/* drawer nav */}
            <nav className="flex-1 p-4 space-y-1">
              <NavLinks onNavigate={() => setMobileOpen(false)} />
            </nav>

            {/* drawer tip */}
            <div className="p-4 mx-4 mb-6 bg-gray-800 rounded-xl">
              <p className="text-xs font-semibold text-gray-300 mb-1">
                💡 Quick Tip
              </p>
              <p className="text-xs text-gray-400 leading-relaxed">
                Use AI Analysis to extract codes and check consistency before
                submitting reports.
              </p>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}

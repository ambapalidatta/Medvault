import { useState } from "react";
import Icon from "../Icon.jsx";

const groups = [
  {
    title: "Overview",
    icon: "LayoutDashboard",
    items: [{ label: "Dashboard", view: "dashboard", icon: "BarChart3" }],
  },
  {
    title: "People",
    icon: "Users",
    items: [
      { label: "Doctors", view: "doctors", icon: "Stethoscope" },
      { label: "Patients", view: "patients", icon: "UserCheck" },
    ],
  },
  {
    title: "Operations",
    icon: "ClipboardList",
    items: [
      { label: "Appointments", view: "appointments", icon: "CalendarCheck" },
      { label: "Emergency", view: "emergency", icon: "Siren" },
      { label: "Documents", view: "documents", icon: "FileCheck" },
      { label: "Issues", view: "issues", icon: "MessageSquareWarning" },
    ],
  },
  {
    title: "System",
    icon: "Settings",
    items: [{ label: "Settings", view: "settings", icon: "SlidersHorizontal" }],
  },
];

export default function AdminSidebar({ activeView, setActiveView, sidebarOpen, setSidebarOpen }) {
  const [expanded, setExpanded] = useState("Overview");

  const content = (
    <aside className="flex h-full w-72 flex-col border-r border-slate-200 bg-white shadow-sm">
      <div className="flex h-20 items-center justify-between border-b border-slate-100 px-6">
        <div>
          <h1 className="text-2xl font-black text-indigo-700">MedVault</h1>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">Admin</p>
        </div>
        <button className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 lg:hidden" onClick={() => setSidebarOpen(false)}>
          <Icon name="X" size={20} />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-4 py-5">
        {groups.map((group) => {
          const isOpen = expanded === group.title;
          return (
            <div key={group.title} className="mb-3">
              <button
                onClick={() => setExpanded(isOpen ? null : group.title)}
                className="flex w-full items-center justify-between rounded-2xl px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50"
              >
                <span className="flex items-center gap-3">
                  <Icon name={group.icon} size={18} className="text-indigo-500" />
                  {group.title}
                </span>
                <Icon name="ChevronDown" size={16} className={`transition ${isOpen ? "rotate-180" : ""}`} />
              </button>
              {isOpen && (
                <div className="mt-1 space-y-1 pl-2">
                  {group.items.map((item) => (
                    <button
                      key={item.view}
                      onClick={() => {
                        setActiveView(item.view);
                        setSidebarOpen(false);
                      }}
                      className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-semibold transition ${
                        activeView === item.view
                          ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                          : "text-slate-600 hover:bg-indigo-50 hover:text-indigo-700"
                      }`}
                    >
                      <Icon name={item.icon} size={17} />
                      {item.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );

  return (
    <>
      <div className={`fixed inset-y-0 left-0 z-40 transform transition-transform lg:hidden ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        {content}
      </div>
      <div className="fixed inset-y-0 left-0 z-20 hidden lg:block">{content}</div>
    </>
  );
}

export default function DashboardShell({
  title,
  subtitle,
  workspace,
  navItems,
  activeSection,
  onSectionChange,
  onLogout,
  children,
  gradient = "from-teal-700 via-indigo-900 to-orange-500",
}) {
  return (
    <main className="min-h-screen bg-[#f8faf7]">
      <aside className="fixed left-0 top-0 hidden h-full w-72 border-r border-slate-200 bg-white p-6 lg:block">
        <h1 className="text-2xl font-extrabold text-teal-800">MedVault</h1>
        <p className="mt-1 text-sm font-semibold text-slate-500">{workspace}</p>

        <nav className="mt-10 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={`w-full rounded-2xl px-4 py-3 text-left font-bold transition ${
                activeSection === item.id
                  ? "bg-teal-700 text-white shadow-lg shadow-teal-700/20"
                  : "text-slate-600 hover:bg-teal-50 hover:text-teal-800"
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <button
          onClick={onLogout}
          className="absolute bottom-6 left-6 right-6 rounded-full bg-slate-950 px-5 py-3 font-bold text-white hover:bg-red-600"
        >
          Logout
        </button>
      </aside>

      <section className="p-6 lg:ml-72 lg:p-10">
        <div
          className={`rounded-[2rem] bg-gradient-to-br ${gradient} p-8 text-white shadow-xl`}
        >
          <p className="text-sm font-bold uppercase tracking-[0.25em] text-teal-100">
            {workspace}
          </p>
          <h2 className="mt-3 text-4xl font-extrabold">{title}</h2>
          <p className="mt-3 max-w-2xl text-white/75">{subtitle}</p>
        </div>

        <div className="mt-8">{children}</div>
      </section>
    </main>
  );
}

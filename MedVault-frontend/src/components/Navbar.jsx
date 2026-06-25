export default function Navbar({
  loggedIn,
  onNavigateToDashboard,
  onNavigateToRoleSelect,
  onLogout,
  getLinkClass,
}) {
  const navItems = [
    { href: "#", label: "Home", section: "" },
    { href: "#about", label: "About", section: "about" },
    { href: "#shop", label: "Shop", section: "shop" },
    { href: "#checkups", label: "Packages", section: "checkups" },
    { href: "#services", label: "Services", section: "services" },
    { href: "#our-doctors", label: "Doctors", section: "our-doctors" },
    { href: "#contact-support", label: "Contact", section: "contact-support" },
  ];

  const activeClass = (section) =>
    typeof getLinkClass === "function"
      ? getLinkClass(section)
      : "hover:text-brand-purple";

  return (
    <header className="sticky top-0 z-30 border-b border-teal-100/80 bg-white/90 shadow-sm backdrop-blur-xl">
      <div className="container mx-auto flex items-center justify-between px-4 py-4">
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="group flex items-center gap-3"
          aria-label="Go to MedVault home"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-700 via-teal-600 to-orange-500 text-xl font-black text-white shadow-lg shadow-teal-700/25 transition group-hover:scale-105">
            M
          </span>
          <span className="text-left">
            <span className="block text-2xl font-extrabold tracking-tight text-slate-950">
              MedVault
            </span>
            <span className="block text-xs font-bold uppercase tracking-[0.24em] text-teal-700">
              Secure Health Cloud
            </span>
          </span>
        </button>

        <nav className="hidden items-center gap-5 text-sm font-bold text-slate-600 lg:flex">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              onClick={
                item.section === "our-doctors"
                  ? (e) => {
                      e.preventDefault();
                      window.location.hash = "our-doctors";
                    }
                  : undefined
              }
              className={`${activeClass(item.section)} rounded-full px-2 py-1 transition hover:text-teal-700`}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {loggedIn ? (
            <>
              <button
                onClick={onNavigateToDashboard}
                className="rounded-full bg-gradient-to-r from-teal-700 to-indigo-900 px-5 py-2.5 text-sm font-extrabold text-white shadow-lg shadow-teal-700/20 transition hover:-translate-y-0.5 hover:shadow-xl"
              >
                Dashboard
              </button>
              <button
                onClick={onLogout}
                className="rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-600 transition hover:border-red-300 hover:text-red-600"
              >
                Logout
              </button>
            </>
          ) : (
            <button
              onClick={onNavigateToRoleSelect}
              className="rounded-full bg-slate-950 px-6 py-2.5 text-sm font-extrabold text-white shadow-lg shadow-slate-950/15 transition hover:-translate-y-0.5 hover:bg-teal-800"
            >
              Sign In / Sign Up
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

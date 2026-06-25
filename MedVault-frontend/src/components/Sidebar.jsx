export default function Sidebar({
  isOpen,
  toggle,
  activeSection,
  onSelectSection,
  menuItems,
  onLogout,
  userRole = "patient",
}) {
  const theme =
    userRole === "doctor"
      ? {
          active:
            "bg-gradient-to-r from-purple-600 to-yellow-500 text-white shadow-lg transform scale-105",
          hover: "text-slate-500 hover:bg-yellow-50 hover:text-yellow-600",
          toggle: "text-yellow-600 hover:bg-yellow-50",
          logo: "from-purple-600 to-yellow-500",
          logout: "text-red-500 hover:bg-red-50",
        }
      : {
          active:
            "bg-gradient-to-r from-purple-600 to-brand-purple text-white shadow-lg transform scale-105",
          hover: "text-slate-500 hover:bg-purple-50 hover:text-brand-purple",
          toggle: "text-brand-purple hover:bg-purple-50",
          logo: "from-purple-600 to-green-500",
          logout: "text-red-500 hover:bg-red-50",
        };

  return (
    <div
      className={`${isOpen ? "w-72" : "w-20"} bg-white h-screen transition-all duration-300 ease-in-out flex flex-col border-r border-slate-200 fixed left-0 top-0 z-50 shadow-2xl overflow-hidden`}
    >
      <div className="h-24 flex items-center justify-center border-b border-slate-100">
        <button
          onClick={toggle}
          className={`${theme.toggle} p-3 rounded-xl transition-all duration-200 focus:outline-none transform hover:scale-110`}
        >
          <i className="fas fa-bars text-3xl"></i>
        </button>
        {isOpen && (
          <span
            className={`ml-3 font-extrabold text-2xl text-transparent bg-clip-text bg-gradient-to-r ${theme.logo} tracking-tight whitespace-nowrap animate-fade-in`}
          >
            MedVault
          </span>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-6 space-y-2 pl-3 pr-5 sidebar-scroll">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onSelectSection(item.id)}
            className={`w-full flex items-center ${isOpen ? "justify-start px-3 gap-3" : "justify-center"} py-3 rounded-xl transition-all duration-200 relative group ${
              activeSection === item.id ? theme.active : theme.hover
            }`}
            title={!isOpen ? item.label : ""}
          >
            <i
              className={`fas ${item.icon} text-lg transition-transform ${activeSection === item.id ? "scale-110" : ""} flex-shrink-0`}
            ></i>
            {isOpen && (
              <span className="font-semibold text-base leading-tight whitespace-nowrap pr-3">
                {item.label}
              </span>
            )}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-100">
        <button
          onClick={onLogout}
          className={`w-full flex items-center ${isOpen ? "justify-start px-3 gap-3" : "justify-center"} py-3 ${theme.logout} rounded-xl transition-colors font-semibold text-base`}
        >
          <i className="fas fa-sign-out-alt text-lg"></i>
          {isOpen && <span className="whitespace-nowrap pr-3">Logout</span>}
        </button>
      </div>
    </div>
  );
}

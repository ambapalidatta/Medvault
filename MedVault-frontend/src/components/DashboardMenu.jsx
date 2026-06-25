import { useEffect, useRef, useState } from "react";

const scrollToSection = (id) => {
  const element = document.getElementById(id);
  if (element) {
    element.scrollIntoView({ behavior: "smooth", block: "start" });
  }
};

export default function DashboardMenu({ menuItems }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMenuItemClick = (id) => {
    scrollToSection(id);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <button
        type="button"
        className="rounded-full p-2 text-slate-600 transition hover:bg-teal-50 hover:text-teal-700"
        onClick={() => setIsOpen((value) => !value)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="Open dashboard menu"
      >
        <i className="fas fa-ellipsis-v text-xl"></i>
      </button>

      {isOpen && (
        <div
          className="absolute right-0 z-50 mt-2 w-56 origin-top-right overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-slate-200 focus:outline-none"
          role="menu"
          aria-orientation="vertical"
        >
          <div className="py-2" role="none">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleMenuItemClick(item.id)}
                className="block w-full px-4 py-2.5 text-left text-sm font-semibold text-slate-700 transition hover:bg-teal-50 hover:text-teal-800"
                role="menuitem"
              >
                <i className={`fas ${item.icon} mr-2 w-5 text-center text-teal-700`}></i>
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

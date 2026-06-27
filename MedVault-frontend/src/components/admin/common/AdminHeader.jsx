import Icon from "../Icon.jsx";

function formatTime(timestamp) {
  if (!timestamp) return "Just now";
  const date = new Date(timestamp);
  const diff = Date.now() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}

export default function AdminHeader({
  user,
  unreadCount,
  notifications,
  notificationOpen,
  setNotificationOpen,
  onNotificationClick,
  onMarkAllNotificationsRead,
  onRefresh,
  onLogout,
  onOpenSidebar,
}) {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur-xl">
      <div className="flex h-20 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <button className="rounded-xl p-2 text-slate-600 hover:bg-slate-100 lg:hidden" onClick={onOpenSidebar}>
            <Icon name="Menu" size={22} />
          </button>
          <div>
            <h2 className="text-xl font-black text-slate-900">Admin Control Center</h2>
            <p className="text-sm text-slate-500">Manage doctors, patients, appointments and operations.</p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button onClick={onRefresh} className="hidden rounded-2xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 sm:flex sm:items-center sm:gap-2">
            <Icon name="RefreshCw" size={17} /> Refresh
          </button>

          <div className="relative">
            <button
              onClick={() => setNotificationOpen(!notificationOpen)}
              className="relative rounded-2xl border border-slate-200 p-3 text-slate-700 hover:bg-slate-50"
            >
              <Icon name="Bell" size={20} />
              {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-600 px-1 text-xs font-black text-white">
                  {unreadCount}
                </span>
              )}
            </button>

            {notificationOpen && (
              <div className="absolute right-0 mt-3 w-80 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
                <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                  <h3 className="font-black text-slate-900">Notifications</h3>
                  <button className="text-xs font-bold text-indigo-600" onClick={onMarkAllNotificationsRead}>Mark all read</button>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="p-5 text-center text-sm text-slate-500">No unread notifications.</p>
                  ) : notifications.map((n) => (
                    <button key={n.notificationId || n.id} onClick={() => onNotificationClick(n)} className="block w-full border-b border-slate-100 px-4 py-3 text-left hover:bg-slate-50">
                      <p className="text-sm font-bold text-slate-800">{n.title || n.type || "Notification"}</p>
                      <p className="mt-1 line-clamp-2 text-xs text-slate-500">{n.message || n.description}</p>
                      <p className="mt-1 text-[11px] font-semibold text-indigo-500">{formatTime(n.createdAt || n.timestamp)}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="hidden items-center gap-3 rounded-2xl bg-slate-50 px-3 py-2 sm:flex">
            <img src={user?.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.displayName || user?.name || "Admin")}&background=4f46e5&color=fff`} alt="Admin" className="h-9 w-9 rounded-full object-cover" />
            <div className="leading-tight">
              <p className="text-sm font-black text-slate-900">{user?.displayName || user?.name || "Admin"}</p>
              <p className="text-xs text-slate-500">{user?.email || "admin@medvault.com"}</p>
            </div>
          </div>

          <button onClick={onLogout} className="rounded-2xl bg-slate-950 px-4 py-2 text-sm font-black text-white hover:bg-rose-600">Logout</button>
        </div>
      </div>
    </header>
  );
}

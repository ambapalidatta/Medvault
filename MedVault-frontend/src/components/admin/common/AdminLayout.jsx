import Icon from "../Icon.jsx";
import AdminSidebar from "./AdminSidebar.jsx";
import AdminHeader from "./AdminHeader.jsx";

export default function AdminLayout({
  user,
  activeView,
  setActiveView,
  sidebarOpen,
  setSidebarOpen,
  notifications = [],
  unreadCount = 0,
  notificationOpen,
  setNotificationOpen,
  onNotificationClick,
  onMarkAllNotificationsRead,
  onRefresh,
  onLogout,
  children,
}) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <AdminSidebar
        activeView={activeView}
        setActiveView={setActiveView}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      <div className="min-h-screen lg:pl-72">
        <AdminHeader
          user={user}
          unreadCount={unreadCount}
          notifications={notifications}
          notificationOpen={notificationOpen}
          setNotificationOpen={setNotificationOpen}
          onNotificationClick={onNotificationClick}
          onMarkAllNotificationsRead={onMarkAllNotificationsRead}
          onRefresh={onRefresh}
          onLogout={onLogout}
          onOpenSidebar={() => setSidebarOpen(true)}
        />

        <main className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>

      {sidebarOpen && (
        <button
          aria-label="Close sidebar"
          className="fixed inset-0 z-30 bg-slate-950/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}

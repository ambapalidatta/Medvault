import DashboardMenu from "./DashboardMenu.jsx";

export default function DashboardHeader({
  onLogout,
  menuItems = [],
  notifications = [],
  unreadCount = 0,
  showNotifications = false,
  handleBellClick,
  handleNotificationClick,
  title = "MedVault",
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 shadow-sm backdrop-blur-xl">
      <div className="mx-auto flex items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <h1 className="flex items-center text-2xl font-extrabold text-teal-800">
          <span className="mr-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-700 to-indigo-900 text-white shadow-lg">
            <i className="fas fa-shield-heart"></i>
          </span>
          {title}
        </h1>

        <div className="flex items-center gap-4">
          <div className="relative">
            <button
              type="button"
              onClick={handleBellClick}
              className="relative rounded-full p-2 text-slate-600 transition hover:bg-teal-50 hover:text-teal-800"
            >
              <i className="fas fa-bell text-2xl"></i>
              {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-xs font-bold text-white">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-4 max-h-96 w-80 overflow-y-auto rounded-2xl border border-slate-100 bg-white shadow-2xl">
                <div className="border-b bg-teal-50 p-4">
                  <h3 className="font-bold text-teal-800">Notifications</h3>
                </div>

                {notifications.length === 0 ? (
                  <p className="p-4 text-center text-slate-500">No notifications</p>
                ) : (
                  notifications.map((notification) => (
                    <button
                      type="button"
                      key={notification.notificationId}
                      className="block w-full border-b p-4 text-left transition hover:bg-slate-50"
                      onClick={() => handleNotificationClick?.(notification)}
                    >
                      <p className="text-sm text-slate-800">{notification.message}</p>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          <DashboardMenu menuItems={menuItems} />

          <button
            type="button"
            onClick={onLogout}
            className="font-semibold text-slate-600 transition hover:text-red-500"
          >
            <i className="fas fa-sign-out-alt mr-2"></i>Log Out
          </button>
        </div>
      </div>
    </header>
  );
}

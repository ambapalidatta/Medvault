export default function PatientHeader({
  unreadCount,
  notifications,
  showNotifications,
  onBellClick,
}) {
  const goHome = () => {
    sessionStorage.removeItem("loggedInUser");
    sessionStorage.removeItem("authToken");
    window.location.href = "/";
  };

  const goToSupport = () => {
    window.location.hash = "#support";
  };

  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between bg-gradient-to-r from-teal-700 via-indigo-900 to-orange-500 px-8 py-4 shadow-lg">
      <div className="flex items-center gap-4">
        <h1
          className="flex cursor-pointer items-center text-2xl font-extrabold text-white"
          onClick={() => window.location.reload()}
        >
          <i className="fas fa-shield-heart mr-2 text-3xl"></i> MedVault
        </h1>
      </div>

      <div className="flex items-center gap-6">
        <button
          onClick={goHome}
          className="flex items-center rounded-full bg-white/20 px-4 py-2 font-bold text-white transition-all hover:bg-white/30"
        >
          <i className="fas fa-home mr-2"></i> Home
        </button>

        <button
          onClick={goToSupport}
          className="flex items-center rounded-full bg-white/20 px-4 py-2 font-bold text-white transition-all hover:bg-white/30"
        >
          <i className="fas fa-exclamation-circle mr-2"></i> Report Issue
        </button>

        <div className="relative">
          <button
            onClick={onBellClick}
            className="relative text-white transition-colors hover:scale-110 hover:text-orange-100"
          >
            <i className="fas fa-bell text-2xl"></i>
            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 z-50 mt-4 max-h-96 w-80 overflow-y-auto rounded-xl border border-slate-100 bg-white shadow-2xl">
              <div className="border-b bg-teal-50 p-4">
                <h3 className="font-bold text-teal-800">Notifications</h3>
              </div>

              {notifications.length === 0 ? (
                <p className="p-4 text-center text-slate-500">No notifications</p>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.notificationId}
                    className="border-b p-4 hover:bg-slate-50"
                  >
                    <p className="text-sm text-slate-800">
                      {notification.message}
                    </p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

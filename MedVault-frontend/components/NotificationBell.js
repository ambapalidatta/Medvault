// Notification Bell Component
const NotificationBell = ({ user }) => {
    const [notifications, setNotifications] = useState([]);
    const [showPanel, setShowPanel] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const bellRef = useRef(null);

    useEffect(() => {
        // Load notifications when component mounts
        fetchNotifications();
        
        // Poll for new notifications every 30 seconds
        const interval = setInterval(fetchNotifications, 30000);
        
        // Cleanup interval on unmount
        return () => clearInterval(interval);
    }, [user]);

    useEffect(() => {
        // Handle clicks outside notification panel
        const handleClickOutside = (event) => {
            if (bellRef.current && !bellRef.current.contains(event.target)) {
                setShowPanel(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchNotifications = async () => {
        if (!user?.id) return;
        
        try {
            const response = await fetch(`/api/notifications/user/${user.id}`);
            if (!response.ok) throw new Error('Failed to fetch notifications');
            
            const data = await response.json();
            setNotifications(data);
            setUnreadCount(data.filter(n => !n.read).length);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    const markAsRead = async (notificationId) => {
        try {
            await fetch(`/api/notifications/${notificationId}/read`, {
                method: 'PUT'
            });
            fetchNotifications(); // Refresh notifications
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const togglePanel = () => setShowPanel(!showPanel);

    const formatTimestamp = (timestamp) => {
        const date = new Date(timestamp);
        return new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(
            Math.round((date - new Date()) / (1000 * 60 * 60 * 24)),
            'day'
        );
    };

    return (
        <div className="notification-bell" ref={bellRef}>
            <button 
                onClick={togglePanel}
                className="p-2 text-slate-600 hover:text-brand-purple transition-colors relative"
            >
                <i className="fas fa-bell text-xl"></i>
                {unreadCount > 0 && (
                    <span className="notification-badge">{unreadCount}</span>
                )}
            </button>

            {showPanel && (
                <div className="notification-panel">
                    <div className="p-4 border-b border-slate-200">
                        <h3 className="text-lg font-semibold text-slate-800">
                            Notifications
                        </h3>
                    </div>
                    
                    <div className="divide-y divide-slate-200">
                        {notifications.length === 0 ? (
                            <div className="p-4 text-slate-500 text-center">
                                No notifications
                            </div>
                        ) : (
                            notifications.map(notification => (
                                <div
                                    key={notification.id}
                                    className={`notification-item ${!notification.read ? 'bg-blue-50' : ''}`}
                                    onClick={() => markAsRead(notification.id)}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className={`rounded-full p-2 ${
                                            notification.type === 'RECORD_ADDED' 
                                                ? 'bg-green-100 text-green-600'
                                                : 'bg-blue-100 text-blue-600'
                                        }`}>
                                            <i className={`fas ${
                                                notification.type === 'RECORD_ADDED'
                                                    ? 'fa-file-medical'
                                                    : 'fa-bell'
                                            }`}></i>
                                        </div>
                                        <div>
                                            <p className="text-sm text-slate-800">
                                                {notification.message}
                                            </p>
                                            <p className="text-xs text-slate-500 mt-1">
                                                {formatTimestamp(notification.createdAt)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
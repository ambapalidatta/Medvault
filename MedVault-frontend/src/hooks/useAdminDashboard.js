import { useCallback, useEffect, useMemo, useState } from "react";
import {
  fetchNotifications,
  loadAdminCollections,
  markAllNotificationsRead,
  markNotificationRead,
  remindEmergencyDoctor,
  resolveIssue,
  verifyDoctor,
  verifyDocument,
} from "../services/adminDashboardService.js";

const getStoredBool = (key, fallback) => {
  const saved = localStorage.getItem(key);
  if (saved === null) return fallback;
  return saved === "true";
};

export default function useAdminDashboard(user) {
  const [activeView, setActiveView] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [appointmentFilter, setAppointmentFilter] = useState("all");
  const [issuesFilter, setIssuesFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [replyMessage, setReplyMessage] = useState("");

  const [collections, setCollections] = useState({
    doctors: [],
    patients: [],
    appointments: [],
    emergencies: [],
    documents: [],
    issues: [],
    stats: {},
  });

  const [settings, setSettings] = useState({
    darkMode: getStoredBool("adminDarkMode", false),
    emailNotifications: getStoredBool("emailNotifications", true),
    smsAlerts: getStoredBool("smsAlerts", true),
    emergencyAlerts: getStoredBool("emergencyAlerts", true),
    autoRefresh: getStoredBool("autoRefresh", false),
    compactView: getStoredBool("compactView", false),
  });

  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await loadAdminCollections();
      setCollections(data);
    } catch (err) {
      console.error("Admin dashboard load failed:", err);
      setError("Failed to load admin data. Please check the Render backend and try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", settings.darkMode);
    Object.entries(settings).forEach(([key, value]) => localStorage.setItem(key === "darkMode" ? "adminDarkMode" : key, String(value)));
  }, [settings]);

  useEffect(() => {
    if (!settings.autoRefresh) return undefined;
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, [settings.autoRefresh, loadData]);

  const refreshNotifications = useCallback(async () => {
    const userId = user?.userId || user?.uid;
    if (!userId) return;
    try {
      setNotifications(await fetchNotifications(userId));
    } catch (error) {
      console.error("Notification load failed:", error);
    }
  }, [user?.userId, user?.uid]);

  useEffect(() => {
    refreshNotifications();
    const interval = setInterval(refreshNotifications, 10000);
    return () => clearInterval(interval);
  }, [refreshNotifications]);

  const handleSettingChange = (key, value) => setSettings((prev) => ({ ...prev, [key]: value }));

  const handleVerifyDoctor = async (doctorId) => {
    const response = await verifyDoctor(doctorId);
    if (!response.ok) throw new Error("Doctor verification failed");
    await loadData();
  };

  const handleVerifyDocument = async (documentId) => {
    const response = await verifyDocument(documentId);
    if (!response.ok) throw new Error("Document verification failed");
    await loadData();
  };

  const handleRemindEmergencyDoctor = async (emergencyId) => {
    const response = await remindEmergencyDoctor(emergencyId);
    if (!response.ok) throw new Error("Emergency reminder failed");
  };

  const handleSubmitIssueReply = async () => {
    if (!selectedIssue || !replyMessage.trim()) return;
    const response = await resolveIssue(selectedIssue.id, replyMessage.trim());
    if (!response.ok) throw new Error("Issue reply failed");
    setSelectedIssue(null);
    setReplyMessage("");
    await loadData();
  };

  const handleNotificationClick = async (notification) => {
    const id = notification.notificationId || notification.id;
    if (!id) return;
    await markNotificationRead(id);
    setNotifications((prev) => prev.filter((item) => (item.notificationId || item.id) !== id));
    setNotificationOpen(false);
  };

  const handleMarkAllNotificationsRead = async () => {
    const userId = user?.userId || user?.uid;
    if (!userId) return;
    await markAllNotificationsRead(userId);
    setNotifications([]);
  };

  return {
    activeView,
    setActiveView,
    sidebarOpen,
    setSidebarOpen,
    searchTerm,
    setSearchTerm,
    appointmentFilter,
    setAppointmentFilter,
    issuesFilter,
    setIssuesFilter,
    loading,
    error,
    collections,
    settings,
    handleSettingChange,
    selectedIssue,
    setSelectedIssue,
    replyMessage,
    setReplyMessage,
    notificationOpen,
    setNotificationOpen,
    notifications,
    unreadCount: notifications.length,
    loadData,
    handleVerifyDoctor,
    handleVerifyDocument,
    handleRemindEmergencyDoctor,
    handleSubmitIssueReply,
    handleNotificationClick,
    handleMarkAllNotificationsRead,
  };
}

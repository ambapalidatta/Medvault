import React, { useEffect, useState } from "react";
import Login from "../../components/admin/AdminLogin.jsx";
import AdminLayout from "../../components/admin/common/AdminLayout.jsx";
import AdminDashboardHome from "../../components/admin/dashboard/AdminDashboardHome.jsx";
import AdminDoctorsView from "../../components/admin/doctors/AdminDoctorsView.jsx";
import AdminPatientsView from "../../components/admin/patients/AdminPatientsView.jsx";
import AdminAppointmentsView from "../../components/admin/appointments/AdminAppointmentsView.jsx";
import AdminEmergencyView from "../../components/admin/emergency/AdminEmergencyView.jsx";
import AdminDocumentsView from "../../components/admin/documents/AdminDocumentsView.jsx";
import AdminIssuesView from "../../components/admin/issues/AdminIssuesView.jsx";
import AdminSettingsView from "../../components/admin/settings/AdminSettingsView.jsx";
import useAdminDashboard from "../../hooks/useAdminDashboard.js";
import { fetchAdminProfile } from "../../services/adminApi.js";

function AdminDashboard({ user, onLogout }) {
  const admin = useAdminDashboard(user);

  const {
    doctors,
    patients,
    appointments,
    emergencies,
    documents,
    issues,
    stats,
  } = admin.collections;

  const handleSafeAction = async (action, successMessage) => {
    try {
      await action();
      if (successMessage) alert(successMessage);
    } catch (error) {
      console.error(error);
      alert(error.message || "Action failed. Please try again.");
    }
  };

  const handleViewDetails = (type, data) => {
    const summary = Object.entries(data || {})
      .slice(0, 10)
      .map(([key, value]) => `${key}: ${typeof value === "object" ? JSON.stringify(value) : value}`)
      .join("\n");
    alert(`${type.toUpperCase()} DETAILS\n\n${summary}`);
  };

  const renderContent = () => {
    switch (admin.activeView) {
      case "doctors":
        return (
          <AdminDoctorsView
            doctors={doctors}
            searchTerm={admin.searchTerm}
            setSearchTerm={admin.setSearchTerm}
            onVerifyDoctor={(id) => handleSafeAction(() => admin.handleVerifyDoctor(id), "Doctor verified successfully.")}
            onViewDetails={handleViewDetails}
          />
        );
      case "patients":
        return (
          <AdminPatientsView
            patients={patients}
            searchTerm={admin.searchTerm}
            setSearchTerm={admin.setSearchTerm}
            onViewDetails={handleViewDetails}
          />
        );
      case "appointments":
        return (
          <AdminAppointmentsView
            appointments={appointments}
            appointmentFilter={admin.appointmentFilter}
            setAppointmentFilter={admin.setAppointmentFilter}
            onViewDetails={handleViewDetails}
          />
        );
      case "emergency":
        return (
          <AdminEmergencyView
            emergencies={emergencies}
            onRemindDoctor={(id) => handleSafeAction(() => admin.handleRemindEmergencyDoctor(id), "Reminder sent to the doctor.")}
          />
        );
      case "documents":
        return (
          <AdminDocumentsView
            documents={documents}
            onVerifyDocument={(id) => handleSafeAction(() => admin.handleVerifyDocument(id), "Document verified successfully.")}
          />
        );
      case "issues":
        return (
          <AdminIssuesView
            issues={issues}
            issuesFilter={admin.issuesFilter}
            setIssuesFilter={admin.setIssuesFilter}
            selectedIssue={admin.selectedIssue}
            setSelectedIssue={admin.setSelectedIssue}
            replyMessage={admin.replyMessage}
            setReplyMessage={admin.setReplyMessage}
            onSubmitReply={() => handleSafeAction(admin.handleSubmitIssueReply, "Reply sent and issue resolved.")}
          />
        );
      case "settings":
        return <AdminSettingsView settings={admin.settings} onSettingChange={admin.handleSettingChange} />;
      case "dashboard":
      default:
        return (
          <AdminDashboardHome
            user={user}
            stats={stats}
            doctors={doctors}
            patients={patients}
            appointments={appointments}
            emergencies={emergencies}
            loading={admin.loading}
            error={admin.error}
            onRefresh={admin.loadData}
            onNavigate={admin.setActiveView}
          />
        );
    }
  };

  return (
    <AdminLayout
      user={user}
      activeView={admin.activeView}
      setActiveView={admin.setActiveView}
      sidebarOpen={admin.sidebarOpen}
      setSidebarOpen={admin.setSidebarOpen}
      notifications={admin.notifications}
      unreadCount={admin.unreadCount}
      notificationOpen={admin.notificationOpen}
      setNotificationOpen={admin.setNotificationOpen}
      onNotificationClick={admin.handleNotificationClick}
      onMarkAllNotificationsRead={admin.handleMarkAllNotificationsRead}
      onRefresh={admin.loadData}
      onLogout={onLogout}
    >
      {renderContent()}
    </AdminLayout>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    const storedUser = sessionStorage.getItem("adminUser");
    const storedToken = sessionStorage.getItem("adminAuthToken");

    if (storedUser && storedToken) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        sessionStorage.removeItem("adminUser");
        sessionStorage.removeItem("adminAuthToken");
      }
    }
    setLoadingUser(false);
  }, []);

  const handleLogin = async (type, email) => {
    if (type !== "admin") return;
    setLoadingUser(true);
    try {
      const adminProfile = await fetchAdminProfile(email);
      setUser(adminProfile);
      sessionStorage.setItem("adminUser", JSON.stringify(adminProfile));
    } catch (error) {
      console.error("Failed to fetch admin profile:", error);
      alert("Failed to load admin profile. Please try again.");
      setUser(null);
    } finally {
      setLoadingUser(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
    sessionStorage.removeItem("adminUser");
    sessionStorage.removeItem("adminAuthToken");
    localStorage.removeItem("adminEmail");
  };

  if (loadingUser) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-700 to-teal-700">
        <div className="text-center text-white">
          <div className="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-4 border-white border-t-transparent" />
          <p className="text-lg font-bold">Loading admin profile...</p>
        </div>
      </div>
    );
  }

  return user ? <AdminDashboard user={user} onLogout={handleLogout} /> : <Login onLogin={handleLogin} />;
}

import React, { useEffect, useState } from "react";
import ChatWidget from "../components/ChatWidget.jsx";
import HomePage from "../pages/HomePage.jsx";
import RoleSelectionPage from "../pages/RoleSelectionPage.jsx";
import AuthPage from "../pages/AuthPage.jsx";
import DoctorsPage from "../pages/DoctorsPage.jsx";
import SupportPage from "../pages/SupportPage.jsx";
import PatientDashboard from "../pages/patient/PatientDashboard.jsx";
import DoctorDashboard from "../pages/doctor/DoctorDashboard.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function AppRoutes() {
  const { user, isAuthenticated, role, login, logout } = useAuth();

  const [page, setPage] = useState("home");
  const [selectedRole, setSelectedRole] = useState(null);
  const [authBackPage, setAuthBackPage] = useState("role_select");

  const navigateTo = (
    targetPage,
    selectedUserRole = null,
    backTarget = null,
  ) => {
    window.scrollTo(0, 0);
    setPage(targetPage);

    if (selectedUserRole) setSelectedRole(selectedUserRole);
    if (backTarget) setAuthBackPage(backTarget);

    if (targetPage === "home") {
      window.location.hash = "";
    } else if (targetPage === "role_select") {
      window.location.hash = "role-selection";
    } else if (targetPage === "auth" && selectedUserRole) {
      window.location.hash = selectedUserRole;
    } else if (targetPage === "dashboard" && selectedUserRole) {
      window.location.hash = `${selectedUserRole}-dashboard`;
    } else if (targetPage === "support") {
      window.location.hash = "support";
    } else if (targetPage === "doctors") {
      window.location.hash = "doctors";
    }
  };

  useEffect(() => {
    const checkHash = () => {
      const hash = window.location.hash.replace("#", "");

      if (!hash) {
        if (!isAuthenticated) setPage("home");
        return;
      }

      if (hash === "role-selection") {
        if (!isAuthenticated) setPage("role_select");
        return;
      }

      if (hash === "patient") {
        if (isAuthenticated && role === "patient") {
          window.location.hash = "patient-dashboard";
        } else {
          setPage("auth");
          setSelectedRole("patient");
          setAuthBackPage("role_select");
        }
        return;
      }

      if (hash === "doctor") {
        if (isAuthenticated && role === "doctor") {
          window.location.hash = "doctor-dashboard";
        } else {
          setPage("auth");
          setSelectedRole("doctor");
          setAuthBackPage("role_select");
        }
        return;
      }

      if (hash === "patient-dashboard") {
        if (isAuthenticated && role === "patient") {
          setPage("dashboard");
        } else {
          setPage("auth");
          setSelectedRole("patient");
          setAuthBackPage("home");
        }
        return;
      }

      if (hash === "doctor-dashboard") {
        if (isAuthenticated && role === "doctor") {
          setPage("dashboard");
        } else {
          setPage("auth");
          setSelectedRole("doctor");
          setAuthBackPage("home");
        }
        return;
      }

      if (hash === "support") {
        setPage("support");
        return;
      }

      if (hash === "our-doctors" || hash === "doctors") {
        setPage("doctors");
        return;
      }

      if (hash === "register" || hash.startsWith("register?")) {
        const params = new URLSearchParams(
          hash.replace("register?", "").replace("register", ""),
        );

        const requestedRole = params.get("role") || "patient";
        const email = params.get("email");

        if (email) {
          sessionStorage.setItem("invitedDoctorEmail", email);
        }

        setPage("auth");
        setSelectedRole(requestedRole);
        setAuthBackPage("home");
        return;
      }

      if (hash === "login" || hash.startsWith("login?")) {
        const params = new URLSearchParams(
          hash.replace("login?", "").replace("login", ""),
        );

        setPage("auth");
        setSelectedRole(params.get("role") || "patient");
        setAuthBackPage("home");
      }
    };

    checkHash();
    window.addEventListener("hashchange", checkHash);

    return () => window.removeEventListener("hashchange", checkHash);
  }, [isAuthenticated, role]);

  const handleLoginSuccess = (userData) => {
    login(userData);
    navigateTo("dashboard", userData.role);
  };

  const handleLogout = () => {
    const previousRole = role;
    logout();

    if (previousRole === "patient") {
      setPage("auth");
      setSelectedRole("patient");
      window.location.hash = "patient";
    } else if (previousRole === "doctor") {
      setPage("auth");
      setSelectedRole("doctor");
      window.location.hash = "doctor";
    } else {
      setPage("home");
      window.location.hash = "";
    }
  };

  const renderAuthenticatedDashboard = () => {
    if (role === "patient") {
      return <PatientDashboard user={user} onLogout={handleLogout} />;
    }

    if (role === "doctor") {
      return <DoctorDashboard user={user} onLogout={handleLogout} />;
    }

    return (
      <div className="min-h-screen bg-slate-50 p-8">
        <div className="mx-auto max-w-xl rounded-2xl bg-white p-8 shadow">
          <h1 className="text-2xl font-bold text-slate-900">
            Unsupported role
          </h1>
          <p className="mt-2 text-slate-600">
            Please log in through the correct portal.
          </p>
          <button
            onClick={handleLogout}
            className="mt-6 rounded-xl bg-slate-900 px-5 py-3 font-bold text-white"
          >
            Logout
          </button>
        </div>
      </div>
    );
  };

  const renderPage = () => {
    if (page === "support") {
      return (
        <SupportPage
          onBack={
            isAuthenticated
              ? () => navigateTo("dashboard", role)
              : () => navigateTo("home")
          }
        />
      );
    }

    if (page === "doctors") {
      return (
        <DoctorsPage
          onBack={
            isAuthenticated
              ? () => navigateTo("dashboard", role)
              : () => navigateTo("home")
          }
        />
      );
    }

    if (isAuthenticated) {
      return renderAuthenticatedDashboard();
    }

    if (page === "role_select") {
      return (
        <RoleSelectionPage
          onBack={() => navigateTo("home")}
          onSelectPatient={() => navigateTo("auth", "patient", "role_select")}
          onSelectDoctor={() => navigateTo("auth", "doctor", "role_select")}
          onSelectAdmin={() => {
            window.location.href = "/admin.html";
          }}
        />
      );
    }

    if (page === "auth") {
      return (
        <AuthPage
          role={selectedRole}
          onBack={() => navigateTo(authBackPage || "role_select")}
          onLoginSuccess={handleLoginSuccess}
        />
      );
    }

    return (
      <HomePage
        onNavigateToRoleSelect={() => navigateTo("role_select")}
        loggedIn={isAuthenticated}
        onLogout={handleLogout}
        onNavigateToDashboard={() => navigateTo("dashboard", role)}
      />
    );
  };

  return (
    <div>
      {renderPage()}
      <ChatWidget />
    </div>
  );
}

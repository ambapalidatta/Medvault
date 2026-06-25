import React, { useEffect, useState } from "react";
import ChatWidget from "../components/ChatWidget.jsx";
import HomePage from "../pages/HomePage.jsx";
import RoleSelectionPage from "../pages/RoleSelectionPage.jsx";
import AuthPage from "../pages/AuthPage.jsx";
import DoctorsPage from "../pages/DoctorsPage.jsx";
import SupportPage from "../pages/SupportPage.jsx";
import PatientDashboard from "../pages/patient/PatientDashboard.jsx";
import DoctorDashboard from "../pages/doctor/DoctorDashboard.jsx";

export default function AppRoutes() {
  const [page, setPage] = useState("home");
  const [selectedRole, setSelectedRole] = useState(null);
  const [authBackPage, setAuthBackPage] = useState("role_select");
  const [loggedInUser, setLoggedInUser] = useState(null);

  useEffect(() => {
    const storedUser = sessionStorage.getItem("loggedInUser");

    if (!storedUser) return;

    try {
      const userData = JSON.parse(storedUser);
      setLoggedInUser(userData);
    } catch (error) {
      console.error("Failed to parse stored user data", error);
      sessionStorage.removeItem("loggedInUser");
      sessionStorage.removeItem("authToken");
    }
  }, []);

  const navigateTo = (targetPage, role = null, backTarget = null) => {
    window.scrollTo(0, 0);
    setPage(targetPage);

    if (role) setSelectedRole(role);
    if (backTarget) setAuthBackPage(backTarget);

    if (targetPage === "home") {
      window.location.hash = "";
    } else if (targetPage === "role_select") {
      window.location.hash = "role-selection";
    } else if (targetPage === "auth" && role) {
      window.location.hash = `${role}`;
    } else if (targetPage === "dashboard" && role) {
      window.location.hash = `${role}-dashboard`;
    } else if (targetPage === "support") {
      window.location.hash = "support";
    } else if (targetPage === "doctors") {
      window.location.hash = "doctors";
    }
  };

  useEffect(() => {
    const checkHash = () => {
      const hash = window.location.hash.replace("#", "");

      if (!hash || hash === "") {
        if (page !== "home" && !loggedInUser) {
          setPage("home");
        }
        return;
      }

      if (hash === "role-selection") {
        if (!loggedInUser) {
          setPage("role_select");
        }
        return;
      }

      if (hash === "patient") {
        if (loggedInUser && loggedInUser.role === "patient") {
          window.location.hash = "patient-dashboard";
        } else if (!loggedInUser) {
          setPage("auth");
          setSelectedRole("patient");
          setAuthBackPage("role_select");
        }
        return;
      }

      if (hash === "patient-dashboard") {
        if (loggedInUser && loggedInUser.role === "patient") {
          setPage("dashboard");
        } else if (!loggedInUser) {
          setPage("auth");
          setSelectedRole("patient");
          setAuthBackPage("home");
        }
        return;
      }

      if (hash === "doctor") {
        if (loggedInUser && loggedInUser.role === "doctor") {
          window.location.hash = "doctor-dashboard";
        } else if (!loggedInUser) {
          setPage("auth");
          setSelectedRole("doctor");
          setAuthBackPage("home");
        }
        return;
      }

      if (hash === "doctor-dashboard") {
        if (loggedInUser && loggedInUser.role === "doctor") {
          setPage("dashboard");
        } else if (!loggedInUser) {
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
        const hashParams = new URLSearchParams(
          hash.replace("register?", "").replace("register", ""),
        );
        const role = hashParams.get("role");
        const email = hashParams.get("email");

        if (!loggedInUser) {
          if (role === "doctor") {
            setPage("auth");
            setSelectedRole("doctor");
            setAuthBackPage("home");
            if (email) {
              sessionStorage.setItem("invitedDoctorEmail", email);
            }
          } else if (role === "patient") {
            setPage("auth");
            setSelectedRole("patient");
            setAuthBackPage("home");
          } else {
            setPage("auth");
            setSelectedRole("patient");
            setAuthBackPage("home");
          }
        }
        return;
      }

      if (hash === "login" || hash.startsWith("login?")) {
        const hashParams = new URLSearchParams(
          hash.replace("login?", "").replace("login", ""),
        );
        const role = hashParams.get("role");

        if (!loggedInUser) {
          if (role === "doctor") {
            setPage("auth");
            setSelectedRole("doctor");
            setAuthBackPage("home");
          } else {
            setPage("auth");
            setSelectedRole("patient");
            setAuthBackPage("home");
          }
        }
      }
    };

    checkHash();
    window.addEventListener("hashchange", checkHash);

    return () => {
      window.removeEventListener("hashchange", checkHash);
    };
  }, [loggedInUser, page]);

  const handleLoginSuccess = (userData) => {
    setLoggedInUser(userData);
    sessionStorage.setItem("loggedInUser", JSON.stringify(userData));
    navigateTo("dashboard", userData.role);
  };

  const handleLogout = () => {
    const userRole = loggedInUser?.role;

    setLoggedInUser(null);
    sessionStorage.removeItem("loggedInUser");
    sessionStorage.removeItem("authToken");

    if (userRole === "patient") {
      setPage("patient-login");
      window.location.hash = "#patient";
    } else if (userRole === "doctor") {
      setPage("doctor-login");
      window.location.hash = "#doctor";
    } else {
      setPage("home");
      window.location.hash = "";
    }
  };

  const renderPage = () => {
    if (page === "support") {
      const onBackAction = loggedInUser
        ? () => navigateTo("dashboard", loggedInUser.role)
        : () => navigateTo("home");

      return <SupportPage onBack={onBackAction} />;
    }

    if (page === "doctors") {
      const onBackAction = loggedInUser
        ? () => navigateTo("dashboard", loggedInUser.role)
        : () => navigateTo("home");

      return <DoctorsPage onBack={onBackAction} />;
    }

    if (loggedInUser) {
      switch (loggedInUser.role) {
        case "patient":
          return (
            <PatientDashboard user={loggedInUser} onLogout={handleLogout} />
          );
        case "doctor":
          return (
            <DoctorDashboard user={loggedInUser} onLogout={handleLogout} />
          );
        default:
          return (
            <div className="p-8">
              <h1>Dashboard for {loggedInUser.role}</h1>
              <button onClick={handleLogout}>Logout</button>
            </div>
          );
      }
    }

    switch (page) {
      case "role_select":
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
      case "auth":
        return (
          <AuthPage
            role={selectedRole}
            onBack={() => navigateTo(authBackPage || "role_select")}
            onLoginSuccess={handleLoginSuccess}
          />
        );
      case "home":
      default:
        return (
          <HomePage
            onNavigateToRoleSelect={() => navigateTo("role_select")}
            loggedIn={!!loggedInUser}
            onLogout={handleLogout}
            onNavigateToDashboard={() =>
              navigateTo("dashboard", loggedInUser?.role)
            }
          />
        );
    }
  };

  return (
    <div>
      {renderPage()}
      <ChatWidget />
    </div>
  );
}

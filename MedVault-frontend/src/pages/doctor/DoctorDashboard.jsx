import React, { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar.jsx";
import DoctorAddPrescriptionModal from "../../components/modals/DoctorAddPrescriptionModal.jsx";
import DoctorViewRecordsModal from "../../components/doctor/records/DoctorViewRecordsModal.jsx";
import authFetch from "../../services/authFetch.js";
import { getISTGreeting } from "../../utils/date.js";

// --- DOCTOR DASHBOARD ---
const DoctorDashboard = ({ user, onLogout }) => {
  // UI State
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("dashboard");
  const [showNotifications, setShowNotifications] = useState(false);
  const [message, setMessage] = useState("");

  // Data State
  const [doctorProfile, setDoctorProfile] = useState({});
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [stats, setStats] = useState({
    pendingRequests: 0,
    todayAppointments: 0,
    totalPatients: 0,
    totalEarnings: 0,
    averageRating: 4.5,
    emergencyCases: 0,
  });

  // Lists
  const [pendingAppointments, setPendingAppointments] = useState([]); // Regular pending
  const [approvedAppointments, setApprovedAppointments] = useState([]); // Regular approved
  const [rejectedAppointments, setRejectedAppointments] = useState([]); // Regular rejected
  const [completedAppointments, setCompletedAppointments] = useState([]); // Regular completed + passed emergency
  const [emergencyRequests, setEmergencyRequests] = useState([]); // Pending emergency
  const [approvedEmergency, setApprovedEmergency] = useState([]); // Upcoming emergency

  const [slots, setSlots] = useState([]);
  const [qualifications, setQualifications] = useState([]);
  const [allPatients, setAllPatients] = useState(new Map());
  const [userIssues, setUserIssues] = useState([]);
  const [showReportIssueModal, setShowReportIssueModal] = useState(false);
  const [issueForm, setIssueForm] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    subject: "",
    message: "",
  });

  // Modals & Forms
  const [showCreateSlotModal, setShowCreateSlotModal] = useState(false);
  const [showUploadQualificationModal, setShowUploadQualificationModal] =
    useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showViewRecordsModal, setShowViewRecordsModal] = useState(false);
  const [selectedPatientForUpload, setSelectedPatientForUpload] =
    useState(null);
  const [selectedPatientForView, setSelectedPatientForView] = useState(null);
  const [slotData, setSlotData] = useState({ slotDate: "", slotTime: "" });
  const [qualificationData, setQualificationData] = useState({
    documentName: "",
    documentType: "Degree",
    file: null,
  });
  const [uploadedPrescriptions, setUploadedPrescriptions] = useState(new Set());
  const [activeTab, setActiveTab] = useState("all"); // For Appointments Tab
  const [consentStatus, setConsentStatus] = useState(new Map());

  // --- CONSENT LOGIC ---
  // Note: Consent is per-appointment for regular appointments, per-emergency-request for emergency
  const fetchAllConsentStatus = async (appointments) => {
    if (!user?.doctorId) return;
    const newConsentStatus = new Map();

    for (const apt of appointments) {
      const patientId = apt.patient?.patientId || apt.patientId;
      const isEmergency = apt.requestId && !apt.appointmentId;
      // For regular appointments use appointmentId, for emergency use requestId
      const appointmentId = apt.appointmentId;
      const emergencyRequestId = isEmergency ? apt.requestId : null;
      const statusKey = isEmergency
        ? `${patientId}_${apt.requestId}`
        : appointmentId
          ? `${patientId}_${appointmentId}`
          : patientId;

      if (!patientId) continue;

      try {
        // Build URL with appropriate parameters
        let url = `https://medvault-backend-ni3i.onrender.com/api/consent-requests/status?doctorId=${user.doctorId}&patientId=${patientId}`;
        if (isEmergency && emergencyRequestId) {
          // For emergency requests, pass emergencyRequestId
          url += `&emergencyRequestId=${emergencyRequestId}`;
        } else if (appointmentId) {
          // For regular appointments, pass appointmentId
          url += `&appointmentId=${appointmentId}`;
        }

        const res = await fetch(url, { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          if (data.hasPermission) {
            newConsentStatus.set(statusKey, "APPROVED");
          } else if (data.hasPendingRequest) {
            newConsentStatus.set(statusKey, "PENDING");
          } else {
            newConsentStatus.set(statusKey, "LOCKED");
          }
        } else {
          newConsentStatus.set(statusKey, "LOCKED");
        }
      } catch (e) {
        console.error(
          `Failed to fetch consent status for patient ${patientId}`,
          e,
        );
        newConsentStatus.set(statusKey, "LOCKED");
      }
    }
    setConsentStatus(newConsentStatus);
  };

  // Updated to handle both regular appointments and emergency requests
  const handleRequestAccess = async (
    patientId,
    appointmentId = null,
    emergencyRequestId = null,
  ) => {
    if (!user?.doctorId) return;
    try {
      const requestBody = { doctorId: user.doctorId, patientId: patientId };
      if (emergencyRequestId) {
        requestBody.emergencyRequestId = emergencyRequestId.toString();
      } else if (appointmentId) {
        requestBody.appointmentId = appointmentId;
      }
      console.log("🔐 Requesting access:", requestBody);
      const res = await authFetch(
        `https://medvault-backend-ni3i.onrender.com/api/consent-requests`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
          body: JSON.stringify(requestBody),
        },
      );
      if (res.ok) {
        setMessage(
          "✅ Access requested successfully! Patient will be notified.",
        );
        // Update consent status with the correct key
        const newConsentStatus = new Map(consentStatus);
        const statusKey = emergencyRequestId
          ? `${patientId}_${emergencyRequestId}`
          : appointmentId
            ? `${patientId}_${appointmentId}`
            : patientId;
        newConsentStatus.set(statusKey, "PENDING");
        setConsentStatus(newConsentStatus);
      } else {
        const error = await res.text();
        setMessage(`❌ ${error}`);
      }
    } catch (e) {
      console.error("❌ Request access error:", e);
      setMessage("❌ Failed to request access.");
    }
    setTimeout(() => setMessage(""), 3000);
  };

  const handleViewRecords = (
    patient,
    appointmentId = null,
    emergencyRequestId = null,
  ) => {
    // Fix: Check if patient and patientId exist
    if (!patient || !patient.patientId) {
      setMessage("❌ Patient information not available. Please try again.");
      setTimeout(() => setMessage(""), 3000);
      return;
    }

    // Use the correct key format based on type
    const statusKey = emergencyRequestId
      ? `${patient.patientId}_${emergencyRequestId}`
      : appointmentId
        ? `${patient.patientId}_${appointmentId}`
        : patient.patientId;
    const status = consentStatus.get(statusKey);
    console.log(
      "🔐 Checking consent for key:",
      statusKey,
      "status:",
      status,
      "emergencyRequestId:",
      emergencyRequestId,
    );

    switch (status) {
      case "APPROVED":
        setSelectedPatientForView(patient);
        setShowViewRecordsModal(true);
        break;
      case "LOCKED":
        handleRequestAccess(
          patient.patientId,
          appointmentId,
          emergencyRequestId,
        );
        break;
      case "PENDING":
        setMessage("Request is already pending approval.");
        setTimeout(() => setMessage(""), 3000);
        break;
      default:
        // If status is unknown (undefined), request access
        console.log("🔐 Status unknown, requesting access");
        handleRequestAccess(
          patient.patientId,
          appointmentId,
          emergencyRequestId,
        );
    }
  };

  // --- NOTIFICATION LOGIC (Robust Fix) ---
  const fetchNotifications = () => {
    // 1. Try to find the correct ID from the user object
    // The database has UUIDs like "0a910776...", we need to find that string in the user object
    const currentUserId = user?.userId || user?.id || user?.user_id;

    if (!currentUserId) {
      console.warn(
        "⚠️ Notification Error: No User ID found in 'user' object. Cannot fetch.",
      );
      console.log("Current User Object:", user);
      return;
    }

    // 2. Fetch using the found ID
    authFetch(
      `https://medvault-backend-ni3i.onrender.com/api/notifications/user/${currentUserId}`,
    )
      .then((r) => {
        if (!r.ok) throw new Error("Failed to fetch");
        return r.json();
      })
      .then((d) => {
        console.log("✅ Notifications fetched:", d); // Debug log
        setNotifications(d);
        setUnreadCount(d.filter((n) => !n.isRead).length);
      })
      .catch((err) => console.error("Notification fetch error:", err));
  };

  // --- NOTIFICATION: Handler for clicking the bell icon ---
  const handleBellClick = () => {
    setShowNotifications((prev) => !prev); // Toggle the view

    // If we are opening the list AND there are unread items
    if (!showNotifications && unreadCount > 0) {
      authFetch(
        `https://medvault-backend-ni3i.onrender.com/api/notifications/user/${user.userId}/read-all`,
        {
          method: "PUT",
        },
      )
        .then((res) => {
          if (res.ok) {
            setUnreadCount(0); // Optimistically set count to 0

            // Update the local list to show as "read"
            setNotifications((prev) =>
              prev.map((n) => ({ ...n, isRead: true })),
            );
          }
        })
        .catch(console.error);
    }
  };

  // --- NOTIFICATION: Handler for clicking a single notification item ---
  const handleNotificationClick = (notification) => {
    // Mark as read if it's not already
    if (!notification.isRead) {
      authFetch(
        `https://medvault-backend-ni3i.onrender.com/api/notifications/${notification.notificationId}/read`,
        {
          method: "PUT",
        },
      ).catch(console.error); // Fire and forget
    }

    // --- Navigation Logic ---
    // If it's an appointment, go to the appointments page
    if (
      notification.notificationType &&
      notification.notificationType.includes("APPOINTMENT")
    ) {
      setActiveSection("appointments");
    }

    setShowNotifications(false); // Close dropdown
  };
  // --- UTILITIES ---
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour < 21; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const startHour = hour;
        const startMin = minute;
        const endMin = minute + 30;
        const endHour = endMin >= 60 ? hour + 1 : hour;
        const finalEndMin = endMin >= 60 ? 0 : endMin;
        const period = startHour >= 12 ? "PM" : "AM";
        const endPeriod = endHour >= 12 ? "PM" : "AM";
        // Value in 24-hour format for backend (HH:mm)
        const value24h = `${String(startHour).padStart(2, "0")}:${String(startMin).padStart(2, "0")}`;
        // Display format: 9:00 AM - 9:30 AM
        const displayStart = `${startHour > 12 ? startHour - 12 : startHour === 0 ? 12 : startHour}:${String(startMin).padStart(2, "0")} ${period}`;
        const displayEnd = `${endHour > 12 ? endHour - 12 : endHour === 0 ? 12 : endHour}:${String(finalEndMin).padStart(2, "0")} ${endPeriod}`;

        slots.push({
          value: value24h,
          label: `${displayStart} - ${displayEnd}`,
        });
      }
    }
    return slots;
  };
  const timeSlots = generateTimeSlots();

  // --- FETCH DATA EFFECTS ---
  useEffect(() => {
    const doctorId = user?.doctorId || user?.professionalId;
    if (!doctorId) return;

    const fetchData = async () => {
      try {
        // 1. Profile
        const profileRes = await authFetch(
          `https://medvault-backend-ni3i.onrender.com/api/doctors/${doctorId}`,
        );
        if (profileRes.ok) {
          const data = await profileRes.json();
          setDoctorProfile({
            firstName: data.firstName || "",
            lastName: data.lastName || "",
            email: data.email || user.email || "",
            phone: data.phone || "",
            specialization: data.specialization || "",
            licenseNumber: data.licenseNumber || "",
            licenseExpiry: data.licenseExpiry || "",
            qualification: data.qualification || "",
            consultationFee: data.consultationFee || "",
            experienceYears: data.experienceYears || "",
            hospitalAffiliation: data.hospitalAffiliation || "",
            address: data.address || "",
            city: data.city || "",
            state: data.state || "",
            country: data.country || "",
            postalCode: data.postalCode || "",
            isVerified: data.isVerified || data.verified || false,
          });
        }

        // 2. Notifications
        const notifRes = await authFetch(
          `https://medvault-backend-ni3i.onrender.com/api/notifications/user/${user.userId}`,
        );
        if (notifRes.ok) {
          const data = await notifRes.json();
          setNotifications(data);
          setUnreadCount(data.filter((n) => !n.isRead).length);
        }

        // 3. Slots
        const slotsRes = await authFetch(
          `https://medvault-backend-ni3i.onrender.com/api/slots/doctor/${doctorId}`,
        );
        if (slotsRes.ok) setSlots(await slotsRes.json());

        // 4. Qualifications
        const qualRes = await authFetch(
          `https://medvault-backend-ni3i.onrender.com/api/qualifications/doctor/${doctorId}`,
        );
        if (qualRes.ok) setQualifications(await qualRes.json());

        // --- COMBINED APPOINTMENT & EMERGENCY FETCH ---
        const appRes = await authFetch(
          `https://medvault-backend-ni3i.onrender.com/api/appointments/doctor/${doctorId}`,
        );
        const appData = appRes.ok ? await appRes.json() : [];

        const emerRes = await authFetch(
          `https://medvault-backend-ni3i.onrender.com/api/emergency-requests/doctor/${doctorId}`,
        );
        const emerData = emerRes.ok ? await emerRes.json() : [];

        // --- POPULATE PATIENT MAP (FIX) ---
        const pMap = new Map();
        appData.forEach((a) => {
          if (a.patient) pMap.set(a.patient.patientId, a.patient);
        });
        emerData.forEach((e) => {
          if (e.patient) pMap.set(e.patient.patientId, e.patient);
        });
        setAllPatients(pMap);

        // Fetch consent status for all appointments (regular + emergency)
        const allAppointmentsForConsent = [...appData, ...emerData];
        fetchAllConsentStatus(allAppointmentsForConsent);

        // --- PROCESS & SET STATE (FIX) ---
        const now = new Date();
        setPendingAppointments(
          appData.filter((a) => a.status?.toUpperCase() === "PENDING"),
        );

        // ONLY regular approved appointments (NO emergency)
        setApprovedAppointments(
          appData.filter((a) => a.status?.toUpperCase() === "APPROVED"),
        );

        // Rejected appointments
        setRejectedAppointments(
          appData.filter((a) => a.status?.toUpperCase() === "REJECTED"),
        );

        const regularCompleted = appData.filter(
          (a) => a.status?.toUpperCase() === "COMPLETED",
        );
        const passedEmer = emerData.filter(
          (r) => r.status === "APPROVED" && new Date(r.requestDateTime) < now,
        );
        setCompletedAppointments([
          ...regularCompleted,
          ...passedEmer.map((e) => ({
            ...e,
            isEmergency: true,
            patientId: e.patient?.patientId || e.patientId,
          })),
        ]); // Add patientId fix

        // Emergency requests - pending ones
        const pendingEmer = emerData.filter((r) => r.status === "PENDING");
        setEmergencyRequests(pendingEmer);

        // Approved emergency requests with future dates - for Emergency tab
        const futureEmer = emerData.filter(
          (r) => r.status === "APPROVED" && new Date(r.requestDateTime) >= now,
        );
        setApprovedEmergency(futureEmer);
        // --- END OF FIX ---
      } catch (e) {
        console.error("Data fetch error", e);
      }
    };

    fetchData();

    // LocalStorage Prescriptions
    const stored = JSON.parse(
      localStorage.getItem("uploadedPrescriptions") || "[]",
    );
    setUploadedPrescriptions(new Set(stored));

    // Fetch user issues
    if (user?.email)
      authFetch(
        `https://medvault-backend-ni3i.onrender.com/api/issues/email/${user.email}`,
      )
        .then((r) => (r.ok ? r.json() : []))
        .then((d) => setUserIssues(d))
        .catch(console.error);
  }, [user]);

  // This separate fetch function can be used to refresh *just* appointments
  const fetchDoctorAppointments = () => {
    if (!user?.doctorId) return;
    authFetch(
      `https://medvault-backend-ni3i.onrender.com/api/appointments/doctor/${user.doctorId}`,
    )
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        const now = new Date();
        setPendingAppointments(
          data.filter((a) => a.status?.toUpperCase() === "PENDING"),
        );
        setApprovedAppointments(
          data.filter((a) => a.status?.toUpperCase() === "APPROVED"),
        );
        setRejectedAppointments(
          data.filter((a) => a.status?.toUpperCase() === "REJECTED"),
        );

        const regularCompleted = data.filter(
          (a) => a.status?.toUpperCase() === "COMPLETED",
        );
        // Re-check passed emergencies when refreshing
        const passedEmer = emergencyRequests.filter(
          (r) => r.status === "APPROVED" && new Date(r.requestDateTime) < now,
        );
        setCompletedAppointments([
          ...regularCompleted,
          ...passedEmer.map((e) => ({
            ...e,
            isEmergency: true,
            patientId: e.patient?.patientId || e.patientId,
          })),
        ]);

        const pMap = new Map(allPatients); // Copy existing map
        data.forEach((a) => {
          if (a.patient) pMap.set(a.patient.patientId, a.patient);
        });
        setAllPatients(pMap);
      })
      .catch(console.error);
  };

  // Refresh emergency requests (e.g., after approval)
  const fetchEmergencyRequests = () => {
    if (!user?.doctorId) return;
    authFetch(
      `https://medvault-backend-ni3i.onrender.com/api/emergency-requests/doctor/${user.doctorId}`,
    )
      .then((res) => (res.ok ? res.json() : []))
      .then((emerData) => {
        const now = new Date();
        const pendingEmer = emerData.filter((r) => r.status === "PENDING");
        setEmergencyRequests(pendingEmer);
        const futureEmer = emerData.filter(
          (r) => r.status === "APPROVED" && new Date(r.requestDateTime) >= now,
        );
        setApprovedEmergency(futureEmer);

        // Update completed list as well
        const regularCompleted = completedAppointments.filter(
          (a) => !a.isEmergency,
        );
        const passedEmer = emerData.filter(
          (r) => r.status === "APPROVED" && new Date(r.requestDateTime) < now,
        );
        setCompletedAppointments([
          ...regularCompleted,
          ...passedEmer.map((e) => ({
            ...e,
            isEmergency: true,
            patientId: e.patient?.patientId || e.patientId,
          })),
        ]);
      });
  };

  // Fetch user issues
  const fetchUserIssues = () => {
    if (user?.email)
      authFetch(
        `https://medvault-backend-ni3i.onrender.com/api/issues/email/${user.email}`,
      )
        .then((r) => (r.ok ? r.json() : []))
        .then((d) => setUserIssues(d))
        .catch(console.error);
  };

  // Stats Calculation
  useEffect(() => {
    const today = new Date().toDateString();
    const todayAppts = approvedAppointments.filter(
      (a) => new Date(a.appointmentDateTime).toDateString() === today,
    ).length;
    const uniquePatients = allPatients.size;
    setStats((prev) => ({
      ...prev,
      pendingRequests: pendingAppointments.length + emergencyRequests.length, // Total pending
      todayAppointments: todayAppts,
      totalPatients: uniquePatients,
      totalEarnings:
        completedAppointments.length * (doctorProfile.consultationFee || 500),
      averageRating: 4.5, // Hardcoded as per screenshot
      emergencyCases: emergencyRequests.length + approvedEmergency.length, // Pending + Upcoming
    }));
  }, [
    pendingAppointments,
    approvedAppointments,
    completedAppointments,
    emergencyRequests,
    approvedEmergency,
    doctorProfile,
    allPatients,
  ]);

  // --- HANDLERS ---
  const handleCreateSlot = async () => {
    if (!slotData.slotDate || !slotData.slotTime) {
      setMessage("❌ Please select date and time");
      return;
    }
    try {
      const res = await authFetch(
        `https://medvault-backend-ni3i.onrender.com/api/slots/create`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            doctorId: user.doctorId,
            slotDate: slotData.slotDate,
            slotTimes: [slotData.slotTime],
          }),
        },
      );
      if (res.ok) {
        setMessage("✅ Slot created!");
        authFetch(
          `https://medvault-backend-ni3i.onrender.com/api/slots/doctor/${user.doctorId}`,
        )
          .then((r) => r.json())
          .then(setSlots);
        setSlotData({ slotDate: "", slotTime: "" });
        setTimeout(() => setMessage(""), 3000);
      }
    } catch (e) {
      setMessage("❌ Failed to create slot");
    }
  };

  const handleUploadQualification = async () => {
    if (!qualificationData.documentName || !qualificationData.file) {
      setMessage("❌ Missing fields");
      return;
    }
    if (qualificationData.file.type !== "application/pdf") {
      setMessage("❌ Only PDF files are allowed.");
      return;
    }

    try {
      const fd = new FormData();
      fd.append("doctorId", user.doctorId);
      fd.append("documentName", qualificationData.documentName);
      fd.append("documentType", qualificationData.documentType);
      fd.append("file", qualificationData.file);
      const res = await authFetch(
        `https://medvault-backend-ni3i.onrender.com/api/qualifications/uploads`,
        { method: "POST", body: fd },
      );
      if (res.ok) {
        setMessage("✅ Uploaded!");
        authFetch(
          `https://medvault-backend-ni3i.onrender.com/api/qualifications/doctor/${user.doctorId}`,
        )
          .then((r) => r.json())
          .then(setQualifications);
        setQualificationData({
          documentName: "",
          documentType: "Degree",
          file: null,
        });
        setShowUploadQualificationModal(false); // Close modal on success
        setTimeout(() => setMessage(""), 3000);
      }
    } catch (e) {
      setMessage("❌ Upload failed");
    }
  };

  const updateAppointmentStatus = async (id, status) => {
    try {
      await authFetch(
        `https://medvault-backend-ni3i.onrender.com/api/appointments/${id}/status`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        },
      );
      fetchDoctorAppointments();
      setMessage(`✅ Appointment ${status.toLowerCase()}!`);
      setTimeout(() => setMessage(""), 3000);
    } catch (e) {
      setMessage("❌ Update failed");
    }
  };

  const updateEmergencyRequestStatus = async (id, status) => {
    try {
      await authFetch(
        `https://medvault-backend-ni3i.onrender.com/api/emergency-requests/${id}/status`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        },
      );
      fetchEmergencyRequests(); // Refresh emergency list
      fetchDoctorAppointments(); // Refresh regular lists
      setMessage(`✅ Request ${status.toLowerCase()}!`);
      setTimeout(() => setMessage(""), 3000);
    } catch (e) {
      setMessage("❌ Update failed");
    }
  };

  const handlePrescriptionAdded = () => {
    setShowUploadModal(false);
    setMessage("✅ Prescription Sent!");
    const appointmentId =
      selectedPatientForUpload?.appointmentId ||
      selectedPatientForUpload?.requestId;
    if (appointmentId) {
      const newSet = new Set(uploadedPrescriptions).add(appointmentId);
      setUploadedPrescriptions(newSet);
      localStorage.setItem(
        "uploadedPrescriptions",
        JSON.stringify([...newSet]),
      );
    }
    setTimeout(() => setMessage(""), 3000);
  };

  const handleUploadPrescription = (patient, appointmentId) => {
    setSelectedPatientForUpload({ ...patient, appointmentId: appointmentId });
    setShowUploadModal(true);
  };

  const handleDownloadQual = (qualification) => {
    if (!qualification.documentPath) {
      setMessage("❌ Document path not found.");
      setTimeout(() => setMessage(""), 3000);
      return;
    }
    setMessage(`Downloading ${qualification.documentName}...`);

    const link = document.createElement("a");
    link.href = qualification.documentPath;
    link.setAttribute(
      "download",
      qualification.documentName || "qualification.pdf",
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => setMessage(""), 3000);
  };

  // Sidebar Items for Doctor
  const sidebarItems = [
    { id: "dashboard", label: "Dashboard", icon: "fa-chart-line" },
    { id: "profile", label: "My Profile", icon: "fa-user-md" },
    { id: "slots", label: "Manage Slots", icon: "fa-clock" },
    {
      id: "appointments",
      label: "Manage Appointments",
      icon: "fa-calendar-check",
    },
    { id: "requests", label: "Booking Requests", icon: "fa-inbox" },
    {
      id: "reviews",
      label: "Reviews & Prescriptions",
      icon: "fa-file-prescription",
    },
    { id: "qualifications", label: "Qualifications", icon: "fa-certificate" },
    { id: "reports", label: "Reports & Issues", icon: "fa-flag" },
  ];

  // --- DERIVED STATE FOR SLOTS & APPOINTMENTS (FOR COUNTS & LISTS) ---
  const today = new Date(new Date().setHours(0, 0, 0, 0));
  const activeSlots = slots
    .filter((s) => new Date(s.slotDate) >= today)
    .sort((a, b) => new Date(a.slotDate) - new Date(b.slotDate));
  const passedSlots = slots
    .filter((s) => new Date(s.slotDate) < today)
    .sort((a, b) => new Date(b.slotDate) - new Date(a.slotDate));

  const upcomingAppointments = approvedAppointments.filter((a) => {
    const dateTime = a.appointmentDateTime || a.requestDateTime;
    return new Date(dateTime) > new Date();
  });

  // Combine all appointments (completed + approved + rejected + emergency completed + active emergency)
  // and remove duplicates based on appointmentId or requestId
  const allAppointmentsRaw = [
    ...approvedAppointments,
    ...completedAppointments,
    ...rejectedAppointments,
    ...approvedEmergency,
  ];
  const seenIds = new Set();
  const allAppointments = allAppointmentsRaw.filter((a) => {
    const id = a.appointmentId || a.requestId;
    // If no valid ID, include the item (don't filter it out)
    if (!id) return true;
    if (seenIds.has(id)) return false;
    seenIds.add(id);
    return true;
  });

  return (
    <div className="flex min-h-screen bg-brand-bg font-sans">
      {/* SIDEBAR */}
      <Sidebar
        isOpen={isSidebarOpen}
        toggle={() => setIsSidebarOpen(!isSidebarOpen)}
        activeSection={activeSection}
        onSelectSection={setActiveSection}
        menuItems={sidebarItems}
        onLogout={onLogout}
        userRole="doctor"
      />

      {/* MAIN CONTENT AREA */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarOpen ? "ml-72" : "ml-20"}`}
      >
        {/* HEADER (UPDATED) */}
        <header className="bg-gradient-to-r from-purple-600 via-pink-600 to-yellow-500 shadow-lg sticky top-0 z-30 px-8 py-4 h-20 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h1
              className="text-2xl font-extrabold text-white flex items-center cursor-pointer"
              onClick={() => window.location.reload()}
            >
              <i className="fas fa-shield-heart text-3xl mr-2"></i> MedVault
            </h1>
          </div>

          {/* --- UPDATED HEADER BUTTONS (GLASS EFFECT) --- */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                sessionStorage.removeItem("loggedInUser");
                sessionStorage.removeItem("authToken");
                window.location.href = "http://localhost:5173/";
              }}
              className="bg-white/30 backdrop-blur-sm border border-white/40 text-white px-4 py-2 rounded-lg font-bold hover:bg-white/50 transition flex items-center text-sm"
            >
              <i className="fas fa-home mr-2"></i> Home
            </button>
            <button
              onClick={() => {
                window.location.hash = "#support";
              }}
              className="bg-white/30 backdrop-blur-sm border border-white/40 text-white px-4 py-2 rounded-lg font-bold hover:bg-white/50 transition flex items-center text-sm"
            >
              <i className="fas fa-exclamation-circle mr-2"></i> Report Issue
            </button>

            {/* Notification Bell (RED COUNTER) */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  if (!showNotifications && unreadCount > 0) {
                    authFetch(
                      `https://medvault-backend-ni3i.onrender.com/api/notifications/user/${user.userId}/read-all`,
                      { method: "PUT" },
                    )
                      .then(() => {
                        setUnreadCount(0);
                        setNotifications((prev) =>
                          prev.map((n) => ({ ...n, isRead: true })),
                        );
                      })
                      .catch(console.error);
                  }
                }}
                className="text-white hover:text-yellow-200 relative transition-colors transform hover:scale-110"
              >
                <i className="fas fa-bell text-2xl"></i>
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {unreadCount}
                  </span>
                )}
              </button>
              {showNotifications && (
                <div className="absolute right-0 mt-4 w-80 bg-white rounded-xl shadow-2xl z-50 border border-slate-100 p-4">
                  <h3 className="font-bold text-purple-600 border-b pb-2 mb-2">
                    Notifications
                  </h3>
                  {notifications.length === 0 ? (
                    <p className="text-sm text-slate-500">No notifications</p>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.notificationId}
                        className="p-2 border-b text-sm hover:bg-slate-50"
                      >
                        {n.message}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="p-8 max-w-7xl w-full mx-auto bg-brand-bg">
          {/* --- BANNER (FULL PURPLE) --- */}
          <div className="relative bg-gradient-to-r from-purple-600 to-brand-purple rounded-3xl shadow-lg p-8 mb-10 flex items-center overflow-hidden animate-fade-in">
            <div className="flex items-center gap-6 z-10">
              <div className="p-1 rounded-full bg-white/30 border-2 border-white/50">
                <img
                  src={
                    user.profilePictureUrl ||
                    `https://placehold.co/128x128/B8BDFF/7209B7?text=${user.name?.charAt(0)}`
                  }
                  alt="Profile"
                  className="w-28 h-28 rounded-full object-cover"
                />
              </div>
              <div>
                <h2 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
                  {/* --- GREETING & VERIFIED BADGE --- */}
                  {getISTGreeting()}, {user.name}!
                  {(doctorProfile.isVerified || doctorProfile.verified) && (
                    <img
                      src="https://cdn-icons-png.flaticon.com/128/2143/2143150.png"
                      alt="Verified"
                      title="Verified Doctor"
                      className="w-8 h-8"
                    />
                  )}
                </h2>
                <p className="text-purple-100 text-lg opacity-90 italic">
                  Dedicated to healing, committed to care
                </p>
              </div>
            </div>
          </div>

          {message && (
            <div className="mb-6 p-4 bg-yellow-100 text-yellow-800 rounded-xl font-bold text-center border border-yellow-200 shadow-sm">
              {message}
            </div>
          )}

          {/* --- DASHBOARD SECTION (NEW STATS CARDS) --- */}
          {activeSection === "dashboard" && (
            <div className="animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-2xl shadow-md border-l-4 border-purple-500 flex items-center gap-4 hover:shadow-lg transition-all">
                  <div className="w-14 h-14 bg-purple-100 rounded-full flex items-center justify-center text-purple-600">
                    <i className="fas fa-clock text-2xl"></i>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-slate-800">
                      {stats.pendingRequests}
                    </p>
                    <p className="text-slate-500 font-bold text-xs uppercase">
                      Pending Requests
                    </p>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-md border-l-4 border-yellow-500 flex items-center gap-4 hover:shadow-lg transition-all">
                  <div className="w-14 h-14 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600">
                    <i className="fas fa-calendar-day text-2xl"></i>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-slate-800">
                      {stats.todayAppointments}
                    </p>
                    <p className="text-slate-500 font-bold text-xs uppercase">
                      Today's Appointments
                    </p>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-md border-l-4 border-blue-500 flex items-center gap-4 hover:shadow-lg transition-all">
                  <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                    <i className="fas fa-users text-2xl"></i>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-slate-800">
                      {stats.totalPatients}
                    </p>
                    <p className="text-slate-500 font-bold text-xs uppercase">
                      Total Patients
                    </p>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-md border-l-4 border-red-500 flex items-center gap-4 hover:shadow-lg transition-all">
                  <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center text-red-600">
                    <i className="fas fa-ambulance text-2xl"></i>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-slate-800">
                      {stats.emergencyCases}
                    </p>
                    <p className="text-slate-500 font-bold text-xs uppercase">
                      Emergency requests
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm p-8 border border-slate-100">
                <h4 className="text-lg font-bold text-slate-800 mb-6 flex items-center">
                  <i className="fas fa-calendar-alt mr-2 text-purple-600"></i>{" "}
                  Today's Schedule
                </h4>
                {approvedAppointments.filter(
                  (a) =>
                    new Date(a.appointmentDateTime).toDateString() ===
                    new Date().toDateString(),
                ).length === 0 ? (
                  <p className="text-slate-500 italic">
                    No appointments scheduled for today.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {approvedAppointments
                      .filter(
                        (a) =>
                          new Date(a.appointmentDateTime).toDateString() ===
                          new Date().toDateString(),
                      )
                      .map((a) => (
                        <div
                          key={a.appointmentId}
                          className="flex items-center p-4 bg-slate-50 rounded-xl"
                        >
                          <div className="flex items-center gap-4 flex-1">
                            <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                              {a.patient?.firstName?.charAt(0) || "P"}
                            </div>
                            <div className="flex-1">
                              <p className="font-bold text-slate-800">
                                {a.patient
                                  ? `${a.patient.firstName} ${a.patient.lastName}`
                                  : "N/A"}
                              </p>
                              <div className="flex items-center gap-4 text-sm text-slate-500">
                                <span>
                                  <i className="fas fa-calendar mr-1"></i>
                                  {new Date(
                                    a.appointmentDateTime,
                                  ).toLocaleDateString()}
                                </span>
                                <span>
                                  <i className="fas fa-clock mr-1"></i>
                                  {new Date(
                                    a.appointmentDateTime,
                                  ).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </span>
                                {a.reason && (
                                  <span className="text-slate-600 border-l border-slate-300 pl-4">
                                    <i className="fas fa-notes-medical mr-1"></i>
                                    {a.reason}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
                            APPROVED
                          </span>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* --- MY PROFILE SECTION --- */}
          {activeSection === "profile" && (
            <div className="animate-fade-in bg-white rounded-2xl shadow-sm p-8 border border-slate-100">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-bold text-slate-800 flex items-center">
                  <i className="fas fa-user-circle mr-2 text-purple-600"></i> My
                  Profile
                </h3>
                <button
                  onClick={() => setIsEditingProfile(!isEditingProfile)}
                  className="bg-purple-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-purple-700 transition"
                >
                  {isEditingProfile ? "Save Profile" : "Edit Profile"}
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  "firstName",
                  "lastName",
                  "email",
                  "phone",
                  "specialization",
                  "experienceYears",
                  "licenseNumber",
                  "licenseExpiry",
                  "consultationFee",
                  "city",
                  "state",
                  "country",
                  "postalCode",
                  "hospitalAffiliation",
                  "qualification",
                ].map((field) => (
                  <div
                    key={field}
                    className="p-4 bg-slate-50 rounded-xl border border-slate-100"
                  >
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                      {field === "experienceYears"
                        ? "Experience"
                        : field.replace(/([A-Z])/g, " $1")}
                    </label>
                    {isEditingProfile ? (
                      <input
                        className="w-full bg-white border border-slate-300 rounded p-1"
                        value={doctorProfile[field] || ""}
                        onChange={(e) =>
                          setDoctorProfile({
                            ...doctorProfile,
                            [field]: e.target.value,
                          })
                        }
                      />
                    ) : (
                      <p className="text-slate-800 font-semibold text-lg">
                        {field === "consultationFee" && "₹"}
                        {doctorProfile[field] || "N/A"}
                        {field === "experienceYears" && " years"}
                      </p>
                    )}
                  </div>
                ))}
                <div className="md:col-span-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                    Address
                  </label>
                  {isEditingProfile ? (
                    <textarea
                      className="w-full bg-white border border-slate-300 rounded p-1"
                      value={doctorProfile.address || ""}
                      onChange={(e) =>
                        setDoctorProfile({
                          ...doctorProfile,
                          address: e.target.value,
                        })
                      }
                    />
                  ) : (
                    <p className="text-slate-800 font-semibold">
                      {doctorProfile.address || "N/A"}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* --- CREATE SLOTS SECTION (UPDATED) --- */}
          {activeSection === "slots" && (
            <div className="animate-fade-in">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-slate-800 flex items-center">
                  <i className="fas fa-clock mr-2 text-yellow-600"></i> My
                  Availability Slots
                </h3>
                <button
                  onClick={() => setShowCreateSlotModal(true)}
                  className="bg-orange-500 text-white px-6 py-2 rounded-lg font-bold hover:bg-orange-600 shadow-md"
                >
                  + Create Slot
                </button>
              </div>

              <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 mb-8">
                <h4 className="font-bold text-slate-800 mb-4">
                  Active Slots ({activeSlots.length})
                </h4>
                {activeSlots.length === 0 ? (
                  <div className="p-8 text-center bg-yellow-50 rounded-xl border border-yellow-100 text-yellow-700">
                    No active slots found.
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Group slots by date */}
                    {Object.entries(
                      activeSlots.reduce((groups, slot) => {
                        const date = new Date(
                          slot.slotDate,
                        ).toLocaleDateString();
                        if (!groups[date]) groups[date] = [];
                        groups[date].push(slot);
                        return groups;
                      }, {}),
                    ).map(([date, slotsForDate]) => {
                      const bookedCount = slotsForDate.filter(
                        (s) => !s.isAvailable,
                      ).length;
                      const totalCount = slotsForDate.length;
                      return (
                        <div
                          key={date}
                          className="border border-slate-200 rounded-xl overflow-hidden"
                        >
                          <div className="bg-slate-100 px-4 py-3 flex justify-between items-center">
                            <h5 className="font-bold text-slate-800">{date}</h5>
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-bold ${bookedCount === totalCount ? "bg-red-100 text-red-700" : bookedCount > 0 ? "bg-yellow-100 text-yellow-700" : "bg-green-100 text-green-700"}`}
                            >
                              {bookedCount}/{totalCount} Booked
                            </span>
                          </div>
                          <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                            {slotsForDate.map((s) => (
                              <div
                                key={s.slotId}
                                className={`p-3 rounded-lg border ${s.isAvailable ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}
                              >
                                <p className="text-sm font-semibold text-slate-700">
                                  {s.slotTime}
                                </p>
                                <span
                                  className={`inline-block mt-1 px-2 py-0.5 rounded text-xs font-bold ${s.isAvailable ? "bg-green-200 text-green-800" : "bg-red-200 text-red-800"}`}
                                >
                                  {s.isAvailable ? "Available" : "Booked"}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
                <h4 className="font-bold text-slate-500 mb-4">
                  Passed Slots ({passedSlots.length})
                </h4>
                {passedSlots.length === 0 ? (
                  <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-100 text-slate-500 italic">
                    No passed slots.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {passedSlots.slice(0, 8).map(
                      (
                        s, // Show max 8 passed slots
                      ) => (
                        <div
                          key={s.slotId}
                          className="p-4 rounded-xl border bg-slate-50 border-slate-200 opacity-70"
                        >
                          <p className="font-semibold text-slate-600">
                            {new Date(s.slotDate).toLocaleDateString()}
                          </p>
                          <p className="text-sm text-slate-500">{s.slotTime}</p>
                          <span className="inline-block mt-2 px-2 py-0.5 rounded text-xs font-bold bg-slate-200 text-slate-600">
                            {s.isAvailable ? "Expired" : "Completed"}
                          </span>
                        </div>
                      ),
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* --- MANAGE APPOINTMENTS SECTION (ACTION COLUMN FIX) --- */}
          {activeSection === "appointments" && (
            <div className="animate-fade-in bg-white rounded-2xl shadow-sm p-8 border border-slate-100">
              <h3 className="text-2xl font-bold text-slate-800 mb-6 flex items-center">
                <i className="fas fa-calendar-check mr-2 text-blue-600"></i>{" "}
                Manage Appointments
              </h3>

              <div className="flex gap-8 border-b border-slate-200 mb-6">
                <button
                  onClick={() => setActiveTab("all")}
                  className={`pb-3 font-bold text-sm transition-colors ${activeTab === "all" ? "text-purple-600 border-b-2 border-purple-600" : "text-slate-400 hover:text-purple-600"}`}
                >
                  All ({allAppointments.length})
                </button>
                <button
                  onClick={() => setActiveTab("upcoming")}
                  className={`pb-3 font-bold text-sm transition-colors ${activeTab === "upcoming" ? "text-purple-600 border-b-2 border-purple-600" : "text-slate-400 hover:text-purple-600"}`}
                >
                  Upcoming ({upcomingAppointments.length})
                </button>
                <button
                  onClick={() => setActiveTab("approved")}
                  className={`pb-3 font-bold text-sm transition-colors ${activeTab === "approved" ? "text-purple-600 border-b-2 border-purple-600" : "text-slate-400 hover:text-purple-600"}`}
                >
                  Approved ({approvedAppointments.length})
                </button>
                <button
                  onClick={() => setActiveTab("emergency")}
                  className={`pb-3 font-bold text-sm transition-colors ${activeTab === "emergency" ? "text-purple-600 border-b-2 border-purple-600" : "text-slate-400 hover:text-purple-600"}`}
                >
                  Emergency ({approvedEmergency.length})
                </button>
                <button
                  onClick={() => setActiveTab("completed")}
                  className={`pb-3 font-bold text-sm transition-colors ${activeTab === "completed" ? "text-purple-600 border-b-2 border-purple-600" : "text-slate-400 hover:text-purple-600"}`}
                >
                  Completed ({completedAppointments.length})
                </button>
              </div>

              {/* --- DYNAMIC HEADER --- */}
              <div
                className={`grid ${activeTab === "all" || activeTab === "completed" || activeTab === "upcoming" ? "grid-cols-5" : "grid-cols-6"} gap-4 font-bold text-slate-800 mb-4 px-4`}
              >
                <div>Patient</div>
                <div>Date</div>
                <div>Time</div>
                <div>Reason</div>
                <div>Status</div>
                {activeTab !== "all" &&
                  activeTab !== "completed" &&
                  activeTab !== "upcoming" && <div>Action</div>}
              </div>

              <div className="space-y-2">
                {/* --- ALL (grid-cols-5) --- */}
                {activeTab === "all" && allAppointments.length === 0 && (
                  <p className="text-center p-4 text-slate-500 italic">
                    No appointments found.
                  </p>
                )}
                {activeTab === "all" &&
                  allAppointments.map((a, index) => {
                    const patient = allPatients.get(
                      a.patient?.patientId || a.patientId,
                    );
                    const isEmergency = a.isEmergency || a.requestId;
                    const dateTime = a.appointmentDateTime || a.requestDateTime;
                    const patientName =
                      a.patientName ||
                      (patient
                        ? `${patient.firstName} ${patient.lastName}`
                        : a.patient
                          ? `${a.patient.firstName} ${a.patient.lastName}`
                          : "Unknown Patient");
                    const reason = isEmergency
                      ? a.conditionDescription || "Emergency"
                      : a.reason || "General Checkup";
                    const uniqueKey =
                      a.appointmentId || a.requestId || `all-${index}`;
                    // Determine emergency status: EMERGENCY (COMPLETED) or EMERGENCY (UPCOMING)
                    const isUpcomingEmergency =
                      isEmergency &&
                      a.status === "APPROVED" &&
                      new Date(dateTime) >= new Date();
                    const isCompletedEmergency =
                      isEmergency &&
                      (a.status === "COMPLETED" ||
                        (a.status === "APPROVED" &&
                          new Date(dateTime) < new Date()));
                    const displayStatus = isEmergency
                      ? isCompletedEmergency
                        ? "EMERGENCY (COMPLETED)"
                        : isUpcomingEmergency
                          ? "EMERGENCY (UPCOMING)"
                          : a.status
                      : a.status;
                    return (
                      <div
                        key={uniqueKey}
                        className={`grid grid-cols-5 gap-4 items-center p-4 rounded-xl ${isEmergency ? "bg-red-50" : "bg-slate-50"}`}
                      >
                        <div className="font-semibold text-slate-700">
                          {patientName}
                        </div>
                        <div className="text-slate-600 text-sm">
                          {new Date(dateTime).toLocaleDateString()}
                        </div>
                        <div className="text-slate-600 text-sm">
                          {new Date(dateTime).toLocaleTimeString()}
                        </div>
                        <div className="text-slate-600 text-sm">{reason}</div>
                        <div>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                              displayStatus === "EMERGENCY (COMPLETED)"
                                ? "bg-orange-100 text-orange-800"
                                : displayStatus === "EMERGENCY (UPCOMING)"
                                  ? "bg-red-100 text-red-800"
                                  : a.status === "APPROVED"
                                    ? "bg-green-100 text-green-800"
                                    : a.status === "COMPLETED"
                                      ? "bg-blue-100 text-blue-800"
                                      : a.status === "REJECTED"
                                        ? "bg-red-100 text-red-800"
                                        : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {displayStatus}
                          </span>
                        </div>
                        {/* --- NO ACTION COLUMN --- */}
                      </div>
                    );
                  })}

                {/* --- UPCOMING (grid-cols-6) --- */}
                {activeTab === "upcoming" &&
                  upcomingAppointments.length === 0 && (
                    <p className="text-center p-4 text-slate-500 italic">
                      No upcoming appointments.
                    </p>
                  )}
                {activeTab === "upcoming" &&
                  upcomingAppointments.map((a) => {
                    // Fix: Get patient from multiple sources
                    const isEmergency = a.isEmergency || a.requestId;
                    const dateTime = a.appointmentDateTime || a.requestDateTime;
                    const patientFromMap = allPatients.get(
                      a.patient?.patientId || a.patientId,
                    );
                    const patient = patientFromMap ||
                      a.patient || {
                        patientId: a.patientId,
                        firstName: "Unknown",
                        lastName: "Patient",
                      };
                    const patientIdForConsent =
                      patient?.patientId || a.patient?.patientId || a.patientId;
                    // Use appointment-specific consent key
                    const appointmentId = a.appointmentId || a.requestId;
                    const consentKey = appointmentId
                      ? `${patientIdForConsent}_${appointmentId}`
                      : patientIdForConsent;
                    const status = consentStatus.get(consentKey) || "LOCKED";
                    const reason = isEmergency
                      ? a.conditionDescription || "Emergency"
                      : a.reason || "General Checkup";
                    return (
                      <div
                        key={a.appointmentId || a.requestId}
                        className="grid grid-cols-5 gap-4 items-center p-4 rounded-xl bg-slate-50"
                      >
                        <div className="font-semibold text-slate-700">
                          {patient?.firstName || "Unknown"}{" "}
                          {patient?.lastName || "Patient"}
                        </div>
                        <div className="text-slate-600 text-sm">
                          {new Date(dateTime).toLocaleDateString()}
                        </div>
                        <div className="text-slate-600 text-sm">
                          {new Date(dateTime).toLocaleTimeString()}
                        </div>
                        <div className="text-slate-600 text-sm">{reason}</div>
                        <div>
                          <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800">
                            UPCOMING
                          </span>
                        </div>
                      </div>
                    );
                  })}

                {/* --- APPROVED (grid-cols-6) --- */}
                {activeTab === "approved" &&
                  approvedAppointments.length === 0 && (
                    <p className="text-center p-4 text-slate-500 italic">
                      No approved appointments.
                    </p>
                  )}
                {activeTab === "approved" &&
                  approvedAppointments.map((a) => {
                    // Fix: Get patient from multiple sources
                    const patientFromMap = allPatients.get(
                      a.patient?.patientId,
                    );
                    const patient = patientFromMap ||
                      a.patient || {
                        patientId: a.patientId,
                        firstName: "Unknown",
                        lastName: "Patient",
                      };
                    const patientIdForConsent =
                      patient?.patientId || a.patient?.patientId;
                    // Use appointment-specific consent key
                    const consentKey = a.appointmentId
                      ? `${patientIdForConsent}_${a.appointmentId}`
                      : patientIdForConsent;
                    const status = consentStatus.get(consentKey) || "LOCKED";
                    const reason = a.reason || "General Checkup";
                    return (
                      <div
                        key={a.appointmentId}
                        className="grid grid-cols-6 gap-4 items-center p-4 bg-slate-50 rounded-xl"
                      >
                        <div className="font-semibold text-slate-700">
                          {patient?.firstName || "Unknown"}{" "}
                          {patient?.lastName || "Patient"}
                        </div>
                        <div className="text-slate-600 text-sm">
                          {new Date(a.appointmentDateTime).toLocaleDateString()}
                        </div>
                        <div className="text-slate-600 text-sm">
                          {new Date(a.appointmentDateTime).toLocaleTimeString()}
                        </div>
                        <div className="text-slate-600 text-sm">{reason}</div>
                        <div>
                          <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-bold">
                            APPROVED
                          </span>
                        </div>
                        <div>
                          <button
                            onClick={() => {
                              if (patient && patientIdForConsent) {
                                handleViewRecords(
                                  {
                                    ...patient,
                                    patientId: patientIdForConsent,
                                  },
                                  a.appointmentId,
                                );
                              } else {
                                setMessage(
                                  "❌ Patient information not available",
                                );
                                setTimeout(() => setMessage(""), 3000);
                              }
                            }}
                            className={`font-bold text-sm flex items-center gap-1 w-fit px-3 py-1 rounded-lg
                                                            ${status === "APPROVED" ? "bg-blue-100 text-blue-600 hover:bg-blue-200" : ""}
                                                            ${status === "LOCKED" ? "bg-yellow-400 text-white hover:bg-yellow-500" : ""}
                                                            ${status === "PENDING" ? "bg-gray-400 text-white cursor-not-allowed" : ""}
                                                        `}
                            disabled={status === "PENDING"}
                          >
                            <i
                              className={`fas ${status === "LOCKED" ? "fa-lock" : "fa-file-alt"}`}
                            ></i>
                            {status === "APPROVED"
                              ? "View Records"
                              : status === "LOCKED"
                                ? "Request Access"
                                : "Pending"}
                          </button>
                          {status === "LOCKED" && (
                            <p className="text-xs text-slate-500 mt-1 italic">
                              View health records, medical conditions and
                              prescriptions
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}

                {/* --- EMERGENCY (grid-cols-6) --- */}
                {activeTab === "emergency" &&
                  approvedEmergency.length === 0 && (
                    <p className="text-center p-4 text-slate-500 italic">
                      No upcoming emergency appointments.
                    </p>
                  )}
                {activeTab === "emergency" &&
                  approvedEmergency.map((a) => {
                    // Fix: Get patient from multiple sources
                    const patientFromMap =
                      allPatients.get(a.patientId) ||
                      allPatients.get(a.patient?.patientId);
                    const patient = patientFromMap ||
                      a.patient || {
                        patientId: a.patientId,
                        firstName: "Unknown",
                        lastName: "Patient",
                      };
                    const patientName =
                      a.patientName ||
                      (patient
                        ? `${patient.firstName || ""} ${patient.lastName || ""}`.trim()
                        : "Unknown Patient");
                    const patientIdForConsent =
                      patient?.patientId || a.patientId;
                    // Use appointment-specific consent key (requestId for emergency)
                    const consentKey = a.requestId
                      ? `${patientIdForConsent}_${a.requestId}`
                      : patientIdForConsent;
                    const status = consentStatus.get(consentKey) || "LOCKED";
                    const reason = a.conditionDescription || "Emergency";
                    return (
                      <div
                        key={a.requestId}
                        className="grid grid-cols-6 gap-4 items-center p-4 bg-red-50 rounded-xl"
                      >
                        <div className="font-semibold text-slate-700">
                          {patientName}
                        </div>
                        <div className="text-slate-600 text-sm">
                          {new Date(a.requestDateTime).toLocaleDateString()}
                        </div>
                        <div className="text-slate-600 text-sm">
                          {new Date(a.requestDateTime).toLocaleTimeString()}
                        </div>
                        <div className="text-slate-600 text-sm">{reason}</div>
                        <div>
                          <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs font-bold">
                            EMERGENCY
                          </span>
                        </div>
                        <div>
                          <button
                            onClick={() => {
                              // Fix: Ensure patient object has patientId before calling
                              // Pass null for appointmentId and requestId as emergencyRequestId
                              if (
                                patient &&
                                (patient.patientId || a.patientId)
                              ) {
                                handleViewRecords(
                                  {
                                    ...patient,
                                    patientId: patient.patientId || a.patientId,
                                  },
                                  null,
                                  a.requestId,
                                );
                              } else {
                                setMessage(
                                  "❌ Patient information not available",
                                );
                                setTimeout(() => setMessage(""), 3000);
                              }
                            }}
                            className={`font-bold text-sm flex items-center gap-1 w-fit px-3 py-1 rounded-lg
                                                            ${status === "APPROVED" ? "bg-blue-100 text-blue-600 hover:bg-blue-200" : ""}
                                                            ${status === "LOCKED" ? "bg-yellow-400 text-white hover:bg-yellow-500" : ""}
                                                            ${status === "PENDING" ? "bg-gray-400 text-white cursor-not-allowed" : ""}
                                                        `}
                            disabled={status === "PENDING"}
                          >
                            <i
                              className={`fas ${status === "LOCKED" ? "fa-lock" : "fa-file-alt"}`}
                            ></i>
                            {status === "APPROVED"
                              ? "View Records"
                              : status === "LOCKED"
                                ? "Request Access"
                                : "Pending"}
                          </button>
                          {status === "LOCKED" && (
                            <p className="text-xs text-slate-500 mt-1 italic">
                              View health records, medical conditions and
                              prescriptions
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}

                {/* --- COMPLETED (grid-cols-5) --- */}
                {activeTab === "completed" &&
                  completedAppointments.length === 0 && (
                    <p className="text-center p-4 text-slate-500 italic">
                      No completed appointments.
                    </p>
                  )}
                {activeTab === "completed" &&
                  completedAppointments.map((a) => {
                    const patient = allPatients.get(
                      a.patient?.patientId || a.patientId,
                    );
                    const isEmergency = a.isEmergency || false;
                    const patientName =
                      a.patientName ||
                      (patient
                        ? `${patient.firstName} ${patient.lastName}`
                        : a.patient
                          ? `${a.patient.firstName} ${a.patient.lastName}`
                          : "Unknown Patient");
                    const reason = isEmergency
                      ? a.conditionDescription || "Emergency"
                      : a.reason || "General Checkup";
                    return (
                      <div
                        key={a.appointmentId || a.requestId}
                        className={`grid grid-cols-5 gap-4 items-center p-4 rounded-xl ${isEmergency ? "bg-red-50" : "bg-slate-50"}`}
                      >
                        <div className="font-semibold text-slate-700">
                          {patientName}
                        </div>
                        <div className="text-slate-600 text-sm">
                          {new Date(
                            a.appointmentDateTime || a.requestDateTime,
                          ).toLocaleDateString()}
                        </div>
                        <div className="text-slate-600 text-sm">
                          {new Date(
                            a.appointmentDateTime || a.requestDateTime,
                          ).toLocaleTimeString()}
                        </div>
                        <div className="text-slate-600 text-sm">{reason}</div>
                        <div>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold ${isEmergency ? "bg-red-100 text-red-800" : "bg-blue-100 text-blue-800"}`}
                          >
                            {isEmergency
                              ? "COMPLETED (EMERGENCY)"
                              : "COMPLETED"}
                          </span>
                        </div>
                        {/* --- NO ACTION COLUMN --- */}
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* --- BOOKING REQUESTS SECTION --- */}
          {activeSection === "requests" && (
            <div className="animate-fade-in bg-white rounded-2xl shadow-sm p-8 border border-slate-100">
              <h3 className="text-2xl font-bold text-slate-800 mb-6">
                Booking Requests
              </h3>

              {emergencyRequests.length > 0 && (
                <div className="mb-8">
                  <h4 className="text-lg font-bold text-red-600 mb-4 flex items-center">
                    <i className="fas fa-ambulance mr-2"></i> Emergency Requests
                  </h4>
                  <div className="border-2 border-red-100 rounded-xl overflow-hidden">
                    <div className="grid grid-cols-5 gap-4 bg-red-50 p-4 font-bold text-red-800 border-b border-red-100">
                      <div>Patient</div>
                      <div>Date & Time</div>
                      <div>Urgency</div>
                      <div>Condition</div>
                      <div>Actions</div>
                    </div>
                    {emergencyRequests.length === 0 ? (
                      <div className="p-8 text-center">
                        <i className="fas fa-ambulance text-4xl text-red-200 mb-4"></i>
                        <p className="text-slate-500 font-medium">
                          No pending emergency requests
                        </p>
                        <p className="text-slate-400 text-sm mt-1">
                          Emergency requests will appear here
                        </p>
                      </div>
                    ) : (
                      emergencyRequests.map((r) => {
                        const patient = allPatients.get(r.patientId);
                        const patientName =
                          r.patientName ||
                          (patient
                            ? `${patient.firstName} ${patient.lastName}`
                            : "Unknown Patient");
                        return (
                          <div
                            key={r.requestId}
                            className="grid grid-cols-5 gap-4 p-4 items-center border-b border-red-50 hover:bg-red-50/50"
                          >
                            <div className="font-semibold text-slate-700">
                              {patientName}
                            </div>
                            <div className="text-sm text-slate-600">
                              {new Date(r.requestDateTime).toLocaleString()}
                            </div>
                            <div>
                              <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-bold uppercase">
                                {r.urgencyLevel}
                              </span>
                            </div>
                            <div className="text-sm text-slate-600 italic">
                              {r.conditionDescription}
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() =>
                                  updateEmergencyRequestStatus(
                                    r.requestId,
                                    "APPROVED",
                                  )
                                }
                                className="bg-green-100 text-green-700 px-3 py-1 rounded text-xs font-bold hover:bg-green-200"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() =>
                                  updateEmergencyRequestStatus(
                                    r.requestId,
                                    "REJECTED",
                                  )
                                }
                                className="bg-red-100 text-red-700 px-3 py-1 rounded text-xs font-bold hover:bg-red-200"
                              >
                                Reject
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}

              <h4 className="text-lg font-bold text-slate-800 mb-4">
                Regular Appointments
              </h4>
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="grid grid-cols-4 gap-4 bg-slate-50 p-4 font-bold text-slate-700 border-b border-slate-200">
                  <div>Patient</div>
                  <div>Date</div>
                  <div>Reason</div>
                  <div>Actions</div>
                </div>
                {pendingAppointments.length === 0 ? (
                  <div className="p-4 text-center text-slate-500 italic">
                    No pending regular appointments.
                  </div>
                ) : (
                  pendingAppointments.map((a) => (
                    <div
                      key={a.appointmentId}
                      className="grid grid-cols-4 gap-4 p-4 items-center border-b border-slate-100 hover:bg-slate-50"
                    >
                      <div className="font-semibold text-slate-700">
                        {a.patient?.firstName} {a.patient?.lastName}
                      </div>
                      <div className="text-sm text-slate-600">
                        {new Date(a.appointmentDateTime).toLocaleString()}
                      </div>
                      <div className="text-sm text-slate-600">
                        {a.reason || "Checkup"}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            updateAppointmentStatus(a.appointmentId, "APPROVED")
                          }
                          className="bg-green-100 text-green-700 px-3 py-1 rounded text-xs font-bold hover:bg-green-200"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() =>
                            updateAppointmentStatus(a.appointmentId, "REJECTED")
                          }
                          className="bg-red-100 text-red-700 px-3 py-1 rounded text-xs font-bold hover:bg-red-200"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* --- REVIEWS & PRESCRIPTIONS SECTION (UPDATED) --- */}
          {activeSection === "reviews" && (
            <div className="animate-fade-in space-y-6">
              {/* Rating Distribution Card */}
              <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-100">
                <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <i className="fas fa-star text-amber-500"></i> Rating
                  Distribution
                </h3>
                <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
                  {[5, 4, 3, 2, 1].map((star) => {
                    const reviewsWithRating = completedAppointments.filter(
                      (a) => a.review && a.review.rating === star,
                    );
                    const totalReviews = completedAppointments.filter(
                      (a) => a.review,
                    ).length;
                    const count = reviewsWithRating.length;
                    const percentage =
                      totalReviews > 0
                        ? Math.round((count / totalReviews) * 100)
                        : 0;
                    return (
                      <div key={star} className="flex items-center gap-3 mb-2">
                        <span className="text-amber-600 w-8 font-bold">
                          {star} ☆
                        </span>
                        <div className="flex-1 bg-amber-100 rounded-full h-4 overflow-hidden">
                          <div
                            className="bg-amber-500 h-full rounded-full transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-slate-600 text-sm w-20 text-right">
                          {count} ({percentage}%)
                        </span>
                      </div>
                    );
                  })}
                  <div className="mt-4 pt-4 border-t border-amber-200 flex justify-between items-center">
                    <span className="text-slate-700 font-semibold">
                      Total Reviews:{" "}
                      {completedAppointments.filter((a) => a.review).length}
                    </span>
                    <span className="text-amber-600 font-bold text-lg">
                      Avg:{" "}
                      {completedAppointments.filter((a) => a.review).length > 0
                        ? (
                            completedAppointments
                              .filter((a) => a.review)
                              .reduce(
                                (sum, a) => sum + (a.review?.rating || 0),
                                0,
                              ) /
                            completedAppointments.filter((a) => a.review).length
                          ).toFixed(1)
                        : "0.0"}{" "}
                      ★
                    </span>
                  </div>
                </div>
              </div>

              {/* Feedbacks & Prescriptions Table */}
              <div className="bg-white rounded-2xl shadow-sm p-8 border border-slate-100">
                <h3 className="text-2xl font-bold text-slate-800 mb-6">
                  Feedbacks & Prescriptions
                </h3>
                <div className="overflow-x-auto">
                  <div className="min-w-full">
                    <div className="grid grid-cols-6 gap-4 bg-slate-50 p-4 rounded-t-xl font-bold text-slate-700 text-sm">
                      <div>Patient</div>
                      <div>Date</div>
                      <div>Time</div>
                      <div>Reason</div>
                      <div>Patient Feedback</div>
                      <div>Action</div>
                    </div>
                    <div className="border border-t-0 border-slate-200 rounded-b-xl">
                      {completedAppointments.map((a) => {
                        const patient = allPatients.get(
                          a.patient?.patientId || a.patientId,
                        );
                        const patientName = patient
                          ? `${patient.firstName} ${patient.lastName}`
                          : a.patient
                            ? `${a.patient.firstName} ${a.patient.lastName}`
                            : "N/A";
                        const dateTime =
                          a.appointmentDateTime || a.requestDateTime;
                        const appointmentId = a.appointmentId || a.requestId; // Use correct ID
                        const reason =
                          a.reason || a.conditionDescription || "N/A";
                        return (
                          <div
                            key={appointmentId}
                            className={`grid grid-cols-6 gap-4 p-4 items-center border-b border-slate-100 ${a.isEmergency ? "bg-red-50/50" : "hover:bg-slate-50"} transition`}
                          >
                            <div className="font-semibold text-slate-700">
                              {patientName}
                            </div>
                            <div className="text-sm text-slate-600">
                              {new Date(dateTime).toLocaleDateString()}
                            </div>
                            <div className="text-sm text-slate-600">
                              {new Date(dateTime).toLocaleTimeString()}
                            </div>
                            <div className="text-sm text-slate-600">
                              {reason}
                            </div>
                            <div>
                              {a.review ? (
                                <div>
                                  <div className="text-amber-400 text-xs">
                                    {"★".repeat(a.review.rating)}
                                  </div>
                                  <div className="text-xs text-slate-500 italic">
                                    "{a.review.feedback}"
                                  </div>
                                </div>
                              ) : (
                                <span
                                  className={`text-xs ${a.isEmergency ? "text-red-500" : "text-slate-400"} italic`}
                                >
                                  {a.isEmergency
                                    ? "Emergency Consult"
                                    : "No feedback submitted."}
                                </span>
                              )}
                            </div>
                            <div>
                              {uploadedPrescriptions.has(appointmentId) ? (
                                <span className="px-3 py-1 bg-green-100 text-green-700 rounded text-xs font-bold flex items-center w-fit">
                                  <i className="fas fa-check mr-1"></i> Uploaded
                                </span>
                              ) : (
                                <button
                                  onClick={() =>
                                    handleUploadPrescription(
                                      patient,
                                      appointmentId,
                                    )
                                  }
                                  className="bg-purple-100 text-purple-700 px-3 py-1 rounded text-xs font-bold hover:bg-purple-200 flex items-center w-fit"
                                >
                                  <i className="fas fa-upload mr-1"></i> Upload
                                  Prescription
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* --- QUALIFICATIONS SECTION (DOWNLOAD FIX) --- */}
          {activeSection === "qualifications" && (
            <div className="animate-fade-in">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-slate-800">
                  <i className="fas fa-certificate mr-2 text-purple-600"></i> My
                  Qualifications
                </h3>
                <button
                  onClick={() => setShowUploadQualificationModal(true)}
                  className="bg-purple-500 text-white px-6 py-2 rounded-lg font-bold hover:bg-purple-600 shadow-md"
                >
                  <i className="fas fa-upload mr-2"></i> Upload Qualification
                </button>
              </div>

              <div className="bg-white rounded-2xl shadow-sm p-8 border border-slate-100">
                <h4 className="font-bold text-slate-800 mb-4">
                  Uploaded Documents ({qualifications.length})
                </h4>
                {qualifications.length === 0 ? (
                  <div className="p-8 text-center text-slate-500">
                    No qualifications uploaded yet.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {qualifications.map((q) => (
                      <div
                        key={q.qualificationId}
                        className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-red-100 text-red-600 rounded-lg flex items-center justify-center text-xl">
                            <i className="fas fa-file-pdf"></i>
                          </div>
                          <div>
                            <p className="font-bold text-slate-800">
                              {q.documentName}
                            </p>
                            <p className="text-xs text-slate-500">
                              {q.documentType}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span
                            className={`text-xs font-bold px-3 py-1.5 rounded-full uppercase flex items-center gap-1.5 ${
                              q.verificationStatus === "VERIFIED" ||
                              q.verificationStatus === "APPROVED"
                                ? "bg-green-100 text-green-700"
                                : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            {(q.verificationStatus === "VERIFIED" ||
                              q.verificationStatus === "APPROVED") && (
                              <i className="fas fa-check-circle"></i>
                            )}
                            {q.verificationStatus === "APPROVED"
                              ? "Verified"
                              : q.verificationStatus || "Pending"}
                          </span>
                          <button
                            onClick={() => handleDownloadQual(q)}
                            className="text-blue-600 font-bold text-sm hover:underline flex items-center gap-1"
                          >
                            <i className="fas fa-download"></i> Download
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* REPORTS & ISSUES - DOCTOR */}
          {activeSection === "reports" && (
            <section className="animate-fade-in space-y-6">
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                    <i className="fas fa-flag text-orange-500"></i> My Reports &
                    Issues
                  </h3>
                  <button
                    onClick={() => {
                      window.location.hash = "#support";
                    }}
                    className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-lg font-bold hover:shadow-lg transition-all"
                  >
                    <i className="fas fa-plus mr-2"></i> Report New Issue
                  </button>
                </div>

                {userIssues.length === 0 ? (
                  <div className="text-center py-12">
                    <i className="fas fa-check-circle text-6xl text-green-300 mb-4"></i>
                    <p className="text-slate-500 text-lg">
                      No issues reported yet.
                    </p>
                    <p className="text-slate-400 text-sm mt-2">
                      If you face any problems, click "Report New Issue" above.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {userIssues.map((issue) => {
                      const statusLower = (
                        issue.status || "pending"
                      ).toLowerCase();
                      const isResolved = statusLower === "resolved";
                      const isInProgress =
                        statusLower === "in-progress" ||
                        statusLower === "in_progress";
                      return (
                        <div
                          key={issue.id}
                          className={`p-5 rounded-xl border-2 ${isResolved ? "bg-green-50 border-green-200" : isInProgress ? "bg-blue-50 border-blue-200" : "bg-orange-50 border-orange-200"}`}
                        >
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h4 className="font-bold text-lg text-slate-800">
                                {issue.subject || "Issue Report"}
                              </h4>
                              <p className="text-sm text-slate-500">
                                Submitted:{" "}
                                {new Date(issue.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${isResolved ? "bg-green-500 text-white" : isInProgress ? "bg-blue-500 text-white" : "bg-orange-500 text-white"}`}
                            >
                              {issue.status || "PENDING"}
                            </span>
                          </div>
                          <p className="text-slate-700 mb-3">{issue.message}</p>
                          {issue.adminMessage && (
                            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                              <p className="text-sm font-bold text-blue-700 mb-1">
                                <i className="fas fa-reply mr-1"></i> Admin
                                Response:
                              </p>
                              <p className="text-slate-700">
                                {issue.adminMessage}
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </section>
          )}
        </main>
      </div>

      {/* --- DOCTOR MODALS --- */}
      {showCreateSlotModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowCreateSlotModal(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-4">Add Availability Slot</h2>
            <input
              type="date"
              className="w-full p-3 border rounded mb-4"
              value={slotData.slotDate}
              onChange={(e) =>
                setSlotData({ ...slotData, slotDate: e.target.value })
              }
            />
            <select
              className="w-full p-3 border rounded mb-4"
              value={slotData.slotTime}
              onChange={(e) =>
                setSlotData({ ...slotData, slotTime: e.target.value })
              }
            >
              <option value="">Select Time</option>
              {timeSlots.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
            <button
              onClick={handleCreateSlot}
              className="w-full bg-purple-600 text-white py-3 rounded font-bold"
            >
              Create Slot
            </button>
          </div>
        </div>
      )}

      {showUploadQualificationModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowUploadQualificationModal(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-800">
                Upload Qualification
              </h2>
              <button
                onClick={() => setShowUploadQualificationModal(false)}
                className="text-slate-400 hover:text-slate-600 text-2xl font-bold"
              >
                &times;
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Document Name
                </label>
                <input
                  type="text"
                  placeholder="e.g., MBBS Certificate"
                  className="w-full p-3 border rounded"
                  value={qualificationData.documentName}
                  onChange={(e) =>
                    setQualificationData({
                      ...qualificationData,
                      documentName: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Document Type
                </label>
                <select
                  className="w-full p-3 border rounded"
                  value={qualificationData.documentType}
                  onChange={(e) =>
                    setQualificationData({
                      ...qualificationData,
                      documentType: e.target.value,
                    })
                  }
                >
                  <option>Degree</option>
                  <option>Certificate</option>
                  <option>License</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Upload File{" "}
                  <span className="text-red-500 font-normal">
                    (Only PDF allowed)
                  </span>
                </label>
                <input
                  type="file"
                  className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                  accept=".pdf" // Ensures only PDFs can be selected
                  onChange={(e) =>
                    setQualificationData({
                      ...qualificationData,
                      file: e.target.files[0],
                    })
                  }
                />
              </div>
              <button
                onClick={handleUploadQualification}
                className="w-full bg-purple-600 text-white py-3 rounded font-bold"
              >
                Upload
              </button>
            </div>
          </div>
        </div>
      )}

      {showUploadModal && selectedPatientForUpload && (
        <DoctorAddPrescriptionModal
          doctorUser={user}
          patient={selectedPatientForUpload}
          onClose={() => setShowUploadModal(false)}
          onRecordAdded={handlePrescriptionAdded}
        />
      )}

      {showViewRecordsModal && selectedPatientForView && (
        <DoctorViewRecordsModal
          patient={selectedPatientForView}
          doctorId={user?.doctorId}
          onClose={() => setShowViewRecordsModal(false)}
          onUploadPrescription={handleUploadPrescription}
        />
      )}

      {/* REPORT ISSUE MODAL - DOCTOR */}
      {showReportIssueModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8 animate-fade-in">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-slate-800">
                <i className="fas fa-flag text-orange-500 mr-2"></i> Report an
                Issue
              </h3>
              <button
                onClick={() => setShowReportIssueModal(false)}
                className="text-slate-400 hover:text-slate-600 text-2xl"
              >
                &times;
              </button>
            </div>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Your Name"
                value={
                  issueForm.name ||
                  doctorProfile?.firstName + " " + doctorProfile?.lastName ||
                  ""
                }
                onChange={(e) =>
                  setIssueForm({ ...issueForm, name: e.target.value })
                }
                className="w-full p-3 border border-slate-200 rounded-lg"
              />
              <input
                type="email"
                placeholder="Your Email"
                value={issueForm.email || user?.email || ""}
                onChange={(e) =>
                  setIssueForm({ ...issueForm, email: e.target.value })
                }
                className="w-full p-3 border border-slate-200 rounded-lg"
              />
              <input
                type="tel"
                placeholder="Phone Number (optional)"
                value={issueForm.phoneNumber}
                onChange={(e) =>
                  setIssueForm({ ...issueForm, phoneNumber: e.target.value })
                }
                className="w-full p-3 border border-slate-200 rounded-lg"
              />
              <input
                type="text"
                placeholder="Subject"
                value={issueForm.subject}
                onChange={(e) =>
                  setIssueForm({ ...issueForm, subject: e.target.value })
                }
                className="w-full p-3 border border-slate-200 rounded-lg"
              />
              <textarea
                placeholder="Describe your issue in detail..."
                value={issueForm.message}
                onChange={(e) =>
                  setIssueForm({ ...issueForm, message: e.target.value })
                }
                className="w-full p-3 border border-slate-200 rounded-lg h-32 resize-none"
              ></textarea>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowReportIssueModal(false)}
                className="flex-1 py-3 border border-slate-300 rounded-lg font-bold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const payload = {
                    name:
                      issueForm.name ||
                      doctorProfile?.firstName + " " + doctorProfile?.lastName,
                    email: issueForm.email || user?.email,
                    phoneNumber: issueForm.phoneNumber,
                    subject: issueForm.subject,
                    message: issueForm.message,
                    userType: "DOCTOR",
                    userId: user?.userId,
                  };
                  authFetch(
                    "https://medvault-backend-ni3i.onrender.com/api/issues",
                    {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify(payload),
                    },
                  )
                    .then((r) => {
                      if (r.ok) {
                        setShowReportIssueModal(false);
                        setIssueForm({
                          name: "",
                          email: "",
                          phoneNumber: "",
                          subject: "",
                          message: "",
                        });
                        fetchUserIssues();
                        setMessage("Issue reported successfully!");
                        setTimeout(() => setMessage(""), 3000);
                      } else {
                        setMessage("Failed to submit issue");
                        setTimeout(() => setMessage(""), 3000);
                      }
                    })
                    .catch((err) => {
                      setMessage("Error: " + err.message);
                      setTimeout(() => setMessage(""), 3000);
                    });
                }}
                className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg font-bold hover:shadow-lg"
              >
                Submit Issue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
// --- DashboardHeader (MODIFIED) ---

export default DoctorDashboard;

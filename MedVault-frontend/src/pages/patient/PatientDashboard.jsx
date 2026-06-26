import React, { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar.jsx";
import PatientHeader from "../../components/patient/PatientHeader.jsx";
import PatientDashboardOverview from "../../components/patient/PatientDashboardOverview.jsx";
import FeedbackModal from "../../components/modals/FeedbackModal.jsx";
import AddConditionModal from "../../components/modals/AddConditionModal.jsx";
import AddRecordModal from "../../components/modals/AddRecordModal.jsx";
import ViewRecordModal from "../../components/modals/ViewRecordModal.jsx";
import DummyPaymentModal from "../../components/modals/DummyPaymentModal.jsx";
import ReportIssueModal from "../../components/modals/ReportIssueModal.jsx";
import authFetch from "../../services/authFetch.js";
import EmptyState from "../../components/common/EmptyState.jsx";
import PatientProfileSection from "../../components/patient/PatientProfileSection.jsx";
import PatientWelcomeBanner from "../../components/patient/common/PatientWelcomeBanner.jsx";
import BookAppointmentSection from "../../components/patient/appointments/BookAppointmentSection.jsx";
import PatientRecordsSection from "../../components/patient/records/PatientRecordsSection.jsx";
import PatientPrescriptionsSection from "../../components/patient/medications/PatientPrescriptionsSection.jsx";
import EmergencyRequestSection from "../../components/patient/emergency/EmergencyRequestSection.jsx";
import MedicalConditionsSection from "../../components/patient/conditions/MedicalConditionsSection.jsx";
import PatientIssuesSection from "../../components/patient/issues/PatientIssuesSection.jsx";

const PatientDashboard = ({ user, onLogout }) => {
  // --- STATE ---
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [medicalConditions, setMedicalConditions] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [emergencyRequests, setEmergencyRequests] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [pendingConsentRequests, setPendingConsentRequests] = useState([]);
  const [accessRequests, setAccessRequests] = useState([]);
  const [userIssues, setUserIssues] = useState([]);
  const [showReportIssueModal, setShowReportIssueModal] = useState(false);
  const [issueForm, setIssueForm] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    subject: "",
    message: "",
  });

  // --- UI STATE ---
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("dashboard");
  const [activeTab, setActiveTab] = useState("all");
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // --- FORMS & DATA ---
  const [profileData, setProfileData] = useState({});
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [selectedDoctorId, setSelectedDoctorId] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [availableSlots, setAvailableSlots] = useState([]);
  const [reason, setReason] = useState("");
  const [selectedDoctorFee, setSelectedDoctorFee] = useState(null); // <-- Fee state

  const defaultEmergencyData = {
    doctorId: "",
    urgencyLevel: "",
    preferredDate: "",
    preferredTime: "",
    currentLocation: "",
    conditionDescription: "",
  };
  const [emergencyData, setEmergencyData] = useState(defaultEmergencyData);

  // --- LOADERS & MODALS ---
  const [loading, setLoading] = useState(false);
  const [doctorsLoading, setDoctorsLoading] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [conditionMessage, setConditionMessage] = useState("");

  const [showDummyPaymentModal, setShowDummyPaymentModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [selectedAppointmentForFeedback, setSelectedAppointmentForFeedback] =
    useState(null);
  const [showAddConditionModal, setShowAddConditionModal] = useState(false);

  // Reschedule Modal State
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [
    selectedAppointmentForReschedule,
    setSelectedAppointmentForReschedule,
  ] = useState(null);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleTime, setRescheduleTime] = useState("");
  const [rescheduleSlotId, setRescheduleSlotId] = useState(null); // Track selected slot ID for rescheduling
  const [availableSlotsForReschedule, setAvailableSlotsForReschedule] =
    useState([]);
  const [allDoctorSlotsForReschedule, setAllDoctorSlotsForReschedule] =
    useState([]);
  const [showAddRecordModal, setShowAddRecordModal] = useState(false);
  const [selectedRecordForView, setSelectedRecordForView] = useState(null);

  const sidebarItems = [
    { id: "dashboard", label: "Dashboard", icon: "fa-chart-line" },
    { id: "profile", label: "My Profile", icon: "fa-user-circle" },
    {
      id: "book-appointment",
      label: "Book Appointment",
      icon: "fa-calendar-plus",
    },
    { id: "emergency", label: "Emergency Appointment", icon: "fa-ambulance" },
    { id: "appointments", label: "Appointments", icon: "fa-calendar-alt" },
    { id: "conditions", label: "Medical Conditions", icon: "fa-notes-medical" },
    { id: "records", label: "Health Records", icon: "fa-file-medical" },
    {
      id: "prescriptions",
      label: "Prescriptions",
      icon: "fa-prescription-bottle-alt",
    },
    { id: "reports", label: "Reports & Issues", icon: "fa-flag" },
  ];
  // --- NOTIFICATION: Reusable function to fetch all notifications ---
  const fetchNotifications = () => {
    if (!user?.userId) return; // Use userId for both patients and doctors
    authFetch(
      `https://medvault-backend-ni3i.onrender.com/api/notifications/user/${user.userId}`,
    )
      .then((r) => (r.ok ? r.json() : []))
      .then((d) => {
        setNotifications(d);
        setUnreadCount(d.filter((n) => !n.isRead).length);
      })
      .catch(console.error);
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
  // --- HELPER: Get Doctor ID ---
  const getDocId = (d) => d.id || d.doctorId || d.userId || d.professionalId;

  // --- HELPER: Time Slots ---
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour < 21; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const startHour = hour;
        const startMin = minute;
        const startTime = `${String(startHour).padStart(2, "0")}:${String(startMin).padStart(2, "0")}`;
        const period = startHour >= 12 ? "PM" : "AM";
        const displayHour = startHour > 12 ? startHour - 12 : startHour;
        const displayMin = String(startMin).padStart(2, "0");
        slots.push({
          value: startTime,
          label: `${displayHour}:${displayMin} ${period}`,
        });
      }
    }
    return slots;
  };
  const allTimeSlots = generateTimeSlots();

  // --- FILTERS ---
  // Completed emergencies: status is COMPLETED OR (status is APPROVED AND date has passed)
  const completedEmergencies = emergencyRequests.filter(
    (req) =>
      req.status === "COMPLETED" ||
      (req.status === "APPROVED" && new Date(req.requestDateTime) < new Date()),
  );

  // Active emergencies: PENDING status OR (APPROVED and future date)
  const activeEmergencies = emergencyRequests.filter(
    (req) =>
      req.status === "PENDING" ||
      (req.status === "APPROVED" &&
        new Date(req.requestDateTime) >= new Date()),
  );

  // Include only APPROVED emergency appointments with FUTURE dates for Next Appointments section
  const approvedEmergencyAppointments = emergencyRequests.filter((req) => {
    const reqDate = new Date(req.requestDateTime);
    const now = new Date();
    const isFuture = reqDate >= now;
    console.log(
      "🚨 Emergency check:",
      req.requestId,
      "status:",
      req.status,
      "date:",
      req.requestDateTime,
      "isFuture:",
      isFuture,
    );
    return req.status === "APPROVED" && isFuture;
  });
  console.log(
    "🚨 Approved Emergency Appointments for Next:",
    approvedEmergencyAppointments,
  );

  // For Approved tab: ONLY regular appointments (no emergency)
  const upcoming = appointments.filter(
    (a) => a.status && a.status.toUpperCase() === "APPROVED",
  );

  // For Next Appointments section: Include both regular and emergency
  const nextAppointments = [...upcoming, ...approvedEmergencyAppointments];
  console.log(
    "📅 Next Appointments total:",
    nextAppointments.length,
    "regular:",
    upcoming.length,
    "emergency:",
    approvedEmergencyAppointments.length,
  );
  console.log("📅 nextAppointments array:", nextAppointments);
  console.log("📅 emergencyRequests state:", emergencyRequests);
  const pending = appointments.filter(
    (a) => a.status && a.status.toUpperCase() === "PENDING",
  );
  const rejected = appointments.filter(
    (a) => a.status && a.status.toUpperCase() === "REJECTED",
  );
  const completed = [
    ...appointments.filter(
      (a) => a.status && a.status.toUpperCase() === "COMPLETED",
    ),
    ...completedEmergencies.map((e) => ({
      ...e,
      isEmergency: true,
      displayStatus: "COMPLETED (Emergency)",
    })),
  ];
  const today = new Date(new Date().setHours(0, 0, 0, 0));
  const activePrescriptions = prescriptions.filter(
    (p) => new Date(p.endDate || p.end_date) >= today,
  );
  const pastPrescriptions = prescriptions.filter(
    (p) => new Date(p.endDate || p.end_date) < today,
  );
  // --- DATA FETCHING ---
  useEffect(() => {
    const fetchDoctors = async () => {
      setDoctorsLoading(true);
      try {
        const response = await authFetch(
          `https://medvault-backend-ni3i.onrender.com/api/doctors`,
        );
        if (!response.ok) throw new Error("Failed");
        const data = await response.json();
        setDoctors(Array.isArray(data) ? data : []);
      } catch (err) {
        setDoctors([]);
      } finally {
        setDoctorsLoading(false);
      }
    };
    fetchDoctors();

    if (user?.patientId) {
      authFetch(
        `https://medvault-backend-ni3i.onrender.com/api/patients/${user.patientId}`,
      )
        .then((r) => r.json())
        .then((d) => setProfileData(d))
        .catch(console.error);
      authFetch(
        `https://medvault-backend-ni3i.onrender.com/api/notifications/user/${user.userId}`,
      )
        .then((r) => (r.ok ? r.json() : []))
        .then((d) => {
          setNotifications(d);
          setUnreadCount(d.filter((n) => !n.isRead).length);
        })
        .catch(console.error);
      authFetch(
        `https://medvault-backend-ni3i.onrender.com/api/consent-requests/pending?patientId=${user.patientId}`,
        { credentials: "include" },
      )
        .then((r) => (r.ok ? r.json() : []))
        .then(setPendingConsentRequests)
        .catch(console.error);

      fetchPatientAppointments();
      fetchMedicalRecords();
      fetchMedicalConditions();
      fetchPrescriptions();
      fetchEmergencyRequests();
      fetchUserIssues();
    }
  }, [user]);

  const fetchMedicalRecords = () => {
    if (user?.patientId)
      authFetch(
        `https://medvault-backend-ni3i.onrender.com/api/records/patient/${user.patientId}`,
      )
        .then((r) => r.json())
        .then((d) =>
          setMedicalRecords(
            d.sort((a, b) => new Date(b.recordDate) - new Date(a.recordDate)),
          ),
        )
        .catch(console.error);
  };
  const fetchPatientAppointments = () => {
    if (user?.patientId) {
      authFetch(
        `https://medvault-backend-ni3i.onrender.com/api/appointments/patient/${user.patientId}`,
      )
        .then((r) => r.json())
        .then((d) => {
          console.log("📅 Fetched appointments:", d);
          console.log(
            "📅 Rejected appointments:",
            d.filter((a) => a.status && a.status.toUpperCase() === "REJECTED"),
          );
          setAppointments(Array.isArray(d) ? d : []);
        })
        .catch((err) => {
          console.error("❌ Error fetching appointments:", err);
          setAppointments([]);
        });
    }
  };
  const fetchMedicalConditions = () => {
    if (user?.patientId)
      authFetch(
        `https://medvault-backend-ni3i.onrender.com/api/medical-conditions/patient/${user.patientId}`,
      )
        .then((r) => r.json())
        .then((d) => setMedicalConditions(d))
        .catch(console.error);
  };
  const fetchPrescriptions = () => {
    if (user?.patientId)
      authFetch(
        `https://medvault-backend-ni3i.onrender.com/api/medications/patient/${user.patientId}`,
      )
        .then((r) => r.json())
        .then((d) =>
          setPrescriptions(
            d.sort((a, b) => new Date(b.start_date) - new Date(a.start_date)),
          ),
        )
        .catch(console.error);
  };
  const fetchEmergencyRequests = () => {
    if (user?.patientId) {
      console.log(
        "🚨 Fetching emergency requests for patient:",
        user.patientId,
      );
      authFetch(
        `https://medvault-backend-ni3i.onrender.com/api/emergency-requests/patient/${user.patientId}`,
      )
        .then((r) => {
          if (!r.ok) {
            console.error(
              "❌ Emergency requests fetch failed with status:",
              r.status,
            );
            return [];
          }
          return r.json();
        })
        .then((d) => {
          console.log("🚨 Emergency requests received:", d);
          setEmergencyRequests(Array.isArray(d) ? d : []);
        })
        .catch((err) => {
          console.error("❌ Error fetching emergency requests:", err);
          setEmergencyRequests([]);
        });
    }
  };
  const fetchUserIssues = () => {
    if (user?.email)
      authFetch(
        `https://medvault-backend-ni3i.onrender.com/api/issues/email/${user.email}`,
      )
        .then((r) => (r.ok ? r.json() : []))
        .then((d) => setUserIssues(d))
        .catch(console.error);
  };

  // --- SLOT LOGIC ---
  const [allSlotsBookedForDate, setAllSlotsBookedForDate] = useState(false);
  const [doctorHasNoSlots, setDoctorHasNoSlots] = useState(false);

  useEffect(() => {
    if (selectedDoctorId && selectedDate) {
      setLoadingSlots(true);
      setAvailableSlots([]);
      setSelectedTime("");
      setAllSlotsBookedForDate(false);
      setDoctorHasNoSlots(false);

      // Fetch all slots for the doctor on this date (both available and booked)
      Promise.all([
        authFetch(
          `https://medvault-backend-ni3i.onrender.com/api/slots/available/${selectedDoctorId}?date=${selectedDate}`,
        ).then((res) => (res.ok ? res.json() : [])),
        authFetch(
          `https://medvault-backend-ni3i.onrender.com/api/slots/doctor/${selectedDoctorId}`,
        ).then((res) => (res.ok ? res.json() : [])),
      ])
        .then(([availableData, allDoctorSlots]) => {
          const available = Array.isArray(availableData) ? availableData : [];
          const allSlots = Array.isArray(allDoctorSlots) ? allDoctorSlots : [];

          // Filter slots for the selected date
          const slotsForDate = allSlots.filter(
            (s) => s.slotDate === selectedDate,
          );

          if (slotsForDate.length === 0) {
            // Doctor has no slots defined for this date - allow any time
            setDoctorHasNoSlots(true);
            setAllSlotsBookedForDate(false);
          } else if (available.length === 0) {
            // Doctor has slots but all are booked
            setAllSlotsBookedForDate(true);
            setDoctorHasNoSlots(false);
          }

          setAvailableSlots(available);
          setLoadingSlots(false);
        })
        .catch(() => {
          setAvailableSlots([]);
          setLoadingSlots(false);
          setDoctorHasNoSlots(true); // On error, allow any time selection
        });
    }
  }, [selectedDoctorId, selectedDate]);

  // --- NEW: Function to reset appointment and emergency forms ---
  const resetAppointmentForms = () => {
    console.log("Resetting forms...");
    // Reset regular appointment
    setSelectedDoctorId("");
    setSelectedDate("");
    setSelectedTime("");
    setAvailableSlots([]);
    setReason("");
    setSelectedDoctorFee(null); // <-- FIX: Reset fee
    setAllSlotsBookedForDate(false);
    setDoctorHasNoSlots(false);

    // Reset emergency request
    setEmergencyData(defaultEmergencyData);

    // Clear any lingering messages
    setSuccessMessage("");
    setErrorMessage("");
  };

  // --- NEW: Handler for changing sections that also resets forms ---
  const handleSectionSelect = (sectionId) => {
    // If we are navigating *away* from these sections, reset them.
    if (activeSection === "book-appointment" || activeSection === "emergency") {
      if (sectionId !== "book-appointment" && sectionId !== "emergency") {
        resetAppointmentForms();
      }
    }
    setActiveSection(sectionId);
  };

  // --- UPDATED: Handler for doctor selection (to set fee) ---
  const handleDoctorSelect = (id) => {
    setSelectedDoctorId(id);
    setSelectedDate("");
    setSelectedTime("");
    setAvailableSlots([]);
    // --- FIX: Set fee on select ---
    const doctor = doctors.find((d) => getDocId(d) === id);
    setSelectedDoctorFee(
      doctor?.consultationFee > 0 ? doctor.consultationFee : null,
    );
  };

  // --- UPDATED: Handler for emergency doctor selection (to set fee) ---
  const handleEmergencyDoctorSelect = (id) => {
    setEmergencyData({ ...emergencyData, doctorId: id });
    // --- FIX: Set fee on select ---
    const doctor = doctors.find((d) => getDocId(d) === id);
    setSelectedDoctorFee(
      doctor?.consultationFee > 0 ? doctor.consultationFee : null,
    );
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    setSelectedTime("");
  };

  // --- PAYMENT & BOOKING ---
  const initiatePayment = () => {
    if (
      activeSection === "book-appointment" &&
      (!selectedDoctorId || !selectedDate || !selectedTime)
    ) {
      setErrorMessage("Please select details");
      return;
    }
    if (activeSection === "emergency" && !emergencyData.doctorId) {
      setErrorMessage("Please select a doctor");
      return;
    }
    setErrorMessage("");

    if (selectedDoctorFee && selectedDoctorFee > 0) {
      setShowDummyPaymentModal(true);
    } else {
      if (activeSection === "emergency") submitEmergencyRequest();
      else processBooking(null);
    }
  };

  const processBooking = async (pid) => {
    // Find the selected slot to get its slotId
    const selectedSlot = availableSlots.find(
      (slot) => slot.slotTime === selectedTime || slot.value === selectedTime,
    );
    // Fix: Handle time format - if already has seconds (HH:mm:ss), don't add more
    const timeFormatted =
      selectedTime.split(":").length >= 3 ? selectedTime : `${selectedTime}:00`;
    const appointmentData = {
      doctorId: selectedDoctorId,
      patientId: user.patientId,
      appointmentDateTime: `${selectedDate}T${timeFormatted}`,
      reason: reason || "General",
      slotId: selectedSlot?.slotId || null,
    };

    console.log("📅 Booking appointment with data:", appointmentData);

    try {
      const response = await authFetch(
        `https://medvault-backend-ni3i.onrender.com/api/appointments/book`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(appointmentData),
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Booking failed:", errorText);
        setErrorMessage("Failed to book appointment: " + errorText);
        return;
      }

      const result = await response.json();
      console.log("✅ Appointment booked successfully:", result);

      fetchPatientAppointments();
      resetAppointmentForms();
      // Show success message AFTER reset so it doesn't get cleared
      setSuccessMessage("Appointment Booked Successfully!");
      setTimeout(() => setSuccessMessage(""), 5000);
    } catch (e) {
      console.error("❌ Booking error:", e);
      setErrorMessage("Failed to book appointment: " + e.message);
    }
  };

  const submitEmergencyRequest = async () => {
    try {
      await authFetch(
        `https://medvault-backend-ni3i.onrender.com/api/emergency-requests/create`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            patientId: user.patientId,
            doctorId: emergencyData.doctorId,
            conditionDescription: emergencyData.conditionDescription,
            urgencyLevel: emergencyData.urgencyLevel,
            currentLocation: emergencyData.currentLocation,
            requestDateTime: `${emergencyData.preferredDate}T${emergencyData.preferredTime}`,
          }),
        },
      );
      fetchEmergencyRequests();
      resetAppointmentForms();
      // Show success message AFTER reset so it doesn't get cleared
      setSuccessMessage("Emergency Request Sent Successfully!");
      setTimeout(() => setSuccessMessage(""), 5000);
    } catch (e) {
      setErrorMessage("Failed to send request");
    }
  };

  const handleDummyPaymentConfirm = async () => {
    setShowDummyPaymentModal(false);
    if (activeSection === "emergency") {
      await submitEmergencyRequest();
    } else {
      await processBooking("dummy_id");
    }
  };

  const handleProfileUpdate = async () => {
    try {
      const response = await authFetch(
        `https://medvault-backend-ni3i.onrender.com/api/patients/${user.patientId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(profileData),
        },
      );
      if (response.ok) {
        setSuccessMessage("✅ Profile updated successfully!");
        setIsEditingProfile(false);
        setTimeout(() => setSuccessMessage(""), 3000);
      }
    } catch (err) {
      setErrorMessage("Failed to update profile");
    }
  };

  const handleConsentResponse = async (requestId, status) => {
    try {
      const response = await authFetch(
        `https://medvault-backend-ni3i.onrender.com/api/consent-requests/${requestId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
          body: JSON.stringify({ status }),
        },
      );
      if (response.ok) {
        setSuccessMessage(`Access ${status.toLowerCase()}!`);
        setPendingConsentRequests((prev) =>
          prev.filter((req) => req.id !== requestId),
        );
        setTimeout(() => setSuccessMessage(""), 3000);
      } else {
        const error = await response.text();
        setErrorMessage(error);
      }
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  return (
    <div className="flex min-h-screen bg-brand-bg font-sans">
      {/* SIDEBAR (Prop updated) */}
      <Sidebar
        isOpen={isSidebarOpen}
        toggle={() => setIsSidebarOpen(!isSidebarOpen)}
        activeSection={activeSection}
        onSelectSection={handleSectionSelect} // <-- UPDATED PROP
        menuItems={sidebarItems}
        onLogout={onLogout}
      />

      {/* CONTENT */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarOpen ? "ml-72" : "ml-20"}`}
      >
        <PatientHeader
          unreadCount={unreadCount}
          notifications={notifications}
          showNotifications={showNotifications}
          onBellClick={handleBellClick}
        />

        <main className="p-8 pb-20 max-w-7xl w-full mx-auto">
          {/* BANNER */}
          <PatientWelcomeBanner user={user} profileData={profileData} />

          {/* DASHBOARD STATS */}
          {activeSection === "dashboard" && (
            <PatientDashboardOverview
              pendingConsentRequests={pendingConsentRequests}
              onConsentResponse={handleConsentResponse}
              nextAppointments={nextAppointments}
              completed={completed}
              activePrescriptions={activePrescriptions}
              medicalConditions={medicalConditions}
              doctors={doctors}
            />
          )}

          {/* PROFILE */}
          {activeSection === "profile" && (
            <PatientProfileSection
              profileData={profileData}
              setProfileData={setProfileData}
              isEditingProfile={isEditingProfile}
              setIsEditingProfile={setIsEditingProfile}
              onSave={handleProfileUpdate}
            />
          )}

          {/* BOOK APPOINTMENT */}
          {activeSection === "book-appointment" && (
            <BookAppointmentSection
              doctors={doctors}
              doctorsLoading={doctorsLoading}
              errorMessage={errorMessage}
              selectedDoctorId={selectedDoctorId}
              selectedDate={selectedDate}
              selectedTime={selectedTime}
              availableSlots={availableSlots}
              allSlotsBookedForDate={allSlotsBookedForDate}
              doctorHasNoSlots={doctorHasNoSlots}
              allTimeSlots={allTimeSlots}
              loadingSlots={loadingSlots}
              reason={reason}
              selectedDoctorFee={selectedDoctorFee}
              successMessage={successMessage}
              onDoctorSelect={handleDoctorSelect}
              onDateChange={handleDateChange}
              onTimeChange={setSelectedTime}
              onReasonChange={setReason}
              onSubmit={initiatePayment}
            />
          )}

          {/* APPOINTMENTS LIST */}
          {activeSection === "appointments" && (
            <section className="bg-white rounded-2xl shadow-lg p-8 animate-fade-in">
              <div className="flex gap-6 mb-6 border-b pb-2 overflow-x-auto">
                <button
                  onClick={() => setActiveTab("all")}
                  className={`pb-2 font-bold capitalize transition-all whitespace-nowrap ${activeTab === "all" ? "border-b-4 border-purple-500 text-purple-500" : "text-slate-500 hover:text-slate-700"}`}
                >
                  All ({appointments.length + emergencyRequests.length})
                </button>
                <button
                  onClick={() => setActiveTab("emergency")}
                  className={`pb-2 font-bold capitalize transition-all whitespace-nowrap ${activeTab === "emergency" ? "border-b-4 border-red-500 text-red-500" : "text-slate-500 hover:text-red-600"}`}
                >
                  <i className="fas fa-ambulance mr-2"></i>Emergency (
                  {activeEmergencies.length})
                </button>
                <button
                  onClick={() => setActiveTab("pending")}
                  className={`pb-2 font-bold capitalize transition-all whitespace-nowrap ${activeTab === "pending" ? "border-b-4 border-yellow-500 text-yellow-500" : "text-slate-500 hover:text-yellow-600"}`}
                >
                  Pending (
                  {pending.length +
                    activeEmergencies.filter((e) => e.status === "PENDING")
                      .length}
                  )
                </button>
                <button
                  onClick={() => setActiveTab("upcoming")}
                  className={`pb-2 font-bold capitalize transition-all whitespace-nowrap ${activeTab === "upcoming" ? "border-b-4 border-green-500 text-green-500" : "text-slate-500 hover:text-green-600"}`}
                >
                  Approved ({upcoming.length})
                </button>
                <button
                  onClick={() => setActiveTab("rejected")}
                  className={`pb-2 font-bold capitalize transition-all whitespace-nowrap ${activeTab === "rejected" ? "border-b-4 border-red-500 text-red-500" : "text-slate-500 hover:text-red-600"}`}
                >
                  Rejected ({rejected.length})
                </button>
                <button
                  onClick={() => setActiveTab("completed")}
                  className={`pb-2 font-bold capitalize transition-all whitespace-nowrap ${activeTab === "completed" ? "border-b-4 border-blue-500 text-blue-500" : "text-slate-500 hover:text-blue-600"}`}
                >
                  Completed ({completed.length})
                </button>
              </div>

              {/* Emergency List */}
              {activeTab === "emergency" && (
                <div className="bg-red-50 border border-red-100 rounded-xl p-4">
                  <h4 className="text-red-600 font-bold mb-4 flex items-center">
                    <i className="fas fa-ambulance mr-2"></i> Active Emergency
                    Requests
                  </h4>
                  {activeEmergencies.length === 0 ? (
                    <p className="text-center p-4 text-slate-500">
                      No active emergency requests.
                    </p>
                  ) : (
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-red-200 text-red-800">
                          <th className="p-3">Doctor</th>
                          <th className="p-3">Date & Time</th>
                          <th className="p-3">Urgency</th>
                          <th className="p-3">Condition</th>
                          <th className="p-3">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {activeEmergencies.map((req) => {
                          const doc = doctors.find(
                            (d) => getDocId(d) === req.doctorId,
                          );
                          return (
                            <tr
                              key={req.requestId}
                              className="border-b border-red-100"
                            >
                              <td className="p-3 font-bold text-slate-700">
                                Dr.{" "}
                                {doc
                                  ? `${doc.firstName} ${doc.lastName}`
                                  : "N/A"}
                              </td>
                              <td className="p-3 text-slate-600">
                                {new Date(req.requestDateTime).toLocaleString()}
                              </td>
                              <td className="p-3">
                                <span className="bg-red-200 text-red-800 px-2 py-1 rounded text-xs font-bold">
                                  {req.urgencyLevel}
                                </span>
                              </td>
                              <td className="p-3 text-slate-600">
                                {req.conditionDescription}
                              </td>
                              <td className="p-3">
                                <span
                                  className={`px-2 py-1 rounded text-xs font-bold ${(req.status || "PENDING") === "PENDING" ? "bg-yellow-100 text-yellow-800" : req.status === "APPROVED" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                                >
                                  {req.status || "PENDING"}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>
              )}

              {/* Regular Lists */}
              {activeTab !== "emergency" && (
                <div className="space-y-4">
                  {/* Empty state messages for each filter */}
                  {activeTab === "upcoming" && upcoming.length === 0 && (
                    <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
                      <i className="fas fa-calendar-check text-4xl text-green-300 mb-4"></i>
                      <p className="text-slate-500 font-medium">
                        No approved appointments
                      </p>
                      <p className="text-slate-400 text-sm mt-1">
                        Your approved appointments will appear here
                      </p>
                    </div>
                  )}
                  {activeTab === "pending" &&
                    [
                      ...pending,
                      ...activeEmergencies.filter(
                        (e) => e.status === "PENDING",
                      ),
                    ].length === 0 && (
                      <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
                        <i className="fas fa-clock text-4xl text-yellow-300 mb-4"></i>
                        <p className="text-slate-500 font-medium">
                          No pending appointments
                        </p>
                        <p className="text-slate-400 text-sm mt-1">
                          Appointments awaiting approval will appear here
                        </p>
                      </div>
                    )}
                  {activeTab === "rejected" && rejected.length === 0 && (
                    <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
                      <i className="fas fa-times-circle text-4xl text-red-300 mb-4"></i>
                      <p className="text-slate-500 font-medium">
                        No rejected appointments
                      </p>
                      <p className="text-slate-400 text-sm mt-1">
                        Rejected appointments will appear here
                      </p>
                    </div>
                  )}
                  {activeTab === "completed" && completed.length === 0 && (
                    <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
                      <i className="fas fa-check-circle text-4xl text-blue-300 mb-4"></i>
                      <p className="text-slate-500 font-medium">
                        No completed appointments
                      </p>
                      <p className="text-slate-400 text-sm mt-1">
                        Your completed appointments will appear here
                      </p>
                    </div>
                  )}
                  {activeTab === "all" &&
                    [...appointments, ...emergencyRequests].length === 0 && (
                      <EmptyState
                        icon="fas fa-calendar-alt"
                        title="No appointments found"
                        description="Book an appointment to get started."
                      />
                    )}
                  {(activeTab === "upcoming"
                    ? upcoming
                    : activeTab === "pending"
                      ? [
                          ...pending,
                          ...activeEmergencies.filter(
                            (e) => e.status === "PENDING",
                          ),
                        ]
                      : activeTab === "rejected"
                        ? rejected
                        : activeTab === "completed"
                          ? completed
                          : activeTab === "all"
                            ? [...appointments, ...emergencyRequests]
                            : appointments
                  ).map((a) => {
                    const isEmergency = a.requestDateTime !== undefined;
                    const date = isEmergency
                      ? a.requestDateTime
                      : a.appointmentDateTime;
                    const doctorName = isEmergency
                      ? doctors.find((d) => getDocId(d) === a.doctorId)
                        ? `Dr. ${doctors.find((d) => getDocId(d) === a.doctorId).firstName} ${doctors.find((d) => getDocId(d) === a.doctorId).lastName}`
                        : "Dr. N/A"
                      : a.doctor
                        ? `Dr. ${a.doctor.firstName} ${a.doctor.lastName}`
                        : "Dr. N/A";
                    // Use displayStatus if available, otherwise determine status
                    // For emergencies: show EMERGENCY (COMPLETED) or EMERGENCY (UPCOMING)
                    const isUpcomingEmergency =
                      isEmergency &&
                      a.status === "APPROVED" &&
                      new Date(a.requestDateTime) >= new Date();
                    const isCompletedEmergency =
                      isEmergency &&
                      (a.status === "COMPLETED" ||
                        (a.status === "APPROVED" &&
                          new Date(a.requestDateTime) < new Date()));
                    const status =
                      a.displayStatus ||
                      (isEmergency
                        ? a.status === "PENDING"
                          ? "PENDING"
                          : isCompletedEmergency
                            ? "EMERGENCY (COMPLETED)"
                            : isUpcomingEmergency
                              ? "EMERGENCY (UPCOMING)"
                              : a.status
                        : a.status);
                    const reasonText = isEmergency
                      ? a.conditionDescription
                      : a.reason;

                    return (
                      <div
                        key={
                          isEmergency ? `em-${a.requestId}` : a.appointmentId
                        }
                        className={`flex ${activeTab === "completed" && a.review ? "flex-col items-start" : "justify-between items-center"} p-6 border rounded-xl hover:shadow-md transition-all ${isUpcomingEmergency ? "bg-red-50 border-red-300" : "border-slate-200 bg-white"}`}
                      >
                        <div className="flex items-center gap-4 w-full justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-brand-purple text-white rounded-full flex items-center justify-center font-bold text-xl">
                              <i className="fas fa-user-md"></i>
                            </div>
                            <div>
                              <p className="font-bold text-xl text-slate-800">
                                {doctorName}
                              </p>
                              <div className="flex items-center gap-4 text-slate-500 text-sm mt-1 font-medium">
                                <span>{new Date(date).toLocaleString()}</span>
                                {reasonText && (
                                  <span className="border-l border-slate-300 pl-4 italic">
                                    Reason: {reasonText}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Right Side: Status & Action */}
                          <div className="text-right flex flex-col items-end gap-2">
                            <span
                              className={`px-4 py-2 rounded-full text-xs font-extrabold uppercase tracking-wide ${
                                status.includes("EMERGENCY (COMPLETED)")
                                  ? "bg-orange-100 text-orange-800"
                                  : status.includes("EMERGENCY (UPCOMING)")
                                    ? "bg-red-100 text-red-800"
                                    : status.includes("APPROVED")
                                      ? "bg-green-100 text-green-800"
                                      : status.includes("PENDING")
                                        ? "bg-yellow-100 text-yellow-800"
                                        : status.includes("REJECTED")
                                          ? "bg-red-100 text-red-800"
                                          : status.includes("COMPLETED")
                                            ? "bg-blue-100 text-blue-800"
                                            : "bg-slate-100 text-slate-800"
                              }`}
                            >
                              {status}
                            </span>

                            {/* Reschedule & Cancel buttons for APPROVED appointments */}
                            {(activeTab === "upcoming" ||
                              status.includes("APPROVED")) &&
                              !isEmergency && (
                                <div className="flex gap-2">
                                  <button
                                    onClick={async () => {
                                      setSelectedAppointmentForReschedule(a);
                                      setRescheduleDate("");
                                      setRescheduleTime("");
                                      setAvailableSlotsForReschedule([]);
                                      setAllDoctorSlotsForReschedule([]);
                                      setShowRescheduleModal(true);
                                      // Fetch ALL slots for the doctor (to distinguish "no slots" vs "all booked")
                                      try {
                                        const doctorId =
                                          a.doctor?.professionalId ||
                                          a.doctorId;
                                        const res = await authFetch(
                                          `https://medvault-backend-ni3i.onrender.com/api/slots/doctor/${doctorId}`,
                                        );
                                        if (res.ok) {
                                          const slots = await res.json();
                                          // Store all slots (for checking if date has any slots)
                                          setAllDoctorSlotsForReschedule(slots);
                                          // Filter to only available slots for selection
                                          const availableSlots = slots.filter(
                                            (s) => s.isAvailable,
                                          );
                                          setAvailableSlotsForReschedule(
                                            availableSlots,
                                          );
                                        }
                                      } catch (error) {
                                        console.error(
                                          "Error fetching slots:",
                                          error,
                                        );
                                      }
                                    }}
                                    className="text-xs text-blue-600 font-bold hover:bg-blue-50 px-3 py-1 rounded-lg border border-blue-200"
                                  >
                                    <i className="fas fa-calendar-alt mr-1"></i>{" "}
                                    Reschedule
                                  </button>
                                  <button
                                    onClick={async () => {
                                      if (
                                        confirm(
                                          "Are you sure you want to cancel this appointment?",
                                        )
                                      ) {
                                        try {
                                          const res = await authFetch(
                                            `https://medvault-backend-ni3i.onrender.com/api/appointments/${a.appointmentId}/status`,
                                            {
                                              method: "PUT",
                                              headers: {
                                                "Content-Type":
                                                  "application/json",
                                              },
                                              body: JSON.stringify({
                                                status: "CANCELLED",
                                              }),
                                            },
                                          );
                                          if (res.ok) {
                                            setSuccessMessage(
                                              "✅ Appointment cancelled successfully",
                                            );
                                            fetchPatientAppointments();
                                          } else {
                                            setErrorMessage(
                                              "Failed to cancel appointment",
                                            );
                                          }
                                        } catch (e) {
                                          setErrorMessage(
                                            "Error cancelling appointment",
                                          );
                                        }
                                        setTimeout(() => {
                                          setSuccessMessage("");
                                          setErrorMessage("");
                                        }, 3000);
                                      }
                                    }}
                                    className="text-xs text-red-600 font-bold hover:bg-red-50 px-3 py-1 rounded-lg border border-red-200"
                                  >
                                    <i className="fas fa-times mr-1"></i> Cancel
                                  </button>
                                </div>
                              )}

                            {/* Show "Leave Feedback" button if no review yet */}
                            {activeTab === "completed" && !a.review && (
                              <button
                                onClick={() =>
                                  setSelectedAppointmentForFeedback(a)
                                }
                                className="text-sm text-brand-purple font-bold hover:underline bg-purple-50 px-3 py-1 rounded-lg"
                              >
                                Leave Feedback
                              </button>
                            )}
                          </div>
                        </div>

                        {/* FEEDBACK BOX */}
                        {activeTab === "completed" && a.review && (
                          <div className="mt-4 w-full bg-slate-50 border border-slate-200 rounded-xl p-4 animate-fade-in">
                            <p className="font-bold text-slate-700 flex items-center gap-2 mb-2">
                              <i className="fas fa-star text-amber-500"></i>{" "}
                              Your Feedback
                            </p>
                            <div className="flex text-amber-400 text-lg mb-2">
                              {[...Array(5)].map((_, i) => (
                                <span key={i}>
                                  {i < a.review.rating ? "★" : "☆"}
                                </span>
                              ))}
                            </div>
                            <p className="text-slate-600 italic text-sm">
                              "{a.review.feedback || a.review.feedbackText}"
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          )}

          {/* RECORDS + ACCESS REQUESTS */}
          {activeSection === "records" && (
            <PatientRecordsSection
              medicalRecords={medicalRecords}
              accessRequests={accessRequests}
              onUploadClick={() => setShowAddRecordModal(true)}
              onViewRecord={setSelectedRecordForView}
              onConsentResponse={handleConsentResponse}
            />
          )}

          {/* PRESCRIPTIONS */}
          {activeSection === "prescriptions" && (
            <PatientPrescriptionsSection
              activePrescriptions={activePrescriptions}
              pastPrescriptions={pastPrescriptions}
              onViewPrescription={setSelectedRecordForView}
            />
          )}

          {/* EMERGENCY REQUEST FORM */}
          {activeSection === "emergency" && (
            <EmergencyRequestSection
              doctors={doctors}
              emergencyData={emergencyData}
              setEmergencyData={setEmergencyData}
              selectedDoctorFee={selectedDoctorFee}
              successMessage={successMessage}
              errorMessage={errorMessage}
              onDoctorSelect={handleEmergencyDoctorSelect}
              onSubmit={initiatePayment}
            />
          )}

          {/* CONDITIONS */}
          {activeSection === "conditions" && (
            <MedicalConditionsSection
              medicalConditions={medicalConditions}
              onAddCondition={() => setShowAddConditionModal(true)}
            />
          )}

          {/* REPORTS & ISSUES - PATIENT */}
          {activeSection === "reports" && (
            <PatientIssuesSection userIssues={userIssues} />
          )}
        </main>
      </div>

      {/* --- MODALS --- */}
      {showDummyPaymentModal && (
        <DummyPaymentModal
          fee={selectedDoctorFee}
          loading={loading}
          onClose={() => {
            setShowDummyPaymentModal(false);
            resetAppointmentForms(); // <-- RESET ADDED HERE
          }}
          onConfirmPayment={handleDummyPaymentConfirm}
        />
      )}

      {selectedAppointmentForFeedback && (
        <FeedbackModal
          appointment={selectedAppointmentForFeedback}
          user={user}
          doctors={doctors}
          onClose={() => setSelectedAppointmentForFeedback(null)}
          onFeedbackSubmitted={() => {
            fetchPatientAppointments();
            fetchEmergencyRequests();
          }}
        />
      )}

      {/* Reschedule Appointment Modal */}
      {showRescheduleModal &&
        selectedAppointmentForReschedule &&
        (() => {
          const rescheduleDoctorName = selectedAppointmentForReschedule.doctor
            ? `Dr. ${selectedAppointmentForReschedule.doctor.firstName} ${selectedAppointmentForReschedule.doctor.lastName}`
            : doctors.find(
                  (d) =>
                    (d.id || d.doctorId || d.professionalId) ===
                    selectedAppointmentForReschedule.doctorId,
                )
              ? `Dr. ${doctors.find((d) => (d.id || d.doctorId || d.professionalId) === selectedAppointmentForReschedule.doctorId).firstName} ${doctors.find((d) => (d.id || d.doctorId || d.professionalId) === selectedAppointmentForReschedule.doctorId).lastName}`
              : "Dr. N/A";

          // Generate 30-minute time slots for the full day (8 AM to 8 PM)
          const generateTimeSlots = () => {
            const slots = [];
            for (let hour = 8; hour < 20; hour++) {
              const h = hour.toString().padStart(2, "0");
              slots.push(`${h}:00:00`);
              slots.push(`${h}:30:00`);
            }
            return slots;
          };
          const defaultTimeSlots = generateTimeSlots();

          return (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-fade-in mx-4">
                <div className="sticky top-0 bg-white p-6 pb-4 border-b border-slate-100 z-10">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-xl font-bold text-slate-800">
                        <i className="fas fa-calendar-alt text-purple-600 mr-2"></i>
                        Reschedule Appointment
                      </h2>
                      <p className="text-slate-500 text-sm mt-1">
                        Select a new date and time
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setShowRescheduleModal(false);
                        setSelectedAppointmentForReschedule(null);
                      }}
                      className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-500 text-2xl"
                    >
                      &times;
                    </button>
                  </div>
                </div>

                <div className="p-6">
                  {/* Current Appointment Info */}
                  <div className="bg-slate-50 rounded-xl p-4 mb-6">
                    <p className="text-xs text-slate-500 font-semibold mb-3">
                      CURRENT APPOINTMENT
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-slate-500">Doctor</p>
                        <p className="font-semibold text-purple-600">
                          {rescheduleDoctorName}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Reason</p>
                        <p className="font-semibold text-slate-800">
                          {selectedAppointmentForReschedule.reason || "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Current Date</p>
                        <p className="font-semibold text-slate-800">
                          {selectedAppointmentForReschedule.appointmentDateTime?.split(
                            "T",
                          )[0] || selectedAppointmentForReschedule.date}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Current Time</p>
                        <p className="font-semibold text-slate-800">
                          {selectedAppointmentForReschedule.appointmentDateTime
                            ?.split("T")[1]
                            ?.substring(0, 5) ||
                            selectedAppointmentForReschedule.time}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* New Date Selection */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Select New Date
                      </label>
                      <input
                        type="date"
                        value={rescheduleDate}
                        onChange={(e) => {
                          setRescheduleDate(e.target.value);
                          setRescheduleTime("");
                          setRescheduleSlotId(null); // Reset slot ID when date changes
                          // Filter to only available slots for the selected date
                          const filteredSlots =
                            allDoctorSlotsForReschedule.filter(
                              (s) =>
                                s.slotDate === e.target.value && s.isAvailable,
                            );
                          setAvailableSlotsForReschedule(filteredSlots);
                        }}
                        min={new Date().toISOString().split("T")[0]}
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                      />
                    </div>

                    {rescheduleDate &&
                      (() => {
                        // Check slot availability for the selected date
                        // allDoctorSlotsForReschedule contains ALL slots (both available and booked)
                        const allSlotsForDate =
                          allDoctorSlotsForReschedule.filter(
                            (s) => s.slotDate === rescheduleDate,
                          );
                        const availableSlotsForDate = allSlotsForDate.filter(
                          (s) => s.isAvailable,
                        );

                        // Doctor has no slots defined at all
                        const doctorHasNoSlots =
                          allDoctorSlotsForReschedule.length === 0;
                        // Doctor has no slots for this specific date
                        const noSlotsForThisDate = allSlotsForDate.length === 0;
                        // Doctor has slots for this date but all are booked
                        const allSlotsBookedForDate =
                          allSlotsForDate.length > 0 &&
                          availableSlotsForDate.length === 0;
                        // Doctor has available slots for this date
                        const hasAvailableSlots =
                          availableSlotsForDate.length > 0;

                        return (
                          <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                              {hasAvailableSlots
                                ? `Available Slots (${availableSlotsForDate.length} available)`
                                : allSlotsBookedForDate
                                  ? `No slots available for ${rescheduleDate}`
                                  : `Select Time Slot`}
                            </label>
                            {hasAvailableSlots ? (
                              /* Doctor has available slots - show them */
                              <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                                {availableSlotsForDate.map((slot) => (
                                  <button
                                    key={slot.slotId}
                                    onClick={() => {
                                      setRescheduleTime(slot.slotTime);
                                      setRescheduleSlotId(slot.slotId); // Track the slot ID
                                      if (slot.slotDate)
                                        setRescheduleDate(slot.slotDate);
                                    }}
                                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                                      rescheduleSlotId === slot.slotId
                                        ? "bg-purple-600 text-white shadow-lg"
                                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                                    }`}
                                  >
                                    <div>{slot.slotTime}</div>
                                  </button>
                                ))}
                              </div>
                            ) : allSlotsBookedForDate ? (
                              /* Doctor has slots for this date but all are booked */
                              <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
                                <i className="fas fa-calendar-times text-red-500 text-2xl mb-2"></i>
                                <p className="text-red-700 font-medium">
                                  All slots are booked for this date
                                </p>
                                <p className="text-red-600 text-sm mt-1">
                                  Please select a different date
                                </p>
                              </div>
                            ) : (
                              /* Doctor has no slots defined for this date - allow any time */
                              <div>
                                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-3">
                                  <p className="text-amber-700 text-sm">
                                    <i className="fas fa-info-circle mr-1"></i>
                                    No pre-defined slots for this date. Select a
                                    time below:
                                  </p>
                                </div>
                                <select
                                  value={rescheduleTime}
                                  onChange={(e) =>
                                    setRescheduleTime(e.target.value)
                                  }
                                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none bg-white"
                                >
                                  <option value="">
                                    -- Select Time Slot --
                                  </option>
                                  {defaultTimeSlots.map((time) => {
                                    const [h, m] = time.split(":");
                                    const endH =
                                      m === "00"
                                        ? h
                                        : (parseInt(h) + 1)
                                            .toString()
                                            .padStart(2, "0");
                                    const endM = m === "00" ? "30" : "00";
                                    return (
                                      <option key={time} value={time}>
                                        {h}:{m.substring(0, 2)} - {endH}:{endM}
                                      </option>
                                    );
                                  })}
                                </select>
                              </div>
                            )}
                          </div>
                        );
                      })()}

                    {!rescheduleDate && (
                      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
                        <i className="fas fa-calendar text-blue-500 text-2xl mb-2"></i>
                        <p className="text-blue-700 font-medium">
                          Select a date to see available slots
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={() => {
                        setShowRescheduleModal(false);
                        setSelectedAppointmentForReschedule(null);
                        setRescheduleSlotId(null); // Reset slot ID
                      }}
                      className="flex-1 px-6 py-3 border border-slate-200 text-slate-600 rounded-xl font-semibold hover:bg-slate-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={async () => {
                        if (!rescheduleDate || !rescheduleTime) {
                          setErrorMessage("Please select both date and time");
                          setTimeout(() => setErrorMessage(""), 3000);
                          return;
                        }
                        try {
                          // Handle time format - ensure it has seconds
                          const timeWithSeconds =
                            rescheduleTime.includes(":") &&
                            rescheduleTime.split(":").length === 3
                              ? rescheduleTime
                              : `${rescheduleTime}:00`;
                          const appointmentDateTime = `${rescheduleDate}T${timeWithSeconds}`;
                          const response = await authFetch(
                            `https://medvault-backend-ni3i.onrender.com/api/appointments/${selectedAppointmentForReschedule.appointmentId}`,
                            {
                              method: "PUT",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({
                                appointmentDateTime: appointmentDateTime,
                                reason:
                                  selectedAppointmentForReschedule.reason ||
                                  "Rescheduled appointment",
                                slotId: rescheduleSlotId, // Include the new slot ID
                              }),
                            },
                          );
                          if (response.ok) {
                            setSuccessMessage(
                              `✅ Appointment rescheduled to ${rescheduleDate} at ${rescheduleTime}!`,
                            );
                            setShowRescheduleModal(false);
                            setSelectedAppointmentForReschedule(null);
                            setRescheduleSlotId(null); // Reset slot ID
                            fetchPatientAppointments();
                          } else {
                            const error = await response.text();
                            setErrorMessage(
                              `Failed to reschedule: ${error || "Unknown error"}`,
                            );
                          }
                        } catch (error) {
                          console.error("Error rescheduling:", error);
                          setErrorMessage(
                            "Failed to reschedule. Please try again.",
                          );
                        }
                        setTimeout(() => {
                          setSuccessMessage("");
                          setErrorMessage("");
                        }, 3000);
                      }}
                      disabled={!rescheduleDate || !rescheduleTime}
                      className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                        rescheduleDate && rescheduleTime
                          ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:shadow-lg"
                          : "bg-slate-200 text-slate-400 cursor-not-allowed"
                      }`}
                    >
                      <i className="fas fa-calendar-check"></i>
                      Confirm Reschedule
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

      {showAddConditionModal && (
        <AddConditionModal
          user={user}
          onClose={() => setShowAddConditionModal(false)}
          onConditionAdded={() => {
            fetchMedicalConditions();
            setConditionMessage("Added!");
            setTimeout(() => setConditionMessage(""), 3000);
          }}
        />
      )}

      {showAddRecordModal && (
        <AddRecordModal
          user={user}
          onClose={() => setShowAddRecordModal(false)}
          onRecordAdded={fetchMedicalRecords}
        />
      )}

      {selectedRecordForView && (
        <ViewRecordModal
          record={selectedRecordForView}
          patientProfile={user} // <-- Pass the fetched profile
          onClose={() => setSelectedRecordForView(null)}
        />
      )}

      {/* REPORT ISSUE MODAL */}
      {showReportIssueModal && (
        <ReportIssueModal
          user={user}
          issueForm={issueForm}
          setIssueForm={setIssueForm}
          onClose={() => setShowReportIssueModal(false)}
          fetchUserIssues={fetchUserIssues}
          setSuccessMessage={setSuccessMessage}
          setErrorMessage={setErrorMessage}
        />
      )}
    </div>
  );
};
// --- DOCTOR DASHBOARD ---

export default PatientDashboard;

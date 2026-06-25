import React, { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar.jsx";
import SearchableDoctorDropdown from "../../components/SearchableDoctorDropdown.jsx";
import FeedbackModal from "../../components/modals/FeedbackModal.jsx";
import AddConditionModal from "../../components/modals/AddConditionModal.jsx";
import AddRecordModal from "../../components/modals/AddRecordModal.jsx";
import ViewRecordModal from "../../components/modals/ViewRecordModal.jsx";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://medvault-backend-ni3i.onrender.com/api";

const getAuthToken = () => sessionStorage.getItem("authToken");

const authFetch = (url, options = {}) => {
  const token = getAuthToken();
  const headers = { ...(options.headers || {}) };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const finalUrl = url.startsWith("http") ? url : `${API_BASE_URL}${url.startsWith("/") ? url : `/${url}`}`;

  return fetch(finalUrl, {
    ...options,
    headers,
  });
};

const getISTGreeting = () => {
  const date = new Date();
  const istString = date.toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
  const istDate = new Date(istString);
  const hour = istDate.getHours();

  if (hour >= 0 && hour < 12) return "Good Morning";
  if (hour >= 12 && hour < 17) return "Good Afternoon";
  return "Good Evening";
};

// --- ViewRecordModal  ---



// --- MODIFIED DUMMY PAYMENT MODAL ---
// --- MODIFIED DUMMY PAYMENT MODAL ---

const DummyPaymentModal = ({ fee, onClose, onConfirmPayment, loading }) => {
  const [step, setStep] = useState(1); // 1: Select Method, 2: OTP
  const [method, setMethod] = useState("card");
  const [otp, setOtp] = useState("");
  const [paymentMessage, setPaymentMessage] = useState("");
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  // This is the function passed from PatientDashboard (which includes the reset)
  const handleCloseClick = () => {
    if (!loading) setShowCancelConfirm(true);
  };

  const confirmCancel = () => {
    setShowCancelConfirm(false);
    onClose(); // <-- This now calls resetAppointmentForms()
  };

  const handlePayClick = () => {
    setPaymentMessage("");
    setStep(2); // Go to OTP step
  };

  const handleOtpConfirm = () => {
    if (otp.length !== 4) {
      setPaymentMessage("Please enter OTP.");
      return;
    }
    setPaymentMessage("Verifying OTP...");
    setTimeout(() => {
      onConfirmPayment();
    }, 1000);
  };

  const renderPaymentForm = () => {
    if (method === "card") {
      return (
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Card Number (XXXX XXXX XXXX XXXX)"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-purple"
            maxLength="16"
          />
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="MM/YY"
              className="w-1/2 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-purple"
              maxLength="5"
            />
            <input
              type="text"
              placeholder="CVV"
              className="w-1/2 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-purple"
              maxLength="3"
            />
          </div>
          <input
            type="text"
            placeholder="Name on Card"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-purple"
          />
        </div>
      );
    } else if (method === "upi") {
      return (
        <div className="space-y-4">
          <input
            type="text"
            placeholder="UPI ID (e.g., name@bank)"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-purple"
          />
          <p className="text-sm text-slate-500">
            A payment request will be sent to your UPI app.
          </p>
        </div>
      );
    } else if (method === "wallet") {
      return (
        <div className="space-y-4">
          <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-purple">
            <option>Select Wallet</option>
            <option>Paytm</option>
            <option>Google Pay</option>
            <option>PhonePe</option>
          </select>
          <input
            type="text"
            placeholder="Mobile Number"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-purple"
            maxLength="10"
          />
        </div>
      );
    }
  };

  return (
    <div className="modal-overlay" onClick={handleCloseClick}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-800">
            Complete Your Payment
          </h2>
          <button
            onClick={handleCloseClick}
            className="text-slate-500 hover:text-slate-800 text-2xl"
            disabled={loading}
          >
            &times;
          </button>
        </div>
        <div className="text-center mb-4">
          <img
            src="https://razorpay.com/assets/razorpay-logo.svg"
            alt="Razorpay"
            className="h-12 mx-auto mb-4"
          />
          <p className="text-lg text-slate-600">Total Amount:</p>
          <p className="text-4xl font-bold text-brand-purple">₹{fee}</p>
        </div>

        {step === 1 && (
          <>
            <div className="flex justify-center mb-6 border-b">
              {["card", "upi", "wallet"].map((m) => (
                <button
                  key={m}
                  className={`px-4 py-2 font-semibold capitalize ${
                    method === m
                      ? "border-b-4 border-brand-purple text-brand-purple"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                  onClick={() => setMethod(m)}
                >
                  {m}
                </button>
              ))}
            </div>

            <div className="mb-6 p-4 border rounded-lg bg-slate-50">
              {renderPaymentForm()}
            </div>

            <button
              onClick={handlePayClick}
              disabled={loading}
              className={`w-full text-white font-bold py-3 px-4 rounded-lg transition-colors duration-300 ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-brand-purple hover:bg-purple-700"
              }`}
            >
              {loading ? "Processing Payment..." : `Pay ₹${fee}`}
            </button>
          </>
        )}

        {step === 2 && (
          <div className="text-center">
            <p className="text-slate-600 mb-4">
              Enter the 4-digit OTP sent to your number/email to confirm
              payment.
            </p>
            <div className="flex justify-center space-x-2 mb-6">
              <input
                type="text"
                value={otp}
                onChange={(e) =>
                  setOtp(e.target.value.replace(/[^0-9]/g, "").slice(0, 4))
                }
                placeholder="••••"
                maxLength="4"
                className="text-3xl font-bold text-center w-32 p-3 border-2 border-brand-purple rounded-lg focus:outline-none focus:border-purple-700"
              />
            </div>
            {paymentMessage && (
              <p className="text-red-600 text-sm mb-4">{paymentMessage}</p>
            )}
            <button
              onClick={handleOtpConfirm}
              disabled={loading}
              className={`w-full text-white font-bold py-3 px-4 rounded-lg transition-colors duration-300 ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700"
              }`}
            >
              {loading ? "Verifying..." : "Confirm OTP & Pay"}
            </button>
            <button
              onClick={() => setStep(1)}
              disabled={loading}
              className="w-full text-slate-500 font-semibold py-2 mt-2"
            >
              Go Back
            </button>
          </div>
        )}
      </div>
      {showCancelConfirm && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm">
            <h3 className="text-xl font-bold text-slate-800 mb-4">
              Cancel Payment?
            </h3>
            <p className="text-slate-600 mb-6">
              Are you sure you want to cancel this payment?
            </p>
            <div className="flex gap-3">
              <button
                onClick={confirmCancel}
                className="flex-1 bg-red-600 text-white py-2 rounded-lg font-semibold hover:bg-red-700"
              >
                Yes, Cancel
              </button>
              <button
                onClick={() => setShowCancelConfirm(false)}
                className="flex-1 bg-gray-300 text-slate-800 py-2 rounded-lg font-semibold hover:bg-gray-400"
              >
                No, Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
// --- FINAL PATIENT DASHBOARD (Feedback Box Fixed, Urgency Icons Updated) ---

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
        {/* HEADER */}
        <header className="bg-gradient-to-r from-purple-600 to-green-500 shadow-lg sticky top-0 z-30 px-8 py-4 h-20 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h1
              className="text-2xl font-extrabold text-white flex items-center cursor-pointer"
              onClick={() => window.location.reload()}
            >
              <i className="fas fa-shield-heart text-3xl mr-2"></i> MedVault
            </h1>
          </div>

          <div className="flex items-center gap-6">
            <button
              onClick={() => {
                sessionStorage.removeItem("loggedInUser");
                sessionStorage.removeItem("authToken");
                window.location.href = "http://localhost:5173/";
              }}
              className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-full font-bold flex items-center transition-all"
            >
              <i className="fas fa-home mr-2"></i> Home
            </button>
            <button
              onClick={() => {
                window.location.hash = "#support";
              }}
              className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-full font-bold flex items-center transition-all"
            >
              <i className="fas fa-exclamation-circle mr-2"></i> Report Issue
            </button>
            <div className="relative">
              <button
                onClick={handleBellClick}
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
                <div className="absolute right-0 mt-4 w-80 bg-white rounded-xl shadow-2xl z-50 max-h-96 overflow-y-auto border border-slate-100">
                  <div className="p-4 border-b bg-purple-50">
                    <h3 className="font-bold text-brand-purple">
                      Notifications
                    </h3>
                  </div>
                  {notifications.length === 0 ? (
                    <p className="p-4 text-slate-500 text-center">
                      No notifications
                    </p>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.notificationId}
                        className="p-4 border-b hover:bg-slate-50"
                      >
                        <p className="text-sm text-slate-800">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="p-8 pb-20 max-w-7xl w-full mx-auto">
          {/* BANNER */}
          <div className="flex items-center gap-6 bg-gradient-to-r from-purple-600 to-brand-purple rounded-3xl shadow-lg p-8 mb-10 text-white animate-fade-in">
            <img
              src={
                user.profilePictureUrl ||
                `https://placehold.co/128x128/B8BDFF/7209B7?text=${user.name?.charAt(0)}`
              }
              alt="Profile"
              className="w-24 h-24 rounded-full border-4 border-white shadow-lg object-cover"
            />
            <div>
              <h2 className="text-4xl font-bold mb-2">
                {getISTGreeting()}, {profileData.firstName || user.name}!
              </h2>
              <p className="text-purple-100 text-lg opacity-90 italic">
                Let's take care of your health today.
              </p>
            </div>
          </div>

          {/* DASHBOARD STATS */}
          {activeSection === "dashboard" && (
            <div className="animate-fade-in">
              {pendingConsentRequests.length > 0 && (
                <div className="mb-8 bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-r-xl shadow-sm">
                  <h4 className="text-lg font-bold text-yellow-800 mb-4 flex items-center">
                    <i className="fas fa-key mr-2"></i> Pending Access Requests
                  </h4>
                  <div className="space-y-3">
                    {pendingConsentRequests.map((req) => (
                      <div
                        key={req.id}
                        className="bg-white p-4 rounded-lg shadow flex justify-between items-center"
                      >
                        <div>
                          <p className="font-bold text-slate-800">
                            Dr. {req.doctorName}
                          </p>
                          <p className="text-sm text-slate-600">
                            Requests access to your records.
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() =>
                              handleConsentResponse(req.id, "APPROVED")
                            }
                            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm font-bold"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() =>
                              handleConsentResponse(req.id, "REJECTED")
                            }
                            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 text-sm font-bold"
                          >
                            Deny
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-2xl shadow-md border-l-4 border-purple-500 flex items-center gap-4 hover:shadow-lg transition-all">
                  <div className="w-14 h-14 bg-purple-100 rounded-full flex items-center justify-center text-purple-600">
                    <i className="fas fa-calendar-check text-2xl"></i>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-slate-800">
                      {nextAppointments.length}
                    </p>
                    <p className="text-slate-500 font-bold text-xs uppercase">
                      Upcoming Appointments
                    </p>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-md border-l-4 border-green-500 flex items-center gap-4 hover:shadow-lg transition-all">
                  <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                    <i className="fas fa-clipboard-check text-2xl"></i>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-slate-800">
                      {completed.length}
                    </p>
                    <p className="text-slate-500 font-bold text-xs uppercase">
                      Completed Appointments
                    </p>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-md border-l-4 border-blue-500 flex items-center gap-4 hover:shadow-lg transition-all">
                  <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                    <i className="fas fa-prescription-bottle-alt text-2xl"></i>
                  </div>
                  {/* --- UPDATE THIS LINE --- */}
                  <div>
                    <p className="text-3xl font-bold text-slate-800">
                      {activePrescriptions.length}
                    </p>
                    <p className="text-slate-500 font-bold text-xs uppercase">
                      Active Prescriptions
                    </p>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-md border-l-4 border-teal-500 flex items-center gap-4 hover:shadow-lg transition-all">
                  <div className="w-14 h-14 bg-teal-100 rounded-full flex items-center justify-center text-teal-600">
                    <i className="fas fa-notes-medical text-2xl"></i>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-slate-800">
                      {medicalConditions.length}
                    </p>
                    <p className="text-slate-500 font-bold text-xs uppercase">
                      Medical Conditions
                    </p>
                  </div>
                </div>
              </div>

              {/* Next Appointments - Show ALL upcoming appointments */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h4 className="text-xl font-bold text-slate-800 mb-4 flex items-center">
                  <i className="fas fa-calendar-alt mr-2 text-purple-600"></i>{" "}
                  Next Appointments ({nextAppointments.length})
                </h4>
                {nextAppointments.length === 0 ? (
                  <p className="text-slate-500 text-center py-8">
                    No upcoming appointments.
                  </p>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {nextAppointments.map((a) => {
                      const isEmergency = a.requestDateTime !== undefined;
                      const dateTime = isEmergency
                        ? a.requestDateTime
                        : a.appointmentDateTime;
                      const doctorName = isEmergency
                        ? doctors.find(
                            (d) => (d.professionalId || d.id) === a.doctorId,
                          )
                          ? `Dr. ${doctors.find((d) => (d.professionalId || d.id) === a.doctorId).firstName} ${doctors.find((d) => (d.professionalId || d.id) === a.doctorId).lastName}`
                          : "Dr. N/A"
                        : `Dr. ${a.doctor?.firstName} ${a.doctor?.lastName}`;
                      const reason = isEmergency
                        ? a.conditionDescription
                        : a.reason;
                      const doctorInitial = isEmergency
                        ? doctors
                            .find(
                              (d) => (d.professionalId || d.id) === a.doctorId,
                            )
                            ?.firstName?.charAt(0) || "D"
                        : a.doctor?.firstName?.charAt(0) || "D";

                      return (
                        <div
                          key={a.appointmentId || a.requestId}
                          className={`flex justify-between items-center p-4 rounded-xl border ${isEmergency ? "bg-red-50 border-red-300 shadow-lg animate-pulse-slow" : "bg-green-50 border-green-100"}`}
                        >
                          <div className="flex items-center gap-4">
                            <div
                              className={`w-12 h-12 ${isEmergency ? "bg-red-600" : "bg-brand-purple"} text-white rounded-full flex items-center justify-center font-bold text-xl`}
                            >
                              {isEmergency ? "🚨" : doctorInitial}
                            </div>
                            <div>
                              <p className="font-bold text-slate-800 text-lg flex items-center gap-2">
                                {doctorName}
                                {isEmergency && (
                                  <span className="text-xs bg-red-600 text-white px-2 py-1 rounded-full font-bold">
                                    EMERGENCY
                                  </span>
                                )}
                              </p>
                              <div className="flex items-center gap-3">
                                <p className="text-sm text-slate-600 font-medium">
                                  {new Date(dateTime).toLocaleString()}
                                </p>
                                {reason && (
                                  <span className="text-sm text-slate-500 border-l border-slate-300 pl-3">
                                    {reason}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <span
                            className={`px-3 py-1 ${isEmergency ? "bg-red-200 text-red-800" : "bg-green-200 text-green-800"} rounded-full text-xs font-bold`}
                          >
                            {isEmergency ? "EMERGENCY" : "APPROVED"}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* PROFILE */}
          {activeSection === "profile" && (
            <section className="bg-white rounded-2xl shadow-lg p-8 animate-fade-in">
              <div className="flex justify-between items-center mb-8 border-b pb-4">
                <div className="flex items-center gap-3">
                  <i className="fas fa-user-circle text-4xl text-slate-800"></i>
                  <h3 className="text-3xl font-bold text-slate-800">
                    My Profile
                  </h3>
                </div>
                {!isEditingProfile ? (
                  <button
                    onClick={() => setIsEditingProfile(true)}
                    className="bg-purple-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-purple-700 transition-all"
                  >
                    <i className="fas fa-edit mr-2"></i>Edit Profile
                  </button>
                ) : (
                  <div className="flex gap-3">
                    <button
                      onClick={handleProfileUpdate}
                      className="bg-green-600 text-white px-6 py-2 rounded-lg font-bold"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setIsEditingProfile(false)}
                      className="bg-slate-500 text-white px-6 py-2 rounded-lg font-bold"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {["firstName", "lastName"].map((field) => (
                  <div key={field}>
                    <label className="block text-sm font-bold text-slate-800 mb-2 capitalize">
                      {field.replace(/([A-Z])/g, " $1").trim()}
                    </label>
                    <input
                      type="text"
                      value={profileData[field] || ""}
                      disabled={!isEditingProfile}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          [field]: e.target.value,
                        })
                      }
                      className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 bg-slate-50 disabled:bg-slate-100 disabled:text-slate-600"
                    />
                  </div>
                ))}
                {/* Email field - fetched from User object */}
                <div>
                  <label className="block text-sm font-bold text-slate-800 mb-2 capitalize">
                    Email
                  </label>
                  <input
                    type="email"
                    value={profileData.email || ""}
                    disabled={true} // Email should not be editable from here
                    className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 bg-slate-100 text-slate-600"
                  />
                </div>
                {/* Gender field */}
                <div>
                  <label className="block text-sm font-bold text-slate-800 mb-2">
                    Gender
                  </label>
                  <select
                    value={profileData.gender?.toLowerCase() || ""}
                    disabled={!isEditingProfile}
                    onChange={(e) =>
                      setProfileData({ ...profileData, gender: e.target.value })
                    }
                    className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 bg-slate-50 disabled:bg-slate-100 appearance-none"
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                {[
                  "phone",
                  "dateOfBirth",
                  "bloodGroup",
                  "address",
                  "city",
                  "state",
                  "country",
                  "postalCode",
                  "emergencyContactName",
                  "emergencyContactPhone",
                ].map((field) => (
                  <div
                    key={field}
                    className={field === "address" ? "md:col-span-2" : ""}
                  >
                    <label className="block text-sm font-bold text-slate-800 mb-2 capitalize">
                      {field.replace(/([A-Z])/g, " $1").trim()}
                    </label>
                    <input
                      type={field.includes("date") ? "date" : "text"}
                      value={profileData[field] || ""}
                      disabled={!isEditingProfile}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          [field]: e.target.value,
                        })
                      }
                      className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 bg-slate-50 disabled:bg-slate-100 disabled:text-slate-600"
                    />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* BOOK APPOINTMENT (Fee logic fixed) */}
          {activeSection === "book-appointment" && (
            <section className="bg-white rounded-2xl shadow-lg p-8 mb-32 animate-fade-in">
              <h3 className="text-2xl font-bold text-slate-800 mb-6">
                Book an Appointment
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <SearchableDoctorDropdown
                  doctors={doctors}
                  selectedDoctorId={selectedDoctorId}
                  onSelectDoctor={handleDoctorSelect}
                  loading={doctorsLoading}
                  error={errorMessage}
                />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => handleDateChange(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  className="p-3 border rounded-lg focus:ring-2 focus:ring-brand-purple"
                />
                <select
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  disabled={
                    loadingSlots ||
                    !selectedDate ||
                    (availableSlots.length === 0 && allSlotsBookedForDate)
                  }
                  className="p-3 border rounded-lg focus:ring-2 focus:ring-brand-purple"
                >
                  <option value="">
                    {loadingSlots
                      ? "Loading..."
                      : !selectedDoctorId || !selectedDate
                        ? "Select Date First"
                        : allSlotsBookedForDate
                          ? "No slots available"
                          : availableSlots.length > 0
                            ? "Select Doctor Slot"
                            : "Select Time"}
                  </option>
                  {(allSlotsBookedForDate
                    ? []
                    : availableSlots.length > 0
                      ? availableSlots
                      : doctorHasNoSlots
                        ? allTimeSlots
                        : []
                  ).map((s, i) => (
                    <option key={i} value={s.value || s.slotTime}>
                      {s.label || s.slotTime}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Reason for visit"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="p-3 border rounded-lg focus:ring-2 focus:ring-brand-purple"
                />
              </div>

              {/* --- Slot availability messages --- */}
              {allSlotsBookedForDate && selectedDoctorId && selectedDate && (
                <div className="mt-4 p-4 bg-red-50 text-red-700 font-semibold text-center rounded-lg border border-red-200">
                  <i className="fas fa-calendar-times mr-2"></i>
                  All slots are booked for this date. Please select a different
                  date.
                </div>
              )}
              {doctorHasNoSlots &&
                selectedDoctorId &&
                selectedDate &&
                !loadingSlots && (
                  <div className="mt-4 p-4 bg-amber-50 text-amber-700 font-semibold text-center rounded-lg border border-amber-200">
                    <i className="fas fa-info-circle mr-2"></i>
                    No pre-defined slots for this date. You can select any
                    available time.
                  </div>
                )}

              {/* --- FIX: Fee only shows when selected --- */}
              {selectedDoctorFee !== null && selectedDoctorFee > 0 && (
                <div className="mt-6 p-4 bg-purple-50 text-brand-purple font-bold text-center rounded-lg border border-purple-200">
                  Consultation Fee: ₹{selectedDoctorFee}
                </div>
              )}

              <button
                onClick={initiatePayment}
                disabled={!selectedDoctorId || !selectedDate || !selectedTime}
                className={`mt-6 w-full bg-gradient-to-r from-purple-600 to-brand-purple text-white py-4 rounded-xl font-bold hover:shadow-lg transition-all ${
                  !selectedDoctorId || !selectedDate || !selectedTime
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:shadow-2xl"
                }`}
              >
                Pay & Book Appointment
              </button>
              {successMessage && (
                <p className="mt-4 text-center text-green-600 font-bold bg-green-50 p-2 rounded">
                  {successMessage}
                </p>
              )}
            </section>
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
                      <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
                        <i className="fas fa-calendar-alt text-4xl text-slate-300 mb-4"></i>
                        <p className="text-slate-500 font-medium">
                          No appointments found
                        </p>
                        <p className="text-slate-400 text-sm mt-1">
                          Book an appointment to get started
                        </p>
                      </div>
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
            <section className="bg-white rounded-2xl shadow-lg p-8 animate-fade-in">
              <div className="flex justify-between mb-6">
                <h3 className="text-2xl font-bold text-slate-800">
                  Health Records
                </h3>
                <button
                  onClick={() => setShowAddRecordModal(true)}
                  className="bg-brand-purple text-white px-4 py-2 rounded-lg font-bold"
                >
                  + Upload
                </button>
              </div>

              {/* ACCESS REQUESTS */}
              {accessRequests.filter((r) => r.status === "PENDING").length >
                0 && (
                <div className="mb-8 bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-r-xl shadow-sm">
                  <h4 className="text-lg font-bold text-yellow-800 mb-4 flex items-center">
                    <i className="fas fa-key mr-2"></i> Pending Access Requests
                  </h4>
                  <div className="space-y-3">
                    {accessRequests
                      .filter((r) => r.status === "PENDING")
                      .map((req) => (
                        <div
                          key={req.requestId}
                          className="bg-white p-4 rounded-lg shadow flex justify-between items-center"
                        >
                          <div>
                            <p className="font-bold text-slate-800">
                              Dr. {req.doctorName}
                            </p>
                            <p className="text-sm text-slate-600">
                              Requests access for appointment on:{" "}
                              {new Date(
                                req.appointmentDate,
                              ).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() =>
                                handleConsentResponse(
                                  req.requestId,
                                  "APPROVED",
                                  req.doctorName,
                                )
                              }
                              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm font-bold"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() =>
                                handleConsentResponse(
                                  req.requestId,
                                  "REJECTED",
                                  req.doctorName,
                                )
                              }
                              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 text-sm font-bold"
                            >
                              Reject
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {medicalRecords.map((r) => (
                  <div
                    key={r.recordId}
                    className="p-6 border border-blue-200 rounded-xl hover:shadow-lg transition-all bg-blue-50 flex flex-col"
                  >
                    <div className="mb-2">
                      <p className="font-bold text-xl text-slate-800 break-words">
                        Patient Information for '{r.title}'
                      </p>
                      <p className="text-xs text-slate-500 font-bold uppercase mt-1 tracking-wider">
                        {r.recordType || "General Record"}
                      </p>
                    </div>
                    <p className="text-sm text-slate-500 mb-4 border-b border-blue-200 pb-2">
                      {new Date(r.recordDate).toLocaleDateString()}
                    </p>
                    <button
                      onClick={() => setSelectedRecordForView(r)}
                      className="mt-auto w-full py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 shadow-md transition-colors"
                    >
                      <i className="fas fa-eye"></i> View
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* PRESCRIPTIONS */}
          {activeSection === "prescriptions" && (
            <section className="animate-fade-in space-y-8">
              {/* --- ACTIVE PRESCRIPTIONS --- */}
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h3 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                  <i className="fas fa-prescription-bottle-alt text-green-600"></i>{" "}
                  Active Prescriptions ({activePrescriptions.length})
                </h3>
                {activePrescriptions.length === 0 ? (
                  <p className="text-slate-500 text-center py-4">
                    No active prescriptions found.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {activePrescriptions.map((p) => {
                      // --- THIS LINE IS FIXED ---
                      const dateStr =
                        p.startDate || p.start_date
                          ? new Date(
                              p.startDate || p.start_date,
                            ).toLocaleDateString()
                          : "N/A";
                      return (
                        <div
                          key={p.medication_id}
                          className="bg-green-50 rounded-xl p-6 shadow-sm border border-green-200 hover:shadow-md transition-all"
                        >
                          <h4 className="text-xl font-bold text-green-700 mb-3 capitalize">
                            {p.medication_name ||
                              p.medicationName ||
                              "Medicine"}
                          </h4>
                          <div className="space-y-2 text-sm text-slate-700 mb-4">
                            <p>
                              <span className="font-bold text-slate-500">
                                Dosage:
                              </span>{" "}
                              {p.dosage}
                            </p>
                            <p>
                              <span className="font-bold text-slate-500">
                                Frequency:
                              </span>{" "}
                              {p.frequency}
                            </p>
                            <p>
                              <span className="font-bold text-slate-500">
                                Ends On:
                              </span>{" "}
                              {new Date(
                                p.endDate || p.end_date,
                              ).toLocaleDateString()}
                            </p>
                            {/* --- THIS LINE USES THE FIX --- */}
                            <p className="text-slate-400 text-xs mt-2 pt-2 border-t border-green-200">
                              Started: {dateStr}
                            </p>
                          </div>
                          <div className="flex gap-3">
                            <button
                              onClick={() =>
                                setSelectedRecordForView({
                                  ...p,
                                  title: p.medication_name,
                                })
                              }
                              className="flex items-center gap-1 text-blue-600 font-bold text-sm hover:text-blue-800"
                            >
                              <i className="fas fa-eye"></i> View
                            </button>
                            <button
                              onClick={() => alert("Downloading...")}
                              className="flex items-center gap-1 text-green-600 font-bold text-sm hover:text-green-800"
                            >
                              <i className="fas fa-download"></i> Download
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* --- PAST PRESCRIPTIONS --- */}
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h3 className="text-2xl font-bold text-slate-500 mb-6 flex items-center gap-2">
                  <i className="fas fa-history text-slate-500"></i> Past
                  Prescriptions ({pastPrescriptions.length})
                </h3>
                {pastPrescriptions.length === 0 ? (
                  <p className="text-slate-500 text-center py-4">
                    No past prescriptions found.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {pastPrescriptions.map((p) => {
                      // --- THIS LINE IS ALSO FIXED ---
                      const dateStr =
                        p.startDate || p.start_date
                          ? new Date(
                              p.startDate || p.start_date,
                            ).toLocaleDateString()
                          : "N/A";
                      return (
                        <div
                          key={p.medication_id}
                          className="bg-slate-50 rounded-xl p-6 shadow-sm border border-slate-200 opacity-80 hover:opacity-100 transition-all"
                        >
                          <h4 className="text-xl font-bold text-slate-600 mb-3 capitalize">
                            {p.medication_name ||
                              p.medicationName ||
                              "Medicine"}
                          </h4>
                          <div className="space-y-2 text-sm text-slate-600 mb-4">
                            <p>
                              <span className="font-bold text-slate-500">
                                Dosage:
                              </span>{" "}
                              {p.dosage}
                            </p>
                            <p>
                              <span className="font-bold text-slate-500">
                                Frequency:
                              </span>{" "}
                              {p.frequency}
                            </p>
                            <p>
                              <span className="font-bold text-slate-500">
                                Ended On:
                              </span>{" "}
                              {new Date(
                                p.endDate || p.end_date,
                              ).toLocaleDateString()}
                            </p>
                            {/* --- THIS LINE USES THE FIX --- */}
                            <p className="text-slate-400 text-xs mt-2 pt-2 border-t border-slate-200">
                              Started: {dateStr}
                            </p>
                          </div>
                          <div className="flex gap-3">
                            <button
                              onClick={() =>
                                setSelectedRecordForView({
                                  ...p,
                                  title: p.medication_name,
                                })
                              }
                              className="flex items-center gap-1 text-blue-600 font-bold text-sm hover:text-blue-800"
                            >
                              <i className="fas fa-eye"></i> View
                            </button>
                            <button
                              onClick={() => alert("Downloading...")}
                              className="flex items-center gap-1 text-green-600 font-bold text-sm hover:text-green-800"
                            >
                              <i className="fas fa-download"></i> Download
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </section>
          )}

          {/* EMERGENCY REQUEST FORM (Fee logic fixed) */}
          {activeSection === "emergency" && (
            <section className="bg-red-50 rounded-2xl shadow-lg p-8 border-2 border-red-100 animate-fade-in">
              <h3 className="text-2xl font-bold text-red-700 mb-6 flex items-center">
                <i className="fas fa-ambulance mr-2"></i> Emergency Request
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <SearchableDoctorDropdown
                  doctors={doctors}
                  selectedDoctorId={emergencyData.doctorId}
                  onSelectDoctor={handleEmergencyDoctorSelect}
                />
                <select
                  value={emergencyData.urgencyLevel}
                  onChange={(e) =>
                    setEmergencyData({
                      ...emergencyData,
                      urgencyLevel: e.target.value,
                    })
                  }
                  className="p-3 border border-red-200 rounded-lg font-medium text-slate-700"
                >
                  <option value="">Select Urgency Level</option>
                  <option value="HIGH">
                    ⚡ HIGH - Immediate attention needed
                  </option>
                  <option value="MEDIUM">
                    ⚠️ MEDIUM - Urgent but not critical
                  </option>
                  <option value="LOW">🟢 LOW - Can wait for a few hours</option>
                </select>
                <input
                  type="date"
                  value={emergencyData.preferredDate}
                  onChange={(e) =>
                    setEmergencyData({
                      ...emergencyData,
                      preferredDate: e.target.value,
                    })
                  }
                  className="p-3 border border-red-200 rounded-lg"
                />
                <input
                  type="time"
                  value={emergencyData.preferredTime}
                  onChange={(e) =>
                    setEmergencyData({
                      ...emergencyData,
                      preferredTime: e.target.value,
                    })
                  }
                  className="p-3 border border-red-200 rounded-lg"
                />
                <input
                  type="text"
                  placeholder="Location"
                  value={emergencyData.currentLocation}
                  onChange={(e) =>
                    setEmergencyData({
                      ...emergencyData,
                      currentLocation: e.target.value,
                    })
                  }
                  className="p-3 border border-red-200 rounded-lg"
                />
                <textarea
                  placeholder="Describe Condition..."
                  value={emergencyData.conditionDescription}
                  className="md:col-span-2 p-3 border border-red-200 rounded-lg h-32"
                  onChange={(e) =>
                    setEmergencyData({
                      ...emergencyData,
                      conditionDescription: e.target.value,
                    })
                  }
                ></textarea>
              </div>

              {/* --- FIX: Fee only shows when selected --- */}
              {selectedDoctorFee !== null && selectedDoctorFee > 0 && (
                <div className="mt-4 p-3 bg-red-100 text-red-800 font-bold text-center rounded-lg border border-red-200">
                  Emergency Fee: ₹{selectedDoctorFee}
                </div>
              )}
              <button
                onClick={initiatePayment}
                className="mt-6 w-full bg-red-600 text-white py-4 rounded-xl font-bold hover:bg-red-700 shadow-lg"
              >
                Pay & Send Emergency Request
              </button>
              {successMessage && (
                <p className="mt-4 text-center text-green-600 font-bold bg-green-50 p-3 rounded-lg border border-green-200">
                  {successMessage}
                </p>
              )}
              {errorMessage && (
                <p className="mt-4 text-center text-red-600 font-bold bg-red-50 p-3 rounded-lg border border-red-200">
                  {errorMessage}
                </p>
              )}
            </section>
          )}

          {/* CONDITIONS */}
          {activeSection === "conditions" && (
            <section className="bg-white rounded-2xl shadow-lg p-8 animate-fade-in">
              <div className="flex justify-between mb-6">
                <h3 className="text-2xl font-bold text-slate-800">
                  Medical Conditions
                </h3>
                <button
                  onClick={() => setShowAddConditionModal(true)}
                  className="text-brand-purple font-bold bg-purple-50 px-4 py-2 rounded-lg"
                >
                  + Add
                </button>
              </div>
              {medicalConditions.map((c) => (
                <div
                  key={c.conditionId}
                  className="p-4 border border-yellow-200 rounded-lg mb-3 bg-yellow-50"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-bold text-lg text-slate-800">
                        {c.conditionName}
                      </p>
                      <p className="text-sm text-slate-500">
                        Diagnosed:{" "}
                        {new Date(c.diagnosedDate).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="bg-teal-100 text-teal-800 px-3 py-1 rounded-full text-xs font-bold">
                      {c.status}
                    </span>
                  </div>
                  {c.notes && (
                    <div className="text-base text-slate-700 mt-2 p-3 bg-white border border-yellow-100 rounded-lg italic">
                      Note: {c.notes}
                    </div>
                  )}
                </div>
              ))}
            </section>
          )}

          {/* REPORTS & ISSUES - PATIENT */}
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
                  issueForm.name || user?.firstName + " " + user?.lastName || ""
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
                      issueForm.name || user?.firstName + " " + user?.lastName,
                    email: issueForm.email || user?.email,
                    phoneNumber: issueForm.phoneNumber,
                    subject: issueForm.subject,
                    message: issueForm.message,
                    userType: "PATIENT",
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
                        setSuccessMessage("Issue reported successfully!");
                        setTimeout(() => setSuccessMessage(""), 3000);
                      } else {
                        setErrorMessage("Failed to submit issue");
                        setTimeout(() => setErrorMessage(""), 3000);
                      }
                    })
                    .catch((err) => {
                      setErrorMessage("Error: " + err.message);
                      setTimeout(() => setErrorMessage(""), 3000);
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
// --- DOCTOR DASHBOARD ---


export default PatientDashboard;

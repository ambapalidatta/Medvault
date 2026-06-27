import React, { useEffect, useState } from "react";
import authFetch from "../../../services/authFetch.js";
import LoadingSpinner from "../../common/LoadingSpinner.jsx";
import EmptyState from "../../common/EmptyState.jsx";
import ErrorState from "../../common/ErrorState.jsx";
import ViewRecordModal from "../../modals/ViewRecordModal.jsx";

export default function DoctorViewRecordsModal({
  patient,
  doctorId,
  onClose,
}) {
  const [records, setRecords] = useState([]); // For api/records
  const [conditions, setConditions] = useState([]); // For api/medical-conditions
  const [prescriptions, setPrescriptions] = useState([]); // For api/medications
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null); // For viewing any file
  const [prescriptionFiles, setPrescriptionFiles] = useState([]);
  const [fullPatientProfile, setFullPatientProfile] = useState(null);
  // API CALL TO FETCH ALL PATIENT DATA
  useEffect(() => {
    const fetchAllData = async () => {
      if (!patient?.patientId) {
        console.error("No patient ID available");
        return;
      }

      setLoading(true);
      setError(null);
      console.log("Fetching data for patient:", patient.patientId);

      try {
        // --- 1. FETCH HEALTH RECORDS (without doctorId - consent already verified) ---
        // Note: We don't pass doctorId here because consent was already verified before opening this modal
        const [recordsRes, prescriptionsRes] = await Promise.all([
          authFetch(
            `/records/patient/${patient.patientId}`,
            {
              credentials: "include",
            },
          ),

          authFetch(
            `/medications/patient/${patient.patientId}`,
            {
              credentials: "include",
            },
          ),
        ]);

        if (!recordsRes.ok) {
          if (recordsRes.status === 403) {
            throw new Error(
              "Access denied. You need patient consent to view their records.",
            );
          }
          throw new Error(
            `Failed to fetch records (HTTP ${recordsRes.status})`,
          );
        }
        if (!prescriptionsRes.ok) {
          if (prescriptionsRes.status === 403) {
            throw new Error(
              "Access denied. You need patient consent to view their prescriptions.",
            );
          }
          throw new Error(
            `Failed to fetch prescriptions (HTTP ${prescriptionsRes.status})`,
          );
        }

        const [recordsData, prescriptionsData] = await Promise.all([
          recordsRes.json(),
          prescriptionsRes.json(),
        ]);


        setRecords(recordsData);
        setPrescriptions(prescriptionsData);
      } catch (e) {
        console.error("Error fetching patient data:", e);
        setError(e.message);
        setRecords([]);
        setPrescriptions([]);
      } finally {
        setLoading(false);
      }
      try {
        const profileRes = await authFetch(
          `/patients/${patient.patientId}`,
        );
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          setFullPatientProfile(profileData); // Set the full profile
        } else {
          throw new Error("Failed to fetch patient profile");
        }
      } catch (e) {
        console.error("Error fetching full patient profile:", e);
        setFullPatientProfile(patient); // Fallback to minimal patient object
      }
      // --- 2. FETCH MEDICAL CONDITIONS (api/medical-conditions) ---
      try {
        const conditionsUrl = `/medical-conditions/patient/${patient.patientId}`;
        const res = await authFetch(conditionsUrl);
        if (!res.ok)
          throw new Error(`Failed to fetch conditions (HTTP ${res.status})`);
        const conditions = await res.json();
        setConditions(conditions);
      } catch (e) {
        console.error("Error fetching medical conditions:", e);
        console.warn("Could not load medical conditions.");
        setConditions([]);
      }

      // --- 3. FETCH PRESCRIPTION FILES (api/medications) ---
      try {
        const prescriptionsUrl = `/medications/patient/${patient.patientId}`;
        const res = await fetch(prescriptionsUrl);
        if (!res.ok)
          throw new Error(`Failed to fetch prescriptions (HTTP ${res.status})`);
        const data = await res.json();
        setPrescriptions(
          data.sort(
            (a, b) =>
              new Date(b.created_at || b.start_date) -
              new Date(a.created_at || a.start_date),
          ),
        );
      } catch (e) {
        console.error("Error fetching prescription files:", e);
        console.warn("Could not load prescription files.");
        setPrescriptions([]);
      }

      setLoading(false);
    };

    fetchAllData();
  }, [patient.patientId]);

  // RecordItem component for displaying individual records
  const RecordItem = ({ r, isPrescription, onViewRecord }) => {
    const fileIcon = (r.document_path || r.fileUrl || "").endsWith(".pdf")
      ? "fa-file-pdf"
      : "fa-file-image";

    // Styles
    const cardClasses = isPrescription
      ? "bg-brand-purple/5 border-brand-purple/20"
      : "bg-white border-slate-200 hover:border-brand-purple/50";

    const titleClasses = isPrescription
      ? "text-brand-purple font-extrabold"
      : "text-slate-800 font-bold";

    // Data Mapping
    const title = isPrescription
      ? r.medication_name || r.medicationName
      : r.title;
    const dateRaw = isPrescription ? r.start_date || r.startDate : r.recordDate;
    const date = dateRaw ? new Date(dateRaw).toLocaleDateString() : "N/A";

    // Check for extra info tags
    const hasVitals = r.weightKg || r.bmi || r.bodyTemperature;
    const hasLifestyle = r.smokingStatus || r.dietPreference;

    return (
      <div
        className={`p-5 rounded-xl border shadow-sm hover:shadow-md transition-all duration-300 flex flex-col h-full ${cardClasses}`}
      >
        {/* Top Row: Icon & Date */}
        <div className="flex justify-between items-start mb-2">
          <div
            className={`p-2 rounded-lg ${isPrescription ? "bg-purple-100 text-purple-600" : "bg-blue-50 text-blue-600"}`}
          >
            <i
              className={`fas ${isPrescription ? "fa-prescription" : "fa-file-medical"} text-xl`}
            ></i>
          </div>
          <span className="text-xs font-semibold text-slate-400 bg-slate-50 px-2 py-1 rounded-full">
            {date}
          </span>
        </div>

        {/* Title */}
        <h4 className={`text-lg mb-1 ${titleClasses} line-clamp-1`}>{title}</h4>
        <p className="text-xs text-slate-500 font-medium uppercase tracking-wide mb-3">
          {isPrescription ? "Prescription" : r.recordType}
        </p>

        {/* Brief Summary / Description Truncated */}
        <div className="flex-grow mb-4">
          {r.description || r.notes ? (
            <p className="text-sm text-slate-600 line-clamp-2">
              {r.description || r.notes}
            </p>
          ) : (
            <p className="text-sm text-slate-400 italic">
              No additional notes.
            </p>
          )}
        </div>

        {/* Quick Tags (Summary of what's inside) */}
        {!isPrescription && (
          <div className="flex flex-wrap gap-2 mb-4">
            {hasVitals && (
              <span className="text-[10px] font-bold px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                VITALS
              </span>
            )}
            {hasLifestyle && (
              <span className="text-[10px] font-bold px-2 py-1 bg-green-100 text-green-700 rounded-full">
                LIFESTYLE
              </span>
            )}
            {(r.document_path || r.fileUrl) && (
              <span className="text-[10px] font-bold px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                FILE
              </span>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="mt-auto pt-3 border-t border-slate-100 flex gap-2">
          <button
            onClick={() => onViewRecord(r)}
            className="flex-1 text-sm font-semibold text-brand-purple bg-purple-50 hover:bg-purple-100 py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <i className="fas fa-eye"></i> View Details
          </button>
        </div>
      </div>
    );
  };
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content max-w-4xl w-full h-5/6 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <h2 className="text-2xl font-bold text-slate-800">
            Patient Records: {patient.firstName} {patient.lastName}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-800 text-2xl"
          >
            &times;
          </button>
        </div>

        {loading && <LoadingSpinner message="Loading patient records..." />}

        {error && <ErrorState message={`Error loading records: ${error}`} className="mb-4" />}

        {!loading && !error && (
          <div className="flex-grow overflow-y-auto pr-2 space-y-6">
            {/* --- 1. MEDICAL CONDITIONS --- */}
            <div
              className="bg-slate-50 p-4 rounded-lg shadow-inner mb-6"
              id="doctor-medical-conditions"
            >
              <h3 className="text-2xl font-bold text-slate-800 mb-4 flex items-center">
                <i className="fas fa-notes-medical mr-2"></i> Medical Conditions
                ({conditions.length})
              </h3>
              <div className="space-y-3">
                {conditions.length === 0 ? (
                  <p className="text-slate-500">
                    No medical conditions recorded for this patient.
                  </p>
                ) : (
                  conditions.map((c) => (
                    <div
                      key={c.conditionId}
                      className="p-4 bg-white rounded-lg border border-slate-200"
                    >
                      <p className="font-semibold text-slate-800">
                        {c.conditionName}
                      </p>
                      <div className="flex flex-wrap gap-4 text-sm text-slate-600 mt-1">
                        {c.diagnosedDate && (
                          <p>
                            <span className="font-medium">Diagnosed:</span>{" "}
                            {new Date(c.diagnosedDate).toLocaleDateString()}
                          </p>
                        )}
                        {c.status && (
                          <p>
                            <span className="font-medium">Status:</span>
                            <span
                              className={`ml-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                                c.status.toUpperCase() === "RESOLVED"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {c.status}
                            </span>
                          </p>
                        )}
                      </div>
                      {c.notes && (
                        <p className="text-slate-600 text-sm italic mt-1">
                          Notes: {c.notes}
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* --- 2. PRESCRIPTIONS CONTAINER (MODIFIED) --- */}
            <div
              className="bg-slate-50 p-4 rounded-lg shadow-inner"
              id="doctor-prescriptions"
            >
              <h3 className="text-2xl font-bold text-brand-purple mb-4 flex items-center">
                <i className="fas fa-prescription-bottle-alt mr-2"></i>{" "}
                Prescriptions ({prescriptions.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {prescriptions.length === 0 ? (
                  <p className="text-slate-500 col-span-full">
                    No prescriptions found for this patient.
                  </p>
                ) : (
                  prescriptions.map((r) => (
                    <RecordItem
                      key={r.medication_id}
                      r={r}
                      isPrescription={true}
                      onViewRecord={setSelectedRecord}
                    />
                  ))
                )}
              </div>
            </div>

            {/* --- 3. OTHER RECORDS CONTAINER (MODIFIED) --- */}
            <div
              className="bg-slate-50 p-4 rounded-lg shadow-inner"
              id="doctor-other-records"
            >
              <h3 className="text-2xl font-bold text-slate-800 mb-4 flex items-center">
                <i className="fas fa-file-medical mr-2"></i> Health Records (
                {records.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {records.length === 0 ? (
                  <p className="text-slate-500 col-span-full">
                    No lab reports, imaging, or notes found for this patient.
                  </p>
                ) : (
                  records.map((r) => (
                    <RecordItem
                      key={r.recordId}
                      r={r}
                      isPrescription={false}
                      onViewRecord={setSelectedRecord}
                    />
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      {/* Modal to view single record detail (unchanged) */}
      {/* Modal to view single record detail (FIXED) */}
      {selectedRecord && (
        <ViewRecordModal
          record={selectedRecord}
          patientProfile={fullPatientProfile || patient} // <-- This is the fix
          onClose={() => setSelectedRecord(null)}
        />
      )}
    </div>
  );
};
const RecordItem = ({ r, isPrescription, onViewRecord }) => {
  const fileIcon = r.document_path?.endsWith(".pdf")
    ? "fa-file-pdf"
    : r.document_path?.includes("jpg")
      ? "fa-file-image"
      : "fa-file";

  // Highlight prescriptions visually
  const cardClasses = isPrescription
    ? "bg-brand-purple/10 border-brand-purple/50"
    : "bg-brand-peach-light/50 border-brand-peach-dark/30";

  const titleClasses = isPrescription
    ? "text-brand-purple font-extrabold"
    : "text-slate-800";

  // Handle different title fields for prescriptions vs records
  const title = isPrescription ? r.medication_name : r.title;
  const date = isPrescription
    ? r.start_date
      ? new Date(r.start_date).toLocaleDateString()
      : "N/A"
    : r.recordDate
      ? new Date(r.recordDate).toLocaleDateString()
      : "N/A";

  return (
    <div
      key={isPrescription ? r.medication_id : r.recordId}
      className={`p-4 rounded-xl border hover:shadow-md transition-shadow ${cardClasses}`}
    >
      <p className={`font-semibold leading-tight ${titleClasses}`}>{title}</p>
      <p className="text-xs text-slate-500 mt-1">
        <span className="font-medium">
          {isPrescription ? "Prescription" : r.recordType}
        </span>{" "}
        | {date}
      </p>
      {isPrescription && r.dosage && (
        <p className="text-xs text-slate-600 mt-1">
          {r.dosage} - {r.frequency}
        </p>
      )}
      {r.document_path && (
        <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
          <i className={`fas ${fileIcon} mr-2 text-brand-purple`}></i>
          {r.document_path.split("/").pop()}
        </p>
      )}
      <div className="mt-3 flex gap-2">
        <button
          onClick={() => onViewRecord(r)}
          className="text-xs font-semibold text-blue-600 hover:text-blue-800 p-1 rounded transition-colors flex items-center gap-1"
        >
          <i className="fas fa-eye"></i> View
        </button>
        {r.document_path && (
          <button
            onClick={() => alert("Downloading...")}
            className="text-xs font-semibold text-green-600 hover:text-green-800 p-1 rounded transition-colors flex items-center gap-1"
          >
            <i className="fas fa-download"></i> Download
          </button>
        )}
      </div>
    </div>
  );
};

// --- Other Health Records Section (Top in 30% aside) ---
const OtherRecordsSection = ({ records, onAddRecord, onViewRecord }) => {
  const otherRecords = records.filter((r) => r.recordType !== "Prescription");

  return (
    <div
      className="flex flex-col bg-white rounded-2xl shadow-xl mb-6"
      id="other-records"
    >
      <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
        <h3 className="text-2xl font-bold text-slate-800 flex items-center">
          <i className="fas fa-file-medical mr-2"></i> Health Records
        </h3>
        <button
          onClick={onAddRecord}
          className="bg-brand-purple text-white font-semibold py-1 px-3 rounded-lg hover:bg-purple-700 text-sm"
          title="Add New Record"
        >
          <i className="fas fa-plus mr-1"></i> Add
        </button>
      </div>

      <div className="p-4 space-y-4 overflow-y-auto">
        {otherRecords.length === 0 ? (
          <p className="text-slate-500 p-2 text-sm text-center bg-slate-50 rounded-lg">
            No lab reports, imaging, or visit notes uploaded yet.
          </p>
        ) : (
          otherRecords.map((r) => (
            <RecordItem
              key={r.recordId}
              r={r}
              isPrescription={false}
              onViewRecord={onViewRecord}
            />
          ))
        )}
      </div>
    </div>
  );
};

// --- Prescriptions Sidebar Section (Bottom in 30% aside) ---
const PrescriptionsSidebar = ({ user, onViewRecord }) => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPrescriptions = async () => {
      if (!user?.patientId) {
        console.error("No patient ID available");
        return;
      }

      setLoading(true);
      try {
        console.log("Fetching prescriptions for patient:", user.patientId);
        const response = await authFetch(
          `https://medvault-backend-ni3i.onrender.com/api/medications/patient/${user.patientId}`,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
            credentials: "include",
          },
        );

        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();

        // Transform and validate the data
        const validPrescriptions = data
          .map((p) => ({
            ...p,
            medication_id: p.medicationId || p.medication_id,
            medication_name: p.medicationName || p.medication_name,
            prescribed_by: p.prescribedBy || p.prescribed_by,
            document_path: p.documentPath || p.document_path,
            start_date: p.startDate || p.start_date,
            end_date: p.endDate || p.end_date,
          }))
          .filter((p) => p.medication_name); // Only include prescriptions with valid names

        console.log("Processed prescriptions:", validPrescriptions);
        setPrescriptions(validPrescriptions);
      } catch (error) {
        console.error("Error fetching prescriptions:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPrescriptions();
  }, [user?.patientId]);

  return (
    <div
      className="flex flex-col bg-white rounded-2xl shadow-xl"
      id="prescriptions-sidebar"
    >
      <div className="p-6 border-b border-slate-100 sticky top-0 bg-white z-10">
        <h3 className="text-2xl font-bold text-brand-purple flex items-center">
          <i className="fas fa-prescription-bottle-alt mr-2"></i> My
          Prescriptions
          <span className="ml-2 text-sm text-gray-500">
            ({prescriptions.length})
          </span>
        </h3>
      </div>

      <div className="p-4 space-y-4 overflow-y-auto">
        {loading ? (
          <LoadingSpinner message="Loading prescriptions..." className="p-4" />
        ) : prescriptions.length === 0 ? (
          <EmptyState
            icon="fas fa-prescription-bottle-medical"
            title="No prescriptions yet"
            description="Prescriptions from your doctors will appear here."
            className="p-4"
          />
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {prescriptions.map((r) => (
              <div
                key={r.medication_id}
                className="p-4 rounded-xl border border-brand-purple/20 bg-brand-purple/5 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-brand-purple">
                    {r.medication_name}
                  </h4>
                  <span className="text-xs text-slate-500">
                    {new Date(r.start_date).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-slate-600">
                  <span className="font-medium">Dosage:</span> {r.dosage}
                </p>
                <p className="text-sm text-slate-600">
                  <span className="font-medium">Frequency:</span> {r.frequency}
                </p>
                <p className="text-sm text-slate-600">
                  <span className="font-medium">Prescribed by:</span>{" "}
                  {r.prescribed_by}
                </p>
                {r.notes && (
                  <p className="text-sm text-slate-500 mt-2 italic">
                    Note: {r.notes}
                  </p>
                )}
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => onViewRecord(r)}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-800 p-1 rounded transition-colors flex items-center gap-1"
                  >
                    <i className="fas fa-eye"></i> View
                  </button>
                  {r.document_path && (
                    <button
                      onClick={() => alert("Downloading prescription...")}
                      className="text-xs font-semibold text-green-600 hover:text-green-800 p-1 rounded transition-colors flex items-center gap-1"
                    >
                      <i className="fas fa-download"></i> Download
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

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
}

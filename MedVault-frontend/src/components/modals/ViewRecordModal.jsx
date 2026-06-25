import React from "react";

const ViewRecordModal = ({ record, patientProfile, onClose }) => {
  // --- HELPER 1: Gets data *ONLY* from the RECORD ---
  const getRecordData = (key, defaultVal = "N/A") => {
    if (!record) return defaultVal;
    const snakeKey = key.replace(/([A-Z])/g, "_$1").toLowerCase();
    const value = record[key] || record[snakeKey];

    if (value !== undefined && value !== null && String(value).trim() !== "") {
      return value;
    }
    return defaultVal;
  };

  // --- HELPER 2: Gets data *ONLY* from the main PROFILE ---
  const getPatientData = (key, defaultVal = "N/A") => {
    if (!patientProfile) return defaultVal;
    const snakeKey = key.replace(/([A-Z])/g, "_$1").toLowerCase();
    const value = patientProfile[key] || patientProfile[snakeKey];
    if (value !== undefined && value !== null && String(value).trim() !== "") {
      return value;
    }
    return defaultVal;
  };

  const handleDownload = () => {
    alert("Downloading document...");
    window.open(getRecordData("fileUrl", "#"), "_blank");
  };

  // --- Component for colored boxes ---
  const ProfileData = ({ label, value, icon }) => (
    <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
      <span className="block text-xs font-bold text-slate-400 uppercase mb-1 flex items-center">
        <i className={`fas ${icon} fa-fw mr-2`}></i>
        {label}
      </span>
      <p className="text-slate-700 font-medium">{value}</p>
    </div>
  );

  const VitalData = ({ label, value, unit }) => (
    <div className="bg-white p-3 rounded-lg border border-blue-100 text-center shadow-sm">
      <span className="block text-xs font-bold text-blue-400 uppercase mb-1">
        {label}
      </span>
      <p className="text-slate-700 font-bold text-lg">
        {value} {unit || ""}
      </p>
    </div>
  );

  // --- Component for simple prescription layout ---
  const PrescriptionDetail = ({ label, value }) => (
    <div>
      <label className="block text-sm font-bold text-slate-500">{label}</label>
      <p className="text-slate-800 font-medium text-lg capitalize">{value}</p>
    </div>
  );

  // --- DATA LOGIC ---
  const isPrescription = !!getRecordData("medicationName", null);
  const title = isPrescription
    ? getRecordData("medicationName")
    : getRecordData("title");

  const date = isPrescription
    ? getRecordData("startDate", null)
      ? new Date(getRecordData("startDate")).toLocaleDateString()
      : "N/A"
    : getRecordData("recordDate", null)
      ? new Date(getRecordData("recordDate")).toLocaleDateString()
      : "N/A";

  const description =
    getRecordData("description", null) ||
    getRecordData("notes", "No description provided.");
  const recordType = isPrescription
    ? "Prescription"
    : getRecordData("recordType");

  let fullName = getPatientData("name");
  if (fullName === "N/A" || !fullName) {
    fullName = `${getPatientData("firstName")} ${getPatientData("lastName")}`;
  }

  // --- DATA FIX: Get all other data *from the record* ---
  const maritalStatus = getRecordData("maritalStatus");
  const displayAddress = getRecordData("address") || "N/A";
  const weightKg = getRecordData("weightKg");
  const heightCm = getRecordData("heightCm");
  const bmi = getRecordData("bmi");
  const pulseRate = getRecordData("pulseRate");
  const bodyTemperature = getRecordData("bodyTemperature");
  const aadhaarNumber = getRecordData("aadhaarNumber");
  const insuranceDetails = getRecordData("insuranceDetails");
  const birthMark = getRecordData("birthMark");
  const smokingStatus = getRecordData("smokingStatus");
  const alcoholConsumption = getRecordData("alcoholConsumption");
  const dietPreference = getRecordData("dietPreference");
  const physicalActivityLevel = getRecordData("physicalActivityLevel");
  const sleepHours = getRecordData("sleepHours");
  const stressLevel = getRecordData("stressLevel");

  // --- Data for Prescriptions ---
  const dosage = getRecordData("dosage");
  const frequency = getRecordData("frequency");

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content bg-slate-50 rounded-xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "90%",
          maxWidth: "800px",
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div className="sticky top-0 bg-white z-10 border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-brand-purple flex items-center gap-3 capitalize">
            <i
              className={`fas ${isPrescription ? "fa-prescription-bottle-alt" : "fa-file-alt"}`}
            ></i>
            {isPrescription ? title : `Patient Information for '${title}'`}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-red-500 text-3xl font-bold"
          >
            &times;
          </button>
        </div>

        {/* =======================================
                    === 1. PRESCRIPTION LAYOUT (UPDATED)
                    =======================================
                    */}
        {isPrescription ? (
          <>
            <div className="p-6 space-y-6 overflow-y-auto">
              <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm space-y-6">
                <PrescriptionDetail label="Medicine Name:" value={title} />
                <PrescriptionDetail label="Dosage:" value={dosage} />
                <PrescriptionDetail label="Frequency:" value={frequency} />

                {/* --- ADDED DATES --- */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <PrescriptionDetail
                    label="Start Date:"
                    value={
                      getRecordData("startDate", null)
                        ? new Date(
                            getRecordData("startDate"),
                          ).toLocaleDateString()
                        : "N/A"
                    }
                  />
                  <PrescriptionDetail
                    label="End Date:"
                    value={
                      getRecordData("endDate", null)
                        ? new Date(
                            getRecordData("endDate"),
                          ).toLocaleDateString()
                        : "N/A"
                    }
                  />
                </div>
                {/* --- END ADDED DATES --- */}

                <PrescriptionDetail label="Description:" value={description} />
              </div>
            </div>
            <div className="sticky bottom-0 bg-slate-50 z-10 p-6 border-t border-slate-200">
              <button
                onClick={handleDownload}
                className="w-full bg-brand-purple text-white font-bold py-3 rounded-lg hover:opacity-90 shadow-lg flex items-center justify-center gap-2"
              >
                <i className="fas fa-download"></i> Download Prescription
              </button>
            </div>
          </>
        ) : (
          /* =======================================
                    === 2. HEALTH RECORD LAYOUT
                    =======================================
                    */
          <>
            {/* --- LAYOUT FIX: Simple text, no container --- */}
            <div className="px-6 pt-4 pb-2 bg-white border-b">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase">
                    Type
                  </label>
                  <p className="text-slate-700 font-medium">{recordType}</p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase">
                    Date
                  </label>
                  <p className="text-slate-700 font-medium">{date}</p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto">
              <div className="bg-slate-100 p-5 rounded-xl border border-slate-200">
                <h3 className="font-bold text-slate-700 mb-4 text-lg border-b pb-2">
                  Basic Info
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <ProfileData
                    label="Full Name"
                    value={fullName}
                    icon="fa-user"
                  />
                  <ProfileData
                    label="Marital Status"
                    value={maritalStatus}
                    icon="fa-heart"
                  />
                  <ProfileData
                    label="Full Address"
                    value={displayAddress}
                    icon="fa-map-marker-alt"
                  />
                </div>
              </div>

              <div className="bg-blue-50 p-5 rounded-xl border border-blue-200">
                <h3 className="font-bold text-blue-800 mb-4 text-lg border-b border-blue-200 pb-2">
                  Current Health (Vitals)
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  <VitalData label="Weight" value={weightKg} unit="kg" />
                  <VitalData label="Height" value={heightCm} unit="cm" />
                  <VitalData label="BMI" value={bmi} />
                  <VitalData label="Pulse" value={pulseRate} unit="bpm" />
                  <VitalData label="Temp" value={bodyTemperature} unit="°C" />
                </div>
              </div>

              <div className="bg-orange-50 p-5 rounded-xl border border-orange-200">
                <h3 className="font-bold text-orange-800 mb-4 text-lg border-b border-orange-200 pb-2">
                  Identification Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <ProfileData
                    label="Aadhaar Number"
                    value={aadhaarNumber}
                    icon="fa-id-badge"
                  />
                  <ProfileData
                    label="Insurance"
                    value={insuranceDetails}
                    icon="fa-shield-alt"
                  />
                  <ProfileData
                    label="Birth Mark"
                    value={birthMark}
                    icon="fa-star"
                  />
                </div>
              </div>

              <div className="bg-green-50 p-5 rounded-xl border border-green-200">
                <h3 className="font-bold text-green-800 mb-4 text-lg border-b border-green-200 pb-2">
                  Lifestyle
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <ProfileData
                    label="Smoking"
                    value={smokingStatus}
                    icon="fa-smoking"
                  />
                  <ProfileData
                    label="Alcohol"
                    value={alcoholConsumption}
                    icon="fa-wine-glass"
                  />
                  <ProfileData
                    label="Diet"
                    value={dietPreference}
                    icon="fa-carrot"
                  />
                  <ProfileData
                    label="Activity"
                    value={physicalActivityLevel}
                    icon="fa-running"
                  />
                  <ProfileData
                    label="Sleep"
                    value={
                      sleepHours !== "N/A" ? `${sleepHours} hrs/night` : "N/A"
                    }
                    icon="fa-bed"
                  />
                  <ProfileData
                    label="Stress Level"
                    value={stressLevel}
                    icon="fa-brain"
                  />
                </div>
              </div>

              {/* --- LAYOUT FIX: Description moved to end --- */}
              <div className="bg-purple-50 p-5 rounded-xl border border-purple-200 shadow-sm">
                <h3 className="font-bold text-purple-800 mb-4 text-lg border-b border-purple-200 pb-2">
                  Description / Notes
                </h3>
                <p className="text-slate-700 font-medium">{description}</p>
              </div>
            </div>
            <div className="sticky bottom-0 bg-slate-50 z-10 p-6 border-t border-slate-200">
              <button
                onClick={handleDownload}
                className="w-full bg-brand-purple text-white font-bold py-3 rounded-lg hover:opacity-90 shadow-lg flex items-center justify-center gap-2"
              >
                <i className="fas fa-download"></i> Download Attached Document
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ViewRecordModal;

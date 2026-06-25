import { useEffect, useRef, useState } from "react";
import { authFetch } from "../../services/authFetch.js";

const AddRecordModal = ({ user, onClose, onRecordAdded }) => {
  const [patientName, setPatientName] = useState("Loading...");

  const [recordAddress, setRecordAddress] = useState("");
  const [maritalStatus, setMaritalStatus] = useState("");
  const [aadhaarNumber, setAadhaarNumber] = useState("");
  const [insuranceDetails, setInsuranceDetails] = useState("");
  const [birthMark, setBirthMark] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [heightCm, setHeightCm] = useState("");
  const [bmi, setBmi] = useState("");
  const [pulseRate, setPulseRate] = useState("");
  const [bodyTemperature, setBodyTemperature] = useState("");
  const [smokingStatus, setSmokingStatus] = useState("");
  const [alcoholConsumption, setAlcoholConsumption] = useState("");
  const [dietPreference, setDietPreference] = useState("");
  const [physicalActivityLevel, setPhysicalActivityLevel] = useState("");
  const [sleepHours, setSleepHours] = useState("");
  const [stressLevel, setStressLevel] = useState("");
  const [recordType, setRecordType] = useState("Lab Report");
  const [title, setTitle] = useState("");
  const [recordDate, setRecordDate] = useState("");
  const [description, setDescription] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [message, setMessage] = useState("");
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (user?.patientId) {
      authFetch(
        `https://medvault-backend-ni3i.onrender.com/api/patients/${user.patientId}`,
      )
        .then((res) => res.json())
        .then((data) => {
          const fName = data.firstName || data.first_name || "";
          const lName = data.lastName || data.last_name || "";
          setPatientName(
            `${fName} ${lName}`.trim() || user.name || "Name not found",
          );
        })
        .catch((e) => setPatientName("Error loading name"));
    }
  }, [user]);

  useEffect(() => {
    if (weightKg && heightCm) {
      const heightM = heightCm / 100;
      const val = (weightKg / (heightM * heightM)).toFixed(2);
      setBmi(val);
    } else {
      setBmi("");
    }
  }, [weightKg, heightCm]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!["image/jpeg", "image/jpg", "application/pdf"].includes(file.type)) {
        setMessage("Error: Only JPG, JPEG, and PDF files are allowed.");
        setSelectedFile(null);
        e.target.value = null;
        return;
      }
      setSelectedFile(file);
      setMessage("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("Uploading...");
    if (!title || !selectedFile || !user?.patientId || !recordDate) {
      setMessage("Error: Please fill all required fields, including the date.");
      return;
    }

    const formData = new FormData();
    formData.append("patientId", user.patientId);
    formData.append("createdBy", user.userId || user.patientId);
    formData.append("recordType", recordType);
    formData.append("title", title);
    formData.append("recordDate", recordDate);
    formData.append("description", description);
    formData.append("file", selectedFile);

    if (recordAddress) formData.append("address", recordAddress);
    if (maritalStatus) formData.append("maritalStatus", maritalStatus);
    if (aadhaarNumber) formData.append("aadhaarNumber", aadhaarNumber);
    if (insuranceDetails) formData.append("insuranceDetails", insuranceDetails);
    if (birthMark) formData.append("birthMark", birthMark);
    if (weightKg) formData.append("weightKg", weightKg);
    if (heightCm) formData.append("heightCm", heightCm);
    if (bmi) formData.append("bmi", bmi);
    if (pulseRate) formData.append("pulseRate", pulseRate);
    if (bodyTemperature) formData.append("bodyTemperature", bodyTemperature);
    if (smokingStatus) formData.append("smokingStatus", smokingStatus);
    if (alcoholConsumption)
      formData.append("alcoholConsumption", alcoholConsumption);
    if (dietPreference) formData.append("dietPreference", dietPreference);
    if (physicalActivityLevel)
      formData.append("physicalActivityLevel", physicalActivityLevel);
    if (sleepHours) formData.append("sleepHours", sleepHours);
    if (stressLevel) formData.append("stressLevel", stressLevel);

    try {
      const res = await authFetch(
        `https://medvault-backend-ni3i.onrender.com/api/records/uploads/${user.patientId}`,
        {
          method: "POST",
          body: formData,
        },
      );
      if (!res.ok) throw new Error("Server rejected the upload");

      setMessage("✅ Record added successfully!");
      setTimeout(() => {
        onRecordAdded();
        onClose();
      }, 1000);
    } catch (err) {
      setMessage("Failed to add record: " + err.message);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content bg-white rounded-xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "90%",
          maxWidth: "900px",
          maxHeight: "85vh",
          overflowY: "auto",
        }}
      >
        <div className="sticky top-0 bg-white z-50 border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-brand-purple flex items-center">
            <i className="fas fa-file-medical-alt mr-2"></i> Add Health Record
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-red-500 text-3xl font-bold"
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* 1. Basic Info */}
          <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
            <h3 className="font-bold text-slate-700 mb-4 text-lg border-b pb-2">
              Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase">
                  Patient Name
                </label>
                <div className="mt-1 p-3 bg-white border rounded-lg text-slate-800 font-medium shadow-sm">
                  {patientName}
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">
                  Marital Status
                </label>
                <select
                  value={maritalStatus}
                  onChange={(e) => setMaritalStatus(e.target.value)}
                  className="w-full p-3 border rounded-lg"
                >
                  <option value="">Select Status...</option>
                  <option value="Single">Single</option>
                  <option value="Married">Married</option>
                  <option value="Divorced">Divorced</option>
                  <option value="Widowed">Widowed</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-slate-700 mb-1">
                  Address
                </label>
                <textarea
                  value={recordAddress}
                  onChange={(e) => setRecordAddress(e.target.value)}
                  className="w-full p-3 border rounded-lg"
                  placeholder="Enter the address for this record..."
                  rows="2"
                ></textarea>
              </div>
            </div>
          </div>

          {/* 2. Identification Details */}
          <div className="bg-orange-50 p-5 rounded-xl border border-orange-200">
            <h3 className="font-bold text-orange-800 mb-4 text-lg border-b border-orange-200 pb-2">
              Identification Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-bold mb-1">
                  Aadhaar Number
                </label>
                <input
                  type="text"
                  value={aadhaarNumber}
                  onChange={(e) => setAadhaarNumber(e.target.value)}
                  className="w-full p-3 border rounded-lg"
                  placeholder="XXXX-XXXX-XXXX"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">
                  Insurance Details
                </label>
                <input
                  type="text"
                  value={insuranceDetails}
                  onChange={(e) => setInsuranceDetails(e.target.value)}
                  className="w-full p-3 border rounded-lg"
                  placeholder="Policy No"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">
                  Birth Mark
                </label>
                <input
                  type="text"
                  value={birthMark}
                  onChange={(e) => setBirthMark(e.target.value)}
                  className="w-full p-3 border rounded-lg"
                  placeholder="Visible mark"
                />
              </div>
            </div>
          </div>

          {/* 3. Current Health (Vitals) */}
          <div className="bg-blue-50 p-5 rounded-xl border border-blue-200">
            <h3 className="font-bold text-blue-800 mb-4 text-lg border-b border-blue-200 pb-2">
              Current Healt
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
              <div>
                <label className="block text-sm font-bold mb-1">
                  Weight (kg)
                </label>
                <input
                  type="number"
                  value={weightKg}
                  onChange={(e) => setWeightKg(e.target.value)}
                  className="w-full p-3 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">
                  Height (cm)
                </label>
                <input
                  type="number"
                  value={heightCm}
                  onChange={(e) => setHeightCm(e.target.value)}
                  className="w-full p-3 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">BMI</label>
                <input
                  type="text"
                  value={bmi}
                  disabled
                  className="w-full p-3 border rounded-lg bg-slate-100"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">
                  Pulse Rate (bpm)
                </label>
                <input
                  type="number"
                  value={pulseRate}
                  onChange={(e) => setPulseRate(e.target.value)}
                  className="w-full p-3 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">
                  Body Temp (°C)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={bodyTemperature}
                  onChange={(e) => setBodyTemperature(e.target.value)}
                  className="w-full p-3 border rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* 4. Lifestyle */}
          <div className="bg-green-50 p-5 rounded-xl border border-green-200">
            <h3 className="font-bold text-green-800 mb-4 text-lg border-b border-green-200 pb-2">
              Lifestyle
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-bold mb-1">Smoking</label>
                <select
                  value={smokingStatus}
                  onChange={(e) => setSmokingStatus(e.target.value)}
                  className="w-full p-3 border rounded-lg"
                >
                  <option value="">Select...</option>
                  <option value="Non-smoker">Non-smoker</option>
                  <option value="Former smoker">Former smoker</option>
                  <option value="Current smoker">Current smoker</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">Alcohol</label>
                <select
                  value={alcoholConsumption}
                  onChange={(e) => setAlcoholConsumption(e.target.value)}
                  className="w-full p-3 border rounded-lg"
                >
                  <option value="">Select...</option>
                  <option value="Never">Never</option>
                  <option value="Occasionally">Occasionally</option>
                  <option value="Regularly">Regularly</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">Diet</label>
                <select
                  value={dietPreference}
                  onChange={(e) => setDietPreference(e.target.value)}
                  className="w-full p-3 border rounded-lg"
                >
                  <option value="">Select...</option>
                  <option value="Vegetarian">Vegetarian</option>
                  <option value="Non-Vegetarian">Non-Vegetarian</option>
                  <option value="Vegan">Vegan</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">Activity</label>
                <select
                  value={physicalActivityLevel}
                  onChange={(e) => setPhysicalActivityLevel(e.target.value)}
                  className="w-full p-3 border rounded-lg"
                >
                  <option value="">Select...</option>
                  <option value="Sedentary">Sedentary</option>
                  <option value="Light">Light</option>
                  <option value="Moderate">Moderate</option>
                  <option value="Active">Active</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">
                  Sleep (hrs/night)
                </label>
                <input
                  type="number"
                  value={sleepHours}
                  onChange={(e) => setSleepHours(e.target.value)}
                  className="w-full p-3 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">
                  Stress Level
                </label>
                <select
                  value={stressLevel}
                  onChange={(e) => setStressLevel(e.target.value)}
                  className="w-full p-3 border rounded-lg"
                >
                  <option value="">Select...</option>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
            </div>
          </div>

          {/* 5. Add Document */}
          <div className="bg-purple-50 p-5 rounded-xl border border-purple-200">
            <h3 className="font-bold text-purple-800 mb-4 text-lg border-b border-purple-200 pb-2">
              Add Document
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold mb-1">
                  Record Type *
                </label>
                <select
                  value={recordType}
                  onChange={(e) => setRecordType(e.target.value)}
                  className="w-full p-3 border rounded-lg"
                >
                  <option value=" ">Select type...</option>
                  <option value="Lab Report">Lab Report</option>
                  <option value="Imaging">Imaging (X-Ray, MRI)</option>
                  <option value="Visit Summary">Vaccination</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">
                  Record Date *
                </label>
                <input
                  type="date"
                  value={recordDate}
                  onChange={(e) => setRecordDate(e.target.value)}
                  className="w-full p-3 border rounded-lg"
                  placeholder="dd-mm-yyyy"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-bold mb-1">
                  Title / Document Name *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-3 border rounded-lg"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-bold mb-1">
                  Description (Optional)
                </label>
                <textarea
                  rows="2"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-3 border rounded-lg"
                ></textarea>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-bold mb-1">
                  Upload File *{" "}
                  <span className="font-normal text-xs text-slate-500">
                    (JPG, PDF)
                  </span>
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".jpg,.jpeg,.pdf"
                  onChange={handleFileChange}
                  className="w-full p-2 bg-white border rounded-lg"
                  required
                />
              </div>
            </div>
          </div>

          {message && (
            <div
              className={`p-4 rounded-lg text-center font-bold ${message.includes("Error") ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}
            >
              {message}
            </div>
          )}

          <div className="flex gap-4 pt-4 border-t sticky bottom-0 bg-white py-4 px-6 -m-6 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-lg border border-slate-300 hover:bg-slate-100 font-bold text-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-[2] bg-brand-purple text-white py-3 rounded-lg font-bold hover:opacity-90 shadow-lg"
            >
              Save Record
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddRecordModal;

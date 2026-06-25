import React, { useEffect, useRef, useState } from "react";
import { authFetch } from "../../services/authFetch.js";

const DoctorAddPrescriptionModal = ({
  doctorUser,
  patient,
  onClose,
  onRecordAdded,
}) => {
  const [medicationName, setMedicationName] = useState("");
  const [dosage, setDosage] = useState("");
  const [frequency, setFrequency] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [prescribedBy, setPrescribedBy] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [message, setMessage] = useState("");
  const prescriptionFileInputRef = useRef(null);

  // Set doctor name when component mounts
  useEffect(() => {
    if (doctorUser?.firstName && doctorUser?.lastName) {
      setPrescribedBy(`Dr. ${doctorUser.firstName} ${doctorUser.lastName}`);
    }
  }, [doctorUser]);

  // Debug logging
  useEffect(() => {
    console.log("DoctorAddPrescriptionModal mounted with:", {
      doctorUser,
      patient,
      prescribedBy,
    });
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validTypes = ["image/jpeg", "image/jpg", "application/pdf"];
      if (!validTypes.includes(file.type)) {
        setMessage("Only JPG, JPEG, and PDF files are allowed.");
        setSelectedFile(null);
        e.target.value = null;
        return;
      }
      setSelectedFile(file);
      setMessage("");
    } else {
      setSelectedFile(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!medicationName) {
      setMessage("Please enter medication name.");
      return;
    }
    if (!dosage) {
      setMessage("Please enter dosage.");
      return;
    }
    if (!frequency) {
      setMessage("Please enter frequency.");
      return;
    }
    if (!startDate || !endDate) {
      setMessage("Please select start and end dates.");
      return;
    }
    if (!prescribedBy) {
      setMessage("Please enter prescriber ID or name.");
      return;
    }
    if (!patient?.patientId) {
      setMessage("Patient ID missing.");
      return;
    }
    if (!selectedFile) {
      setMessage("Please upload a JPG, JPEG, or PDF file.");
      return;
    }

    console.log("Submitting prescription with data:", {
      patientId: patient.patientId,
      medicationName,
      dosage,
      frequency,
      startDate,
      endDate,
      prescribedBy,
      notes,
      file: selectedFile,
    });

    const formData = new FormData();
    formData.append("patientId", patient.patientId);
    formData.append("medicationName", medicationName);
    formData.append("dosage", dosage);
    formData.append("frequency", frequency);
    formData.append("startDate", startDate);
    formData.append("endDate", endDate);
    formData.append("prescribedBy", prescribedBy);
    formData.append("notes", notes);
    if (selectedFile) formData.append("file", selectedFile);

    try {
      // --- THIS IS THE KEY CHANGE ---
      // It now posts to your dedicated medications endpoint
      console.log("Making request to medications endpoint...");
      console.log("Form data contents:");
      for (let pair of formData.entries()) {
        console.log(
          pair[0] + ": " + (pair[0] === "file" ? "File object" : pair[1]),
        );
      }

      const res = await authFetch(
        `https://medvault-backend-ni3i.onrender.com/api/medications/uploads`,
        {
          method: "POST",
          body: formData,
          credentials: "include",
          // Don't set any headers for multipart/form-data - browser will handle it
        },
      );

      console.log("Response status:", res.status);
      const responseText = await res.text();
      console.log("Response text:", responseText);

      if (!res.ok) {
        throw new Error(responseText || "Failed to add prescription");
      }

      let jsonData;
      try {
        jsonData = JSON.parse(responseText);
        console.log("Parsed response:", jsonData);
      } catch (e) {
        console.warn("Could not parse response as JSON:", e);
      }

      // Reset form and file input
      setMedicationName("");
      setDosage("");
      setFrequency("");
      setStartDate("");
      setEndDate("");
      setNotes("");
      setSelectedFile(null);
      if (prescriptionFileInputRef.current)
        prescriptionFileInputRef.current.value = "";

      onRecordAdded();
      onClose();
      setMessage("Prescription uploaded successfully!");
      setTimeout(() => setMessage(""), 5000);
      return jsonData;
    } catch (err) {
      console.error("Prescription POST failed:", err);
      setMessage("Error adding prescription: " + err.message);
      // Clear error message after 10 seconds
      setTimeout(() => setMessage(""), 5000);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">
            Add Prescription for {patient.firstName}
          </h2>
          <button onClick={onClose} className="text-2xl">
            &times;
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="mb-4">
              <label className="block mb-2 font-medium text-slate-700">
                Medication Name
              </label>
              <input
                type="text"
                value={medicationName}
                onChange={(e) => setMedicationName(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-purple"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block mb-2 font-medium text-slate-700">
                Dosage
              </label>
              <input
                type="text"
                value={dosage}
                onChange={(e) => setDosage(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-purple"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block mb-2 font-medium text-slate-700">
                Frequency
              </label>
              <input
                type="text"
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-purple"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block mb-2 font-medium text-slate-700">
                Prescribed By
              </label>
              <input
                type="text"
                value={prescribedBy}
                onChange={(e) => setPrescribedBy(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-purple"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block mb-2 font-medium text-slate-700">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-purple"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block mb-2 font-medium text-slate-700">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-purple"
                required
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="block mb-2 font-medium text-slate-700">
              Upload File (JPG, JPEG, or PDF)
            </label>
            <input
              ref={prescriptionFileInputRef}
              type="file"
              accept=".jpg,.jpeg,.pdf"
              onChange={handleFileChange}
              className="w-full text-slate-700 text-sm 
                               file:mr-4 file:py-2 file:px-4
                               file:rounded-full file:border-0
                               file:text-sm file:font-semibold
                               file:bg-brand-lavender/50 file:text-brand-purple
                               hover:file:bg-brand-lavender/70
                               border border-gray-300 rounded-lg p-3"
              required
            />
            {selectedFile && (
              <p className="text-sm text-green-600 mt-2 flex items-center">
                <i className="fas fa-check-circle mr-1"></i> File selected:{" "}
                {selectedFile.name}
              </p>
            )}
          </div>

          <div className="mb-4">
            <label className="block mb-2 font-medium text-slate-700">
              Notes (Optional)
            </label>
            <textarea
              rows="4"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-purple"
            />
          </div>

          {message && (
            <p
              className={`mb-4 text-center font-medium ${message.includes("Error") ? "text-red-600" : "text-green-600"}`}
            >
              {message}
            </p>
          )}
          <button
            type="submit"
            className="w-full bg-brand-purple text-white py-3 rounded-lg font-semibold hover:bg-purple-700"
          >
            Add Prescription
          </button>
        </form>
      </div>
    </div>
  );
};

export default DoctorAddPrescriptionModal;

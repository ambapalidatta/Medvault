import { useEffect, useState } from "react";
import { authFetch } from "../../services/authFetch.js";

const AddConditionModal = ({ user, onClose, onConditionAdded }) => {
  const [conditionName, setConditionName] = useState("");
  const [diagnosedDate, setDiagnosedDate] = useState("");
  const [status, setStatus] = useState("");
  const [notes, setNotes] = useState("");
  const [message, setMessage] = useState("");
  useEffect(() => {
    console.log("User object in AddConditionModal:", user);
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. Mandatory Frontend Validation
    if (!conditionName) {
      setMessage("Please enter a condition name.");
      return;
    }
    if (!user.patientId) {
      setMessage("Cannot add condition: Patient ID is missing.");
      return;
    }

    // 2. Build Payload with Robust Null Checks
    const conditionData = {
      conditionId: null,
      patientId: user.patientId,
      conditionName,
      diagnosedDate: diagnosedDate ? diagnosedDate : null,
      status: status ? status : "Unknown",
      notes: notes ? notes : null,
    };
    try {
      const response = await authFetch(
        `https://medvault-backend-ni3i.onrender.com/api/medical-conditions`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(conditionData),
        },
      );

      // If the server returns a 400, try to get the error message
      if (!response.ok) {
        const errorText = await response.text();
        // Throw the error with any text received from the server (e.g., Spring validation errors)
        throw new Error(
          errorText || "Failed to add condition due to Bad Request (400)",
        );
      }

      onConditionAdded();
      onClose();
    } catch (error) {
      setMessage(
        `Error adding condition. Details: ${error.message}. Please check server log.`,
      );
      console.error("Condition POST failed:", error);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-800">
            Add Medical Condition
          </h2>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-800 text-2xl"
          >
            &times;
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label
              htmlFor="conditionName"
              className="block text-lg font-medium text-slate-700 mb-2"
            >
              Condition Name
            </label>
            <input
              id="conditionName"
              type="text"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-purple"
              placeholder="e.g., Asthma, Hypertension"
              value={conditionName}
              onChange={(e) => setConditionName(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="mb-6">
              <label
                htmlFor="diagnosedDate"
                className="block text-lg font-medium text-slate-700 mb-2"
              >
                Diagnosed Date
              </label>
              <input
                id="diagnosedDate"
                type="date"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-purple"
                value={diagnosedDate}
                onChange={(e) => setDiagnosedDate(e.target.value)}
              />
            </div>

            <div className="mb-6">
              <label
                htmlFor="status"
                className="block text-lg font-medium text-slate-700 mb-2"
              >
                Status
              </label>
              <select
                id="status"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-purple"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="">Select Status</option>
                <option value="Chronic">Chronic</option>
                <option value="Resolved">Resolved</option>
                <option value="Acute">Acute</option>
                <option value="Managing">Managing</option>
              </select>
            </div>
          </div>

          <div className="mb-6">
            <label
              htmlFor="notes"
              className="block text-lg font-medium text-slate-700 mb-2"
            >
              Notes (Optional)
            </label>
            <textarea
              id="notes"
              rows="3"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-purple"
              placeholder="e.g., Diagnosed in 2010, managed with daily medication."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            ></textarea>
          </div>
          {message && (
            <p className="text-red-600 text-center mb-4">{message}</p>
          )}
          <button
            type="submit"
            className="w-full bg-brand-purple text-white font-semibold py-3 rounded-lg hover:bg-purple-700"
          >
            Add Condition
          </button>
        </form>
      </div>
    </div>
  );
};




export default AddConditionModal;

import SearchableDoctorDropdown from "../../SearchableDoctorDropdown.jsx";

export default function EmergencyRequestSection({
  doctors,
  emergencyData,
  setEmergencyData,
  selectedDoctorFee,
  successMessage,
  errorMessage,
  onDoctorSelect,
  onSubmit,
}) {
  return (
    <section className="bg-red-50 rounded-2xl shadow-lg p-8 border-2 border-red-100 animate-fade-in">
      <h3 className="text-2xl font-bold text-red-700 mb-6 flex items-center">
        <i className="fas fa-ambulance mr-2"></i> Emergency Request
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SearchableDoctorDropdown
          doctors={doctors}
          selectedDoctorId={emergencyData.doctorId}
          onSelectDoctor={onDoctorSelect}
        />
        <select
          value={emergencyData.urgencyLevel}
          onChange={(e) =>
            setEmergencyData({ ...emergencyData, urgencyLevel: e.target.value })
          }
          className="p-3 border border-red-200 rounded-lg font-medium text-slate-700"
        >
          <option value="">Select Urgency Level</option>
          <option value="HIGH">⚡ HIGH - Immediate attention needed</option>
          <option value="MEDIUM">⚠️ MEDIUM - Urgent but not critical</option>
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

      {selectedDoctorFee !== null && selectedDoctorFee > 0 && (
        <div className="mt-4 p-3 bg-red-100 text-red-800 font-bold text-center rounded-lg border border-red-200">
          Emergency Fee: ₹{selectedDoctorFee}
        </div>
      )}
      <button
        onClick={onSubmit}
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
  );
}

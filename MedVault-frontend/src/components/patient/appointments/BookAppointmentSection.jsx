import SearchableDoctorDropdown from "../../SearchableDoctorDropdown.jsx";

export default function BookAppointmentSection({
  doctors,
  doctorsLoading,
  errorMessage,
  selectedDoctorId,
  selectedDate,
  selectedTime,
  availableSlots,
  allSlotsBookedForDate,
  doctorHasNoSlots,
  allTimeSlots,
  loadingSlots,
  reason,
  selectedDoctorFee,
  successMessage,
  onDoctorSelect,
  onDateChange,
  onTimeChange,
  onReasonChange,
  onSubmit,
}) {
  const canSubmit = selectedDoctorId && selectedDate && selectedTime;
  const slotOptions = allSlotsBookedForDate
    ? []
    : availableSlots.length > 0
      ? availableSlots
      : doctorHasNoSlots
        ? allTimeSlots
        : [];

  return (
    <section className="bg-white rounded-2xl shadow-lg p-8 mb-32 animate-fade-in">
      <h3 className="text-2xl font-bold text-slate-800 mb-6">
        Book an Appointment
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <SearchableDoctorDropdown
          doctors={doctors}
          selectedDoctorId={selectedDoctorId}
          onSelectDoctor={onDoctorSelect}
          loading={doctorsLoading}
          error={errorMessage}
        />
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => onDateChange(e.target.value)}
          min={new Date().toISOString().split("T")[0]}
          className="p-3 border rounded-lg focus:ring-2 focus:ring-brand-purple"
        />
        <select
          value={selectedTime}
          onChange={(e) => onTimeChange(e.target.value)}
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
          {slotOptions.map((slot, index) => (
            <option key={index} value={slot.value || slot.slotTime}>
              {slot.label || slot.slotTime}
            </option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Reason for visit"
          value={reason}
          onChange={(e) => onReasonChange(e.target.value)}
          className="p-3 border rounded-lg focus:ring-2 focus:ring-brand-purple"
        />
      </div>

      {allSlotsBookedForDate && selectedDoctorId && selectedDate && (
        <div className="mt-4 p-4 bg-red-50 text-red-700 font-semibold text-center rounded-lg border border-red-200">
          <i className="fas fa-calendar-times mr-2"></i>
          All slots are booked for this date. Please select a different date.
        </div>
      )}

      {doctorHasNoSlots &&
        selectedDoctorId &&
        selectedDate &&
        !loadingSlots && (
          <div className="mt-4 p-4 bg-amber-50 text-amber-700 font-semibold text-center rounded-lg border border-amber-200">
            <i className="fas fa-info-circle mr-2"></i>
            No pre-defined slots for this date. You can select any available
            time.
          </div>
        )}

      {selectedDoctorFee !== null && selectedDoctorFee > 0 && (
        <div className="mt-6 p-4 bg-purple-50 text-brand-purple font-bold text-center rounded-lg border border-purple-200">
          Consultation Fee: ₹{selectedDoctorFee}
        </div>
      )}

      <button
        onClick={onSubmit}
        disabled={!canSubmit}
        className={`mt-6 w-full bg-gradient-to-r from-purple-600 to-brand-purple text-white py-4 rounded-xl font-bold hover:shadow-lg transition-all ${
          !canSubmit ? "opacity-50 cursor-not-allowed" : "hover:shadow-2xl"
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
  );
}

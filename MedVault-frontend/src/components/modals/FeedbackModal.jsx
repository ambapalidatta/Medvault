import React, { useState } from "react";
import { authFetch } from "../../services/authFetch.js";

const FeedbackModal = ({
  appointment,
  user,
  doctors,
  onClose,
  onFeedbackSubmitted,
}) => {
  const [rating, setRating] = useState(0);
  const [feedbackText, setFeedbackText] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1. Determine Record Type & ID
  // If it has a requestId, it's an Emergency. Otherwise, it's an Appointment.
  const isEmergency = appointment.requestId !== undefined;
  const recordId = isEmergency
    ? appointment.requestId
    : appointment.appointmentId;

  // 2. Safely Get Doctor ID
  // Emergency requests usually have 'doctorId' directly. Appointments might have it nested.
  const getDoctorId = () => {
    if (appointment.doctorId) return appointment.doctorId;
    if (appointment.doctor)
      return (
        appointment.doctor.id ||
        appointment.doctor.doctorId ||
        appointment.doctor.professionalId
      );
    return null;
  };
  const doctorId = getDoctorId();

  // 3. Safely Get Doctor Name (for display)
  // We try to find the doctor object in the full 'doctors' list first for accuracy
  const docObj = doctors
    ? doctors.find((d) => (d.id || d.doctorId || d.professionalId) === doctorId)
    : null;
  const doctorName = docObj
    ? `Dr. ${docObj.firstName} ${docObj.lastName}`
    : appointment.doctor
      ? `Dr. ${appointment.doctor.firstName} ${appointment.doctor.lastName}`
      : "Dr. N/A";

  // 4. Safely Get Date
  const dateRaw = isEmergency
    ? appointment.requestDateTime
    : appointment.appointmentDateTime;
  const dateStr = dateRaw ? new Date(dateRaw).toLocaleDateString() : "N/A";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      setMessage("Please select a star rating.");
      return;
    }
    if (!doctorId) {
      setMessage("Error: Could not identify the doctor.");
      return;
    }

    setIsSubmitting(true);

    // 5. Construct Payload (FIXED KEYS)
    const reviewData = {
      patientId: user.patientId,
      doctorId: doctorId,
      // Send ID to the correct field, set the other to null
      appointmentId: !isEmergency ? recordId : null,
      requestId: isEmergency ? recordId : null,
      rating: rating,
      feedbackText: feedbackText, // <--- FIXED: Changed from 'feedback' to 'feedbackText'
      reviewDate: new Date().toISOString(),
    };

    try {
      console.log("Submitting Review Payload:", reviewData);

      const response = await authFetch(
        `https://medvault-backend-ni3i.onrender.com/api/reviews`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(reviewData),
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Submission failed");
      }

      // Success
      onFeedbackSubmitted();
      onClose();
    } catch (error) {
      console.error("Feedback Error:", error);
      setMessage("Error submitting feedback. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-2xl font-bold text-slate-800">Leave Feedback</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-2xl leading-none"
          >
            &times;
          </button>
        </div>

        <div className="mb-6 text-center bg-slate-50 p-4 rounded-xl border border-slate-100">
          <p className="text-slate-500 text-sm mb-1">
            {isEmergency ? "Emergency Request" : "Appointment"} with
          </p>
          <h3 className="text-lg font-bold text-brand-purple">{doctorName}</h3>
          <p className="text-xs text-slate-400 mt-1">{dateStr}</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-6 text-center">
            <label className="block text-base font-semibold text-slate-700 mb-3">
              Your Rating
            </label>
            <div className="flex justify-center gap-2 flex-row-reverse">
              {[5, 4, 3, 2, 1].map((star) => (
                <React.Fragment key={star}>
                  <input
                    type="radio"
                    id={`star${star}`}
                    name="rating"
                    value={star}
                    className="hidden"
                    onChange={() => setRating(star)}
                  />
                  <label
                    htmlFor={`star${star}`}
                    className={`text-4xl cursor-pointer transition-colors ${rating >= star ? "text-amber-400" : "text-gray-300"} hover:text-amber-400`}
                  >
                    ★
                  </label>
                </React.Fragment>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Your Comments
            </label>
            <textarea
              rows="4"
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-purple resize-none text-slate-700"
              placeholder="How was your experience?"
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              required
            ></textarea>
          </div>

          {message && (
            <p className="text-red-600 text-center mb-4 text-sm font-bold bg-red-50 p-2 rounded">
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full bg-brand-purple text-white font-bold py-3 rounded-xl hover:bg-purple-700 transition-all shadow-md ${isSubmitting ? "opacity-70 cursor-not-allowed" : ""}`}
          >
            {isSubmitting ? "Submitting..." : "Submit Feedback"}
          </button>
        </form>
      </div>
    </div>
  );
};



export default FeedbackModal;

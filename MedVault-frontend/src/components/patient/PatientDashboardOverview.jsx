export default function PatientDashboardOverview({
  pendingConsentRequests,
  onConsentResponse,
  nextAppointments,
  completed,
  activePrescriptions,
  medicalConditions,
  doctors,
}) {
  const getEmergencyDoctor = (doctorId) =>
    doctors.find((doctor) => (doctor.professionalId || doctor.id) === doctorId);

  return (
    <div className="animate-fade-in">
      {pendingConsentRequests.length > 0 && (
        <div className="mb-8 rounded-r-xl border-l-4 border-yellow-400 bg-yellow-50 p-6 shadow-sm">
          <h4 className="mb-4 flex items-center text-lg font-bold text-yellow-800">
            <i className="fas fa-key mr-2"></i> Pending Access Requests
          </h4>

          <div className="space-y-3">
            {pendingConsentRequests.map((request) => (
              <div
                key={request.id}
                className="flex items-center justify-between rounded-lg bg-white p-4 shadow"
              >
                <div>
                  <p className="font-bold text-slate-800">
                    Dr. {request.doctorName}
                  </p>
                  <p className="text-sm text-slate-600">
                    Requests access to your records.
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => onConsentResponse(request.id, "APPROVED")}
                    className="rounded bg-green-600 px-4 py-2 text-sm font-bold text-white hover:bg-green-700"
                  >
                    Approve
                  </button>

                  <button
                    onClick={() => onConsentResponse(request.id, "REJECTED")}
                    className="rounded bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-700"
                  >
                    Deny
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon="fa-calendar-check"
          value={nextAppointments.length}
          label="Upcoming Appointments"
          borderClass="border-purple-500"
          iconClass="bg-purple-100 text-purple-600"
        />

        <StatCard
          icon="fa-clipboard-check"
          value={completed.length}
          label="Completed Appointments"
          borderClass="border-green-500"
          iconClass="bg-green-100 text-green-600"
        />

        <StatCard
          icon="fa-prescription-bottle-alt"
          value={activePrescriptions.length}
          label="Active Prescriptions"
          borderClass="border-blue-500"
          iconClass="bg-blue-100 text-blue-600"
        />

        <StatCard
          icon="fa-notes-medical"
          value={medicalConditions.length}
          label="Medical Conditions"
          borderClass="border-teal-500"
          iconClass="bg-teal-100 text-teal-600"
        />
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-lg">
        <h4 className="mb-4 flex items-center text-xl font-bold text-slate-800">
          <i className="fas fa-calendar-alt mr-2 text-purple-600"></i>
          Next Appointments ({nextAppointments.length})
        </h4>

        {nextAppointments.length === 0 ? (
          <p className="py-8 text-center text-slate-500">
            No upcoming appointments.
          </p>
        ) : (
          <div className="max-h-96 space-y-3 overflow-y-auto">
            {nextAppointments.map((appointment) => {
              const isEmergency = appointment.requestDateTime !== undefined;
              const dateTime = isEmergency
                ? appointment.requestDateTime
                : appointment.appointmentDateTime;

              const emergencyDoctor = isEmergency
                ? getEmergencyDoctor(appointment.doctorId)
                : null;

              const doctorName = isEmergency
                ? emergencyDoctor
                  ? `Dr. ${emergencyDoctor.firstName} ${emergencyDoctor.lastName}`
                  : "Dr. N/A"
                : `Dr. ${appointment.doctor?.firstName} ${appointment.doctor?.lastName}`;

              const reason = isEmergency
                ? appointment.conditionDescription
                : appointment.reason;

              const doctorInitial = isEmergency
                ? emergencyDoctor?.firstName?.charAt(0) || "D"
                : appointment.doctor?.firstName?.charAt(0) || "D";

              return (
                <div
                  key={appointment.appointmentId || appointment.requestId}
                  className={`flex items-center justify-between rounded-xl border p-4 ${
                    isEmergency
                      ? "animate-pulse-slow border-red-300 bg-red-50 shadow-lg"
                      : "border-green-100 bg-green-50"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-full text-xl font-bold text-white ${
                        isEmergency ? "bg-red-600" : "bg-brand-purple"
                      }`}
                    >
                      {isEmergency ? "🚨" : doctorInitial}
                    </div>

                    <div>
                      <p className="flex items-center gap-2 text-lg font-bold text-slate-800">
                        {doctorName}
                        {isEmergency && (
                          <span className="rounded-full bg-red-600 px-2 py-1 text-xs font-bold text-white">
                            EMERGENCY
                          </span>
                        )}
                      </p>

                      <div className="flex items-center gap-3">
                        <p className="text-sm font-medium text-slate-600">
                          {new Date(dateTime).toLocaleString()}
                        </p>

                        {reason && (
                          <span className="border-l border-slate-300 pl-3 text-sm text-slate-500">
                            {reason}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${
                      isEmergency
                        ? "bg-red-200 text-red-800"
                        : "bg-green-200 text-green-800"
                    }`}
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
  );
}

function StatCard({ icon, value, label, borderClass, iconClass }) {
  return (
    <div
      className={`flex items-center gap-4 rounded-2xl border-l-4 bg-white p-6 shadow-md transition-all hover:shadow-lg ${borderClass}`}
    >
      <div
        className={`flex h-14 w-14 items-center justify-center rounded-full ${iconClass}`}
      >
        <i className={`fas ${icon} text-2xl`}></i>
      </div>

      <div>
        <p className="text-3xl font-bold text-slate-800">{value}</p>
        <p className="text-xs font-bold uppercase text-slate-500">{label}</p>
      </div>
    </div>
  );
}

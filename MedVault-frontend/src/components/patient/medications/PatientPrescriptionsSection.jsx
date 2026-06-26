import EmptyState from "../../common/EmptyState.jsx";

function PrescriptionCard({ prescription, active, onView }) {
  const startDate = prescription.startDate || prescription.start_date;
  const endDate = prescription.endDate || prescription.end_date;
  const dateStr = startDate ? new Date(startDate).toLocaleDateString() : "N/A";
  const medicineName =
    prescription.medication_name || prescription.medicationName || "Medicine";

  return (
    <div
      className={`${
        active
          ? "bg-green-50 border-green-200"
          : "bg-slate-50 border-slate-200 opacity-80 hover:opacity-100"
      } rounded-xl p-6 shadow-sm border hover:shadow-md transition-all`}
    >
      <h4
        className={`text-xl font-bold mb-3 capitalize ${active ? "text-green-700" : "text-slate-600"}`}
      >
        {medicineName}
      </h4>
      <div
        className={`space-y-2 text-sm mb-4 ${active ? "text-slate-700" : "text-slate-600"}`}
      >
        <p>
          <span className="font-bold text-slate-500">Dosage:</span>{" "}
          {prescription.dosage}
        </p>
        <p>
          <span className="font-bold text-slate-500">Frequency:</span>{" "}
          {prescription.frequency}
        </p>
        <p>
          <span className="font-bold text-slate-500">
            {active ? "Ends On:" : "Ended On:"}
          </span>{" "}
          {endDate ? new Date(endDate).toLocaleDateString() : "N/A"}
        </p>
        <p
          className={`text-slate-400 text-xs mt-2 pt-2 border-t ${active ? "border-green-200" : "border-slate-200"}`}
        >
          Started: {dateStr}
        </p>
      </div>
      <div className="flex gap-3">
        <button
          onClick={() => onView({ ...prescription, title: medicineName })}
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
}

export default function PatientPrescriptionsSection({
  activePrescriptions,
  pastPrescriptions,
  onViewPrescription,
}) {
  return (
    <section className="animate-fade-in space-y-8">
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <h3 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
          <i className="fas fa-prescription-bottle-alt text-green-600"></i>{" "}
          Active Prescriptions ({activePrescriptions.length})
        </h3>
        {activePrescriptions.length === 0 ? (
          <EmptyState
            icon="fas fa-prescription-bottle-alt"
            title="No active prescriptions found"
            description="Active prescriptions from your doctors will appear here."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activePrescriptions.map((prescription) => (
              <PrescriptionCard
                key={prescription.medication_id || prescription.medicationId}
                prescription={prescription}
                active
                onView={onViewPrescription}
              />
            ))}
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-8">
        <h3 className="text-2xl font-bold text-slate-500 mb-6 flex items-center gap-2">
          <i className="fas fa-history text-slate-500"></i> Past Prescriptions (
          {pastPrescriptions.length})
        </h3>
        {pastPrescriptions.length === 0 ? (
          <p className="text-slate-500 text-center py-4">
            No past prescriptions found.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pastPrescriptions.map((prescription) => (
              <PrescriptionCard
                key={prescription.medication_id || prescription.medicationId}
                prescription={prescription}
                active={false}
                onView={onViewPrescription}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

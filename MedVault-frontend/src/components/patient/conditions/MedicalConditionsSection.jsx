export default function MedicalConditionsSection({
  medicalConditions,
  onAddCondition,
}) {
  return (
    <section className="bg-white rounded-2xl shadow-lg p-8 animate-fade-in">
      <div className="flex justify-between mb-6">
        <h3 className="text-2xl font-bold text-slate-800">
          Medical Conditions
        </h3>
        <button
          onClick={onAddCondition}
          className="text-brand-purple font-bold bg-purple-50 px-4 py-2 rounded-lg"
        >
          + Add
        </button>
      </div>
      {medicalConditions.map((condition) => (
        <div
          key={condition.conditionId}
          className="p-4 border border-yellow-200 rounded-lg mb-3 bg-yellow-50"
        >
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="font-bold text-lg text-slate-800">
                {condition.conditionName}
              </p>
              <p className="text-sm text-slate-500">
                Diagnosed:{" "}
                {condition.diagnosedDate
                  ? new Date(condition.diagnosedDate).toLocaleDateString()
                  : "N/A"}
              </p>
            </div>
            <span className="bg-teal-100 text-teal-800 px-3 py-1 rounded-full text-xs font-bold">
              {condition.status}
            </span>
          </div>
          {condition.notes && (
            <div className="text-base text-slate-700 mt-2 p-3 bg-white border border-yellow-100 rounded-lg italic">
              Note: {condition.notes}
            </div>
          )}
        </div>
      ))}
    </section>
  );
}

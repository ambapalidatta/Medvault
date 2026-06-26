export default function PatientRecordsSection({
  medicalRecords,
  accessRequests,
  onUploadClick,
  onViewRecord,
  onConsentResponse,
}) {
  const pendingAccessRequests = accessRequests.filter(
    (request) => request.status === "PENDING",
  );

  return (
    <section className="bg-white rounded-2xl shadow-lg p-8 animate-fade-in">
      <div className="flex justify-between mb-6">
        <h3 className="text-2xl font-bold text-slate-800">Health Records</h3>
        <button
          onClick={onUploadClick}
          className="bg-brand-purple text-white px-4 py-2 rounded-lg font-bold"
        >
          + Upload
        </button>
      </div>

      {pendingAccessRequests.length > 0 && (
        <div className="mb-8 bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-r-xl shadow-sm">
          <h4 className="text-lg font-bold text-yellow-800 mb-4 flex items-center">
            <i className="fas fa-key mr-2"></i> Pending Access Requests
          </h4>
          <div className="space-y-3">
            {pendingAccessRequests.map((request) => (
              <div
                key={request.requestId}
                className="bg-white p-4 rounded-lg shadow flex justify-between items-center"
              >
                <div>
                  <p className="font-bold text-slate-800">
                    Dr. {request.doctorName}
                  </p>
                  <p className="text-sm text-slate-600">
                    Requests access for appointment on:{" "}
                    {new Date(request.appointmentDate).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      onConsentResponse(
                        request.requestId,
                        "APPROVED",
                        request.doctorName,
                      )
                    }
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm font-bold"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() =>
                      onConsentResponse(
                        request.requestId,
                        "REJECTED",
                        request.doctorName,
                      )
                    }
                    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 text-sm font-bold"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {medicalRecords.map((record) => (
          <div
            key={record.recordId}
            className="p-6 border border-blue-200 rounded-xl hover:shadow-lg transition-all bg-blue-50 flex flex-col"
          >
            <div className="mb-2">
              <p className="font-bold text-xl text-slate-800 break-words">
                Patient Information for '{record.title}'
              </p>
              <p className="text-xs text-slate-500 font-bold uppercase mt-1 tracking-wider">
                {record.recordType || "General Record"}
              </p>
            </div>
            <p className="text-sm text-slate-500 mb-4 border-b border-blue-200 pb-2">
              {new Date(record.recordDate).toLocaleDateString()}
            </p>
            <button
              onClick={() => onViewRecord(record)}
              className="mt-auto w-full py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 shadow-md transition-colors"
            >
              <i className="fas fa-eye"></i> View
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

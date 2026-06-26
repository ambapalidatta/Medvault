export default function PatientIssuesSection({ userIssues }) {
  return (
    <section className="animate-fade-in space-y-6">
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <i className="fas fa-flag text-orange-500"></i> My Reports & Issues
          </h3>
          <button
            onClick={() => {
              window.location.hash = "#support";
            }}
            className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-lg font-bold hover:shadow-lg transition-all"
          >
            <i className="fas fa-plus mr-2"></i> Report New Issue
          </button>
        </div>

        {userIssues.length === 0 ? (
          <div className="text-center py-12">
            <i className="fas fa-check-circle text-6xl text-green-300 mb-4"></i>
            <p className="text-slate-500 text-lg">No issues reported yet.</p>
            <p className="text-slate-400 text-sm mt-2">
              If you face any problems, click "Report New Issue" above.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {userIssues.map((issue) => {
              const statusLower = (issue.status || "pending").toLowerCase();
              const isResolved = statusLower === "resolved";
              const isInProgress =
                statusLower === "in-progress" || statusLower === "in_progress";
              return (
                <div
                  key={issue.id}
                  className={`p-5 rounded-xl border-2 ${
                    isResolved
                      ? "bg-green-50 border-green-200"
                      : isInProgress
                        ? "bg-blue-50 border-blue-200"
                        : "bg-orange-50 border-orange-200"
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-bold text-lg text-slate-800">
                        {issue.subject || "Issue Report"}
                      </h4>
                      <p className="text-sm text-slate-500">
                        Submitted:{" "}
                        {issue.createdAt
                          ? new Date(issue.createdAt).toLocaleDateString()
                          : "N/A"}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                        isResolved
                          ? "bg-green-500 text-white"
                          : isInProgress
                            ? "bg-blue-500 text-white"
                            : "bg-orange-500 text-white"
                      }`}
                    >
                      {issue.status || "PENDING"}
                    </span>
                  </div>
                  <p className="text-slate-700 mb-3">{issue.message}</p>
                  {issue.adminMessage && (
                    <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm font-bold text-blue-700 mb-1">
                        <i className="fas fa-reply mr-1"></i> Admin Response:
                      </p>
                      <p className="text-slate-700">{issue.adminMessage}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

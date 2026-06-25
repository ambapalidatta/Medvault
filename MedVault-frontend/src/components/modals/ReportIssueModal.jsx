import authFetch from "../../services/authFetch.js";

export default function ReportIssueModal({
  user,
  issueForm,
  setIssueForm,
  onClose,
  fetchUserIssues,
  setSuccessMessage,
  setErrorMessage,
}) {
  const handleSubmitIssue = () => {
    const payload = {
      name: issueForm.name || `${user?.firstName || ""} ${user?.lastName || ""}`.trim(),
      email: issueForm.email || user?.email,
      phoneNumber: issueForm.phoneNumber,
      subject: issueForm.subject,
      message: issueForm.message,
      userType: "PATIENT",
      userId: user?.userId,
    };

    authFetch("/issues", {
      method: "POST",
      body: JSON.stringify(payload),
    })
      .then((response) => {
        if (response.ok) {
          onClose();
          setIssueForm({
            name: "",
            email: "",
            phoneNumber: "",
            subject: "",
            message: "",
          });
          fetchUserIssues();
          setSuccessMessage("Issue reported successfully!");
          setTimeout(() => setSuccessMessage(""), 3000);
        } else {
          setErrorMessage("Failed to submit issue");
          setTimeout(() => setErrorMessage(""), 3000);
        }
      })
      .catch((error) => {
        setErrorMessage("Error: " + error.message);
        setTimeout(() => setErrorMessage(""), 3000);
      });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-8 shadow-2xl animate-fade-in">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-2xl font-bold text-slate-800">
            <i className="fas fa-flag mr-2 text-orange-500"></i>
            Report an Issue
          </h3>
          <button
            onClick={onClose}
            className="text-2xl text-slate-400 hover:text-slate-600"
            type="button"
          >
            &times;
          </button>
        </div>

        <div className="space-y-4">
          <input
            type="text"
            placeholder="Your Name"
            value={
              issueForm.name ||
              `${user?.firstName || ""} ${user?.lastName || ""}`.trim()
            }
            onChange={(event) =>
              setIssueForm({ ...issueForm, name: event.target.value })
            }
            className="w-full rounded-lg border border-slate-200 p-3 focus:border-teal-600 focus:outline-none"
          />

          <input
            type="email"
            placeholder="Your Email"
            value={issueForm.email || user?.email || ""}
            onChange={(event) =>
              setIssueForm({ ...issueForm, email: event.target.value })
            }
            className="w-full rounded-lg border border-slate-200 p-3 focus:border-teal-600 focus:outline-none"
          />

          <input
            type="tel"
            placeholder="Phone Number (optional)"
            value={issueForm.phoneNumber}
            onChange={(event) =>
              setIssueForm({ ...issueForm, phoneNumber: event.target.value })
            }
            className="w-full rounded-lg border border-slate-200 p-3 focus:border-teal-600 focus:outline-none"
          />

          <input
            type="text"
            placeholder="Subject"
            value={issueForm.subject}
            onChange={(event) =>
              setIssueForm({ ...issueForm, subject: event.target.value })
            }
            className="w-full rounded-lg border border-slate-200 p-3 focus:border-teal-600 focus:outline-none"
          />

          <textarea
            placeholder="Describe your issue in detail..."
            value={issueForm.message}
            onChange={(event) =>
              setIssueForm({ ...issueForm, message: event.target.value })
            }
            className="h-32 w-full resize-none rounded-lg border border-slate-200 p-3 focus:border-teal-600 focus:outline-none"
          ></textarea>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg border border-slate-300 py-3 font-bold text-slate-600 hover:bg-slate-50"
            type="button"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmitIssue}
            className="flex-1 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 py-3 font-bold text-white hover:shadow-lg"
            type="button"
          >
            Submit Issue
          </button>
        </div>
      </div>
    </div>
  );
}

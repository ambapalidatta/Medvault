import { useState } from "react";
import API_BASE_URL from "../services/api.js";

export default function SupportPage({ onBack }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [submitStatus, setSubmitStatus] = useState({ message: "", type: "" });
  const faqs = [
    {
      q: "How do I book an appointment?",
      a: "Sign in as a patient, navigate to Book Appointment, select a doctor, date, and time, then confirm.",
    },
    {
      q: "Can I cancel my appointment?",
      a: "YES, go to your appointments section and click cancel on the appointment you wish to cancel.",
    },
    {
      q: "How do I upload medical records?",
      a: "In your dashboard, go to Health Records section and click Add Record to upload documents.",
    },
    {
      q: "Is my data secure?",
      a: "YES, we use industry-standard encryption to protect all your medical data.",
    },
  ];

  const handleSubmitIssue = async (e) => {
    e.preventDefault();
    setSubmitStatus({ message: "Submitting...", type: "info" });
    try {
      const response = await fetch(
        `${API_BASE_URL}/issues`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            phoneNumber: formData.phone,
            subject: formData.subject || "Support Request",
            message: formData.message,
            userType: "GUEST",
          }),
        },
      );
      if (response.ok) {
        setSubmitStatus({
          message:
            "✅ Issue submitted successfully! We will get back to you soon.",
          type: "success",
        });
        setFormData({
          name: "",
          email: "",
          phone: "",
          subject: "",
          message: "",
        });
      } else {
        setSubmitStatus({
          message: "❌ Failed to submit issue. Please try again.",
          type: "error",
        });
      }
    } catch (error) {
      setSubmitStatus({ message: "❌ Error: " + error.message, type: "error" });
    }
    setTimeout(() => setSubmitStatus({ message: "", type: "" }), 5000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto p-4 flex items-center gap-4">
          <button
            onClick={onBack}
            className="text-slate-600 hover:text-purple-600"
          >
            <i className="fas fa-arrow-left text-xl"></i>
          </button>
          <h1 className="text-2xl font-extrabold text-brand-purple flex items-center">
            <i className="fas fa-shield-heart text-3xl mr-2"></i>MedVault
            Support
          </h1>
        </div>
      </header>

      <main className="container mx-auto p-8">
        <h2 className="text-4xl font-bold text-slate-800 mb-8 text-center">
          How can we help you?
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <div className="bg-white/70 backdrop-blur-md p-8 rounded-2xl shadow-lg border border-white/50">
            <h3 className="text-2xl font-bold text-slate-800 mb-6">
              Submit an Issue
            </h3>
            {submitStatus.message && (
              <div
                className={`mb-4 p-3 rounded-lg text-center font-medium ${submitStatus.type === "success" ? "bg-green-100 text-green-700" : submitStatus.type === "error" ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"}`}
              >
                {submitStatus.message}
              </div>
            )}
            <form onSubmit={handleSubmitIssue}>
              <div className="mb-4">
                <label className="block text-slate-700 font-semibold mb-2">
                  Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full p-3 border rounded-lg"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-slate-700 font-semibold mb-2 flex items-center">
                  <i className="fas fa-envelope mr-2"></i>Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full p-3 border rounded-lg"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-slate-700 font-semibold mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="w-full p-3 border rounded-lg"
                />
              </div>
              <div className="mb-4">
                <label className="block text-slate-700 font-semibold mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) =>
                    setFormData({ ...formData, subject: e.target.value })
                  }
                  className="w-full p-3 border rounded-lg"
                  placeholder="Brief description of your issue"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-slate-700 font-semibold mb-2">
                  Message / Issue Description
                </label>
                <textarea
                  rows="4"
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                  className="w-full p-3 border rounded-lg"
                  placeholder="Please describe your issue in detail..."
                  required
                ></textarea>
              </div>
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-3 rounded-lg hover:opacity-90"
              >
                Submit Issue
              </button>
            </form>
          </div>

          <div className="bg-white/70 backdrop-blur-md p-8 rounded-2xl shadow-lg border border-white/50">
            <h3 className="text-2xl font-bold text-slate-800 mb-6">
              Frequently Asked Questions
            </h3>
            <div className="space-y-3">
              {faqs.map((faq, i) => (
                <div key={i} className="border rounded-lg">
                  <button
                    onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                    className="w-full p-4 text-left font-semibold text-slate-800 hover:bg-slate-50 flex justify-between items-center"
                  >
                    {faq.q}
                    <i
                      className={`fas fa-chevron-${expandedFaq === i ? "up" : "down"}`}
                    ></i>
                  </button>
                  {expandedFaq === i && (
                    <div className="p-4 bg-slate-50 text-slate-600 border-t">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white/70 backdrop-blur-md p-8 rounded-2xl shadow-lg border border-white/50">
          <h3 className="text-2xl font-bold text-slate-800 mb-6 text-center">
            Contact Information
          </h3>
          <div className="flex flex-wrap justify-center gap-8">
            <div className="flex items-center gap-3">
              <i className="fas fa-envelope text-2xl text-purple-600"></i>
              <div>
                <p className="font-semibold text-slate-800">Email</p>
                <p className="text-slate-600">ambapali890@gmail.com</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <i className="fas fa-phone text-2xl text-blue-600"></i>
              <div>
                <p className="font-semibold text-slate-800">Phone</p>
                <p className="text-slate-600">+91 1122334455</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <i className="fas fa-map-marker-alt text-2xl text-green-600"></i>
              <div>
                <p className="font-semibold text-slate-800">Address</p>
                <p className="text-slate-600">
                  123 Health St, Wellness City, 45678
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <i className="fas fa-globe text-2xl text-pink-600"></i>
              <div>
                <p className="font-semibold text-slate-800">Website</p>
                <p className="text-slate-600">www.medvault.com</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

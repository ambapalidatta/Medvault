import { useState } from "react";

export default function DummyPaymentModal({ fee, onClose, onConfirmPayment, loading }) {
  const [step, setStep] = useState(1); // 1: Select Method, 2: OTP
  const [method, setMethod] = useState("card");
  const [otp, setOtp] = useState("");
  const [paymentMessage, setPaymentMessage] = useState("");
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  // This is the function passed from PatientDashboard (which includes the reset)
  const handleCloseClick = () => {
    if (!loading) setShowCancelConfirm(true);
  };

  const confirmCancel = () => {
    setShowCancelConfirm(false);
    onClose(); // <-- This now calls resetAppointmentForms()
  };

  const handlePayClick = () => {
    setPaymentMessage("");
    setStep(2); // Go to OTP step
  };

  const handleOtpConfirm = () => {
    if (otp.length !== 4) {
      setPaymentMessage("Please enter OTP.");
      return;
    }
    setPaymentMessage("Verifying OTP...");
    setTimeout(() => {
      onConfirmPayment();
    }, 1000);
  };

  const renderPaymentForm = () => {
    if (method === "card") {
      return (
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Card Number (XXXX XXXX XXXX XXXX)"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-purple"
            maxLength="16"
          />
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="MM/YY"
              className="w-1/2 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-purple"
              maxLength="5"
            />
            <input
              type="text"
              placeholder="CVV"
              className="w-1/2 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-purple"
              maxLength="3"
            />
          </div>
          <input
            type="text"
            placeholder="Name on Card"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-purple"
          />
        </div>
      );
    } else if (method === "upi") {
      return (
        <div className="space-y-4">
          <input
            type="text"
            placeholder="UPI ID (e.g., name@bank)"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-purple"
          />
          <p className="text-sm text-slate-500">
            A payment request will be sent to your UPI app.
          </p>
        </div>
      );
    } else if (method === "wallet") {
      return (
        <div className="space-y-4">
          <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-purple">
            <option>Select Wallet</option>
            <option>Paytm</option>
            <option>Google Pay</option>
            <option>PhonePe</option>
          </select>
          <input
            type="text"
            placeholder="Mobile Number"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-purple"
            maxLength="10"
          />
        </div>
      );
    }
  };

  return (
    <div className="modal-overlay" onClick={handleCloseClick}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-800">
            Complete Your Payment
          </h2>
          <button
            onClick={handleCloseClick}
            className="text-slate-500 hover:text-slate-800 text-2xl"
            disabled={loading}
          >
            &times;
          </button>
        </div>
        <div className="text-center mb-4">
          <img
            src="https://razorpay.com/assets/razorpay-logo.svg"
            alt="Razorpay"
            className="h-12 mx-auto mb-4"
          />
          <p className="text-lg text-slate-600">Total Amount:</p>
          <p className="text-4xl font-bold text-brand-purple">₹{fee}</p>
        </div>

        {step === 1 && (
          <>
            <div className="flex justify-center mb-6 border-b">
              {["card", "upi", "wallet"].map((m) => (
                <button
                  key={m}
                  className={`px-4 py-2 font-semibold capitalize ${
                    method === m
                      ? "border-b-4 border-brand-purple text-brand-purple"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                  onClick={() => setMethod(m)}
                >
                  {m}
                </button>
              ))}
            </div>

            <div className="mb-6 p-4 border rounded-lg bg-slate-50">
              {renderPaymentForm()}
            </div>

            <button
              onClick={handlePayClick}
              disabled={loading}
              className={`w-full text-white font-bold py-3 px-4 rounded-lg transition-colors duration-300 ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-brand-purple hover:bg-purple-700"
              }`}
            >
              {loading ? "Processing Payment..." : `Pay ₹${fee}`}
            </button>
          </>
        )}

        {step === 2 && (
          <div className="text-center">
            <p className="text-slate-600 mb-4">
              Enter the 4-digit OTP sent to your number/email to confirm
              payment.
            </p>
            <div className="flex justify-center space-x-2 mb-6">
              <input
                type="text"
                value={otp}
                onChange={(e) =>
                  setOtp(e.target.value.replace(/[^0-9]/g, "").slice(0, 4))
                }
                placeholder="••••"
                maxLength="4"
                className="text-3xl font-bold text-center w-32 p-3 border-2 border-brand-purple rounded-lg focus:outline-none focus:border-purple-700"
              />
            </div>
            {paymentMessage && (
              <p className="text-red-600 text-sm mb-4">{paymentMessage}</p>
            )}
            <button
              onClick={handleOtpConfirm}
              disabled={loading}
              className={`w-full text-white font-bold py-3 px-4 rounded-lg transition-colors duration-300 ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700"
              }`}
            >
              {loading ? "Verifying..." : "Confirm OTP & Pay"}
            </button>
            <button
              onClick={() => setStep(1)}
              disabled={loading}
              className="w-full text-slate-500 font-semibold py-2 mt-2"
            >
              Go Back
            </button>
          </div>
        )}
      </div>
      {showCancelConfirm && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm">
            <h3 className="text-xl font-bold text-slate-800 mb-4">
              Cancel Payment?
            </h3>
            <p className="text-slate-600 mb-6">
              Are you sure you want to cancel this payment?
            </p>
            <div className="flex gap-3">
              <button
                onClick={confirmCancel}
                className="flex-1 bg-red-600 text-white py-2 rounded-lg font-semibold hover:bg-red-700"
              >
                Yes, Cancel
              </button>
              <button
                onClick={() => setShowCancelConfirm(false)}
                className="flex-1 bg-gray-300 text-slate-800 py-2 rounded-lg font-semibold hover:bg-gray-400"
              >
                No, Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
// --- FINAL PATIENT DASHBOARD (Feedback Box Fixed, Urgency Icons Updated) ---

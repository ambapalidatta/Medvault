import { useState } from "react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

const getAuthToken = () => sessionStorage.getItem("authToken");

const authFetch = (url, options = {}) => {
  const token = getAuthToken();
  const headers = { ...(options.headers || {}) };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return fetch(url, {
    ...options,
    headers,
  });
};

// --- Auth Components (Unchanged) ---
const AuthPage = ({ role, onBack, onLoginSuccess }) => {
  const [authType, setAuthType] = useState("register");
  const [message, setMessage] = useState({ text: "", type: "" });

  const handleRegister = async (e, formData) => {
    e.preventDefault();
    setMessage({ text: "Registering...", type: "info" });
    const payload = Object.fromEntries(
      Object.entries(formData).filter(([_, v]) => v != null && v !== ""),
    );
    try {
      const response = await authFetch(
        `${API_BASE_URL}/auth/register/${role}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const responseText = await response.text();
      if (response.ok) {
        setMessage({
          text: `${responseText}. You can now sign in.`,
          type: "success",
        });
        e.target.reset();
        setAuthType("login");
      } else {
        setMessage({
          text: responseText || `Registration failed`,
          type: "error",
        });
      }
    } catch (error) {
      setMessage({ text: "Could not connect to the server.", type: "error" });
    }
  };

  const handleLogin = async (e, formData) => {
    e.preventDefault();
    setMessage({ text: "Signing in...", type: "info" });
    try {
      const response = await authFetch(
        `${API_BASE_URL}/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        },
      );

      if (response.ok) {
        const userData = await response.json();

        if (!userData.token) {
          setMessage({
            text: "Login failed: token missing from server response.",
            type: "error",
          });
          return;
        }

        if (userData.role !== role) {
          // Special check for admin login from the "secret" URL
          if (role === "admin") {
            setMessage({
              text: `Login failed. Please use the correct portal for your role.`,
              type: "error",
            });
            return;
          }
          setMessage({
            text: `Login failed. Please use the correct portal for your role.`,
            type: "error",
          });
          return;
        }
        sessionStorage.setItem("authToken", userData.token);
        onLoginSuccess(userData);
      } else {
        const errorText = await response.text();
        setMessage({
          text: errorText || `Login failed. Check credentials.`,
          type: "error",
        });
      }
    } catch (error) {
      setMessage({ text: "Could not connect to the server.", type: "error" });
    }
  };

  const renderForm = () => {
    if (role === "admin") {
      return <LoginForm onSubmit={handleLogin} role={role} />;
    }

    if (authType === "login") {
      return <LoginForm onSubmit={handleLogin} role={role} />;
    }
    switch (role) {
      case "patient":
        return (
          <PatientRegistrationForm
            onSubmit={handleRegister}
            onSwitchToLogin={() => setAuthType("login")}
          />
        );
      case "doctor":
        return (
          <DoctorRegistrationForm
            onSubmit={handleRegister}
            onSwitchToLogin={() => setAuthType("login")}
          />
        );
      default:
        return null;
    }
  };

  const sidebarGradient =
    role === "patient"
      ? "bg-gradient-to-br from-purple-600 to-green-600"
      : role === "doctor"
        ? "bg-gradient-to-br from-purple-600 to-yellow-500"
        : "bg-teal-700";

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-brand-bg to-brand-lavender/30">
      <main className="w-full max-w-6xl mx-auto bg-white rounded-3xl shadow-2xl grid grid-cols-1 lg:grid-cols-2 overflow-hidden">
        <div
          className={`hidden lg:flex flex-col justify-center p-12 ${sidebarGradient} text-white relative items-center text-center`}
        >
          <i
            className={`fas ${role === "patient" ? "fa-user-injured" : role === "doctor" ? "fa-user-md" : "fa-user-shield"} text-9xl mb-8`}
          ></i>
          <h1 className="text-4xl font-extrabold mb-4 capitalize">
            {role} Portal
          </h1>
          <p className="text-indigo-100 text-lg">
            {authType === "login"
              ? "Welcome back! Sign in to continue."
              : "Create your account to get started."}
          </p>
        </div>
        <div className="p-8 md:p-12">
          <div className="flex items-center mb-8">
            <button
              onClick={onBack}
              className="text-slate-500 hover:text-slate-800 mr-4"
            >
              <i className="fas fa-arrow-left"></i> Back
            </button>
            {role === "admin" ? (
              <div className="text-center w-full">
                <h2 className="text-2xl font-semibold text-slate-700">
                  Sign In
                </h2>
              </div>
            ) : (
              <div className="bg-slate-100 p-1 rounded-full flex">
                <button
                  onClick={() => setAuthType("register")}
                  className={`px-6 py-2 rounded-full font-semibold ${authType === "register" ? "bg-white text-teal-700 shadow" : "text-slate-500"}`}
                >
                  Create Account
                </button>
                <button
                  onClick={() => setAuthType("login")}
                  className={`px-6 py-2 rounded-full font-semibold ${authType === "login" ? "bg-white text-teal-700 shadow" : "text-slate-500"}`}
                >
                  Sign In
                </button>
              </div>
            )}
          </div>
          {message.text && (
            <div
              className={`p-4 mb-6 rounded-lg text-center ${
                message.type === "success"
                  ? "bg-green-100 text-green-800"
                  : message.type === "error"
                    ? "bg-red-100 text-red-800"
                    : "bg-blue-100 text-blue-800"
              }`}
            >
              {message.text}
            </div>
          )}
          {renderForm()}
        </div>
      </main>
    </div>
  );
};
const PatientRegistrationForm = ({ onSubmit, onSwitchToLogin }) => {
  const handleFormSubmit = (e) => {
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    onSubmit(e, data);
  };
  return (
    <form onSubmit={handleFormSubmit} className="space-y-6">
      <h2 className="text-2xl font-semibold text-slate-700 text-center">
        Patient Registration
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InputField
          id="email"
          label="Email Address"
          type="email"
          required
          placeholder="you@example.com"
        />
        <InputField
          id="password"
          label="Password"
          type="password"
          required
          placeholder="••••••••"
        />
        <InputField
          id="firstName"
          label="First Name"
          required
          placeholder="John"
        />
        <InputField
          id="lastName"
          label="Last Name"
          required
          placeholder="Doe"
        />
        <InputField
          id="dateOfBirth"
          label="Date of Birth"
          type="date"
          required
        />
        <InputField
          id="phone"
          label="Phone Number"
          type="tel"
          required
          placeholder="e.g., +91 1234567890"
        />
        <InputField id="gender" label="Gender" placeholder="e.g., female" />
        <InputField
          id="bloodGroup"
          label="Blood Group"
          placeholder="e.g., O+"
        />
        <InputField
          id="emergencyContactName"
          label="Emergency Contact Name"
          placeholder="Jane Doe"
        />
        <InputField
          id="emergencyContactPhone"
          label="Emergency Contact Phone"
          type="tel"
          placeholder="e.g., +91 9876543210"
        />
        <div className="md:col-span-2">
          <InputField
            id="address"
            label="Full Address"
            placeholder="123 Health St, Medville"
          />
        </div>
        <InputField id="city" label="City" placeholder="Jamshedpur" />
        <InputField id="state" label="State" placeholder="Jharkhand" />
        <InputField id="country" label="Country" placeholder="India" />
        <InputField id="postalCode" label="Postal Code" placeholder="831011" />
        <div className="md:col-span-2">
          <InputField
            id="profilePictureUrl"
            label="Profile Picture URL"
            placeholder="https://example.com/image.jpg"
          />
        </div>
      </div>
      <button
        type="submit"
        className="w-full bg-gradient-to-r from-teal-700 to-indigo-900 text-white font-bold py-3 px-4 rounded-xl hover:from-teal-800 hover:to-indigo-950 shadow-lg shadow-teal-900/20 transition-colors duration-300"
      >
        Create Account
      </button>
      <p className="text-center text-sm text-slate-600 mt-4">
        Already have an account?{" "}
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="text-teal-700 font-semibold hover:underline"
        >
          Sign in
        </button>
      </p>
    </form>
  );
};
const DoctorRegistrationForm = ({ onSubmit, onSwitchToLogin }) => {
  const handleFormSubmit = (e) => {
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    onSubmit(e, data);
  };
  return (
    <form onSubmit={handleFormSubmit} className="space-y-6">
      <h2 className="text-2xl font-semibold text-slate-700 text-center">
        Doctor Registration
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InputField
          id="email"
          label="Email Address"
          type="email"
          required
          placeholder="dr.smith@hospital.com"
        />
        <InputField
          id="password"
          label="Password"
          type="password"
          required
          placeholder="••••••••"
        />
        <InputField
          id="firstName"
          label="First Name"
          required
          placeholder="Jane"
        />
        <InputField
          id="lastName"
          label="Last Name"
          required
          placeholder="Smith"
        />
        <InputField
          id="specialization"
          label="Specialization"
          required
          placeholder="Cardiology"
        />
        <InputField
          id="licenseNumber"
          label="License Number"
          required
          placeholder="e.g., MED12345"
        />
        <InputField id="licenseExpiry" label="License Expiry" type="date" />
        <InputField
          id="qualification"
          label="Qualification"
          placeholder="MD, MBBS"
        />
        <InputField
          id="consultationFee"
          label="Consultation Fee (INR)"
          type="number"
          placeholder="e.g., 500"
        />
        <InputField
          id="experienceYears"
          label="Years of Experience"
          type="number"
          placeholder="10"
        />
        <InputField
          id="phone"
          label="Phone Number"
          type="tel"
          required
          placeholder="e.g., +91 1234567890"
        />
        <InputField
          id="hospitalAffiliation"
          label="Hospital Affiliation"
          placeholder="City General Hospital"
        />
        <div className="md:col-span-2">
          <InputField
            id="address"
            label="Clinic Address"
            placeholder="123 Health St, Medville"
          />
        </div>
        <InputField id="city" label="City" placeholder="Jamshedpur" />
        <InputField id="state" label="State" placeholder="Jharkhand" />
        <InputField id="country" label="Country" placeholder="India" />
        <InputField id="postalCode" label="Postal Code" placeholder="831011" />
        <div className="md:col-span-2">
          <InputField
            id="profilePictureUrl"
            label="Profile Picture URL"
            placeholder="https://example.com/image.jpg"
          />
        </div>
      </div>
      <button
        type="submit"
        className="w-full bg-gradient-to-r from-teal-700 to-indigo-900 text-white font-bold py-3 px-4 rounded-xl hover:from-teal-800 hover:to-indigo-950 shadow-lg shadow-teal-900/20 transition-colors duration-300"
      >
        Create Professional Account
      </button>
      <p className="text-center text-sm text-slate-600 mt-4">
        Already have an account?{" "}
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="text-teal-700 font-semibold hover:underline"
        >
          Sign in
        </button>
      </p>
    </form>
  );
};
const InputField = ({
  id,
  label,
  type = "text",
  required = false,
  placeholder = "",
}) => (
  <div>
    <label
      htmlFor={id}
      className="block text-sm font-medium text-slate-600 mb-1"
    >
      {label}
      {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type={type}
      id={id}
      name={id}
      className="w-full px-4 py-2 bg-slate-100 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600"
      required={required}
      placeholder={placeholder}
    />
  </div>
);
const LoginForm = ({ onSubmit, role }) => {
  const handleFormSubmit = (e) => {
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    onSubmit(e, data);
  };
  return (
    <form onSubmit={handleFormSubmit} className="space-y-6">
      {role !== "admin" && (
        <h2 className="text-2xl font-semibold text-slate-700 text-center capitalize">
          {role} Sign In
        </h2>
      )}
      <div className="space-y-6">
        <InputField
          id="email"
          label="Email Address"
          type="email"
          required
          placeholder="you@example.com"
        />
        <InputField
          id="password"
          label="Password"
          type="password"
          required
          placeholder="••••••••"
        />
      </div>
      <button
        type="submit"
        className="w-full bg-gradient-to-r from-teal-700 to-indigo-900 text-white font-bold py-3 px-4 rounded-xl hover:from-teal-800 hover:to-indigo-950 shadow-lg shadow-teal-900/20 transition-colors duration-300"
      >
        Sign In
      </button>
    </form>
  );
};


export default AuthPage;

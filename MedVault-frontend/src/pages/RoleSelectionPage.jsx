const roleCards = [
  {
    id: "patient",
    title: "Patient",
    subtitle: "Book appointments, manage reports, view prescriptions and track your health records securely.",
    badge: "Sign Up / Sign In",
    icon: "fa-user-injured",
    onKey: "patient",
    accent: "from-teal-600 to-emerald-500",
    soft: "bg-teal-50",
    text: "text-teal-800",
    buttonText: "Continue as Patient",
  },
  {
    id: "doctor",
    title: "Doctor",
    subtitle: "Create your professional profile, manage availability, appointments and patient care workflows.",
    badge: "Sign Up / Sign In",
    icon: "fa-user-md",
    onKey: "doctor",
    accent: "from-indigo-700 to-teal-600",
    soft: "bg-indigo-50",
    text: "text-indigo-800",
    buttonText: "Continue as Doctor",
  },
  {
    id: "admin",
    title: "Admin",
    subtitle: "Access the control panel to verify doctors, monitor users, issues, records and emergencies.",
    badge: "Login Only",
    icon: "fa-user-shield",
    onKey: "admin",
    accent: "from-slate-950 to-orange-500",
    soft: "bg-orange-50",
    text: "text-orange-700",
    buttonText: "Admin Login",
  },
];

export default function RoleSelectionPage({
  onBack,
  onSelectPatient,
  onSelectDoctor,
  onSelectAdmin,
}) {
  const handlers = {
    patient: onSelectPatient,
    doctor: onSelectDoctor,
    admin: onSelectAdmin,
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f8faf7] px-4 py-8">
      <div className="pointer-events-none absolute -left-28 top-10 h-80 w-80 rounded-full bg-teal-200/40 blur-3xl"></div>
      <div className="pointer-events-none absolute -right-28 bottom-10 h-80 w-80 rounded-full bg-orange-200/40 blur-3xl"></div>

      <section className="relative mx-auto flex min-h-[92vh] max-w-6xl flex-col justify-center">
        <button
          onClick={onBack}
          className="mb-8 inline-flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-600 shadow-sm transition hover:border-teal-600 hover:text-teal-700"
        >
          <i className="fas fa-arrow-left"></i>
          Back to Home
        </button>

        <div className="mx-auto max-w-3xl text-center">
          <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-[1.75rem] bg-gradient-to-br from-teal-700 via-indigo-900 to-orange-500 text-white shadow-2xl shadow-teal-700/20">
            <i className="fas fa-shield-heart text-4xl"></i>
          </div>

          <p className="text-sm font-extrabold uppercase tracking-[0.28em] text-teal-700">
            Choose your access
          </p>

          <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-slate-950 md:text-6xl">
            Select your MedVault workspace
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-600">
            A redesigned healthcare platform with separate experiences for patients,
            doctors and administrators.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
          {roleCards.map((role) => (
            <button
              key={role.id}
              onClick={handlers[role.onKey]}
              className="group relative overflow-hidden rounded-[2rem] border border-white bg-white/90 p-7 text-left shadow-xl shadow-slate-200/70 backdrop-blur transition duration-300 hover:-translate-y-2 hover:shadow-2xl"
            >
              <div className={`absolute inset-x-0 top-0 h-2 bg-gradient-to-r ${role.accent}`}></div>

              <div className="mb-8 flex items-start justify-between gap-4">
                <div
                  className={`flex h-20 w-20 items-center justify-center rounded-[1.75rem] bg-gradient-to-br ${role.accent} text-white shadow-lg transition duration-300 group-hover:scale-110`}
                >
                  <i className={`fas ${role.icon} text-4xl`}></i>
                </div>

                <span className={`rounded-full ${role.soft} px-4 py-2 text-xs font-black ${role.text}`}>
                  {role.badge}
                </span>
              </div>

              <h2 className="text-2xl font-extrabold text-slate-950">
                {role.title}
              </h2>

              <p className="mt-4 min-h-[112px] leading-7 text-slate-600">
                {role.subtitle}
              </p>

              <div
                className={`mt-7 flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r ${role.accent} px-5 py-4 font-extrabold text-white transition-all group-hover:gap-5`}
              >
                {role.buttonText}
                <i className="fas fa-arrow-right"></i>
              </div>
            </button>
          ))}
        </div>
      </section>
    </main>
  );
}

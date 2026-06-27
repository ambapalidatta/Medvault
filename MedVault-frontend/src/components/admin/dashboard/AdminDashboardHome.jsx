import Icon from "../Icon.jsx";
import StatsCard from "../StatsCard.jsx";

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 18) return "Good Afternoon";
  return "Good Evening";
};

export default function AdminDashboardHome({ user, stats, doctors, patients, appointments, emergencies, loading, error, onRefresh, onNavigate }) {
  const activeEmergencies = emergencies.filter((e) => String(e.status || "").toUpperCase() !== "COMPLETED");
  const completedAppointments = appointments.filter((a) => ["completed", "COMPLETED"].includes(a.status));
  const earnings = doctors.reduce((total, doctor) => {
    const count = completedAppointments.filter((a) => a.doctorId === doctor.id).length;
    return total + count * (doctor.consultationFee || 500);
  }, 0);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center rounded-3xl bg-white">
        <div className="text-center">
          <div className="mx-auto mb-4 h-14 w-14 animate-spin rounded-full border-4 border-indigo-100 border-t-indigo-600" />
          <p className="font-semibold text-slate-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {error && (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex gap-3">
              <Icon name="AlertCircle" size={24} className="text-rose-600" />
              <div>
                <h3 className="font-black text-rose-900">Connection problem</h3>
                <p className="mt-1 text-sm text-rose-700">{error}</p>
              </div>
            </div>
            <button onClick={onRefresh} className="rounded-2xl bg-rose-600 px-4 py-2 text-sm font-black text-white">Retry</button>
          </div>
        </div>
      )}

      <section className="rounded-[2rem] bg-gradient-to-br from-indigo-700 via-purple-700 to-teal-700 p-6 text-white shadow-xl">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <img src={user?.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.displayName || user?.name || "Admin")}&background=ffffff&color=4f46e5&size=160`} alt="Admin" className="h-20 w-20 rounded-full border-4 border-white/70 object-cover shadow-lg" />
            <div>
              <p className="text-sm font-black uppercase tracking-[0.25em] text-white/70">Admin dashboard</p>
              <h1 className="mt-2 text-3xl font-black">{getGreeting()}, {user?.displayName || user?.name || "Admin"}</h1>
              <p className="mt-1 text-sm text-white/75">{user?.email || "admin@medvault.com"}</p>
            </div>
          </div>
          <button onClick={onRefresh} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white/15 px-5 py-3 font-black text-white ring-1 ring-white/25 hover:bg-white/25">
            <Icon name="RefreshCw" size={18} /> Refresh Data
          </button>
        </div>
      </section>

      <section>
        <h2 className="mb-4 flex items-center gap-2 text-lg font-black text-slate-900"><Icon name="BarChart3" size={20} className="text-indigo-600" /> Primary metrics</h2>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-5">
          <StatsCard title="Total Users" value={stats.totalUsers || patients.length + doctors.length} icon="Users" color="blue" />
          <StatsCard title="Patients" value={stats.totalPatients || patients.length} icon="UserCheck" color="teal" />
          <StatsCard title="Doctors" value={stats.totalDoctors || doctors.length} icon="Stethoscope" color="indigo" />
          <StatsCard title="Appointments" value={stats.totalAppointments || appointments.length} icon="CalendarCheck" color="purple" />
          <StatsCard title="Emergencies" value={activeEmergencies.length} icon="Siren" color="rose" />
        </div>
      </section>

      <section>
        <h2 className="mb-4 flex items-center gap-2 text-lg font-black text-slate-900"><Icon name="TrendingUp" size={20} className="text-purple-600" /> Status overview</h2>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
          <StatsCard title="Verified Doctors" value={stats.verifiedDoctors || doctors.filter((d) => d.isVerified).length} icon="BadgeCheck" color="emerald" />
          <StatsCard title="Pending Doctors" value={stats.pendingDoctors || doctors.filter((d) => !d.isVerified).length} icon="Clock" color="amber" />
          <StatsCard title="Pending Appointments" value={stats.pendingAppointments || appointments.filter((a) => a.status === "pending").length} icon="ClipboardList" color="amber" />
          <StatsCard title="Platform Earnings" value={`₹${earnings.toLocaleString()}`} icon="DollarSign" color="emerald" />
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="mb-5 flex items-center gap-2 text-lg font-black text-slate-900"><Icon name="Link" size={20} className="text-indigo-600" /> Quick actions</h3>
          <div className="grid grid-cols-2 gap-4">
            {[
              ["Doctors", "doctors", "Stethoscope", `${doctors.length} doctors`],
              ["Patients", "patients", "Users", `${patients.length} patients`],
              ["Appointments", "appointments", "CalendarCheck", `${appointments.length} total`],
              ["Issues", "issues", "MessageSquareWarning", "Support queue"],
            ].map(([label, view, icon, sub]) => (
              <button key={view} onClick={() => onNavigate(view)} className="rounded-3xl border border-slate-100 bg-slate-50 p-5 text-left transition hover:-translate-y-0.5 hover:bg-indigo-50 hover:shadow-lg">
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-600 text-white"><Icon name={icon} size={21} /></div>
                <p className="font-black text-slate-900">{label}</p>
                <p className="mt-1 text-xs font-semibold text-slate-500">{sub}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="mb-5 flex items-center gap-2 text-lg font-black text-slate-900"><Icon name="Activity" size={20} className="text-teal-600" /> Recent activity</h3>
          <div className="space-y-4">
            {appointments.slice(0, 5).map((appointment) => (
              <div key={appointment.id} className="flex gap-3 rounded-2xl bg-slate-50 p-3">
                <div className="mt-1 h-3 w-3 rounded-full bg-teal-500" />
                <div>
                  <p className="text-sm font-bold text-slate-800">{appointment.patientName} with {appointment.doctorName}</p>
                  <p className="text-xs text-slate-500">{appointment.date} • {appointment.status}</p>
                </div>
              </div>
            ))}
            {appointments.length === 0 && <p className="text-sm text-slate-500">No recent appointment activity.</p>}
          </div>
        </div>
      </section>
    </div>
  );
}

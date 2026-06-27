import Icon from "../Icon.jsx";
import AdminTable from "../common/AdminTable.jsx";
import StatusBadge from "../common/StatusBadge.jsx";

export default function AdminDoctorsView({ doctors, searchTerm, setSearchTerm, onVerifyDoctor, onViewDetails }) {
  const filtered = doctors.filter((doctor) => {
    const q = searchTerm.toLowerCase();
    return [doctor.name, doctor.email, doctor.specialization, doctor.license].some((v) => String(v || "").toLowerCase().includes(q));
  });

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-900">Doctor Management</h2>
          <p className="text-sm text-slate-500">Verify doctors, review profiles, and monitor activity.</p>
        </div>
        <div className="relative w-full md:w-96">
          <Icon name="Search" size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search doctors..." className="w-full rounded-2xl border border-slate-200 py-3 pl-11 pr-4 text-sm font-semibold outline-none focus:border-indigo-500" />
        </div>
      </div>

      <AdminTable columns={["Doctor", "Specialization", "Contact", "Rating", "Status", "Actions"]}>
        {filtered.map((doctor) => (
          <tr key={doctor.id} className="hover:bg-slate-50">
            <td className="px-5 py-4">
              <p className="font-black text-slate-900">{doctor.name}</p>
              <p className="text-xs text-slate-500">License: {doctor.license}</p>
            </td>
            <td className="px-5 py-4 text-sm font-semibold text-slate-700">{doctor.specialization}</td>
            <td className="px-5 py-4">
              <p className="text-sm text-slate-700">{doctor.email}</p>
              <p className="text-xs text-slate-500">{doctor.phone}</p>
            </td>
            <td className="px-5 py-4 text-sm font-black text-amber-600">★ {doctor.rating || doctor.averageRating || 0}</td>
            <td className="px-5 py-4"><StatusBadge value={doctor.isVerified ? "verified" : "pending"} /></td>
            <td className="px-5 py-4">
              <div className="flex flex-wrap gap-2">
                <button onClick={() => onViewDetails("doctor", doctor)} className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-black text-slate-700 hover:bg-slate-50">View</button>
                {!doctor.isVerified && <button onClick={() => onVerifyDoctor(doctor.id)} className="rounded-xl bg-emerald-600 px-3 py-2 text-xs font-black text-white hover:bg-emerald-700">Verify</button>}
              </div>
            </td>
          </tr>
        ))}
      </AdminTable>
    </section>
  );
}

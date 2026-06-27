import Icon from "../Icon.jsx";
import AdminTable from "../common/AdminTable.jsx";
import StatusBadge from "../common/StatusBadge.jsx";

export default function AdminPatientsView({ patients, searchTerm, setSearchTerm, onViewDetails }) {
  const filtered = patients.filter((patient) => {
    const q = searchTerm.toLowerCase();
    return [patient.name, patient.email, patient.phone, patient.bloodGroup].some((v) => String(v || "").toLowerCase().includes(q));
  });

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-900">Patient Management</h2>
          <p className="text-sm text-slate-500">Review patient profiles and health activity.</p>
        </div>
        <div className="relative w-full md:w-96">
          <Icon name="Search" size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search patients..." className="w-full rounded-2xl border border-slate-200 py-3 pl-11 pr-4 text-sm font-semibold outline-none focus:border-indigo-500" />
        </div>
      </div>

      <AdminTable columns={["Patient", "Contact", "Profile", "Records", "Status", "Actions"]}>
        {filtered.map((patient) => (
          <tr key={patient.id} className="hover:bg-slate-50">
            <td className="px-5 py-4">
              <p className="font-black text-slate-900">{patient.name}</p>
              <p className="text-xs text-slate-500">Age: {patient.age} • {patient.gender}</p>
            </td>
            <td className="px-5 py-4">
              <p className="text-sm text-slate-700">{patient.email}</p>
              <p className="text-xs text-slate-500">{patient.phone}</p>
            </td>
            <td className="px-5 py-4 text-sm text-slate-700">Blood: {patient.bloodGroup}</td>
            <td className="px-5 py-4 text-sm font-bold text-indigo-600">{patient.totalRecords || 0}</td>
            <td className="px-5 py-4"><StatusBadge value={patient.status || "active"} /></td>
            <td className="px-5 py-4"><button onClick={() => onViewDetails("patient", patient)} className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-black text-slate-700 hover:bg-slate-50">View</button></td>
          </tr>
        ))}
      </AdminTable>
    </section>
  );
}

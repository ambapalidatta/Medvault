import AdminTable from "../common/AdminTable.jsx";
import StatusBadge from "../common/StatusBadge.jsx";

export default function AdminEmergencyView({ emergencies, onRemindDoctor }) {
  return (
    <section className="space-y-5">
      <div className="rounded-3xl border border-rose-200 bg-rose-50 p-5">
        <h2 className="text-2xl font-black text-rose-950">Emergency Requests</h2>
        <p className="text-sm text-rose-700">Track urgent patient requests and remind assigned doctors.</p>
      </div>

      <AdminTable columns={["Patient", "Doctor", "Time", "Severity", "Reason", "Status", "Actions"]}>
        {emergencies.map((item) => (
          <tr key={item.id} className="hover:bg-rose-50/40">
            <td className="px-5 py-4 font-bold text-slate-900">{item.patientName}</td>
            <td className="px-5 py-4 text-sm text-slate-700">{item.doctorName}</td>
            <td className="px-5 py-4 text-sm text-slate-600">{item.requestTime}</td>
            <td className="px-5 py-4 text-sm font-black uppercase text-rose-600">{item.severity}</td>
            <td className="px-5 py-4 text-sm text-slate-700">{item.reason}</td>
            <td className="px-5 py-4"><StatusBadge value={item.status} /></td>
            <td className="px-5 py-4"><button onClick={() => onRemindDoctor(item.id)} className="rounded-xl bg-rose-600 px-3 py-2 text-xs font-black text-white hover:bg-rose-700">Send Reminder</button></td>
          </tr>
        ))}
      </AdminTable>
    </section>
  );
}

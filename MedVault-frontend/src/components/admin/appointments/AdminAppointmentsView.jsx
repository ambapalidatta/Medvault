import Icon from "../Icon.jsx";
import AdminTable from "../common/AdminTable.jsx";
import StatusBadge from "../common/StatusBadge.jsx";

export default function AdminAppointmentsView({ appointments, appointmentFilter, setAppointmentFilter, onViewDetails }) {
  const filtered = appointments.filter((appointment) => appointmentFilter === "all" || appointment.status === appointmentFilter);

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-900">Appointment Management</h2>
          <p className="text-sm text-slate-500">Monitor bookings, status, fees and consultation flow.</p>
        </div>
        <select value={appointmentFilter} onChange={(e) => setAppointmentFilter(e.target.value)} className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none focus:border-indigo-500">
          <option value="all">All appointments</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <AdminTable columns={["Patient", "Doctor", "Date & Time", "Type", "Fee", "Status", "Actions"]}>
        {filtered.map((appointment) => (
          <tr key={appointment.id} className="hover:bg-slate-50">
            <td className="px-5 py-4 font-bold text-slate-800">{appointment.patientName}</td>
            <td className="px-5 py-4 text-sm text-slate-700">{appointment.doctorName}</td>
            <td className="px-5 py-4"><p className="text-sm font-bold text-slate-800">{appointment.date}</p><p className="text-xs text-slate-500">{appointment.time}</p></td>
            <td className="px-5 py-4 text-sm text-slate-700">{appointment.type}</td>
            <td className="px-5 py-4 text-sm font-black text-emerald-600">₹{appointment.consultationFee || 500}</td>
            <td className="px-5 py-4"><StatusBadge value={appointment.status} /></td>
            <td className="px-5 py-4"><button onClick={() => onViewDetails("appointment", appointment)} className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-black text-slate-700 hover:bg-slate-50">View</button></td>
          </tr>
        ))}
      </AdminTable>
    </section>
  );
}

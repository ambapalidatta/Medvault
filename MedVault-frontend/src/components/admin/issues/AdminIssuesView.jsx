import AdminTable from "../common/AdminTable.jsx";
import StatusBadge from "../common/StatusBadge.jsx";

export default function AdminIssuesView({ issues, issuesFilter, setIssuesFilter, selectedIssue, setSelectedIssue, replyMessage, setReplyMessage, onSubmitReply }) {
  const filtered = issues.filter((issue) => issuesFilter === "all" || String(issue.status).toLowerCase() === issuesFilter);

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-900">Issue Reports</h2>
          <p className="text-sm text-slate-500">Reply to user issues and resolve support requests.</p>
        </div>
        <select value={issuesFilter} onChange={(e) => setIssuesFilter(e.target.value)} className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none focus:border-indigo-500">
          <option value="all">All issues</option>
          <option value="pending">Pending</option>
          <option value="resolved">Resolved</option>
        </select>
      </div>

      <AdminTable columns={["User", "Subject", "Message", "Created", "Status", "Actions"]}>
        {filtered.map((issue) => (
          <tr key={issue.id} className="hover:bg-slate-50">
            <td className="px-5 py-4"><p className="font-black text-slate-900">{issue.name}</p><p className="text-xs text-slate-500">{issue.email}</p></td>
            <td className="px-5 py-4 text-sm font-bold text-slate-800">{issue.subject}</td>
            <td className="max-w-sm px-5 py-4 text-sm text-slate-600"><p className="line-clamp-2">{issue.message}</p></td>
            <td className="px-5 py-4 text-sm text-slate-500">{issue.createdAt}</td>
            <td className="px-5 py-4"><StatusBadge value={issue.status} /></td>
            <td className="px-5 py-4"><button onClick={() => setSelectedIssue(issue)} className="rounded-xl bg-indigo-600 px-3 py-2 text-xs font-black text-white hover:bg-indigo-700">Reply</button></td>
          </tr>
        ))}
      </AdminTable>

      {selectedIssue && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <div className="w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl">
            <h3 className="text-xl font-black text-slate-900">Reply to {selectedIssue.name}</h3>
            <p className="mt-2 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">{selectedIssue.message}</p>
            <textarea value={replyMessage} onChange={(e) => setReplyMessage(e.target.value)} rows={5} placeholder="Write your reply..." className="mt-4 w-full rounded-2xl border border-slate-200 p-4 text-sm outline-none focus:border-indigo-500" />
            <div className="mt-5 flex gap-3">
              <button onClick={() => setSelectedIssue(null)} className="flex-1 rounded-2xl border border-slate-200 px-5 py-3 font-black text-slate-700 hover:bg-slate-50">Cancel</button>
              <button onClick={onSubmitReply} className="flex-1 rounded-2xl bg-indigo-600 px-5 py-3 font-black text-white hover:bg-indigo-700">Send & Resolve</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

import AdminTable from "../common/AdminTable.jsx";
import StatusBadge from "../common/StatusBadge.jsx";

export default function AdminDocumentsView({ documents, onVerifyDocument }) {
  return (
    <section className="space-y-5">
      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-2xl font-black text-slate-900">Document Verification</h2>
        <p className="text-sm text-slate-500">Review and approve doctor qualification documents.</p>
      </div>

      <AdminTable columns={["Doctor", "Document", "Uploaded", "Status", "Actions"]}>
        {documents.map((doc) => (
          <tr key={doc.id} className="hover:bg-slate-50">
            <td className="px-5 py-4"><p className="font-black text-slate-900">{doc.doctorName}</p><p className="text-xs text-slate-500">{doc.doctorEmail}</p></td>
            <td className="px-5 py-4"><p className="text-sm font-bold text-slate-800">{doc.documentName}</p><p className="text-xs text-slate-500">{doc.documentType}</p></td>
            <td className="px-5 py-4 text-sm text-slate-600">{doc.uploadedDate}</td>
            <td className="px-5 py-4"><StatusBadge value={doc.status} /></td>
            <td className="px-5 py-4">
              <div className="flex gap-2">
                {doc.documentPath && <a href={doc.documentPath} target="_blank" rel="noreferrer" className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-black text-slate-700 hover:bg-slate-50">Open</a>}
                {!doc.isVerified && <button onClick={() => onVerifyDocument(doc.id)} className="rounded-xl bg-emerald-600 px-3 py-2 text-xs font-black text-white hover:bg-emerald-700">Verify</button>}
              </div>
            </td>
          </tr>
        ))}
      </AdminTable>
    </section>
  );
}

export default function AdminTable({ columns, children }) {
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[850px]">
          <thead className="border-b border-slate-100 bg-slate-50">
            <tr>
              {columns.map((column) => (
                <th key={column} className="px-5 py-4 text-left text-xs font-black uppercase tracking-wider text-slate-500">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">{children}</tbody>
        </table>
      </div>
    </div>
  );
}

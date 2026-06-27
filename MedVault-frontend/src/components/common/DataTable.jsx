export default function DataTable({ columns = [], data = [], rowKey = "id", emptyMessage = "No records found" }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left">
          <thead className="border-b border-slate-100 bg-slate-50">
            <tr>
              {columns.map((column) => (
                <th key={column.key} className="px-5 py-4 text-xs font-extrabold uppercase tracking-wide text-slate-500">
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-5 py-10 text-center text-sm font-semibold text-slate-500">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, index) => (
                <tr key={row[rowKey] ?? index} className="hover:bg-slate-50">
                  {columns.map((column) => (
                    <td key={column.key} className="px-5 py-4 text-sm text-slate-700">
                      {column.render ? column.render(row, index) : row[column.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

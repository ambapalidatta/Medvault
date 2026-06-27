const STATUS_STYLES = {
  pending: "bg-amber-100 text-amber-700 border-amber-200",
  approved: "bg-emerald-100 text-emerald-700 border-emerald-200",
  verified: "bg-emerald-100 text-emerald-700 border-emerald-200",
  completed: "bg-blue-100 text-blue-700 border-blue-200",
  rejected: "bg-red-100 text-red-700 border-red-200",
  cancelled: "bg-red-100 text-red-700 border-red-200",
  active: "bg-teal-100 text-teal-700 border-teal-200",
  inactive: "bg-slate-100 text-slate-600 border-slate-200",
  resolved: "bg-indigo-100 text-indigo-700 border-indigo-200",
};

export default function Badge({ children, status, className = "" }) {
  const key = String(status || children || "").toLowerCase();
  const style = STATUS_STYLES[key] || "bg-slate-100 text-slate-700 border-slate-200";

  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold capitalize ${style} ${className}`}>
      {children || status || "N/A"}
    </span>
  );
}

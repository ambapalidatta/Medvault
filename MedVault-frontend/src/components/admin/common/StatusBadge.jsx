const styles = {
  active: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  verified: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  approved: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  completed: "bg-blue-50 text-blue-700 ring-blue-200",
  pending: "bg-amber-50 text-amber-700 ring-amber-200",
  inactive: "bg-slate-50 text-slate-600 ring-slate-200",
  rejected: "bg-rose-50 text-rose-700 ring-rose-200",
  resolved: "bg-indigo-50 text-indigo-700 ring-indigo-200",
  default: "bg-slate-50 text-slate-600 ring-slate-200",
};

export default function StatusBadge({ value }) {
  const normalized = String(value || "pending").toLowerCase();
  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-black capitalize ring-1 ${styles[normalized] || styles.default}`}>
      {normalized}
    </span>
  );
}

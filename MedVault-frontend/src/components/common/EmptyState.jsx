export default function EmptyState({ icon = "fas fa-folder-open", title = "Nothing found", description = "There is no data to show right now.", className = "" }) {
  return (
    <div className={`rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm ${className}`}>
      <i className={`${icon} mb-4 text-4xl text-teal-300`} />
      <p className="font-bold text-slate-600">{title}</p>
      {description && <p className="mt-1 text-sm text-slate-400">{description}</p>}
    </div>
  );
}

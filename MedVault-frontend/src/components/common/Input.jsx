export default function Input({ label, error, className = "", id, ...props }) {
  const inputId = id || props.name || label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="space-y-2">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-bold text-slate-700">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-800 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 ${error ? "border-red-400 focus:border-red-500 focus:ring-red-500/20" : ""} ${className}`}
        {...props}
      />
      {error && <p className="text-sm font-semibold text-red-600">{error}</p>}
    </div>
  );
}

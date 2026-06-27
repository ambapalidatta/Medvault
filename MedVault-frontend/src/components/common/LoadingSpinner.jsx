export default function LoadingSpinner({ label = "Loading...", className = "" }) {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 py-12 text-slate-600 ${className}`}>
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-teal-100 border-t-teal-700" />
      <p className="text-sm font-bold">{label}</p>
    </div>
  );
}

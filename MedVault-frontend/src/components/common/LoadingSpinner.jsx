export default function LoadingSpinner({ message = "Loading...", className = "" }) {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 rounded-2xl bg-white/80 p-8 text-center ${className}`}>
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-teal-100 border-t-teal-700" />
      <p className="font-semibold text-slate-600">{message}</p>
    </div>
  );
}

export default function StatusMessage({ message }) {
  if (!message) return null;

  return (
    <div className="mb-6 rounded-xl border border-teal-200 bg-teal-50 px-4 py-3 text-center font-semibold text-teal-800 shadow-sm">
      {message}
    </div>
  );
}

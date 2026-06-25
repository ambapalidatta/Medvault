export default function ErrorState({ message = "Something went wrong.", className = "" }) {
  return (
    <div className={`rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700 ${className}`}>
      <div className="flex items-start gap-3">
        <i className="fas fa-triangle-exclamation mt-1 text-red-500" />
        <div>
          <p className="font-bold">Unable to complete request</p>
          <p className="mt-1 text-sm">{message}</p>
        </div>
      </div>
    </div>
  );
}

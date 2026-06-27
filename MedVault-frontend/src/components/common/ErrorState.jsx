import Button from "./Button.jsx";

export default function ErrorState({ title = "Something went wrong", message = "Please try again.", onRetry }) {
  return (
    <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
      <h3 className="text-lg font-extrabold text-red-800">{title}</h3>
      <p className="mt-2 text-sm font-semibold text-red-600">{message}</p>
      {onRetry && (
        <Button variant="danger" className="mt-4" onClick={onRetry}>
          Retry
        </Button>
      )}
    </div>
  );
}

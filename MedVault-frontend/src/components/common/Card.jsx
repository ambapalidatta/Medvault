export default function Card({ children, className = "", padded = true, ...props }) {
  return (
    <section
      className={`rounded-2xl border border-slate-200 bg-white shadow-sm ${padded ? "p-6" : ""} ${className}`}
      {...props}
    >
      {children}
    </section>
  );
}

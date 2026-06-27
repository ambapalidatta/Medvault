export default function Button({
  children,
  type = "button",
  variant = "primary",
  size = "md",
  className = "",
  disabled = false,
  loading = false,
  icon: Icon,
  ...props
}) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-xl font-bold transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60";

  const variants = {
    primary:
      "bg-gradient-to-r from-teal-700 to-indigo-800 text-white hover:shadow-lg hover:-translate-y-0.5 focus:ring-teal-600",
    secondary:
      "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 focus:ring-slate-400",
    danger:
      "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
    success:
      "bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-500",
    ghost:
      "bg-transparent text-slate-600 hover:bg-slate-100 focus:ring-slate-400",
    warning:
      "bg-orange-500 text-white hover:bg-orange-600 focus:ring-orange-500",
  };

  const sizes = {
    sm: "px-3 py-2 text-sm",
    md: "px-4 py-2.5 text-sm",
    lg: "px-6 py-3 text-base",
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`${base} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {loading ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : Icon ? (
        <Icon className="h-4 w-4" />
      ) : null}
      {children}
    </button>
  );
}

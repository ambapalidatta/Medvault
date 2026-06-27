export default function DoctorHeader({ title = "Doctor Workspace", subtitle = "Manage appointments, patient access, records, prescriptions and availability.", children }) {
  return (
    <header className="rounded-[2rem] bg-gradient-to-br from-indigo-900 via-teal-800 to-orange-500 p-6 text-white shadow-xl">
      <p className="text-sm font-bold uppercase tracking-[0.25em] text-teal-100">MedVault Doctor</p>
      <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold md:text-4xl">{title}</h1>
          <p className="mt-2 max-w-2xl text-white/75">{subtitle}</p>
        </div>
        {children && <div className="flex flex-wrap gap-3">{children}</div>}
      </div>
    </header>
  );
}

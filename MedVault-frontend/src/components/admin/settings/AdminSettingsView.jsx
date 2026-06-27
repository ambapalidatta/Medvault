function SettingToggle({ label, description, checked, onChange }) {
  return (
    <div className="flex items-center justify-between rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div>
        <p className="font-black text-slate-900">{label}</p>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>
      <button onClick={() => onChange(!checked)} className={`relative h-8 w-14 rounded-full transition ${checked ? "bg-indigo-600" : "bg-slate-300"}`}>
        <span className={`absolute top-1 h-6 w-6 rounded-full bg-white transition ${checked ? "left-7" : "left-1"}`} />
      </button>
    </div>
  );
}

export default function AdminSettingsView({ settings, onSettingChange }) {
  return (
    <section className="space-y-5">
      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-2xl font-black text-slate-900">Admin Settings</h2>
        <p className="text-sm text-slate-500">Configure dashboard behavior and notification preferences.</p>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <SettingToggle label="Email notifications" description="Receive important platform updates by email." checked={settings.emailNotifications} onChange={(value) => onSettingChange("emailNotifications", value)} />
        <SettingToggle label="SMS alerts" description="Enable SMS alerts for urgent events." checked={settings.smsAlerts} onChange={(value) => onSettingChange("smsAlerts", value)} />
        <SettingToggle label="Emergency alerts" description="Keep emergency request alerts enabled." checked={settings.emergencyAlerts} onChange={(value) => onSettingChange("emergencyAlerts", value)} />
        <SettingToggle label="Auto refresh" description="Refresh dashboard data every 30 seconds." checked={settings.autoRefresh} onChange={(value) => onSettingChange("autoRefresh", value)} />
        <SettingToggle label="Compact view" description="Use tighter spacing in admin tables." checked={settings.compactView} onChange={(value) => onSettingChange("compactView", value)} />
        <SettingToggle label="Dark mode" description="Toggle dark mode preference for admin." checked={settings.darkMode} onChange={(value) => onSettingChange("darkMode", value)} />
      </div>
    </section>
  );
}

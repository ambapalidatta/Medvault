const basicFields = ["firstName", "lastName"];

const detailFields = [
  "phone",
  "dateOfBirth",
  "bloodGroup",
  "address",
  "city",
  "state",
  "country",
  "postalCode",
  "emergencyContactName",
  "emergencyContactPhone",
];

function formatLabel(field) {
  return field.replace(/([A-Z])/g, " $1").trim();
}

export default function PatientProfileSection({
  profileData,
  setProfileData,
  isEditingProfile,
  setIsEditingProfile,
  onSave,
}) {
  const updateField = (field, value) => {
    setProfileData({
      ...profileData,
      [field]: value,
    });
  };

  return (
    <section className="animate-fade-in rounded-[2rem] border border-teal-100 bg-white p-8 shadow-xl shadow-slate-200/70">
      <div className="mb-8 flex flex-col gap-4 border-b border-slate-100 pb-5 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 text-teal-700">
            <i className="fas fa-user-circle text-3xl"></i>
          </div>
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-teal-700">
              Patient Profile
            </p>
            <h3 className="text-3xl font-extrabold text-slate-950">My Profile</h3>
          </div>
        </div>

        {!isEditingProfile ? (
          <button
            onClick={() => setIsEditingProfile(true)}
            className="rounded-full bg-teal-700 px-6 py-3 font-bold text-white transition hover:bg-teal-800"
          >
            <i className="fas fa-edit mr-2"></i>Edit Profile
          </button>
        ) : (
          <div className="flex flex-wrap gap-3">
            <button
              onClick={onSave}
              className="rounded-full bg-emerald-600 px-6 py-3 font-bold text-white transition hover:bg-emerald-700"
            >
              Save
            </button>
            <button
              onClick={() => setIsEditingProfile(false)}
              className="rounded-full bg-slate-700 px-6 py-3 font-bold text-white transition hover:bg-slate-900"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {basicFields.map((field) => (
          <div key={field}>
            <label className="mb-2 block text-sm font-bold capitalize text-slate-800">
              {formatLabel(field)}
            </label>
            <input
              type="text"
              value={profileData[field] || ""}
              disabled={!isEditingProfile}
              onChange={(event) => updateField(field, event.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100 disabled:bg-slate-100 disabled:text-slate-600"
            />
          </div>
        ))}

        <div>
          <label className="mb-2 block text-sm font-bold text-slate-800">Email</label>
          <input
            type="email"
            value={profileData.email || ""}
            disabled
            className="w-full rounded-2xl border border-slate-200 bg-slate-100 p-3 text-slate-600"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold text-slate-800">Gender</label>
          <select
            value={profileData.gender?.toLowerCase() || ""}
            disabled={!isEditingProfile}
            onChange={(event) => updateField("gender", event.target.value)}
            className="w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50 p-3 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100 disabled:bg-slate-100"
          >
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>

        {detailFields.map((field) => (
          <div key={field} className={field === "address" ? "md:col-span-2" : ""}>
            <label className="mb-2 block text-sm font-bold capitalize text-slate-800">
              {formatLabel(field)}
            </label>
            <input
              type={field.includes("date") ? "date" : "text"}
              value={profileData[field] || ""}
              disabled={!isEditingProfile}
              onChange={(event) => updateField(field, event.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100 disabled:bg-slate-100 disabled:text-slate-600"
            />
          </div>
        ))}
      </div>
    </section>
  );
}

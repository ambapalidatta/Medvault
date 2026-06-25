import { useEffect, useRef, useState } from "react";

export default function SearchableDoctorDropdown({
  doctors,
  selectedDoctorId,
  onSelectDoctor,
  loading = false,
  error = null,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const safeDoctors = Array.isArray(doctors) ? doctors : [];

  const filteredDoctors = safeDoctors.filter((doc) =>
    `${doc.firstName || ""} ${doc.lastName || ""} ${doc.specialization || ""}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase()),
  );

  const selectedDoctor = safeDoctors.find((doc) => doc.id === selectedDoctorId);

  const placeholder = loading
    ? "Loading doctors..."
    : error
      ? "Error loading doctors"
      : "Select Doctor...";

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputFocus = () => {
    if (loading || error) return;
    setIsOpen(true);
    setSearchTerm("");
  };

  const handleInputChange = (event) => {
    if (loading || error) return;
    setSearchTerm(event.target.value);
    if (!isOpen) setIsOpen(true);
  };

  const handleSelectDoctor = (doctor) => {
    onSelectDoctor(doctor.id);
    setSearchTerm("");
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div
        className={`w-full p-3 pl-3 pr-10 bg-white border rounded-lg focus:ring-2 focus:ring-brand-purple flex justify-between items-center cursor-pointer ${
          error ? "border-red-300 bg-red-50" : "border-gray-300"
        } ${loading ? "cursor-wait" : ""}`}
        onClick={handleInputFocus}
      >
        <span className={selectedDoctor ? "text-slate-800" : "text-slate-400"}>
          {selectedDoctor
            ? `Dr. ${selectedDoctor.firstName} ${selectedDoctor.lastName}`
            : placeholder}
        </span>

        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <i className="fas fa-chevron-down text-gray-400"></i>
        </div>
      </div>

      {isOpen && !loading && !error && (
        <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          <input
            type="text"
            className="w-full p-3 border-b border-gray-200 sticky top-0"
            placeholder="Search by name or specialty..."
            autoFocus
            value={searchTerm}
            onChange={handleInputChange}
          />

          {filteredDoctors.length > 0 ? (
            filteredDoctors.map((doctor) => (
              <div
                key={doctor.id}
                className="p-3 hover:bg-brand-lavender/30 cursor-pointer"
                onMouseDown={(event) => {
                  event.preventDefault();
                  handleSelectDoctor(doctor);
                }}
              >
                <div className="flex items-center gap-2">
                  <span>
                    Dr. {doctor.firstName} {doctor.lastName}
                  </span>
                  <span className="text-slate-500">({doctor.specialization})</span>
                  {(doctor.isVerified || doctor.verified) && (
                    <img
                      src="https://cdn-icons-png.flaticon.com/128/2143/2143150.png"
                      alt="Verified"
                      title="Verified"
                      className="w-5 h-5"
                    />
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="p-3 text-slate-500">No doctors found.</div>
          )}
        </div>
      )}

      {loading && (
        <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
          <i className="fas fa-spinner fa-spin text-brand-purple"></i>
        </div>
      )}

      {error && (
        <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
          <i className="fas fa-exclamation-triangle text-red-500"></i>
        </div>
      )}
    </div>
  );
}

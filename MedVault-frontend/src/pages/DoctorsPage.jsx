// --- DoctorCard Component ---
const DoctorCard = ({ doctor }) => (
  <div className="bg-white rounded-[1.75rem] shadow-sm p-6 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border border-teal-100">
    <img
      src={doctor.image}
      alt={doctor.name}
      className="w-32 h-32 rounded-full mx-auto object-cover mb-4 border-4 border-teal-50 shadow-md"
    />
    <h3 className="text-xl font-bold text-slate-950 text-center mt-4">
      {doctor.name}
    </h3>
    <p className="text-teal-800 font-semibold text-center">
      {doctor.specialization}
    </p>
    <p className="text-slate-600 text-center text-sm mb-4">
      {doctor.qualification}
    </p>
    <div className="space-y-2 mt-4">
      <p className="text-sm text-slate-600 flex items-center justify-center gap-2">
        <i className="fas fa-envelope text-teal-800"></i>
        {doctor.email}
      </p>
      <p className="text-sm text-slate-600 text-center italic mt-3">
        {doctor.description}
      </p>
    </div>
  </div>
);

// --- DoctorsPage Component ---
const DoctorsPage = ({ onBack }) => {
  const doctors = [
    {
      image:
        "https://i.pinimg.com/736x/f4/c9/ef/f4c9ef33d04a22050038e9e53eeb7d85.jpg",
      name: "Dr. John Smith",
      qualification: "MDS",
      specialization: "Dentist",
      email: "dr.john.smith@medvault.com",
      description:
        "A dedicated dentist with 2 years of experience, focusing on family and cosmetic dentistry.",
    },
    {
      image:
        "https://t4.ftcdn.net/jpg/03/20/74/45/240_F_320744517_TaGkT7aRlqqWdfGUuzRKDABtFEoN5CiO.jpg",
      name: "Dr. Asmi Sharma",
      qualification: "MBBS",
      specialization: "General Physician",
      email: "dr.asmi.sharma@medvault.com",
      description:
        "Experienced in providing comprehensive primary care for all ages. Committed to your health.",
    },
    {
      image:
        "https://i.pinimg.com/1200x/6c/59/95/6c599523460f54ddeba81f3cd689ae04.jpg",
      name: "Dr. Priya Sharma",
      qualification: "MD, MBBS",
      specialization: "General Physician",
      email: "dr.priya.sharma@medvault.com",
      description:
        "A compassionate general physician with over 12 years of experience in internal medicine.",
    },
    {
      image:
        "https://i.pinimg.com/736x/f6/2d/a3/f62da3aacbaf68f5a3853da5a20b3fb0.jpg",
      name: "Dr. Meera Patel",
      qualification: "MD Pediatrics",
      specialization: "Pediatrician",
      email: "dr.meera.patel@medvault.com",
      description:
        "Child health specialist with a gentle approach, caring for children from newborns to adolescents.",
    },
    {
      image:
        "https://i.pinimg.com/1200x/77/9f/23/779f23ae620f11a2fca378dcf3fe580d.jpg",
      name: "Dr. Amit Verma",
      qualification: "DM Cardiology",
      specialization: "Cardiologist",
      email: "dr.amit.verma@medvault.com",
      description:
        "Heart specialist with expertise in interventional cardiology and preventive cardiac care.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#f6fbf9]">
      <header className="bg-white/90 backdrop-blur-md shadow-sm border-b border-teal-100">
        <div className="container mx-auto p-4 flex items-center gap-4">
          <button
            onClick={onBack}
            className="text-slate-600 hover:text-teal-700"
          >
            <i className="fas fa-arrow-left text-xl"></i>
          </button>
          <h1 className="text-2xl font-extrabold text-teal-800 flex items-center">
            <i className="fas fa-user-md text-3xl mr-2"></i>Meet Our
            Professionals
          </h1>
        </div>
      </header>

      <main className="container mx-auto p-8">
        <h2 className="text-4xl font-bold text-slate-950 mb-8 text-center">
          Our Care Specialists
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {doctors.map((doctor, index) => (
            <DoctorCard key={index} doctor={doctor} />
          ))}
        </div>
      </main>
    </div>
  );
};

export default DoctorsPage;

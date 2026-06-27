import { API_BASE_URL, authFetch, safeFetch } from "./adminApi.js";

export const toArray = (value, keys = []) => {
  if (Array.isArray(value)) return value;
  for (const key of keys) {
    if (Array.isArray(value?.[key])) return value[key];
  }
  return [];
};

export const calculateAge = (dob) => {
  if (!dob) return "N/A";
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) age -= 1;
  return age;
};

export async function loadAdminCollections() {
  const [doctorsResult, patientsResult, appointmentsResult, emergencyResult, qualificationsResult, issuesResult, statsResult] = await Promise.all([
    safeFetch(`${API_BASE_URL}/admin/doctors`),
    safeFetch(`${API_BASE_URL}/admin/patients`),
    safeFetch(`${API_BASE_URL}/admin/appointments`),
    safeFetch(`${API_BASE_URL}/admin/emergency-requests`),
    safeFetch(`${API_BASE_URL}/admin/qualifications/all`),
    safeFetch(`${API_BASE_URL}/admin/issues`),
    safeFetch(`${API_BASE_URL}/admin/stats`),
  ]);

  const rawDoctors = doctorsResult.success ? toArray(doctorsResult.data, ["doctors", "data", "results"]) : [];
  const rawPatients = patientsResult.success ? toArray(patientsResult.data, ["patients", "data", "results"]) : [];
  const rawAppointments = appointmentsResult.success ? toArray(appointmentsResult.data, ["appointments", "data", "results"]) : [];
  const rawEmergencies = emergencyResult.success ? toArray(emergencyResult.data, ["emergencies", "data", "results"]) : [];
  const rawQualifications = qualificationsResult.success ? toArray(qualificationsResult.data, ["qualifications", "data", "results"]) : [];
  const rawIssues = issuesResult.success ? toArray(issuesResult.data, ["issues", "data", "results"]) : [];

  const doctors = await Promise.all(rawDoctors.map(async (doctor) => {
    const id = doctor.professionalId || doctor.doctorId || doctor.id;
    let rating = doctor.averageRating || doctor.rating || 0;
    let reviewCount = doctor.reviewCount || doctor.totalReviews || 0;

    try {
      const reviewsResponse = await authFetch(`${API_BASE_URL}/reviews/doctor/${id}`);
      if (reviewsResponse.ok) {
        const reviews = await reviewsResponse.json();
        if (reviews.length > 0) {
          const totalRating = reviews.reduce((sum, review) => sum + (review.rating || 0), 0);
          rating = (totalRating / reviews.length).toFixed(1);
          reviewCount = reviews.length;
        }
      }
    } catch {
      // Rating is non-blocking for dashboard load.
    }

    return {
      id,
      name: doctor.name || `Dr. ${doctor.firstName || ""} ${doctor.lastName || ""}`.trim(),
      email: doctor.email || doctor.user?.email || "N/A",
      specialization: doctor.specialization || "General",
      joinedDate: doctor.dateJoined ? new Date(doctor.dateJoined).toLocaleDateString() : "N/A",
      isVerified: doctor.isVerified || doctor.verified || false,
      qualifications: doctor.qualification || doctor.qualifications || "N/A",
      license: doctor.licenseNumber || doctor.professionalId || doctor.id || "N/A",
      phone: doctor.phone || doctor.phoneNumber || doctor.user?.phone || "N/A",
      experienceYears: doctor.experienceYears || doctor.experience || 0,
      consultationFee: doctor.consultationFee || doctor.fee || 500,
      rating,
      averageRating: rating,
      reviewCount,
      totalReviews: reviewCount,
      address: doctor.address || "N/A",
      city: doctor.city || "N/A",
      state: doctor.state || "N/A",
      hospitalAffiliation: doctor.hospitalAffiliation || "N/A",
    };
  }));

  const patients = rawPatients.map((patient) => ({
    id: patient.patientId || patient.id,
    name: patient.name || `${patient.firstName || ""} ${patient.lastName || ""}`.trim(),
    email: patient.email || patient.user?.email || "N/A",
    joinedDate: patient.dateJoined || patient.createdAt ? new Date(patient.dateJoined || patient.createdAt).toLocaleDateString() : "N/A",
    age: patient.age || calculateAge(patient.dateOfBirth),
    gender: patient.gender || "N/A",
    dateOfBirth: patient.dateOfBirth ? new Date(patient.dateOfBirth).toLocaleDateString() : "N/A",
    bloodGroup: patient.bloodGroup || patient.bloodType || "N/A",
    phone: patient.phone || patient.phoneNumber || "N/A",
    address: patient.address || "N/A",
    city: patient.city || "N/A",
    state: patient.state || "N/A",
    postalCode: patient.postalCode || "N/A",
    emergencyContactName: patient.emergencyContactName || "N/A",
    emergencyContactPhone: patient.emergencyContactPhone || "N/A",
    status: patient.status || (patient.isActive ? "active" : "inactive"),
    totalAppointments: patient.totalAppointments || 0,
    completedAppointments: patient.completedAppointments || 0,
    upcomingAppointments: patient.upcomingAppointments || 0,
    totalRecords: patient.totalRecords || 0,
    totalConditions: patient.totalConditions || 0,
  }));

  const appointments = rawAppointments.map((appointment) => ({
    id: appointment.appointmentId || appointment.id,
    patientName: appointment.patientName || (appointment.patient ? `${appointment.patient.firstName || ""} ${appointment.patient.lastName || ""}`.trim() : "N/A"),
    doctorName: appointment.doctorName || (appointment.doctor ? `Dr. ${appointment.doctor.firstName || ""} ${appointment.doctor.lastName || ""}`.trim() : "N/A"),
    doctorId: appointment.doctor?.professionalId || appointment.doctor?.id || appointment.doctorId,
    date: appointment.appointmentDate || appointment.appointmentDateTime || appointment.date ? new Date(appointment.appointmentDate || appointment.appointmentDateTime || appointment.date).toLocaleDateString() : "N/A",
    time: appointment.appointmentTime || appointment.time || (appointment.appointmentDateTime ? new Date(appointment.appointmentDateTime).toLocaleTimeString() : "N/A"),
    status: String(appointment.status || "pending").toLowerCase(),
    type: appointment.type || appointment.appointmentType || "REGULAR",
    reason: appointment.reason || "Regular Checkup",
    consultationFee: appointment.consultationFee || appointment.doctor?.consultationFee || 500,
    feedback: appointment.feedback || null,
    rating: appointment.rating || null,
  }));

  const emergencies = rawEmergencies.map((item) => ({
    id: item.requestId || item.emergencyId || item.id,
    patientName: item.patientName || (item.patient ? `${item.patient.firstName || ""} ${item.patient.lastName || ""}`.trim() : "N/A"),
    doctorName: item.doctorName || (item.doctor ? `Dr. ${item.doctor.firstName || ""} ${item.doctor.lastName || ""}`.trim() : "N/A"),
    doctorId: item.doctorId || item.doctor?.professionalId,
    requestTime: item.requestDateTime || item.requestTime || item.createdAt ? new Date(item.requestDateTime || item.requestTime || item.createdAt).toLocaleString() : "N/A",
    requestDateTime: item.requestDateTime || item.requestTime || item.createdAt,
    severity: item.severity || item.urgencyLevel || "medium",
    status: item.status || "active",
    reason: item.reason || item.conditionDescription || item.description || "N/A",
    patientAddress: item.patientAddress || item.currentLocation || "N/A",
    consultationFee: item.consultationFee,
  }));

  const documents = rawQualifications.map((qualification) => {
    const isVerified = qualification.isVerified || qualification.verified || qualification.verificationStatus === "APPROVED";
    return {
      id: qualification.qualificationId || qualification.id,
      doctorId: qualification.doctorId || qualification.doctor?.professionalId,
      doctorName: qualification.doctorName || (qualification.doctor ? `Dr. ${qualification.doctor.firstName || ""} ${qualification.doctor.lastName || ""}`.trim() : "Unknown Doctor"),
      doctorEmail: qualification.doctorEmail || qualification.doctor?.email || "N/A",
      specialization: qualification.specialization || qualification.doctor?.specialization || "N/A",
      documentType: qualification.documentType || qualification.qualificationType || qualification.type || "Certificate",
      documentName: qualification.documentName || qualification.degreeName || qualification.name || "Qualification Document",
      uploadedDate: qualification.uploadedAt || qualification.createdAt || qualification.uploadDate ? new Date(qualification.uploadedAt || qualification.createdAt || qualification.uploadDate).toLocaleDateString() : "N/A",
      status: isVerified ? "verified" : "pending",
      isVerified,
      documentPath: qualification.documentPath || qualification.filePath || qualification.fileUrl,
      verificationStatus: qualification.verificationStatus || (isVerified ? "APPROVED" : "PENDING"),
    };
  });

  const issues = rawIssues.map((issue) => ({
    id: issue.issueId || issue.issue_id || issue.id,
    name: issue.name || "N/A",
    email: issue.email || "N/A",
    phone: issue.phoneNumber || issue.phone_number || issue.phone || "N/A",
    message: issue.message || "N/A",
    subject: issue.subject || "General Issue",
    status: issue.status || "pending",
    adminMessage: issue.adminMessage || issue.admin_message || null,
    userId: issue.userId || issue.user_id || null,
    userType: issue.userType || issue.user_type || null,
    createdAt: issue.createdAt || issue.created_at ? new Date(issue.createdAt || issue.created_at).toLocaleString() : "N/A",
  }));

  const calculatedStats = {
    totalUsers: patients.length + doctors.length,
    totalPatients: patients.length,
    totalDoctors: doctors.length,
    verifiedDoctors: doctors.filter((doctor) => doctor.isVerified).length,
    pendingDoctors: doctors.filter((doctor) => !doctor.isVerified).length,
    totalAppointments: appointments.length,
    pendingAppointments: appointments.filter((appointment) => appointment.status === "pending").length,
    completedAppointments: appointments.filter((appointment) => appointment.status === "completed").length,
    emergencyRequests: emergencies.filter((item) => String(item.status || "").toUpperCase() !== "COMPLETED").length,
    pendingDocuments: documents.filter((doc) => !doc.isVerified).length,
    verifiedDocuments: documents.filter((doc) => doc.isVerified).length,
    activeUsers: patients.length + doctors.length,
  };

  const backendStats = statsResult.success ? statsResult.data : {};

  return {
    doctors,
    patients,
    appointments,
    emergencies,
    documents,
    issues,
    stats: { ...calculatedStats, ...backendStats },
  };
}

export async function verifyDoctor(doctorId) {
  return authFetch(`${API_BASE_URL}/admin/doctors/${doctorId}/verify`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
  });
}

export async function verifyDocument(documentId) {
  return authFetch(`${API_BASE_URL}/admin/doctors/qualifications/${documentId}/verify`, {
    method: "PUT",
  });
}

export async function remindEmergencyDoctor(emergencyId) {
  return authFetch(`${API_BASE_URL}/admin/emergency-requests/${emergencyId}/remind`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
}

export async function resolveIssue(issueId, adminMessage) {
  return authFetch(`${API_BASE_URL}/admin/issues/${issueId}/status`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status: "resolved", adminMessage }),
  });
}

export async function fetchNotifications(userId) {
  const response = await authFetch(`${API_BASE_URL}/notifications/user/${userId}`);
  if (!response.ok) return [];
  return response.json();
}

export async function markNotificationRead(notificationId) {
  return authFetch(`${API_BASE_URL}/notifications/${notificationId}/read`, { method: "PUT" });
}

export async function markAllNotificationsRead(userId) {
  return authFetch(`${API_BASE_URL}/notifications/user/${userId}/read-all`, { method: "PUT" });
}

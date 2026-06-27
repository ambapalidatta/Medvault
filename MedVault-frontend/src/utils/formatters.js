export function formatDate(value, fallback = "N/A") {
  if (!value) return fallback;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return fallback;
  return date.toLocaleDateString();
}

export function formatDateTime(value, fallback = "N/A") {
  if (!value) return fallback;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return fallback;
  return date.toLocaleString();
}

export function formatCurrency(value, fallback = "₹0") {
  const number = Number(value);
  if (Number.isNaN(number)) return fallback;
  return `₹${number.toLocaleString("en-IN")}`;
}

export function calculateAge(dateOfBirth, fallback = "N/A") {
  if (!dateOfBirth) return fallback;
  const birthDate = new Date(dateOfBirth);
  if (Number.isNaN(birthDate.getTime())) return fallback;

  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age -= 1;
  }

  return age;
}

export function fullName(firstName, lastName, fallback = "N/A") {
  const name = `${firstName || ""} ${lastName || ""}`.trim();
  return name || fallback;
}

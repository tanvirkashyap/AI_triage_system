const BASE_URL = "http://localhost:8000";

export async function predictPatient(patientData) {
  const response = await fetch(`${BASE_URL}/predict`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patientData),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Prediction failed");
  }
  return response.json();
}

export async function getAllPatients() {
  const response = await fetch(`${BASE_URL}/patients`);
  if (!response.ok) throw new Error("Failed to fetch patients");
  return response.json();
}

export async function getDashboardStats() {
  const response = await fetch(`${BASE_URL}/dashboard`);
  if (!response.ok) throw new Error("Failed to fetch dashboard stats");
  return response.json();
}

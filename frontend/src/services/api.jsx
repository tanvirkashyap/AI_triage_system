const BASE_URL = " http://127.0.0.1:8000";

export async function admitPatient(patientData) {
  const response = await fetch(`${BASE_URL}/patients/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patientData),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Admission failed");
  }
  return response.json();
}

export async function getQueue() {
  const response = await fetch(`${BASE_URL}/patients/queue`);
  if (!response.ok) throw new Error("Failed to fetch queue");
  return response.json();
}

export async function dischargePatient(patientId) {
  await fetch(`${BASE_URL}/patients/${patientId}`, { method: "DELETE" });
}

export async function getOverflow() {
  const response = await fetch(`${BASE_URL}/patients/overflow`);
  if (!response.ok) throw new Error("Failed to fetch overflow status");
  return response.json();
}

export async function getResources() {
  const response = await fetch(`${BASE_URL}/patients/resources`);
  if (!response.ok) throw new Error("Failed to fetch resources");
  return response.json();
}
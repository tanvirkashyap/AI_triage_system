const BASE = "http://localhost:8000";

export async function admitPatient(data) {
  const res = await fetch(`${BASE}/patients/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Request failed");
  }
  return res.json();
}

export async function getQueue() {
  const res = await fetch(`${BASE}/patients/queue`);
  if (!res.ok) throw new Error("Failed to fetch queue");
  return res.json();
}

export async function getResources() {
  const res = await fetch(`${BASE}/patients/resources`);
  if (!res.ok) throw new Error("Failed to fetch resources");
  return res.json();
}

export async function checkOverflow() {
  const res = await fetch(`${BASE}/patients/overflow`);
  if (!res.ok) throw new Error("Failed to check overflow");
  return res.json();
}

export async function getPatient(patientId) {
  const res = await fetch(`${BASE}/patients/${patientId}`);
  if (!res.ok) throw new Error("Failed to fetch patient");
  return res.json();
}

export async function updateResources(resources) {
  const res = await fetch(`${BASE}/patients/resources`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(resources),
  });

  if (!res.ok) throw new Error("Failed to update resources");
  return res.json();
}

export async function dischargePatient(patientId) {
  const res = await fetch(`${BASE}/patients/${patientId}`, {
    method: "DELETE",
  });

  if (!res.ok) throw new Error("Failed to discharge patient");
}

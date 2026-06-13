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

import { useState, useEffect } from "react";
import { getQueue } from "../services/api";

const SEV_COLORS = {
  critical: "#dc2626", severe: "#dc2626",
  moderate: "#d97706", high: "#d97706",
  mild: "#1d4ed8",     medium: "#1d4ed8",
  low: "#15803d",      stable: "#15803d",
};

export default function Dashboard() {
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState(null);

  const load = async () => {
    setLoading(true); setError(null);
    try {
      const res = await getQueue();
      setData(res);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const queue = data?.queue || [];
  const total = data?.total_patients || 0;
  const resources = data?.resources || {};

  const dist = { critical: 0, severe: 0, moderate: 0, mild: 0 };
  queue.forEach((r) => {
    const s = r.result?.severity?.toLowerCase();
    if (dist[s] !== undefined) dist[s]++;
  });

  const icuUsed = queue.filter((r) => r.allocated_resource).length;
  const avgScore = queue.length
    ? (queue.reduce((s, r) => s + (r.result?.score || 0), 0) / queue.length).toFixed(2)
    : "0.00";

  const topCritical = [...queue]
    .sort((a, b) => (b.result?.score ?? 0) - (a.result?.score ?? 0))
    .slice(0, 3);

  const sevGroups = [
    { key: "critical", label: "Critical", color: "#dc2626" },
    { key: "severe",   label: "Severe",   color: "#dc2626" },
    { key: "moderate", label: "Moderate", color: "#d97706" },
    { key: "mild",     label: "Mild",     color: "#1d4ed8" },
  ];

  return (
    <div className="card">
      <div className="card-head">
        <div>
          <div className="card-title">Dashboard</div>
          <div className="card-sub">Real-time patient criticality overview</div>
        </div>
        <button className="btn-ghost-dark" onClick={load}>↻ Refresh</button>
      </div>

      {loading && <div className="empty">Loading...</div>}
      {error   && <div className="err">⚠ {error}</div>}

      {!loading && !error && (
        <>
          <div className="stats">
            <div className="stat">
              <div className="stat-label">Total patients</div>
              <div className="stat-value">{total}</div>
            </div>
            <div className="stat">
              <div className="stat-label">Critical / Severe</div>
              <div className="stat-value" style={{ color: "#dc2626" }}>
                {(dist.critical || 0) + (dist.severe || 0)}
              </div>
            </div>
            <div className="stat">
              <div className="stat-label">ICU allocated</div>
              <div className="stat-value" style={{ color: "#0f4c81" }}>{icuUsed}</div>
            </div>
            <div className="stat">
              <div className="stat-label">Avg. score</div>
              <div className="stat-value">{avgScore}</div>
            </div>
          </div>

          <div className="two-col">
            <div className="col">
              <div className="section-title">Severity distribution</div>
              {sevGroups.map(({ key, label, color }) => {
                const count = dist[key] || 0;
                const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                return (
                  <div className="sev-row" key={key}>
                    <span className="sev-name">{label}</span>
                    <div className="sev-track">
                      <div className="sev-fill" style={{ width: `${pct}%`, background: color }} />
                    </div>
                    <span className="sev-count">{count}</span>
                    <span className="sev-pct">{pct}%</span>
                  </div>
                );
              })}

              <div style={{ marginTop: 16, paddingTop: 14, borderTop: "1px solid #f0f2f5" }}>
                <div className="section-title">Resources available</div>
                <div style={{ display: "flex", gap: 16, fontSize: 12 }}>
                  <div>
                    <div style={{ color: "#b0b8c1", fontSize: 10, textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 3 }}>ICU beds</div>
                    <div style={{ fontWeight: 500, color: "#0f4c81" }}>{resources.icu_beds ?? "—"}</div>
                  </div>
                  <div>
                    <div style={{ color: "#b0b8c1", fontSize: 10, textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 3 }}>Staff</div>
                    <div style={{ fontWeight: 500 }}>{resources.emergency_staff ?? "—"}</div>
                  </div>
                  <div>
                    <div style={{ color: "#b0b8c1", fontSize: 10, textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 3 }}>Ventilators</div>
                    <div style={{ fontWeight: 500 }}>{resources.ventilators ?? "—"}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col">
              <div className="section-title">Top priority patients</div>
              {topCritical.length === 0 && (
                <div style={{ fontSize: 12, color: "#9aa0a8" }}>No patients yet.</div>
              )}
              {topCritical.map((r) => {
                const p = r.patient || {};
                const res = r.result || {};
                const color = SEV_COLORS[res.severity?.toLowerCase()] || "#9aa0a8";
                return (
                  <div className="crit-row" key={p.patient_id}>
                    <span className="crit-id">{p.patient_id}</span>
                    <div className="crit-vitals">
                      <span>{p.name}</span>
                      <span>{p.age}y</span>
                      <span>HR {p.heart_rate}</span>
                    </div>
                    <span className="crit-score" style={{ color }}>{res.score?.toFixed(2)}</span>
                    {r.allocated_resource && (
                      <span className="crit-icu">{r.allocated_resource}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="foot">Last updated: {new Date().toLocaleTimeString()}</div>
        </>
      )}
    </div>
  );
}

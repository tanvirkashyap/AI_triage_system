import { useState, useEffect } from "react";
import { getQueue } from "../services/api";

const barColor = (s) => s >= 0.75 ? "#dc2626" : s >= 0.5 ? "#d97706" : s >= 0.25 ? "#1d4ed8" : "#15803d";

const badge = (sev) => {
  const s = sev?.toLowerCase();
  if (s === "critical" || s === "severe") return "badge badge-critical";
  if (s === "high" || s === "moderate")   return "badge badge-high";
  if (s === "medium" || s === "mild")     return "badge badge-medium";
  return "badge badge-low";
};

export default function PatientList() {
  const [rows, setRows]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [sort, setSort]       = useState("score");
  const [filter, setFilter]   = useState("ALL");

  const load = async () => {
    setLoading(true); setError(null);
    try {
      const res = await getQueue();
      setRows(res.queue || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = rows
    .filter((r) => filter === "ALL" || r.result?.severity?.toUpperCase() === filter)
    .sort((a, b) => {
      if (sort === "score") return (b.result?.score ?? 0) - (a.result?.score ?? 0);
      if (sort === "age")   return (b.patient?.age ?? 0) - (a.patient?.age ?? 0);
      return (a.patient?.patient_id ?? "").localeCompare(b.patient?.patient_id ?? "");
    });

  return (
    <div className="card">
      <div className="queue-toolbar">
        <div className="queue-title-row">
          <span className="queue-title">Patient queue</span>
          <span className="queue-count">{filtered.length} patients</span>
        </div>
        <div className="queue-controls">
          Filter
          <select className="queue-select" value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="ALL">All</option>
            <option value="CRITICAL">Critical</option>
            <option value="SEVERE">Severe</option>
            <option value="MODERATE">Moderate</option>
            <option value="MILD">Mild</option>
          </select>
          Sort
          <select className="queue-select" value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="score">By score</option>
            <option value="age">By age</option>
            <option value="id">By ID</option>
          </select>
          <button className="btn-ghost-dark" onClick={load}>↻</button>
        </div>
      </div>

      {loading && <div className="empty">Loading...</div>}
      {error   && <div className="err">⚠ {error}</div>}
      {!loading && !error && filtered.length === 0 && (
        <div className="empty">No patients in queue.</div>
      )}

      {!loading && !error && filtered.length > 0 && (
        <div style={{ overflowX: "auto" }}>
          <table className="qtable">
            <thead>
              <tr>
                <th style={{ width: 36 }}>#</th>
                <th style={{ width: 80 }}>ID</th>
                <th style={{ width: 100 }}>Name</th>
                <th style={{ width: 44 }}>Age</th>
                <th style={{ width: 72 }}>HR</th>
                <th style={{ width: 60 }}>SpO₂</th>
                <th style={{ width: 52 }}>Pain</th>
                <th>Score</th>
                <th style={{ width: 96 }}>Severity</th>
                <th style={{ width: 100 }}>Resource</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, i) => {
                const p = r.patient || {};
                const res = r.result || {};
                const isCrit = ["critical","severe"].includes(res.severity?.toLowerCase());
                return (
                  <tr key={p.patient_id} className={isCrit ? "row-crit" : ""}>
                    <td style={{ color: "#b0b8c1" }}>{i + 1}</td>
                    <td className="mono" style={{ fontWeight: 500 }}>{p.patient_id}</td>
                    <td style={{ color: "#333" }}>{p.name}</td>
                    <td>{p.age}</td>
                    <td>{p.heart_rate} <span className="unit">bpm</span></td>
                    <td>{p.spo2}<span className="unit">%</span></td>
                    <td>{p.pain ?? "—"}/10</td>
                    <td>
                      <div className="bar-wrap">
                        <div className="bar-track">
                          <div className="bar-fill" style={{ width: `${Math.min(100, (res.score ?? 0) * 100)}%`, background: barColor(res.score) }} />
                        </div>
                        <span className="bar-val">{res.score?.toFixed(2) ?? "—"}</span>
                      </div>
                    </td>
                    <td><span className={badge(res.severity)}>{res.severity}</span></td>
                    <td style={{ fontSize: 11, color: "#0f4c81", fontWeight: 500 }}>{r.allocated_resource ?? "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

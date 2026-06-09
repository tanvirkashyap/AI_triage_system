import { useState, useEffect } from "react";
import { getAllPatients } from "../services/api";

const severityMeta = {
  CRITICAL: { color: "#A32D2D", bg: "#FCEBEB", dot: "#E24B4A" },
  HIGH:     { color: "#854F0B", bg: "#FAEEDA", dot: "#EF9F27" },
  MEDIUM:   { color: "#185FA5", bg: "#E6F1FB", dot: "#378ADD" },
  LOW:      { color: "#3B6D11", bg: "#EAF3DE", dot: "#639922" },
};

function SeverityBadge({ severity }) {
  const meta = severityMeta[severity] || severityMeta.LOW;
  return (
    <span style={{
      background: meta.bg,
      color: meta.color,
      fontSize: "11px",
      fontWeight: 500,
      padding: "3px 9px",
      borderRadius: "6px",
      textTransform: "uppercase",
      letterSpacing: "0.04em",
    }}>
      {severity}
    </span>
  );
}

function ScoreBar({ score, max = 100 }) {
  const pct = Math.min(100, Math.round((score / max) * 100));
  let barColor = "#639922";
  if (score >= 75) barColor = "#E24B4A";
  else if (score >= 50) barColor = "#EF9F27";
  else if (score >= 25) barColor = "#378ADD";

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{
        flex: 1,
        height: 6,
        background: "var(--color-border-tertiary)",
        borderRadius: 3,
        overflow: "hidden",
      }}>
        <div style={{
          width: `${pct}%`,
          height: "100%",
          background: barColor,
          borderRadius: 3,
          transition: "width 0.4s ease",
        }} />
      </div>
      <span style={{ fontSize: 13, fontWeight: 500, minWidth: 36, color: "var(--color-text-primary)" }}>
        {score?.toFixed(1) ?? "—"}
      </span>
    </div>
  );
}

export default function PatientList({ refreshTrigger }) {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState("score");
  const [filterSeverity, setFilterSeverity] = useState("ALL");

  const fetchPatients = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllPatients();
      setPatients(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, [refreshTrigger]);

  const filtered = patients
    .filter((p) => filterSeverity === "ALL" || p.severity === filterSeverity)
    .sort((a, b) => {
      if (sortBy === "score") return (b.score ?? 0) - (a.score ?? 0);
      if (sortBy === "id") return a.patient_id.localeCompare(b.patient_id);
      if (sortBy === "age") return b.age - a.age;
      return 0;
    });

  return (
    <div className="pl-wrap">
      <div className="pl-toolbar">
        <div className="pl-title-row">
          <h2 className="pl-title">Patient Queue</h2>
          <span className="pl-count">{filtered.length} patients</span>
        </div>
        <div className="pl-controls">
          <div className="pl-control-group">
            <label className="pl-ctrl-label">Filter</label>
            <select className="pl-select" value={filterSeverity} onChange={(e) => setFilterSeverity(e.target.value)}>
              <option value="ALL">All severities</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>
          <div className="pl-control-group">
            <label className="pl-ctrl-label">Sort</label>
            <select className="pl-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="score">By score</option>
              <option value="age">By age</option>
              <option value="id">By ID</option>
            </select>
          </div>
          <button className="pl-refresh" onClick={fetchPatients} title="Refresh">↻</button>
        </div>
      </div>

      {loading && (
        <div className="pl-state">Loading patients...</div>
      )}
      {error && (
        <div className="pl-state pl-error">⚠ {error}</div>
      )}
      {!loading && !error && filtered.length === 0 && (
        <div className="pl-state">No patients found.</div>
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className="pl-table-wrap">
          <table className="pl-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Patient ID</th>
                <th>Age</th>
                <th>HR</th>
                <th>SpO₂</th>
                <th>Pain</th>
                <th>Score</th>
                <th>Severity</th>
                <th>ICU</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, idx) => (
                <tr key={p.patient_id} className={`pl-row ${p.severity === "CRITICAL" ? "pl-row-critical" : ""}`}>
                  <td className="pl-rank">#{idx + 1}</td>
                  <td className="pl-pid">{p.patient_id}</td>
                  <td>{p.age}</td>
                  <td>{p.heart_rate} <span className="pl-unit">bpm</span></td>
                  <td>{p.spo2}<span className="pl-unit">%</span></td>
                  <td>{p.pain_level}/10</td>
                  <td className="pl-score-cell">
                    <ScoreBar score={p.score} />
                  </td>
                  <td><SeverityBadge severity={p.severity} /></td>
                  <td>{p.icu_allocated
                    ? <span className="pl-icu-yes">✓</span>
                    : <span className="pl-icu-no">—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <style>{`
        .pl-wrap {
          background: var(--color-background-primary);
          border: 0.5px solid var(--color-border-tertiary);
          border-radius: var(--border-radius-lg);
          overflow: hidden;
        }
        .pl-toolbar {
          padding: 1rem 1.25rem;
          border-bottom: 0.5px solid var(--color-border-tertiary);
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
        }
        .pl-title-row { display: flex; align-items: baseline; gap: 10px; }
        .pl-title { font-size: 18px; font-weight: 500; margin: 0; color: var(--color-text-primary); }
        .pl-count { font-size: 13px; color: var(--color-text-tertiary); }
        .pl-controls { display: flex; align-items: center; gap: 10px; }
        .pl-control-group { display: flex; align-items: center; gap: 6px; }
        .pl-ctrl-label { font-size: 12px; color: var(--color-text-secondary); }
        .pl-select {
          font-size: 13px;
          padding: 5px 8px;
          border: 0.5px solid var(--color-border-secondary);
          border-radius: var(--border-radius-md);
          background: var(--color-background-secondary);
          color: var(--color-text-primary);
        }
        .pl-refresh {
          font-size: 16px;
          width: 30px;
          height: 30px;
          border: 0.5px solid var(--color-border-secondary);
          border-radius: var(--border-radius-md);
          background: transparent;
          cursor: pointer;
          color: var(--color-text-secondary);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .pl-state {
          padding: 2rem;
          text-align: center;
          font-size: 14px;
          color: var(--color-text-secondary);
        }
        .pl-error { color: var(--color-text-danger); }
        .pl-table-wrap { overflow-x: auto; }
        .pl-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 13px;
          color: var(--color-text-primary);
        }
        .pl-table thead th {
          text-align: left;
          padding: 10px 12px;
          font-size: 11px;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--color-text-secondary);
          border-bottom: 0.5px solid var(--color-border-tertiary);
          background: var(--color-background-secondary);
          white-space: nowrap;
        }
        .pl-table tbody td {
          padding: 10px 12px;
          border-bottom: 0.5px solid var(--color-border-tertiary);
          vertical-align: middle;
        }
        .pl-row:last-child td { border-bottom: none; }
        .pl-row-critical { background: #FFF5F5; }
        .pl-row:hover { background: var(--color-background-secondary); }
        .pl-rank { font-weight: 500; color: var(--color-text-secondary); }
        .pl-pid { font-weight: 500; font-family: var(--font-mono); }
        .pl-unit { font-size: 11px; color: var(--color-text-tertiary); }
        .pl-score-cell { min-width: 120px; }
        .pl-icu-yes { color: #3B6D11; font-weight: 500; }
        .pl-icu-no { color: var(--color-text-tertiary); }
      `}</style>
    </div>
  );
}

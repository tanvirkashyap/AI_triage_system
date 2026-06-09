import { useState, useEffect } from "react";
import { getDashboardStats } from "../services/api";

const statCards = [
  { key: "total_patients",   label: "Total Patients",  icon: "👥", color: "#185FA5" },
  { key: "critical_count",   label: "Critical",        icon: "🔴", color: "#A32D2D" },
  { key: "icu_allocated",    label: "ICU Allocated",   icon: "🏥", color: "#854F0B" },
  { key: "avg_score",        label: "Avg. Score",      icon: "📊", color: "#3B6D11" },
];

const severityColors = {
  CRITICAL: "#E24B4A",
  HIGH:     "#EF9F27",
  MEDIUM:   "#378ADD",
  LOW:      "#639922",
};

function StatCard({ icon, label, value, color }) {
  return (
    <div className="db-stat">
      <div className="db-stat-top">
        <span className="db-stat-icon">{icon}</span>
        <span className="db-stat-label">{label}</span>
      </div>
      <span className="db-stat-value" style={{ color }}>{value ?? "—"}</span>
    </div>
  );
}

function SeverityBar({ label, count, total }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  const color = severityColors[label] || "#888";
  return (
    <div className="db-sev-row">
      <span className="db-sev-label">{label}</span>
      <div className="db-sev-track">
        <div className="db-sev-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="db-sev-count">{count}</span>
      <span className="db-sev-pct">{pct}%</span>
    </div>
  );
}

export default function Dashboard({ refreshTrigger }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getDashboardStats();
      setStats(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [refreshTrigger]);

  const severityDist = stats?.severity_distribution || {};
  const total = stats?.total_patients || 0;

  return (
    <div className="db-wrap">
      <div className="db-header">
        <div>
          <h2 className="db-title">AI Triage Dashboard</h2>
          <p className="db-subtitle">Real-time patient criticality overview</p>
        </div>
        <button className="db-refresh" onClick={fetchStats} title="Refresh dashboard">
          ↻ Refresh
        </button>
      </div>

      {loading && <div className="db-state">Loading dashboard...</div>}
      {error && <div className="db-state db-error">⚠ {error}</div>}

      {!loading && !error && stats && (
        <>
          <div className="db-stats-grid">
            {statCards.map(({ key, label, icon, color }) => (
              <StatCard
                key={key}
                icon={icon}
                label={label}
                color={color}
                value={
                  key === "avg_score"
                    ? stats[key]?.toFixed(1)
                    : stats[key]
                }
              />
            ))}
          </div>

          <div className="db-section">
            <h3 className="db-section-title">Severity Distribution</h3>
            <div className="db-sev-list">
              {["CRITICAL", "HIGH", "MEDIUM", "LOW"].map((sev) => (
                <SeverityBar
                  key={sev}
                  label={sev}
                  count={severityDist[sev] || 0}
                  total={total}
                />
              ))}
            </div>
          </div>

          {stats.top_critical?.length > 0 && (
            <div className="db-section">
              <h3 className="db-section-title">Top Critical Patients</h3>
              <div className="db-critical-list">
                {stats.top_critical.map((p) => (
                  <div key={p.patient_id} className="db-critical-row">
                    <span className="db-critical-id">{p.patient_id}</span>
                    <div className="db-critical-info">
                      <span>Age {p.age}</span>
                      <span>HR {p.heart_rate}</span>
                      <span>SpO₂ {p.spo2}%</span>
                    </div>
                    <span className="db-critical-score" style={{ color: "#A32D2D" }}>
                      {p.score?.toFixed(1)}
                    </span>
                    {p.icu_allocated && (
                      <span className="db-critical-icu">ICU</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="db-footer">
            Last updated: {new Date().toLocaleTimeString()}
          </div>
        </>
      )}

      <style>{`
        .db-wrap {
          background: var(--color-background-primary);
          border: 0.5px solid var(--color-border-tertiary);
          border-radius: var(--border-radius-lg);
          overflow: hidden;
        }
        .db-header {
          padding: 1rem 1.25rem;
          border-bottom: 0.5px solid var(--color-border-tertiary);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .db-title { font-size: 18px; font-weight: 500; margin: 0; color: var(--color-text-primary); }
        .db-subtitle { font-size: 13px; color: var(--color-text-secondary); margin: 2px 0 0; }
        .db-refresh {
          font-size: 13px;
          padding: 6px 12px;
          border: 0.5px solid var(--color-border-secondary);
          border-radius: var(--border-radius-md);
          background: transparent;
          cursor: pointer;
          color: var(--color-text-secondary);
        }
        .db-state {
          padding: 2rem;
          text-align: center;
          font-size: 14px;
          color: var(--color-text-secondary);
        }
        .db-error { color: var(--color-text-danger); }
        .db-stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          gap: 0;
          border-bottom: 0.5px solid var(--color-border-tertiary);
        }
        .db-stat {
          padding: 1rem 1.25rem;
          border-right: 0.5px solid var(--color-border-tertiary);
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .db-stat:last-child { border-right: none; }
        .db-stat-top { display: flex; align-items: center; gap: 6px; }
        .db-stat-icon { font-size: 16px; }
        .db-stat-label { font-size: 12px; color: var(--color-text-secondary); }
        .db-stat-value { font-size: 28px; font-weight: 500; line-height: 1; }
        .db-section {
          padding: 1rem 1.25rem;
          border-bottom: 0.5px solid var(--color-border-tertiary);
        }
        .db-section-title {
          font-size: 13px;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--color-text-secondary);
          margin: 0 0 12px;
        }
        .db-sev-list { display: flex; flex-direction: column; gap: 8px; }
        .db-sev-row { display: flex; align-items: center; gap: 10px; }
        .db-sev-label { font-size: 12px; font-weight: 500; width: 70px; color: var(--color-text-primary); }
        .db-sev-track {
          flex: 1;
          height: 8px;
          background: var(--color-background-tertiary);
          border-radius: 4px;
          overflow: hidden;
        }
        .db-sev-fill { height: 100%; border-radius: 4px; transition: width 0.4s ease; }
        .db-sev-count { font-size: 13px; font-weight: 500; width: 24px; text-align: right; color: var(--color-text-primary); }
        .db-sev-pct { font-size: 12px; color: var(--color-text-tertiary); width: 36px; text-align: right; }
        .db-critical-list { display: flex; flex-direction: column; gap: 6px; }
        .db-critical-row {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 8px 10px;
          background: #FFF5F5;
          border-radius: var(--border-radius-md);
          font-size: 13px;
        }
        .db-critical-id { font-family: var(--font-mono); font-weight: 500; color: var(--color-text-primary); min-width: 70px; }
        .db-critical-info { display: flex; gap: 10px; color: var(--color-text-secondary); flex: 1; }
        .db-critical-score { font-weight: 500; font-size: 16px; }
        .db-critical-icu {
          font-size: 11px;
          font-weight: 500;
          background: #A32D2D;
          color: #fff;
          padding: 2px 7px;
          border-radius: 4px;
        }
        .db-footer {
          padding: 8px 1.25rem;
          font-size: 12px;
          color: var(--color-text-tertiary);
          text-align: right;
        }
      `}</style>
    </div>
  );
}

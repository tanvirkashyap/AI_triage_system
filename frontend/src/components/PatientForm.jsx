import { useState } from "react";
import { predictPatient } from "../services/api";

const initialForm = {
  patient_id: "",
  age: "",
  heart_rate: "",
  spo2: "",
  chest_pain: false,
  unconscious: false,
  pain_level: 0,
};

const severityConfig = {
  CRITICAL: { color: "#A32D2D", bg: "#FCEBEB", label: "Critical" },
  HIGH:     { color: "#854F0B", bg: "#FAEEDA", label: "High" },
  MEDIUM:   { color: "#185FA5", bg: "#E6F1FB", label: "Medium" },
  LOW:      { color: "#3B6D11", bg: "#EAF3DE", label: "Low" },
};

export default function PatientForm({ onPatientAdded }) {
  const [form, setForm] = useState(initialForm);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const payload = {
        ...form,
        age: Number(form.age),
        heart_rate: Number(form.heart_rate),
        spo2: Number(form.spo2),
        pain_level: Number(form.pain_level),
      };
      const data = await predictPatient(payload);
      setResult(data);
      if (onPatientAdded) onPatientAdded(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setForm(initialForm);
    setResult(null);
    setError(null);
  };

  const sev = result ? severityConfig[result.severity] || severityConfig.LOW : null;

  return (
    <div className="pf-card">
      <div className="pf-header">
        <span className="pf-icon">🏥</span>
        <div>
          <h2 className="pf-title">Patient Intake</h2>
          <p className="pf-subtitle">Enter vitals to assess triage priority</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="pf-form">
        <div className="pf-grid">
          <div className="pf-field">
            <label className="pf-label">Patient ID</label>
            <input
              className="pf-input"
              name="patient_id"
              value={form.patient_id}
              onChange={handleChange}
              placeholder="e.g. P-1042"
              required
            />
          </div>

          <div className="pf-field">
            <label className="pf-label">Age</label>
            <input
              className="pf-input"
              type="number"
              name="age"
              value={form.age}
              onChange={handleChange}
              placeholder="Years"
              min="0"
              max="120"
              required
            />
          </div>

          <div className="pf-field">
            <label className="pf-label">Heart Rate <span className="pf-unit">bpm</span></label>
            <input
              className="pf-input"
              type="number"
              name="heart_rate"
              value={form.heart_rate}
              onChange={handleChange}
              placeholder="60–100 normal"
              min="0"
              max="300"
              required
            />
          </div>

          <div className="pf-field">
            <label className="pf-label">SpO₂ <span className="pf-unit">%</span></label>
            <input
              className="pf-input"
              type="number"
              name="spo2"
              value={form.spo2}
              onChange={handleChange}
              placeholder="95–100 normal"
              min="0"
              max="100"
              required
            />
          </div>
        </div>

        <div className="pf-field pf-full">
          <label className="pf-label">Pain Level: <strong>{form.pain_level}</strong> / 10</label>
          <input
            type="range"
            name="pain_level"
            min="0"
            max="10"
            step="1"
            value={form.pain_level}
            onChange={handleChange}
            className="pf-range"
          />
          <div className="pf-range-labels">
            <span>No pain</span>
            <span>Severe</span>
          </div>
        </div>

        <div className="pf-checks">
          <label className="pf-check">
            <input
              type="checkbox"
              name="chest_pain"
              checked={form.chest_pain}
              onChange={handleChange}
            />
            <span className="pf-check-label">Chest Pain</span>
          </label>
          <label className="pf-check">
            <input
              type="checkbox"
              name="unconscious"
              checked={form.unconscious}
              onChange={handleChange}
            />
            <span className="pf-check-label">Unconscious / Unresponsive</span>
          </label>
        </div>

        {error && (
          <div className="pf-error">⚠ {error}</div>
        )}

        <div className="pf-actions">
          <button type="submit" className="pf-btn-primary" disabled={loading}>
            {loading ? "Analyzing..." : "Assess Patient"}
          </button>
          <button type="button" className="pf-btn-secondary" onClick={handleReset}>
            Clear
          </button>
        </div>
      </form>

      {result && sev && (
        <div className="pf-result" style={{ borderColor: sev.color, background: sev.bg }}>
          <div className="pf-result-row">
            <div className="pf-result-block">
              <span className="pf-result-label">Criticality Score</span>
              <span className="pf-result-score" style={{ color: sev.color }}>
                {result.score?.toFixed(2) ?? "—"}
              </span>
            </div>
            <div className="pf-result-block">
              <span className="pf-result-label">Severity</span>
              <span className="pf-result-badge" style={{ background: sev.color, color: "#fff" }}>
                {sev.label}
              </span>
            </div>
            <div className="pf-result-block">
              <span className="pf-result-label">ICU Allocated</span>
              <span className="pf-result-icu" style={{ color: sev.color }}>
                {result.icu_allocated ? "✓ Yes" : "✗ No"}
              </span>
            </div>
          </div>
          {result.message && (
            <p className="pf-result-msg">{result.message}</p>
          )}
        </div>
      )}

      <style>{`
        .pf-card {
          background: var(--color-background-primary);
          border: 0.5px solid var(--color-border-tertiary);
          border-radius: var(--border-radius-lg);
          padding: 1.5rem;
          max-width: 680px;
        }
        .pf-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 0.5px solid var(--color-border-tertiary);
        }
        .pf-icon { font-size: 28px; }
        .pf-title {
          font-size: 18px;
          font-weight: 500;
          margin: 0;
          color: var(--color-text-primary);
        }
        .pf-subtitle {
          font-size: 13px;
          color: var(--color-text-secondary);
          margin: 2px 0 0;
        }
        .pf-form { display: flex; flex-direction: column; gap: 1rem; }
        .pf-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .pf-field { display: flex; flex-direction: column; gap: 6px; }
        .pf-full { grid-column: 1/-1; }
        .pf-label {
          font-size: 13px;
          font-weight: 500;
          color: var(--color-text-secondary);
        }
        .pf-unit { font-weight: 400; color: var(--color-text-tertiary); }
        .pf-input {
          padding: 8px 12px;
          border: 0.5px solid var(--color-border-secondary);
          border-radius: var(--border-radius-md);
          font-size: 14px;
          background: var(--color-background-secondary);
          color: var(--color-text-primary);
          outline: none;
          transition: border-color 0.15s;
        }
        .pf-input:focus { border-color: var(--color-border-primary); }
        .pf-range { width: 100%; }
        .pf-range-labels {
          display: flex;
          justify-content: space-between;
          font-size: 11px;
          color: var(--color-text-tertiary);
          margin-top: 2px;
        }
        .pf-checks { display: flex; gap: 1.5rem; flex-wrap: wrap; }
        .pf-check {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
        }
        .pf-check-label { font-size: 14px; color: var(--color-text-primary); }
        .pf-error {
          font-size: 13px;
          color: var(--color-text-danger);
          background: var(--color-background-danger);
          padding: 8px 12px;
          border-radius: var(--border-radius-md);
        }
        .pf-actions { display: flex; gap: 8px; }
        .pf-btn-primary {
          padding: 9px 20px;
          background: var(--color-text-primary);
          color: var(--color-background-primary);
          border: none;
          border-radius: var(--border-radius-md);
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: opacity 0.15s;
        }
        .pf-btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
        .pf-btn-secondary {
          padding: 9px 16px;
          background: transparent;
          color: var(--color-text-secondary);
          border: 0.5px solid var(--color-border-secondary);
          border-radius: var(--border-radius-md);
          font-size: 14px;
          cursor: pointer;
        }
        .pf-result {
          margin-top: 1rem;
          border: 1.5px solid;
          border-radius: var(--border-radius-lg);
          padding: 1rem 1.25rem;
        }
        .pf-result-row { display: flex; gap: 1.5rem; align-items: center; flex-wrap: wrap; }
        .pf-result-block { display: flex; flex-direction: column; gap: 4px; }
        .pf-result-label { font-size: 11px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.05em; color: var(--color-text-secondary); }
        .pf-result-score { font-size: 28px; font-weight: 500; }
        .pf-result-badge {
          font-size: 13px;
          font-weight: 500;
          padding: 4px 12px;
          border-radius: var(--border-radius-md);
          display: inline-block;
        }
        .pf-result-icu { font-size: 16px; font-weight: 500; }
        .pf-result-msg {
          margin: 8px 0 0;
          font-size: 13px;
          color: var(--color-text-secondary);
        }
        @media (max-width: 480px) {
          .pf-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}

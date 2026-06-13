import { useState } from "react";
import { admitPatient } from "../services/api";

const INIT = {
  patient_id: "", name: "", age: "", heart_rate: "",
  spo2: "", systolic_bp: "", respiratory_rate: "", pain: 0,
  chest_pain: false, unconscious: false,
  active_bleeding: false, difficulty_breathing: false,
};

const SEV = {
  critical: { color: "#b91c1c", bg: "#fef2f2", border: "#fecaca" },
  high:     { color: "#b45309", bg: "#fffbeb", border: "#fde68a" },
  medium:   { color: "#1d4ed8", bg: "#eff6ff", border: "#bfdbfe" },
  low:      { color: "#15803d", bg: "#f0fdf4", border: "#bbf7d0" },
  stable:   { color: "#15803d", bg: "#f0fdf4", border: "#bbf7d0" },
};

export default function PatientForm({ onAdded }) {
  const [form, setForm]     = useState(INIT);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState(null);

  const change = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true); setError(null); setResult(null);
    try {
      const payload = {
        ...form,
        age: Number(form.age),
        heart_rate: Number(form.heart_rate),
        spo2: Number(form.spo2),
        pain: Number(form.pain),
        systolic_bp: form.systolic_bp ? Number(form.systolic_bp) : null,
        respiratory_rate: form.respiratory_rate ? Number(form.respiratory_rate) : null,
      };
      const data = await admitPatient(payload);
      setResult(data);
      if (onAdded) onAdded(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => { setForm(INIT); setResult(null); setError(null); };

  const sev = result ? (SEV[result.severity?.toLowerCase()] || SEV.low) : null;

  return (
    <div className="card">
      <div className="card-head">
        <div>
          <div className="card-title">Admit patient</div>
          <div className="card-sub">Enter vitals to assess triage priority</div>
        </div>
      </div>

      <form onSubmit={submit}>
        <div className="form-body">

          <div className="grid-2">
            <div className="field">
              <label className="field-label">Patient ID</label>
              <input className="field-input" name="patient_id" value={form.patient_id} onChange={change} placeholder="e.g. P-1042" />
            </div>
            <div className="field">
              <label className="field-label">Full name</label>
              <input className="field-input" name="name" value={form.name} onChange={change} placeholder="Patient name" required />
            </div>
          </div>

          <div className="grid-4">
            <div className="field">
              <label className="field-label">Age</label>
              <input className="field-input" type="number" name="age" value={form.age} onChange={change} placeholder="Years" min="0" max="130" required />
            </div>
            <div className="field">
              <label className="field-label">Heart rate <span>bpm</span></label>
              <input className="field-input" type="number" name="heart_rate" value={form.heart_rate} onChange={change} placeholder="60–100" min="0" max="300" required />
            </div>
            <div className="field">
              <label className="field-label">SpO₂ <span>%</span></label>
              <input className="field-input" type="number" name="spo2" value={form.spo2} onChange={change} placeholder="95–100" min="0" max="100" required />
            </div>
            <div className="field">
              <label className="field-label">Systolic BP <span>mmHg</span></label>
              <input className="field-input" type="number" name="systolic_bp" value={form.systolic_bp} onChange={change} placeholder="Optional" />
            </div>
          </div>

          <div className="grid-2">
            <div className="field">
              <label className="field-label">Respiratory rate <span>/min</span></label>
              <input className="field-input" type="number" name="respiratory_rate" value={form.respiratory_rate} onChange={change} placeholder="Optional, 12–20 normal" />
            </div>
          </div>

          <div className="field">
            <label className="field-label">
              Pain level — <strong style={{ color: "#0a0a0a", fontWeight: 500 }}>{form.pain}</strong> / 10
            </label>
            <input type="range" name="pain" min="0" max="10" step="1" value={form.pain} onChange={change} />
            <div className="range-labels"><span>No pain</span><span>Severe</span></div>
          </div>

          <div className="checks">
            {[
              { name: "chest_pain",           label: "Chest pain" },
              { name: "unconscious",           label: "Unconscious" },
              { name: "active_bleeding",       label: "Active bleeding" },
              { name: "difficulty_breathing",  label: "Difficulty breathing" },
            ].map(({ name, label }) => (
              <label className="check" key={name}>
                <input type="checkbox" name={name} checked={form[name]} onChange={change} />
                {label}
              </label>
            ))}
          </div>

          {error && <div className="form-error">⚠ {error}</div>}

          <div className="form-actions">
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Analysing..." : "Assess patient"}
            </button>
            <button type="button" className="btn-secondary" onClick={reset}>Clear</button>
          </div>
        </div>

        {result && sev && (
          <div className="result-box" style={{ borderColor: sev.border, background: sev.bg }}>
            <div className="result-row">
              <div className="result-block">
                <span className="result-lbl">Criticality score</span>
                <span className="result-score" style={{ color: sev.color }}>{result.score?.toFixed(2) ?? "—"}</span>
              </div>
              <div className="result-block">
                <span className="result-lbl">Severity</span>
                <span className="result-badge" style={{ background: sev.color }}>
                  {result.severity?.charAt(0).toUpperCase() + result.severity?.slice(1).toLowerCase()}
                </span>
              </div>
              {result.category && (
                <div className="result-block">
                  <span className="result-lbl">Category</span>
                  <span className="result-cat" style={{ color: sev.color }}>{result.category}</span>
                </div>
              )}
            </div>
            {result.reasoning?.length > 0 && (
              <ul className="result-reasons">
                {result.reasoning.map((r, i) => <li key={i}>{r}</li>)}
              </ul>
            )}
          </div>
        )}
      </form>
    </div>
  );
}

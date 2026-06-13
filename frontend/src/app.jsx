import { useState } from "react";
import PatientForm from "./components/PatientForm";
import PatientList from "./components/PatientList";
import Dashboard from "./components/Dashboard";

const tabs = [
  { id: "dashboard", label: "Dashboard" },
  { id: "admit",     label: "Admit patient" },
  { id: "queue",     label: "Patient queue" },
];

export default function App() {
  const [active, setActive] = useState("dashboard");
  const [refresh, setRefresh] = useState(0);

  const bump = () => setRefresh((n) => n + 1);

  return (
    <div className="shell">
      <header className="topbar">
        <div className="topbar-brand">
          <div className="topbar-name">AI Triage System</div>
          <div className="topbar-sub">ML-powered emergency patient prioritisation</div>
        </div>
        <nav className="topbar-nav">
          {tabs.map((t) => (
            <button
              key={t.id}
              className={`topbar-btn${active === t.id ? " active" : ""}`}
              onClick={() => setActive(t.id)}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </header>
      <main className="main">
        {active === "dashboard" && <Dashboard key={refresh} />}
        {active === "admit" && (
          <PatientForm onAdded={() => { bump(); setActive("queue"); }} />
        )}
        {active === "queue" && <PatientList key={refresh} />}
      </main>
    </div>
  );
}

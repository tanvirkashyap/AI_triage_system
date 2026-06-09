import { useState } from "react";
import PatientForm from "./components/PatientForm";
import PatientList from "./components/PatientList";
import Dashboard from "./components/Dashboard";

const tabs = [
  { id: "dashboard", label: "Dashboard", icon: "📊" },
  { id: "admit",     label: "Admit Patient", icon: "➕" },
  { id: "queue",     label: "Patient Queue", icon: "📋" },
];

export default function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [refreshKey, setRefreshKey] = useState(0);

  const handlePatientAdded = () => {
    setRefreshKey((k) => k + 1);
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--color-background-tertiary)", padding: "1.5rem" }}>
      <header style={{ maxWidth: 860, margin: "0 auto 1.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: "1rem" }}>
          <span style={{ fontSize: 28 }}>🚑</span>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 500, margin: 0, color: "var(--color-text-primary)" }}>
              AI Triage System
            </h1>
            <p style={{ fontSize: 13, color: "var(--color-text-secondary)", margin: 0 }}>
              ML-powered emergency patient prioritisation
            </p>
          </div>
        </div>

        <nav style={{ display: "flex", gap: 4, borderBottom: "0.5px solid var(--color-border-tertiary)", paddingBottom: 0 }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: "8px 16px",
                background: "transparent",
                border: "none",
                borderBottom: activeTab === tab.id ? "2px solid var(--color-text-primary)" : "2px solid transparent",
                color: activeTab === tab.id ? "var(--color-text-primary)" : "var(--color-text-secondary)",
                fontWeight: activeTab === tab.id ? 500 : 400,
                fontSize: 14,
                cursor: "pointer",
                marginBottom: -1,
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </nav>
      </header>

      <main style={{ maxWidth: 860, margin: "0 auto" }}>
        {activeTab === "dashboard" && <Dashboard refreshTrigger={refreshKey} />}
        {activeTab === "admit" && (
          <PatientForm
            onPatientAdded={() => {
              handlePatientAdded();
              setActiveTab("queue");
            }}
          />
        )}
        {activeTab === "queue" && <PatientList refreshTrigger={refreshKey} />}
      </main>
    </div>
  );
}

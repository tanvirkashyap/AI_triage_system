
# ResQLink: AI-Assisted Emergency Triage and Resource Allocation System
[Check out the live app here](https://ai-triage-system-three.vercel.app/)
## Overview

The AI-Assisted Emergency Triage and Resource Allocation System is a clinical decision-support platform designed to assist healthcare professionals and first responders during emergency and mass-casualty situations.

The system evaluates patient vitals and symptoms, generates a criticality score, classifies patient severity, prioritizes patients in a dynamic queue, and assists with resource allocation when medical resources are limited.

This project is intended as a decision-support tool and does **not** replace medical professionals or clinical judgment.

---

## Problem Statement

During emergency situations, hospitals and first responders often face:

- Large numbers of incoming patients
- Limited ICU beds and medical resources
- Time-critical decision making
- Incomplete patient information

Prioritizing patients quickly and consistently becomes difficult under these conditions.

This system aims to support healthcare workers by providing an AI-assisted triage workflow that helps identify high-risk patients and optimize resource allocation.

---

## Features

### Patient Assessment

- Collects patient information through a structured intake form
- Supports:
  - Age
  - Heart Rate
  - Oxygen Saturation (SpO₂)
  - Chest Pain
  - Consciousness Status
  - Pain Severity Rating

### Criticality Scoring

Generates a numerical urgency score based on patient condition.

Example:

```json
{
  "score": 0.84
}
````

---

### Severity Classification

Patients are classified into:

* Stable
* Moderate
* Critical

Example:

```json
{
  "severity": "critical"
}
```

---

### Medical Categorization

Assigns patients to triage categories such as:

* Respiratory
* Cardiac
* Neurological
* General

These categories can be used for prioritization and tie-breaking.

---

### Patient Ranking

Patients are automatically ranked based on:

1. Criticality score
2. Category priority weight

This ensures that patients with the greatest medical urgency receive attention first.

---

### Resource Allocation

The system can assist hospitals in allocating:

* ICU beds
* Emergency resources
* Medical attention

based on patient priority.

---

### Hospital Overflow Management

If a hospital reaches capacity:

* The system identifies overflow situations
* Recommends alternate hospitals
* Supports coordinated patient routing

---

## System Architecture

```text
Patient Intake Form
        │
        ▼
Frontend (React)
        │
        ▼
FastAPI Backend
        │
        ▼
Triage Scoring Engine
        │
        ▼
Severity Classification
        │
        ▼
Patient Ranking
        │
        ▼
Resource Allocation Engine
        │
        ▼
Hospital Overflow Recommendation
```

---

## Technology Stack

### Frontend

* React
* JavaScript
* HTML/CSS

### Backend

* FastAPI
* Python

### AI / Decision Support

* Python
* Rule-Based Risk Scoring
* Explainable Decision Logic

### Development Tools

* Git
* GitHub

---

## Project Structure

```text
project-root/
│
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
│
├── backend/
│   ├── main.py
│   │
│   ├── models/
│   │   └── ml_model.py
│   │
│   ├── schemas/
│   │   └── patient.py
│   │
│   ├── routes/
│   │
│   ├── services/
│   │
│   ├── tests/
│   │   └── test_model.py
│   │
│   └── requirements.txt
│
└── README.md
```

---

## Sample Patient Input

```json
{
  "patient_id": "P101",
  "age": 72,
  "heart_rate": 128,
  "spo2": 85,
  "chest_pain": true,
  "unconscious": false,
  "pain_level": 8
}
```

---

## Sample Output

```json
{
  "patient_id": "P101",
  "score": 0.84,
  "severity": "critical",
  "category": "respiratory",
  "reasons": [
    "Low oxygen saturation",
    "Elevated heart rate",
    "Chest pain"
  ]
}
```

---

## Future Improvements

### Machine Learning Models

Replace static scoring with:

* Logistic Regression
* Random Forest
* XGBoost

trained on medical triage datasets.

### Explainable AI

Provide detailed reasoning behind every triage recommendation.

### Dynamic Monitoring

Support continuous patient monitoring and score updates as conditions change.

### Resource Optimization

Expand allocation logic to include:

* Ventilators
* Emergency staff
* Ambulances
* Specialized equipment

### Hospital Network Integration

Enable real-time communication between hospitals for coordinated patient transfers.
```

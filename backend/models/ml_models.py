"""
Criticality scoring engine.

Scoring is rule-based with weights loosely aligned to NEWS2 clinical guidelines.
All logic is isolated in this file — swap calc_score() internals for a trained
sklearn model later without touching anything else.
"""

from schemas.patient import Patient, PredictionResult


# ---------------------------------------------------------------------------
# 1. Score calculation
# ---------------------------------------------------------------------------

def calc_score(patient: Patient) -> tuple[float, list[str]]:
    
    score = 0.0
    reasoning: list[str] = []

    
    if patient.unconscious:
        score += 0.40
        reasoning.append("Patient unconscious")

    if patient.active_bleeding:
        score += 0.30
        reasoning.append("Active bleeding")

    if patient.chest_pain:
        score += 0.20
        reasoning.append("Chest pain present")

    if patient.difficulty_breathing:
        score += 0.15
        reasoning.append("Difficulty breathing")

    # Vital signs — additive contributions
    if patient.spo2 < 90:
        score += 0.30
        reasoning.append(f"SpO₂ critically low ({patient.spo2}%)")
    elif patient.spo2 < 94:
        score += 0.10
        reasoning.append(f"SpO₂ low ({patient.spo2}%)")

    if patient.heart_rate > 120:
        score += 0.20
        reasoning.append(f"Heart rate high ({patient.heart_rate} bpm)")
    elif patient.heart_rate < 50:
        score += 0.15
        reasoning.append(f"Heart rate low ({patient.heart_rate} bpm)")

    if patient.systolic_bp is not None:
        if patient.systolic_bp < 90:
            score += 0.20
            reasoning.append(f"Blood pressure critically low ({patient.systolic_bp} mmHg)")
        elif patient.systolic_bp > 180:
            score += 0.10
            reasoning.append(f"Blood pressure high ({patient.systolic_bp} mmHg)")

    if patient.respiratory_rate is not None and patient.respiratory_rate > 25:
        score += 0.15
        reasoning.append(f"Respiratory rate high ({patient.respiratory_rate}/min)")

    
    if patient.pain >= 7:
        contribution = (patient.pain / 10) * 0.15
        score += contribution
        reasoning.append(f"High pain score ({patient.pain}/10)")

    # Age vulnerability
    if patient.age > 70 or patient.age < 5:
        score += 0.08
        reasoning.append(f"Age vulnerability ({patient.age})")

    if not reasoning:
        reasoning.append("All vitals within normal range")

    return round(min(score, 1.0), 2), reasoning


def classify(score: float) -> str:
    if score >= 0.75:
        return "critical"
    elif score >= 0.45:
        return "moderate"
    return "stable"


def categorize(patient: Patient) -> str:
    if patient.unconscious:
        return "neurological"
    if patient.active_bleeding:
        return "trauma"
    if patient.chest_pain:
        return "cardiac"
    if patient.spo2 < 94 or patient.difficulty_breathing:
        return "respiratory"
    return "general"


def predict(patient: Patient) -> PredictionResult:
    score, reasoning = calc_score(patient)
    severity = classify(score)
    category = categorize(patient)

    return PredictionResult(
        patient_id=patient.patient_id,
        score=score,
        severity=severity,
        category=category,
        reasoning=reasoning,
    )



import joblib
import pandas as pd
from pathlib import Path
from schemas.patient import Patient, PredictionResult

MODEL_PATH = Path(__file__).parent / "triage_model.pkl"

try:
    _model = joblib.load(MODEL_PATH)
except FileNotFoundError:
    raise RuntimeError(
        "Trained model not found. Run train_model.py first:\n"
        "  python train_model.py"
    )




def _to_features(patient: Patient) -> pd.DataFrame:
    
    return pd.DataFrame([{
        "age":                  patient.age,
        "heart_rate":           patient.heart_rate,
        "spo2":                 patient.spo2,
        "systolic_bp":          patient.systolic_bp      if patient.systolic_bp      is not None else 120,
        "respiratory_rate":     patient.respiratory_rate if patient.respiratory_rate is not None else 16,
        "pain":                 patient.pain,
        "chest_pain":           int(patient.chest_pain),
        "unconscious":          int(patient.unconscious),
        "active_bleeding":      int(patient.active_bleeding),
        "difficulty_breathing": int(patient.difficulty_breathing),
    }])




def _build_reasoning(patient: Patient) -> list[str]:
    reasons = []

    if patient.unconscious:          reasons.append("Patient unconscious")
    if patient.active_bleeding:      reasons.append("Active bleeding")
    if patient.chest_pain:           reasons.append("Chest pain present")
    if patient.difficulty_breathing: reasons.append("Difficulty breathing")

    if patient.spo2 < 90:
        reasons.append(f"SpO2 critically low ({patient.spo2}%)")
    elif patient.spo2 < 94:
        reasons.append(f"SpO2 low ({patient.spo2}%)")

    if patient.heart_rate > 120:
        reasons.append(f"Heart rate high ({patient.heart_rate} bpm)")
    elif patient.heart_rate < 50:
        reasons.append(f"Heart rate low ({patient.heart_rate} bpm)")

    if patient.systolic_bp and patient.systolic_bp < 90:
        reasons.append(f"Blood pressure critically low ({patient.systolic_bp} mmHg)")
    elif patient.systolic_bp and patient.systolic_bp > 180:
        reasons.append(f"Blood pressure high ({patient.systolic_bp} mmHg)")

    if patient.respiratory_rate and patient.respiratory_rate > 25:
        reasons.append(f"Respiratory rate high ({patient.respiratory_rate}/min)")

    if patient.pain >= 7:
        reasons.append(f"High pain score ({patient.pain}/10)")

    if patient.age > 70 or patient.age < 5:
        reasons.append(f"Age vulnerability ({patient.age})")

    if not reasons:
        reasons.append("All vitals within normal range")

    return reasons




def _categorize(patient: Patient) -> str:
    if patient.unconscious:                                    return "neurological"
    if patient.active_bleeding:                                return "trauma"
    if patient.chest_pain:                                     return "cardiac"
    if patient.spo2 < 94 or patient.difficulty_breathing:     return "respiratory"
    return "general"




def predict(patient: Patient) -> PredictionResult:
    features = _to_features(patient)

    severity = _model.predict(features)[0]         
    probas   = _model.predict_proba(features)[0]   
    classes  = list(_model.classes_)
    score    = round(float(probas[classes.index(severity)]), 2)  

    return PredictionResult(
        patient_id=patient.patient_id,
        score=score,
        severity=severity,
        category=_categorize(patient),
        reasoning=_build_reasoning(patient),
    )
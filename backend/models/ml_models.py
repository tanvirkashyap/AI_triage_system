def calc_score(patient):
    score = 0.0

    if patient["spo2"] < 90:
        score += 0.30

    if patient["heart_rate"] > 120:
        score += 0.20

    if patient["unconscious"]:
        score += 0.40

    if patient["chest_pain"]:
        score += 0.20

    score += (patient["pain"]/10) * 0.15

    return min(score, 1.0)


def classify(score):

    if score >= 0.75:
        return "critical"
    
    elif score >= 0.45:
        return "moderate"
    
    return "stable"

def categorize(patient):

    if patient["unconscious"]:
        return "neurological"
    
    if patient["spo2"] < 90:
        return "respiratory"
    
    if patient["chest_pain"]:
        return "cardiac"
    
    return "general"

def predict(patient) -> dict:

    score = calc_score(patient)
    severity = classify(score)
    category = categorize(patient)
    
    return {
        "patient_id": patient["patient_id"],
        "score" : round(score, 2)
        "severity": severity
        "category": category
    }
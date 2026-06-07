"""
train_model.py

Run this ONCE to:
1. Generate synthetic patient training data using the rule-based logic
2. Train a Random Forest classifier on it
3. Save the trained model to models/triage_model.pkl

After this, ml_models.py uses the trained model instead of the rules directly.

Run from the backend/ root:
    python train_model.py
"""

import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report
import joblib
import os

# ─── Step 1: Generate synthetic patients ──────────────────────────────────

np.random.seed(42)
N = 5000  # number of synthetic patients

def generate_patients(n):
    data = []
    for _ in range(n):
        # Randomly sample vitals within realistic ranges
        age               = np.random.randint(1, 95)
        heart_rate        = np.random.randint(30, 180)
        spo2              = np.random.uniform(78, 100)
        systolic_bp       = np.random.randint(60, 200)
        respiratory_rate  = np.random.randint(8, 40)
        pain              = np.random.randint(0, 11)
        chest_pain        = np.random.choice([0, 1], p=[0.75, 0.25])
        unconscious       = np.random.choice([0, 1], p=[0.90, 0.10])
        active_bleeding   = np.random.choice([0, 1], p=[0.85, 0.15])
        difficulty_breathing = np.random.choice([0, 1], p=[0.80, 0.20])

        data.append([
            age, heart_rate, spo2, systolic_bp, respiratory_rate, pain,
            chest_pain, unconscious, active_bleeding, difficulty_breathing
        ])

    return pd.DataFrame(data, columns=[
        "age", "heart_rate", "spo2", "systolic_bp", "respiratory_rate", "pain",
        "chest_pain", "unconscious", "active_bleeding", "difficulty_breathing"
    ])


def rule_based_score(row):
    score = 0.0
    if row["unconscious"]:       
        score += 0.40
    if row["active_bleeding"]:   
        score += 0.30
    if row["chest_pain"]:        
        score += 0.20
    if row["difficulty_breathing"]: 
        score += 0.15
    if row["spo2"] < 90:         
        score += 0.30
    elif row["spo2"] < 94:       
        score += 0.10
    if row["heart_rate"] > 120:  
        score += 0.20
    elif row["heart_rate"] < 50: 
        score += 0.15
    if row["systolic_bp"] < 90:  
        score += 0.20
    elif row["systolic_bp"] > 180: 
        score += 0.10
    if row["respiratory_rate"] > 25: 
        score += 0.15
    if row["pain"] >= 7:         
        score += (row["pain"] / 10) * 0.15
    if row["age"] > 70 or row["age"] < 5: 
        score += 0.08
    return min(score, 1.0)


def label_severity(score):
    if score >= 0.75: return "critical"
    if score >= 0.45: return "moderate"
    return "stable"


print("Generating synthetic patient data...")
df = generate_patients(N)

df["score"]    = df.apply(rule_based_score, axis=1)
df["severity"] = df["score"].apply(label_severity)

print(f"Label distribution:\n{df['severity'].value_counts()}\n")

FEATURES = [
    "age", "heart_rate", "spo2", "systolic_bp", "respiratory_rate", "pain",
    "chest_pain", "unconscious", "active_bleeding", "difficulty_breathing"
]

X = df[FEATURES]
y = df["severity"]

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

print("Training Random Forest classifier...")
model = RandomForestClassifier(
    n_estimators=100,
    max_depth=10,
    random_state=42,
    class_weight="balanced") 
model.fit(X_train, y_train)



print("\nModel evaluation on held-out test set:")
y_pred = model.predict(X_test)
print(classification_report(y_test, y_pred))


importances = sorted(
    zip(FEATURES, model.feature_importances_),
    key=lambda x: -x[1]
)
print("Feature importances:")
for feat, imp in importances:
    print(f"  {feat:<25} {imp:.3f}")



os.makedirs("models", exist_ok=True)
joblib.dump(model, "models/triage_model.pkl")
print("\nModel saved")

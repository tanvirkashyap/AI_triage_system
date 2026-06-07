"""
In-memory patient queue and resource allocation.
All state resets on server restart — fine for hackathon MVP.
"""

from datetime import datetime
from schemas.patient import Patient, PredictionResult
from models.ml_models import predict


# ---------------------------------------------------------------------------
# State
# ---------------------------------------------------------------------------

# { patient_id: (Patient, PredictionResult, arrived_at, allocated_resource) }
_queue: dict[str, dict] = {}

_resources = {
    "icu_beds": 5,
    "emergency_staff": 10,
    "ventilators": 3,
}

_nearby_hospitals = [
    {"name": "CityCare Hospital",  "available_icu_beds": 3, "distance_km": 4.2},
    {"name": "Metro General",      "available_icu_beds": 0, "distance_km": 6.1},
    {"name": "Northside Emergency","available_icu_beds": 7, "distance_km": 9.8},
]


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def admit(patient: Patient) -> dict:
    """Score patient, add to queue, re-run allocation."""
    result = predict(patient)
    _queue[patient.patient_id] = {
        "patient": patient,
        "result": result,
        "arrived_at": datetime.utcnow().isoformat(),
        "allocated_resource": None,
    }
    _reallocate()
    return _queue[patient.patient_id]


def get_sorted_queue() -> list[dict]:
    """Return queue sorted by score desc, then arrival time asc."""
    return sorted(
        _queue.values(),
        key=lambda e: (-e["result"].score, e["arrived_at"]),
    )


def discharge(patient_id: str) -> bool:
    if patient_id not in _queue:
        return False
    del _queue[patient_id]
    _reallocate()
    return True


def update_resources(new_resources: dict) -> dict:
    global _resources
    _resources.update(new_resources)
    _reallocate()
    return _resources


def get_resources() -> dict:
    return _resources


def check_overflow() -> dict:
    critical_count = sum(
        1 for e in _queue.values()
        if e["result"].severity == "critical"
    )
    at_capacity = critical_count > _resources["icu_beds"]

    if not at_capacity:
        return {
            "overflow": False,
            "message": f"{critical_count} critical patients, {_resources['icu_beds']} ICU beds available.",
        }

    available = [h for h in _nearby_hospitals if h["available_icu_beds"] > 0]
    nearest = min(available, key=lambda h: h["distance_km"]) if available else None

    return {
        "overflow": True,
        "redirect_hospital": nearest,
        "message": (
            f"ICU at capacity ({critical_count} critical patients, {_resources['icu_beds']} beds). "
            + (f"Redirect to {nearest['name']}." if nearest else "No nearby capacity found.")
        ),
    }


# ---------------------------------------------------------------------------
# Internal
# ---------------------------------------------------------------------------

def _build_resource_pool() -> list[str]:
    pool = []
    pool += [f"ICU Bed {i+1}"         for i in range(_resources["icu_beds"])]
    pool += [f"Emergency Staff {i+1}" for i in range(_resources["emergency_staff"])]
    pool += [f"Ventilator {i+1}"      for i in range(_resources["ventilators"])]
    return pool


def _reallocate():
    pool = _build_resource_pool()
    for entry in get_sorted_queue():
        pid = entry["patient"].patient_id
        _queue[pid]["allocated_resource"] = pool.pop(0) if pool else None

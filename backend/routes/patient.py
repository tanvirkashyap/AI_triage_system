from fastapi import APIRouter, HTTPException
from schemas.patient import Patient
from services import queue_engine

router = APIRouter(prefix="/patients", tags=["patients"])


@router.post("/", status_code=201)
def admit_patient(patient: Patient):
    return queue_engine.admit(patient)


@router.get("/queue")
def get_queue():
    return {
        "total_patients": len(queue_engine._queue),
        "resources": queue_engine.get_resources(),
        "queue": queue_engine.get_sorted_queue(),
    }


@router.get("/overflow")
def check_overflow():
   
    return queue_engine.check_overflow()


@router.get("/resources")
def get_resources():
    return queue_engine.get_resources()


@router.put("/resources")
def update_resources(new_resources: dict):
    return queue_engine.update_resources(new_resources) 


@router.get("/{patient_id}")
def get_patient(patient_id: str):
    entry = queue_engine._queue.get(patient_id)
    if not entry:
        raise HTTPException(status_code=404, detail="Patient not found")
    return entry


@router.delete("/{patient_id}", status_code=204)
def discharge_patient(patient_id: str):
    if not queue_engine.discharge(patient_id):
        raise HTTPException(status_code=404, detail="Patient not found")
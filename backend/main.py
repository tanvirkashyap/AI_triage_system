from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from patient import Patient
import queue_engine

app = FastAPI(title = "Triage API", version = "0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins = ["http://localhost:3000", "http://localhost:5173"],
    allow_methods = ["*"],
    allow_header = ["*"],
)

@app.post("/patients", status_code = 201)
def admit_patient(patient: Patient):
    return queue_engine.admit(patient)

@app.get("/patients/{patient_id}")
def get_patient(patient_id: str):
    entry = queue_engine._queue.get(patient_id)
    if not entry:
        raise HTTPException(status_code = 404, detail = "Patient not found")
    return entry

@app.delete("/patients/{patient_id}", status_code = 204)
def discharge_patient(patient_id: str):
    if not queue_engine.discharge(patient_id):
        raise HTTPException(status_code = 404, detail = "Patient not found")
    
@app.get("/queue")
def get_queue():
    return{
        "total_patients" : len(queue_engine._queue),
        "resources": queue_engine.get_resources(),
        "queue":queue_engine.get_sorted_queue(),
    }

@app.get("/resources")
def get_resources():
    return queue_engine.get_resources()

@app.put("/resources")
def update_resources(new_resources: dict):
    return queue_engine.update_resources(new_resource)

@app.get("/overflow")
def overflow():
    return queue_engine.check_overflow()

@app.get("\health")
def health():
    return("status": "ok")
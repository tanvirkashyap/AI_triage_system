from pydantic import BaseModel

class Patient(BaseModel):
    patient_id: str  #import uuid stuff to just generate it
    age: int
    heart_rate: int
    spo2: float
    chest_pain: bool
    conscious: bool
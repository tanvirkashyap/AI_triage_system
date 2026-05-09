from pydantic import BaseModel, Field

class Patient(BaseModel):
    patient_id: str  #import uuid stuff to just generate it
    age: int
    heart_rate: int
    spo2: float 
    chest_pain: bool = False
    unconscious: bool = False
    pain: int = Field(ge = 0, le = 10)
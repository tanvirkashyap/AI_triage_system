import uuid
from pydantic import BaseModel, Field
from typing import Optional


class Patient(BaseModel):
    patient_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    age: int = Field(ge=0, le=130)
    heart_rate: int = Field(ge=0, le=300)
    spo2: float = Field(ge=0.0, le=100.0)
    systolic_bp: Optional[int] = Field(default=None, ge=0, le=300)
    respiratory_rate: Optional[int] = Field(default=None, ge=0, le=100)
    pain: int = Field(default=0, ge=0, le=10)
    chest_pain: bool = False
    unconscious: bool = False
    active_bleeding: bool = False
    difficulty_breathing: bool = False


class PredictionResult(BaseModel):
    patient_id: str
    score: float = Field(ge=0.0, le=1.0)
    severity: str       #stable/critical
    category: str       #cardiological etc
    reasoning: list[str]

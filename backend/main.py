from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from patient import Patient
import queue_engine

app = FastAPI(title = "Triage API", version = "0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins
)
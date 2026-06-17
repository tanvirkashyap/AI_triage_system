from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.patient import router as patient_router

app = FastAPI(title="Triage API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://ai-triage-system-three.vercel.app", "http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],   
)

app.include_router(patient_router)


@app.get("/health", tags=["meta"])
def health():
    return {"status": "ok"} 
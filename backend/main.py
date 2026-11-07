from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text

from app.database import engine, Base, get_db
from app import models
from app.routers import auth
from app.dependencies import get_current_user, require_role
from app.models import DoctorProfile, PatientProfile, User
from app.routers import documents
from app.routers import access

app = FastAPI(
    title="MedSeg-RAG API",
    description="Intelligent Medical Document Platform",
    version="1.0.0"
)

# Register Routers
app.include_router(auth.router)
app.include_router(documents.router)
app.include_router(access.router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def create_tables():
    Base.metadata.create_all(bind=engine)

@app.get("/")
def home():
    return {
        "message": "Welcome to MedSeg-RAG!",
        "status": "Backend is running"
    }

@app.get("/health")
def health():
    return {"status": "healthy"}

@app.get("/db-check")
def database_check(db: Session = Depends(get_db)):
    db.execute(text("SELECT 1"))
    return {
        "status": "success",
        "database": "PostgreSQL",
        "message": "Database connected successfully!"
    }
# Protected: Any logged-in user
@app.get("/me")
def get_my_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    patient_profile = None
    doctor_profile = None

    if current_user.role == "patient":
        patient_profile = db.query(PatientProfile).filter(
            PatientProfile.user_id == current_user.id
        ).first()
    elif current_user.role == "doctor":
        doctor_profile = db.query(DoctorProfile).filter(
            DoctorProfile.user_id == current_user.id
        ).first()

    return auth.serialize_profile(
        current_user,
        patient_profile=patient_profile,
        doctor_profile=doctor_profile,
    )


# Protected: Patient only
@app.get("/patient/dashboard")
def patient_dashboard(
    current_user: User = Depends(require_role("patient"))
):
    return {
        "message": "Welcome to Patient Dashboard",
        "user": current_user.full_name
    }


# Protected: Doctor only
@app.get("/doctor/dashboard")
def doctor_dashboard(
    current_user: User = Depends(require_role("doctor"))
):
    return {
        "message": "Welcome to Doctor Dashboard",
        "user": current_user.full_name
    }
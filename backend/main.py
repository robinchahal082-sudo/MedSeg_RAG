from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text

from app.database import engine, Base, get_db
from app import models
from app.routers import auth
from app.dependencies import get_current_user, require_role
from app.models import User

app = FastAPI(
    title="MedSeg-RAG API",
    description="Intelligent Medical Document Platform",
    version="1.0.0"
)

# Register Authentication Router
app.include_router(auth.router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
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
    current_user: User = Depends(get_current_user)
):
    return {
        "id": current_user.id,
        "full_name": current_user.full_name,
        "email": current_user.email,
        "role": current_user.role
    }


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
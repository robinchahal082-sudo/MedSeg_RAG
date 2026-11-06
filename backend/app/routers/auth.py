
import os
from pathlib import Path
from datetime import datetime, timedelta, timezone

import jwt
from dotenv import load_dotenv
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from pwdlib import PasswordHash

from app.database import get_db
from app.models import User, PatientProfile, DoctorProfile
from app.schemas.auth import PatientRegister, DoctorRegister, LoginRequest


# --------------------------------------------------
# CONFIGURATION
# --------------------------------------------------

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)

password_hash = PasswordHash.recommended()

BASE_DIR = Path(__file__).resolve().parents[2]
load_dotenv(BASE_DIR / ".env", override=True)

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM", "HS256")

ACCESS_TOKEN_EXPIRE_MINUTES = int(
    os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30")
)

if not SECRET_KEY:
    raise ValueError("SECRET_KEY is missing from backend/.env")


# --------------------------------------------------
# JWT TOKEN GENERATION
# --------------------------------------------------

def create_access_token(user_id: int, role: str):

    expire = datetime.now(timezone.utc) + timedelta(
        minutes=ACCESS_TOKEN_EXPIRE_MINUTES
    )

    payload = {
        "sub": str(user_id),
        "role": role,
        "exp": expire
    }

    token = jwt.encode(
        payload,
        SECRET_KEY,
        algorithm=ALGORITHM
    )

    return token


# --------------------------------------------------
# PATIENT REGISTRATION
# --------------------------------------------------

@router.post(
    "/register/patient",
    status_code=status.HTTP_201_CREATED
)
def register_patient(
    data: PatientRegister,
    db: Session = Depends(get_db)
):

    existing = db.query(User).filter(
        User.email == data.email
    ).first()

    if existing:
        raise HTTPException(
            status_code=409,
            detail="Email already registered"
        )

    user = User(
        full_name=data.full_name,
        email=data.email,
        contact_number=data.contact_number,
        hashed_password=password_hash.hash(data.password),
        role="patient"
    )

    try:
        db.add(user)
        db.flush()

        profile = PatientProfile(
            user_id=user.id,
            date_of_birth=data.date_of_birth
        )

        db.add(profile)
        db.commit()
        db.refresh(user)

    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail="Account already exists"
        )

    return {
        "message": "Patient registered successfully",
        "user_id": user.id,
        "role": user.role
    }


# --------------------------------------------------
# DOCTOR REGISTRATION
# --------------------------------------------------

@router.post(
    "/register/doctor",
    status_code=status.HTTP_201_CREATED
)
def register_doctor(
    data: DoctorRegister,
    db: Session = Depends(get_db)
):

    existing = db.query(User).filter(
        User.email == data.email
    ).first()

    if existing:
        raise HTTPException(
            status_code=409,
            detail="Email already registered"
        )

    existing_doctor = db.query(DoctorProfile).filter(
        DoctorProfile.registration_number == data.registration_number
    ).first()

    if existing_doctor:
        raise HTTPException(
            status_code=409,
            detail="Registration number already exists"
        )

    user = User(
        full_name=data.full_name,
        email=data.email,
        contact_number=data.contact_number,
        hashed_password=password_hash.hash(data.password),
        role="doctor"
    )

    try:
        db.add(user)
        db.flush()

        profile = DoctorProfile(
            user_id=user.id,
            specialization=data.specialization,
            qualification=data.qualification,
            registration_number=data.registration_number,
            verification_status="pending"
        )

        db.add(profile)
        db.commit()
        db.refresh(user)

    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail="Account or registration number already exists"
        )

    return {
        "message": "Doctor registered successfully",
        "user_id": user.id,
        "role": user.role,
        "verification_status": "pending"
    }


# --------------------------------------------------
# USER LOGIN
# --------------------------------------------------

@router.post("/login")
def login(
    data: LoginRequest,
    db: Session = Depends(get_db)
):

    # Find user by email
    user = db.query(User).filter(
        User.email == data.email
    ).first()

    # Verify password
    if not user or not password_hash.verify(
        data.password,
        user.hashed_password
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    # Check whether account is active
    if not user.is_active:
        raise HTTPException(
            status_code=403,
            detail="Your account is inactive"
        )

    # Generate JWT
    access_token = create_access_token(
        user_id=user.id,
        role=user.role
    )

    return {
        "message": "Login successful",
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "full_name": user.full_name,
            "email": user.email,
            "role": user.role
        }
    }

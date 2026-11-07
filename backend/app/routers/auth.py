
import os
from pathlib import Path
from datetime import datetime, timedelta, timezone

import jwt
from dotenv import load_dotenv
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from pwdlib import PasswordHash

from app.database import get_db
from app.dependencies import get_current_user
from app.models import User, PatientProfile, DoctorProfile
from app.schemas.auth import (
    DoctorRegister,
    LoginRequest,
    PatientRegister,
    ProfileUpdate,
)


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


def serialize_profile(user, patient_profile=None, doctor_profile=None):
    profile = {
        "id": user.id,
        "full_name": user.full_name,
        "email": user.email,
        "contact_number": user.contact_number,
        "role": user.role,
        "is_active": user.is_active,
        "created_at": user.created_at.isoformat() if user.created_at else None,
        "date_of_birth": (
            patient_profile.date_of_birth.isoformat()
            if patient_profile and patient_profile.date_of_birth else None
        ),
        "specialization": doctor_profile.specialization if doctor_profile else None,
        "qualification": doctor_profile.qualification if doctor_profile else None,
        "registration_number": (
            doctor_profile.registration_number if doctor_profile else None
        ),
        "verification_status": (
            doctor_profile.verification_status if doctor_profile else None
        ),
    }
    return profile


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
            verification_status="verified"
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
        "verification_status": "verified"
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


@router.patch("/profile")
def update_profile(
    data: ProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    fields = data.model_fields_set
    if not fields:
        raise HTTPException(
            status_code=422,
            detail="Provide at least one profile field to update.",
        )

    fields_by_role = {
        "patient": {"full_name", "email", "contact_number", "date_of_birth"},
        "doctor": {
            "full_name",
            "email",
            "contact_number",
            "specialization",
            "qualification",
        },
    }
    allowed_fields = fields_by_role.get(current_user.role, set())
    unsupported_fields = fields - allowed_fields
    if unsupported_fields:
        raise HTTPException(
            status_code=422,
            detail=(
                "These fields cannot be updated for this account: "
                + ", ".join(sorted(unsupported_fields))
            ),
        )

    updates = data.model_dump(exclude_unset=True)
    required_fields = fields - {"date_of_birth"}
    if any(updates[field] is None for field in required_fields):
        raise HTTPException(
            status_code=422,
            detail="Required profile fields cannot be empty.",
        )

    if "email" in updates:
        updates["email"] = str(updates["email"]).lower()
        existing_user = db.query(User).filter(
            func.lower(User.email) == updates["email"],
            User.id != current_user.id,
        ).first()
        if existing_user:
            raise HTTPException(
                status_code=409,
                detail="Email address is already in use.",
            )

    patient_profile = None
    doctor_profile = None
    if current_user.role == "patient":
        patient_profile = db.query(PatientProfile).filter(
            PatientProfile.user_id == current_user.id
        ).first()
        if not patient_profile:
            raise HTTPException(status_code=404, detail="Patient profile not found.")
    elif current_user.role == "doctor":
        doctor_profile = db.query(DoctorProfile).filter(
            DoctorProfile.user_id == current_user.id
        ).first()
        if not doctor_profile:
            raise HTTPException(status_code=404, detail="Doctor profile not found.")
    else:
        raise HTTPException(
            status_code=403,
            detail="This account cannot update a profile.",
        )

    for field in fields - {"date_of_birth", "specialization", "qualification"}:
        setattr(current_user, field, updates[field])

    if "date_of_birth" in fields:
        patient_profile.date_of_birth = updates["date_of_birth"]
    if "specialization" in fields:
        doctor_profile.specialization = updates["specialization"]
    if "qualification" in fields:
        doctor_profile.qualification = updates["qualification"]

    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail="Profile update conflicts with an existing account.",
        ) from exc

    db.refresh(current_user)
    if patient_profile:
        db.refresh(patient_profile)
    if doctor_profile:
        db.refresh(doctor_profile)

    return {
        "message": "Profile updated successfully.",
        "profile": serialize_profile(
            current_user,
            patient_profile=patient_profile,
            doctor_profile=doctor_profile,
        ),
    }

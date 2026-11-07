
import logging

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import require_role
from app.models import (
    User,
    DoctorProfile,
    DoctorPatientAccess,
)

router = APIRouter(
    prefix="/api/access",
    tags=["Doctor-Patient Access"],
)

logger = logging.getLogger(__name__)


# --------------------------------------------------
# HELPER: CHECK DOCTOR VERIFICATION
# --------------------------------------------------

def verify_doctor(doctor_id: int, db: Session):

    profile = db.query(DoctorProfile).filter(
        DoctorProfile.user_id == doctor_id
    ).first()

    if not profile or profile.verification_status != "verified":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your doctor account is not verified yet.",
        )

    return profile


# --------------------------------------------------
# 1. DOCTOR SENDS ACCESS REQUEST
# --------------------------------------------------

@router.post("/request/{patient_id}")
def request_patient_access(
    patient_id: int,
    current_user: User = Depends(require_role("doctor")),
    db: Session = Depends(get_db),
):

    verify_doctor(current_user.id, db)

    patient = db.query(User).filter(
        User.id == patient_id,
        User.role == "patient",
        User.is_active.is_(True),
    ).first()

    if not patient:
        raise HTTPException(
            status_code=404,
            detail="Patient not found.",
        )

    if patient.id == current_user.id:
        raise HTTPException(
            status_code=400,
            detail="Invalid patient.",
        )

    existing = db.query(DoctorPatientAccess).filter(
        DoctorPatientAccess.doctor_id == current_user.id,
        DoctorPatientAccess.patient_id == patient_id,
    ).first()

    if existing:
        if existing.status == "pending":
            raise HTTPException(
                status_code=409,
                detail="An access request is already pending.",
            )

        if existing.status == "approved":
            raise HTTPException(
                status_code=409,
                detail="You already have access to this patient.",
            )

        # Allow a new request after rejection or revocation
        existing.status = "pending"
        db.commit()
        db.refresh(existing)

        return {
            "message": "Access request sent successfully.",
            "request_id": existing.id,
            "status": existing.status,
        }

    access_request = DoctorPatientAccess(
        doctor_id=current_user.id,
        patient_id=patient_id,
        status="pending",
    )

    db.add(access_request)
    db.commit()
    db.refresh(access_request)

    return {
        "message": "Access request sent successfully.",
        "request_id": access_request.id,
        "status": access_request.status,
    }


# --------------------------------------------------
# 2. PATIENT VIEWS INCOMING REQUESTS
# --------------------------------------------------

@router.get("/incoming")
def get_incoming_requests(
    current_user: User = Depends(require_role("patient")),
    db: Session = Depends(get_db),
):

    requests = db.query(DoctorPatientAccess).filter(
        DoctorPatientAccess.patient_id == current_user.id,
        DoctorPatientAccess.status == "pending",
    ).order_by(
        DoctorPatientAccess.requested_at.desc()
    ).all()

    results = []

    for request in requests:

        doctor = db.query(User).filter(
            User.id == request.doctor_id,
            User.role == "doctor",
        ).first()

        profile = db.query(DoctorProfile).filter(
            DoctorProfile.user_id == request.doctor_id
        ).first()

        results.append({
            "request_id": request.id,
            "doctor_id": request.doctor_id,
            "doctor_name": doctor.full_name if doctor else None,
            "doctor_email": doctor.email if doctor else None,
            "specialization": (
                profile.specialization if profile else None
            ),
            "qualification": (
                profile.qualification if profile else None
            ),
            "status": request.status,
            "requested_at": (
                request.requested_at.isoformat()
                if request.requested_at else None
            ),
        })

    return {
        "total_requests": len(results),
        "requests": results,
    }


# --------------------------------------------------
# 3. PATIENT APPROVES ACCESS
# --------------------------------------------------

@router.post("/{request_id}/approve")
def approve_access_request(
    request_id: int,
    current_user: User = Depends(require_role("patient")),
    db: Session = Depends(get_db),
):

    access_request = db.query(DoctorPatientAccess).filter(
        DoctorPatientAccess.id == request_id,
        DoctorPatientAccess.patient_id == current_user.id,
    ).first()

    if not access_request:
        raise HTTPException(
            status_code=404,
            detail="Access request not found.",
        )

    if access_request.status != "pending":
        raise HTTPException(
            status_code=409,
            detail="This request has already been handled.",
        )

    doctor = db.query(User).filter(
        User.id == access_request.doctor_id,
        User.role == "doctor",
        User.is_active.is_(True),
    ).first()

    if not doctor:
        raise HTTPException(
            status_code=403,
            detail="Doctor account is unavailable.",
        )

    verify_doctor(doctor.id, db)

    access_request.status = "approved"

    db.commit()
    db.refresh(access_request)

    return {
        "message": "Doctor access approved successfully.",
        "request_id": access_request.id,
        "status": access_request.status,
    }


# --------------------------------------------------
# 4. PATIENT REJECTS ACCESS
# --------------------------------------------------

@router.post("/{request_id}/reject")
def reject_access_request(
    request_id: int,
    current_user: User = Depends(require_role("patient")),
    db: Session = Depends(get_db),
):

    access_request = db.query(DoctorPatientAccess).filter(
        DoctorPatientAccess.id == request_id,
        DoctorPatientAccess.patient_id == current_user.id,
    ).first()

    if not access_request:
        raise HTTPException(
            status_code=404,
            detail="Access request not found.",
        )

    if access_request.status != "pending":
        raise HTTPException(
            status_code=409,
            detail="This request has already been handled.",
        )

    access_request.status = "rejected"

    db.commit()
    db.refresh(access_request)

    return {
        "message": "Access request rejected.",
        "request_id": access_request.id,
        "status": access_request.status,
    }


# --------------------------------------------------
# 5. PATIENT REVOKES APPROVED ACCESS
# --------------------------------------------------

@router.post("/{request_id}/revoke")
def revoke_doctor_access(
    request_id: int,
    current_user: User = Depends(require_role("patient")),
    db: Session = Depends(get_db),
):

    # Find the access record belonging to this patient
    access_request = db.query(DoctorPatientAccess).filter(
        DoctorPatientAccess.id == request_id,
        DoctorPatientAccess.patient_id == current_user.id,
    ).first()

    if not access_request:
        raise HTTPException(
            status_code=404,
            detail="Access record not found.",
        )

    # Only approved access can be revoked
    if access_request.status != "approved":
        raise HTTPException(
            status_code=409,
            detail="Only approved access can be revoked.",
        )

    access_request.status = "revoked"
    try:
        db.commit()
    except SQLAlchemyError as exc:
        db.rollback()
        logger.exception(
            "Failed to revoke access request %s for patient %s",
            request_id,
            current_user.id,
        )
        raise HTTPException(
            status_code=500,
            detail="Unable to revoke doctor access.",
        ) from exc

    return {
        "message": "Doctor access revoked successfully.",
        "request_id": access_request.id,
        "status": access_request.status,
    }


# --------------------------------------------------
# 6. DOCTOR VIEWS THEIR ACCESS REQUESTS
# --------------------------------------------------

@router.get("/my-requests")
def get_my_access_requests(
    current_user: User = Depends(require_role("doctor")),
    db: Session = Depends(get_db),
):

    verify_doctor(current_user.id, db)

    requests = db.query(DoctorPatientAccess).filter(
        DoctorPatientAccess.doctor_id == current_user.id,
    ).order_by(
        DoctorPatientAccess.requested_at.desc()
    ).all()

    results = []

    for request in requests:

        patient = db.query(User).filter(
            User.id == request.patient_id,
            User.role == "patient",
        ).first()

        results.append({
            "request_id": request.id,
            "patient_id": request.patient_id,
            "patient_name": patient.full_name if patient else None,
            "status": request.status,
            "requested_at": (
                request.requested_at.isoformat()
                if request.requested_at else None
            ),
        })

    return {
        "total_requests": len(results),
        "requests": results,
    }

# --------------------------------------------------
# 7. DOCTOR SEARCHES FOR A PATIENT
# --------------------------------------------------

@router.get("/search-patients")
def search_patients(
    q: str,
    current_user: User = Depends(require_role("doctor")),
    db: Session = Depends(get_db),
):
    verify_doctor(current_user.id, db)

    if len(q.strip()) < 2:
        raise HTTPException(
            status_code=400,
            detail="Enter at least 2 characters to search.",
        )

    patients = db.query(User).filter(
        User.role == "patient",
        User.is_active.is_(True),
        User.full_name.ilike(f"%{q.strip()}%"),
    ).limit(20).all()

    return {
        "total_patients": len(patients),
        "patients": [
            {
                "id": patient.id,
                "full_name": patient.full_name,
            }
            for patient in patients
        ],
    }

# --------------------------------------------------
# 8. PATIENT VIEWS CONNECTED DOCTORS
# --------------------------------------------------

@router.get("/connected-doctors")
def get_connected_doctors(
    current_user: User = Depends(require_role("patient")),
    db: Session = Depends(get_db),
):
    connections = db.query(DoctorPatientAccess).filter(
        DoctorPatientAccess.patient_id == current_user.id,
        DoctorPatientAccess.status == "approved",
    ).order_by(
        DoctorPatientAccess.updated_at.desc()
    ).all()

    results = []

    for connection in connections:
        doctor = db.query(User).filter(
            User.id == connection.doctor_id,
            User.role == "doctor",
            User.is_active.is_(True),
        ).first()

        if not doctor:
            continue

        profile = db.query(DoctorProfile).filter(
            DoctorProfile.user_id == doctor.id
        ).first()

        results.append({
            "request_id": connection.id,
            "doctor_id": doctor.id,
            "doctor_name": doctor.full_name,
            "doctor_email": doctor.email,
            "specialization": (
                profile.specialization if profile else None
            ),
            "qualification": (
                profile.qualification if profile else None
            ),
            "status": connection.status,
        })

    return {
        "total_connected": len(results),
        "doctors": results,
    }

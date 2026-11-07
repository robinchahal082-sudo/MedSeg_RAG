
import uuid
from pathlib import Path

from fastapi import (
    APIRouter,
    Depends,
    File,
    Form,
    HTTPException,
    UploadFile,
    status,
)
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError

from app.database import get_db
from app.dependencies import require_role, get_current_user
from app.models import (
    MedicalDocument,
    User,
    DoctorProfile,
    DoctorPatientAccess,
)


router = APIRouter(
    prefix="/api/documents",
    tags=["Medical Documents"],
)

# Private document storage
BACKEND_DIR = Path(__file__).resolve().parents[2]
STORAGE_DIR = BACKEND_DIR / "storage" / "medical_documents"

MAX_FILE_SIZE = 10 * 1024 * 1024
CHUNK_SIZE = 1024 * 1024

DOCUMENT_TYPES = {
    "Lab Report",
    "Prescription",
    "Discharge Summary",
    "Medical History",
    "Other",
}


# --------------------------------------------------
# HELPER FUNCTIONS
# --------------------------------------------------

def ensure_storage():
    STORAGE_DIR.mkdir(parents=True, exist_ok=True)


def verify_doctor(doctor_id: int, db: Session):

    profile = db.query(DoctorProfile).filter(
        DoctorProfile.user_id == doctor_id
    ).first()

    if not profile or profile.verification_status != "verified":
        raise HTTPException(
            status_code=403,
            detail="Doctor account is not verified.",
        )

    return profile


def check_patient_access(
    doctor_id: int,
    patient_id: int,
    db: Session,
):
    verify_doctor(doctor_id, db)

    access = db.query(DoctorPatientAccess).filter(
        DoctorPatientAccess.doctor_id == doctor_id,
        DoctorPatientAccess.patient_id == patient_id,
        DoctorPatientAccess.status == "approved",
    ).first()

    if not access:
        raise HTTPException(
            status_code=403,
            detail="Patient has not granted you access to these records.",
        )

    return access


def get_owned_document(
    document_id: int,
    patient_id: int,
    db: Session,
):
    document = db.query(MedicalDocument).filter(
        MedicalDocument.id == document_id,
        MedicalDocument.patient_id == patient_id,
    ).first()

    if not document:
        raise HTTPException(
            status_code=404,
            detail="Document not found",
        )

    return document


def validate_document_path(document: MedicalDocument):
    path = Path(document.file_path).resolve()

    if not path.is_relative_to(STORAGE_DIR.resolve()):
        raise HTTPException(
            status_code=403,
            detail="Invalid document storage location",
        )

    if not path.is_file():
        raise HTTPException(
            status_code=404,
            detail="Stored document not found",
        )

    return path


def serialize_document(doc: MedicalDocument):
    return {
        "id": doc.id,
        "filename": doc.original_filename,
        "file_size": doc.file_size,
        "document_type": doc.document_type,
        "processing_status": doc.processing_status,
        "uploaded_at": (
            doc.uploaded_at.isoformat()
            if doc.uploaded_at else None
        ),
    }


# --------------------------------------------------
# 1. UPLOAD MEDICAL DOCUMENTS
# PATIENT ONLY
# --------------------------------------------------

@router.post(
    "/upload",
    status_code=status.HTTP_201_CREATED,
)
async def upload_documents(
    files: list[UploadFile] = File(...),
    document_type: str = Form("Other"),
    current_user: User = Depends(require_role("patient")),
    db: Session = Depends(get_db),
):
    if not files:
        raise HTTPException(
            status_code=400,
            detail="Please select at least one PDF",
        )

    document_type = document_type.strip()

    if document_type not in DOCUMENT_TYPES:
        raise HTTPException(
            status_code=400,
            detail="Invalid document category",
        )

    ensure_storage()

    saved_paths = []
    created_documents = []

    try:
        for file in files:
            original_name = Path(file.filename or "").name

            if not original_name:
                raise HTTPException(
                    status_code=400,
                    detail="Invalid filename",
                )

            if Path(original_name).suffix.lower() != ".pdf":
                raise HTTPException(
                    status_code=400,
                    detail=f"{original_name}: Only PDF files are allowed",
                )

            stored_name = f"{uuid.uuid4().hex}.pdf"
            file_path = STORAGE_DIR / stored_name

            total_size = 0
            header = b""

            try:
                with file_path.open("xb") as destination:
                    saved_paths.append(file_path)

                    while True:
                        chunk = await file.read(CHUNK_SIZE)

                        if not chunk:
                            break

                        if not header:
                            header = chunk[:5]

                        total_size += len(chunk)

                        if total_size > MAX_FILE_SIZE:
                            raise HTTPException(
                                status_code=413,
                                detail=f"{original_name}: Maximum file size is 10 MB",
                            )

                        destination.write(chunk)

            finally:
                await file.close()

            if header != b"%PDF-":
                raise HTTPException(
                    status_code=400,
                    detail=f"{original_name}: Invalid PDF file",
                )

            if total_size == 0:
                raise HTTPException(
                    status_code=400,
                    detail=f"{original_name}: Empty file",
                )

            document = MedicalDocument(
                patient_id=current_user.id,
                original_filename=original_name,
                stored_filename=stored_name,
                file_path=str(file_path),
                file_size=total_size,
                document_type=document_type,
                mime_type="application/pdf",
                processing_status="uploaded",
            )

            db.add(document)
            db.flush()

            created_documents.append({
                "id": document.id,
                "filename": document.original_filename,
                "file_size": document.file_size,
                "document_type": document.document_type,
                "processing_status": document.processing_status,
            })

        db.commit()

        return {
            "message": "Documents uploaded successfully",
            "total_uploaded": len(created_documents),
            "documents": created_documents,
        }

    except HTTPException:
        db.rollback()

        for path in saved_paths:
            path.unlink(missing_ok=True)

        raise

    except Exception:
        db.rollback()

        for path in saved_paths:
            path.unlink(missing_ok=True)

        raise HTTPException(
            status_code=500,
            detail="Document upload failed. Please try again.",
        )


# --------------------------------------------------
# 2. GET MY DOCUMENTS
# PATIENT ONLY
# --------------------------------------------------

@router.get("/")
def get_my_documents(
    current_user: User = Depends(require_role("patient")),
    db: Session = Depends(get_db),
):
    documents = db.query(MedicalDocument).filter(
        MedicalDocument.patient_id == current_user.id
    ).order_by(
        MedicalDocument.uploaded_at.desc()
    ).all()

    return {
        "total_documents": len(documents),
        "documents": [
            serialize_document(doc)
            for doc in documents
        ],
    }


# --------------------------------------------------
# 3. DOCTOR VIEWS AN APPROVED PATIENT'S DOCUMENTS
# DOCTOR ONLY
# --------------------------------------------------

@router.get("/patient/{patient_id}")
def get_patient_documents(
    patient_id: int,
    current_user: User = Depends(require_role("doctor")),
    db: Session = Depends(get_db),
):

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

    check_patient_access(
        doctor_id=current_user.id,
        patient_id=patient_id,
        db=db,
    )

    documents = db.query(MedicalDocument).filter(
        MedicalDocument.patient_id == patient_id
    ).order_by(
        MedicalDocument.uploaded_at.desc()
    ).all()

    return {
        "patient": {
            "id": patient.id,
            "full_name": patient.full_name,
        },
        "total_documents": len(documents),
        "documents": [
            serialize_document(doc)
            for doc in documents
        ],
    }


# --------------------------------------------------
# 4. SECURE DOCUMENT DOWNLOAD
# PATIENT OWNER OR APPROVED DOCTOR
# --------------------------------------------------

@router.get("/{document_id}/download")
def download_document(
    document_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):

    document = db.query(MedicalDocument).filter(
        MedicalDocument.id == document_id
    ).first()

    if not document:
        raise HTTPException(
            status_code=404,
            detail="Document not found.",
        )

    # Patient can download their own document
    if current_user.role == "patient":

        if document.patient_id != current_user.id:
            raise HTTPException(
                status_code=404,
                detail="Document not found.",
            )

    # Doctor must be verified and approved by the patient
    elif current_user.role == "doctor":

        check_patient_access(
            doctor_id=current_user.id,
            patient_id=document.patient_id,
            db=db,
        )

    else:
        raise HTTPException(
            status_code=403,
            detail="You are not authorized to download documents.",
        )

    path = validate_document_path(document)

    return FileResponse(
        path=path,
        media_type="application/pdf",
        filename=document.original_filename,
    )


# --------------------------------------------------
# 5. DELETE PATIENT DOCUMENT
# PATIENT OWNER ONLY
# --------------------------------------------------

@router.delete("/{document_id}")
def delete_document(
    document_id: int,
    current_user: User = Depends(require_role("patient")),
    db: Session = Depends(get_db),
):

    document = get_owned_document(
        document_id,
        current_user.id,
        db,
    )

    path = validate_document_path(document)

    try:
        db.delete(document)
        db.commit()

        path.unlink(missing_ok=True)

        return {
            "message": "Document deleted successfully",
            "document_id": document_id,
        }

    except SQLAlchemyError:
        db.rollback()

        raise HTTPException(
            status_code=500,
            detail="Could not delete document",
        )



from sqlalchemy import (
    Column,
    Integer,
    String,
    Boolean,
    DateTime,
    Date,
    ForeignKey,
    CheckConstraint,
    BigInteger,
    UniqueConstraint,
    func
)


from app.database import Base


# 1. Common User Table
class User(Base):

    __tablename__ = "users"

    __table_args__ = (
        CheckConstraint(
            "role IN ('patient', 'doctor', 'admin')",
            name="check_user_role"
        ),
    )

    id = Column(Integer, primary_key=True, index=True)

    full_name = Column(String(150), nullable=False)

    email = Column(
        String(255),
        unique=True,
        nullable=False,
        index=True
    )

    contact_number = Column(String(15), nullable=False)

    hashed_password = Column(String(255), nullable=False)

    role = Column(String(20), nullable=False)

    is_active = Column(Boolean, default=True)

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )


# 2. Patient Profile Table
class PatientProfile(Base):

    __tablename__ = "patient_profiles"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        unique=True,
        nullable=False
    )

    date_of_birth = Column(Date, nullable=True)


# 3. Doctor Profile Table
class DoctorProfile(Base):

    __tablename__ = "doctor_profiles"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        unique=True,
        nullable=False
    )

    specialization = Column(String(150), nullable=False)

    qualification = Column(String(150), nullable=False)

    registration_number = Column(
        String(100),
        unique=True,
        nullable=False
    )

    verification_status = Column(
        String(30),
        default="pending",
        nullable=False
    )


# 4. Medical Document Table
class MedicalDocument(Base):

    __tablename__ = "medical_documents"

    __table_args__ = (
        CheckConstraint(
            "processing_status IN "
            "('uploaded', 'pending', 'processing', 'processed', 'failed')",
            name="check_document_processing_status"
        ),
    )

    id = Column(Integer, primary_key=True, index=True)

    # Patient who uploaded the document
    patient_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    # Original uploaded filename
    original_filename = Column(
        String(255),
        nullable=False
    )

    # Unique filename stored on server
    stored_filename = Column(
        String(255),
        unique=True,
        nullable=False
    )

    # Document storage location
    file_path = Column(
        String(500),
        nullable=False
    )

    # File size in bytes
    file_size = Column(
        BigInteger,
        nullable=False
    )

    # Document category
    document_type = Column(
        String(100),
        nullable=True
    )

    # MIME type
    mime_type = Column(
        String(100),
        default="application/pdf",
        nullable=False
    )

    # AI processing status
    processing_status = Column(
        String(30),
        default="uploaded",
        nullable=False
    )

    # Processing error, if any
    processing_error = Column(
        String(1000),
        nullable=True
    )

    uploaded_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )

# 5. Doctor-Patient Access Request Table

# 5. Doctor-Patient Access Request Table
class DoctorPatientAccess(Base):

    __tablename__ = "doctor_patient_access"

    __table_args__ = (
        CheckConstraint(
            "status IN ('pending', 'approved', 'rejected', 'revoked')",
            name="check_access_request_status"
        ),
        UniqueConstraint(
            "doctor_id",
            "patient_id",
            name="unique_doctor_patient_access"
        ),
    )

    id = Column(Integer, primary_key=True, index=True)

    doctor_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    patient_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    status = Column(
        String(20),
        default="pending",
        nullable=False
    )

    requested_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )

    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False
    )

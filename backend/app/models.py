
from sqlalchemy import (
    Column,
    Integer,
    String,
    Boolean,
    DateTime,
    Date,
    ForeignKey,
    CheckConstraint,
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

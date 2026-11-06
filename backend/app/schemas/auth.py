
from datetime import date

from pydantic import (
    BaseModel,
    EmailStr,
    Field,
    model_validator
)


# PATIENT REGISTRATION SCHEMA
class PatientRegister(BaseModel):

    full_name: str = Field(
        min_length=2,
        max_length=150
    )

    email: EmailStr

    password: str = Field(min_length=8)

    confirm_password: str

    contact_number: str = Field(
        min_length=10,
        max_length=15
    )

    date_of_birth: date | None = None

    @model_validator(mode="after")
    def check_passwords(self):

        if self.password != self.confirm_password:
            raise ValueError("Passwords do not match")

        return self


# DOCTOR REGISTRATION SCHEMA
class DoctorRegister(BaseModel):

    full_name: str = Field(
        min_length=2,
        max_length=150
    )

    email: EmailStr

    password: str = Field(min_length=8)

    confirm_password: str

    contact_number: str = Field(
        min_length=10,
        max_length=15
    )

    specialization: str

    qualification: str

    registration_number: str

    @model_validator(mode="after")
    def check_passwords(self):

        if self.password != self.confirm_password:
            raise ValueError("Passwords do not match")

        return self


# LOGIN SCHEMA
class LoginRequest(BaseModel):

    email: EmailStr

    password: str


from datetime import date

from pydantic import (
    BaseModel,
    ConfigDict,
    EmailStr,
    Field,
    field_validator,
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


class ProfileUpdate(BaseModel):

    model_config = ConfigDict(extra="forbid")

    full_name: str | None = Field(default=None, min_length=2, max_length=150)
    email: EmailStr | None = None
    contact_number: str | None = Field(default=None, min_length=10, max_length=15)
    date_of_birth: date | None = None
    specialization: str | None = Field(default=None, min_length=1, max_length=150)
    qualification: str | None = Field(default=None, min_length=1, max_length=150)

    @field_validator(
        "full_name",
        "email",
        "contact_number",
        "specialization",
        "qualification",
        mode="before",
    )
    @classmethod
    def strip_string_fields(cls, value):
        return value.strip() if isinstance(value, str) else value

    @field_validator("date_of_birth")
    @classmethod
    def validate_date_of_birth(cls, value):
        if value is not None and value > date.today():
            raise ValueError("Date of birth cannot be in the future")
        return value

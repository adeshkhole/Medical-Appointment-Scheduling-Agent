from pydantic import BaseModel

class PatientInfo(BaseModel):
    name: str
    phone: str
    email: str
    reason: str

class AppointmentRequest(BaseModel):
    appointment_type: str
    slot: dict
    patient: PatientInfo

class BookingConfirmation(BaseModel):
    booking_id: str
    slot: dict
    patient: PatientInfo

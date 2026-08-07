from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel
from app.schemas.room_schema import RoomOut
from app.schemas.user_schema import UserOut

class EventCategoryOut(BaseModel):
    id: int
    name: str
    icon: Optional[str] = None
    description: Optional[str] = None

    class Config:
        from_attributes = True

class EventSpeakerOut(BaseModel):
    id: int
    event_id: str
    name: str
    title: Optional[str] = None
    bio: Optional[str] = None
    photo_url: Optional[str] = None
    organization: Optional[str] = None

    class Config:
        from_attributes = True

class EventGalleryOut(BaseModel):
    id: int
    event_id: str
    image_url: str
    caption: Optional[str] = None

    class Config:
        from_attributes = True

class EventAnnouncementOut(BaseModel):
    id: int
    event_id: Optional[str] = None
    title: str
    content: str
    type: str
    created_at: datetime

    class Config:
        from_attributes = True

class EventSponsorOut(BaseModel):
    id: int
    event_id: str
    name: str
    logo_url: Optional[str] = None
    tier: str

    class Config:
        from_attributes = True

class EventFAQOut(BaseModel):
    id: int
    event_id: str
    question: str
    answer: str

    class Config:
        from_attributes = True

class EventCreate(BaseModel):
    title: str
    description: str
    category_id: Optional[int] = None
    department_id: Optional[int] = None
    room_id: Optional[str] = None
    start_time: datetime
    end_time: Optional[datetime] = None
    registration_deadline: Optional[datetime] = None
    max_seats: int
    event_mode: Optional[str] = "OFFLINE"
    price_type: Optional[str] = "FREE"
    price_amount: Optional[float] = 0.0
    cover_image: Optional[str] = None
    is_public: bool = True

class EventUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category_id: Optional[int] = None
    department_id: Optional[int] = None
    room_id: Optional[str] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    registration_deadline: Optional[datetime] = None
    max_seats: Optional[int] = None
    event_mode: Optional[str] = None
    price_type: Optional[str] = None
    price_amount: Optional[float] = None
    cover_image: Optional[str] = None
    is_public: Optional[bool] = None

class EventReview(BaseModel):
    action: str # APPROVE, REJECT
    comments: Optional[str] = None

class EventOut(BaseModel):
    id: str
    title: str
    description: str
    category_id: Optional[int] = None
    department_id: Optional[int] = None
    organizer_id: str
    room_id: Optional[str] = None
    start_time: datetime
    end_time: datetime
    registration_deadline: Optional[datetime] = None
    max_seats: int
    event_mode: str
    price_type: str
    price_amount: float
    cover_image: Optional[str] = None
    status: str
    is_public: bool
    is_published: bool
    is_deleted: bool
    created_at: datetime
    room: Optional[RoomOut] = None
    organizer: Optional[UserOut] = None
    category: Optional[EventCategoryOut] = None
    speakers: Optional[List[EventSpeakerOut]] = []
    gallery: Optional[List[EventGalleryOut]] = []
    announcements: Optional[List[EventAnnouncementOut]] = []
    sponsors: Optional[List[EventSponsorOut]] = []
    faqs: Optional[List[EventFAQOut]] = []
    registered_count: Optional[int] = 0

    class Config:
        from_attributes = True

class AttendanceOut(BaseModel):
    id: int
    registration_id: str
    scanned_by_id: str
    scanned_at: datetime

    class Config:
        from_attributes = True

class CertificateOut(BaseModel):
    id: str
    registration_id: str
    certificate_number: str
    issued_at: datetime
    pdf_url: Optional[str] = None

    class Config:
        from_attributes = True

class EventRegistrationOut(BaseModel):
    id: str
    event_id: str
    user_id: str
    ticket_code: str
    qr_code: Optional[str] = None
    status: str
    payment_status: str
    attendance_status: Optional[str] = None
    registered_at: datetime
    event: Optional[EventOut] = None
    user: Optional[UserOut] = None
    attendance: Optional[AttendanceOut] = None
    certificate: Optional[CertificateOut] = None

    class Config:
        from_attributes = True

class QRVerifyRequest(BaseModel):
    ticket_code: str

class QRVerifyResponse(BaseModel):
    valid: bool
    message: str
    registration: Optional[EventRegistrationOut] = None


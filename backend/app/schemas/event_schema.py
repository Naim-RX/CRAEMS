from datetime import datetime
from typing import Optional
from pydantic import BaseModel
from app.schemas.room_schema import RoomOut
from app.schemas.user_schema import UserOut

class EventCreate(BaseModel):
    title: str
    description: str
    room_id: str
    start_time: datetime
    end_time: datetime
    max_seats: int
    is_public: bool = True

class EventOut(BaseModel):
    id: str
    title: str
    description: str
    organizer_id: str
    room_id: str
    start_time: datetime
    end_time: datetime
    max_seats: int
    is_public: bool
    created_at: datetime
    room: Optional[RoomOut] = None
    organizer: Optional[UserOut] = None

    class Config:
        from_attributes = True

class EventRegistrationOut(BaseModel):
    id: str
    event_id: str
    user_id: str
    ticket_code: str
    registered_at: datetime
    event: Optional[EventOut] = None
    user: Optional[UserOut] = None

    class Config:
        from_attributes = True

class QRVerifyRequest(BaseModel):
    ticket_code: str

class QRVerifyResponse(BaseModel):
    valid: bool
    message: str
    registration: Optional[EventRegistrationOut] = None

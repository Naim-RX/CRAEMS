from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field
from app.schemas.room_schema import RoomOut
from app.schemas.user_schema import UserOut

class BookingCreate(BaseModel):
    room_id: str
    title: str
    purpose: str
    start_time: datetime
    end_time: datetime
    attendees_count: int = Field(..., gt=0)

class ConflictCheckRequest(BaseModel):
    room_id: str
    start_time: datetime
    end_time: datetime
    exclude_booking_id: Optional[str] = None

class ConflictCheckResponse(BaseModel):
    is_conflicting: bool
    conflicting_booking_id: Optional[str] = None
    message: str

class BookingApprovalAction(BaseModel):
    action: str  # APPROVED or REJECTED
    comments: Optional[str] = None

class BookingOut(BaseModel):
    id: str
    booking_reference: str
    room_id: str
    user_id: str
    title: str
    purpose: str
    start_time: datetime
    end_time: datetime
    status: str
    attendees_count: int
    created_at: datetime
    room: Optional[RoomOut] = None
    user: Optional[UserOut] = None

    class Config:
        from_attributes = True

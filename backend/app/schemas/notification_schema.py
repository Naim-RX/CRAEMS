from datetime import datetime
from typing import Optional
from pydantic import BaseModel

class NotificationOut(BaseModel):
    id: int
    user_id: str
    title: str
    message: str
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True

class NotificationCreate(BaseModel):
    user_id: str
    title: str
    message: str

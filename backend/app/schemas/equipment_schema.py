from datetime import datetime
from typing import Optional
from pydantic import BaseModel
from app.schemas.user_schema import UserOut

class EquipmentCategoryOut(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    class Config:
        from_attributes = True

class EquipmentCreate(BaseModel):
    serial_number: str
    name: str
    category_id: int
    assigned_room_id: Optional[str] = None
    condition: Optional[str] = "EXCELLENT"
    is_available: Optional[bool] = True

class EquipmentOut(BaseModel):
    id: str
    serial_number: str
    name: str
    category: EquipmentCategoryOut
    condition: str
    is_available: bool
    assigned_room_id: Optional[str] = None

    class Config:
        from_attributes = True

class EquipmentReservationCreate(BaseModel):
    equipment_id: str
    start_time: datetime
    expected_return_time: datetime

class EquipmentReservationOut(BaseModel):
    id: str
    equipment_id: str
    user_id: str
    start_time: datetime
    expected_return_time: datetime
    actual_return_time: Optional[datetime] = None
    status: str
    equipment: Optional[EquipmentOut] = None
    user: Optional[UserOut] = None

    class Config:
        from_attributes = True


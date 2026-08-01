from typing import Optional, List, Dict, Any
from pydantic import BaseModel

class BuildingOut(BaseModel):
    id: int
    code: str
    name: str
    total_floors: int
    class Config:
        from_attributes = True

class FloorOut(BaseModel):
    id: int
    building_id: int
    floor_number: int
    floor_name: Optional[str] = None
    class Config:
        from_attributes = True

class RoomTypeOut(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    class Config:
        from_attributes = True

class RoomImageOut(BaseModel):
    id: int
    image_url: str
    is_primary: bool
    class Config:
        from_attributes = True

class RoomCreate(BaseModel):
    room_number: str
    building_id: int
    floor_id: int
    room_type_id: int
    capacity: int
    is_active: bool = True
    features: Optional[Dict[str, Any]] = None

class RoomOut(BaseModel):
    id: str
    room_number: str
    building: BuildingOut
    floor: FloorOut
    room_type: RoomTypeOut
    capacity: int
    is_active: bool
    is_maintenance: bool
    features: Optional[Dict[str, Any]] = None
    images: List[RoomImageOut] = []

    class Config:
        from_attributes = True

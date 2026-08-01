from typing import List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.core.database import get_db
from app.models.facility import Room, Building, Floor, RoomType
from app.schemas.room_schema import RoomOut, RoomCreate, BuildingOut, RoomTypeOut

router = APIRouter()

@router.get("", response_model=List[RoomOut])
async def list_rooms(
    building_id: Optional[int] = Query(None),
    room_type_id: Optional[int] = Query(None),
    min_capacity: Optional[int] = Query(None),
    is_active: Optional[bool] = Query(True),
    db: AsyncSession = Depends(get_db)
):
    stmt = (
        select(Room)
        .options(
            selectinload(Room.building),
            selectinload(Room.floor),
            selectinload(Room.room_type),
            selectinload(Room.images)
        )
    )
    if building_id:
        stmt = stmt.where(Room.building_id == building_id)
    if room_type_id:
        stmt = stmt.where(Room.room_type_id == room_type_id)
    if min_capacity:
        stmt = stmt.where(Room.capacity >= min_capacity)
    if is_active is not None:
        stmt = stmt.where(Room.is_active == is_active)

    result = await db.execute(stmt)
    return result.scalars().all()

@router.get("/buildings", response_model=List[BuildingOut])
async def get_buildings(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Building))
    return result.scalars().all()

@router.get("/types", response_model=List[RoomTypeOut])
async def get_room_types(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(RoomType))
    return result.scalars().all()

@router.post("", response_model=RoomOut, status_code=201)
async def create_room(room_in: RoomCreate, db: AsyncSession = Depends(get_db)):
    room = Room(
        room_number=room_in.room_number,
        building_id=room_in.building_id,
        floor_id=room_in.floor_id,
        room_type_id=room_in.room_type_id,
        capacity=room_in.capacity,
        is_active=room_in.is_active,
        features=room_in.features or {}
    )
    db.add(room)
    await db.commit()
    await db.refresh(room)
    
    stmt = select(Room).options(
        selectinload(Room.building),
        selectinload(Room.floor),
        selectinload(Room.room_type),
        selectinload(Room.images)
    ).where(Room.id == room.id)
    res = await db.execute(stmt)
    return res.scalars().first()

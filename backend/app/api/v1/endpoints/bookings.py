from typing import List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.core.database import get_db
from app.models.booking import RoomBooking
from app.models.facility import Room
from app.models.user import User
from app.schemas.booking_schema import (
    BookingCreate,
    BookingOut,
    ConflictCheckRequest,
    ConflictCheckResponse,
    BookingApprovalAction
)
from app.services.booking_service import BookingService

router = APIRouter()

@router.post("/check-conflict", response_model=ConflictCheckResponse)
async def check_conflict(req: ConflictCheckRequest, db: AsyncSession = Depends(get_db)):
    conflicting = await BookingService.check_conflict(
        db, req.room_id, req.start_time, req.end_time, req.exclude_booking_id
    )
    if conflicting:
        return ConflictCheckResponse(
            is_conflicting=True,
            conflicting_booking_id=conflicting.id,
            message=f"Conflict detected with booking ref {conflicting.booking_reference}"
        )
    return ConflictCheckResponse(
        is_conflicting=False,
        message="Slot is available for booking."
    )

@router.post("", response_model=BookingOut, status_code=201)
async def create_booking(
    booking_in: BookingCreate,
    user_id: str = Query(..., description="Active user ID"),
    db: AsyncSession = Depends(get_db)
):
    # Retrieve user role
    res = await db.execute(select(User).options(selectinload(User.role)).where(User.id == user_id))
    user = res.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    booking = await BookingService.create_booking(
        db=db,
        user_id=user_id,
        room_id=booking_in.room_id,
        title=booking_in.title,
        purpose=booking_in.purpose,
        start_time=booking_in.start_time,
        end_time=booking_in.end_time,
        attendees_count=booking_in.attendees_count,
        user_role=user.role.name
    )
    
    # Reload with relationships
    stmt = (
        select(RoomBooking)
        .options(
            selectinload(RoomBooking.room).selectinload(Room.building),
            selectinload(RoomBooking.room).selectinload(Room.floor),
            selectinload(RoomBooking.room).selectinload(Room.room_type),
            selectinload(RoomBooking.room).selectinload(Room.images),
            selectinload(RoomBooking.user).selectinload(User.role),
            selectinload(RoomBooking.user).selectinload(User.department)
        )
        .where(RoomBooking.id == booking.id)
    )
    res = await db.execute(stmt)
    return res.scalars().first()

@router.get("", response_model=List[BookingOut])
async def list_bookings(
    user_id: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    stmt = (
        select(RoomBooking)
        .options(
            selectinload(RoomBooking.room).selectinload(Room.building),
            selectinload(RoomBooking.room).selectinload(Room.floor),
            selectinload(RoomBooking.room).selectinload(Room.room_type),
            selectinload(RoomBooking.room).selectinload(Room.images),
            selectinload(RoomBooking.user).selectinload(User.role),
            selectinload(RoomBooking.user).selectinload(User.department)
        )
        .order_by(RoomBooking.start_time.desc())
    )
    if user_id:
        stmt = stmt.where(RoomBooking.user_id == user_id)
    if status:
        stmt = stmt.where(RoomBooking.status == status)

    result = await db.execute(stmt)
    return result.scalars().all()

@router.post("/{booking_id}/approve", response_model=BookingOut)
async def review_booking(
    booking_id: str,
    action_in: BookingApprovalAction,
    approver_id: str = Query(..., description="Manager or Admin User ID"),
    db: AsyncSession = Depends(get_db)
):
    booking = await BookingService.review_booking(
        db=db,
        booking_id=booking_id,
        approver_id=approver_id,
        action=action_in.action,
        comments=action_in.comments
    )
    
    stmt = (
        select(RoomBooking)
        .options(
            selectinload(RoomBooking.room).selectinload(RoomBooking.room.building),
            selectinload(RoomBooking.user).selectinload(User.role)
        )
        .where(RoomBooking.id == booking.id)
    )
    res = await db.execute(stmt)
    return res.scalars().first()

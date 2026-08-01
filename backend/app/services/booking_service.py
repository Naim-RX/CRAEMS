import random
import string
from datetime import datetime
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_
from app.models.booking import RoomBooking, BookingApproval
from app.models.facility import Room
from app.core.exceptions import BookingConflictException, EntityNotFoundException

class BookingService:

    @staticmethod
    def generate_booking_reference() -> str:
        prefix = "BKG"
        digits = "".join(random.choices(string.digits, k=8))
        return f"{prefix}-{digits}"

    @staticmethod
    async def check_conflict(
        db: AsyncSession,
        room_id: str,
        start_time: datetime,
        end_time: datetime,
        exclude_booking_id: Optional[str] = None
    ) -> Optional[RoomBooking]:
        stmt = select(RoomBooking).where(
            and_(
                RoomBooking.room_id == room_id,
                RoomBooking.status.in_(["PENDING", "APPROVED"]),
                or_(
                    and_(RoomBooking.start_time <= start_time, RoomBooking.end_time > start_time),
                    and_(RoomBooking.start_time < end_time, RoomBooking.end_time >= end_time),
                    and_(RoomBooking.start_time >= start_time, RoomBooking.end_time <= end_time)
                )
            )
        )
        if exclude_booking_id:
            stmt = stmt.where(RoomBooking.id != exclude_booking_id)
        
        result = await db.execute(stmt)
        return result.scalars().first()

    @classmethod
    async def create_booking(
        cls,
        db: AsyncSession,
        user_id: str,
        room_id: str,
        title: str,
        purpose: str,
        start_time: datetime,
        end_time: datetime,
        attendees_count: int,
        user_role: str = "STUDENT"
    ) -> RoomBooking:
        # Check if room exists
        room_res = await db.execute(select(Room).where(Room.id == room_id))
        room = room_res.scalars().first()
        if not room:
            raise EntityNotFoundException("Room", room_id)
        
        if room.is_maintenance or not room.is_active:
            raise BookingConflictException("The selected room is currently inactive or under maintenance.")

        if attendees_count > room.capacity:
            raise BookingConflictException(f"Attendees count ({attendees_count}) exceeds room capacity ({room.capacity}).")

        # Conflict check
        conflicting = await cls.check_conflict(db, room_id, start_time, end_time)
        if conflicting:
            raise BookingConflictException(
                f"Booking conflict detected. Slot is already booked by Reference: {conflicting.booking_reference}"
            )

        # Faculty bookings auto-approve; student/guest bookings require approval
        initial_status = "APPROVED" if user_role in ["FACULTY", "ADMINISTRATOR", "RESOURCE_MANAGER"] else "PENDING"

        booking = RoomBooking(
            booking_reference=cls.generate_booking_reference(),
            room_id=room_id,
            user_id=user_id,
            title=title,
            purpose=purpose,
            start_time=start_time,
            end_time=end_time,
            status=initial_status,
            attendees_count=attendees_count
        )
        db.add(booking)
        await db.commit()
        await db.refresh(booking)
        return booking

    @staticmethod
    async def review_booking(
        db: AsyncSession,
        booking_id: str,
        approver_id: str,
        action: str,
        comments: Optional[str] = None
    ) -> RoomBooking:
        result = await db.execute(select(RoomBooking).where(RoomBooking.id == booking_id))
        booking = result.scalars().first()
        if not booking:
            raise EntityNotFoundException("RoomBooking", booking_id)

        booking.status = action
        approval = BookingApproval(
            booking_id=booking_id,
            approver_id=approver_id,
            action=action,
            comments=comments
        )
        db.add(approval)
        await db.commit()
        await db.refresh(booking)
        return booking

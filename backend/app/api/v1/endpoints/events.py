import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from app.core.database import get_db
from app.models.event import Event, EventRegistration, Attendance
from app.models.facility import Room
from app.schemas.event_schema import EventOut, EventCreate, EventRegistrationOut, QRVerifyRequest, QRVerifyResponse
from app.services.qr_service import QRService

router = APIRouter()

@router.get("", response_model=List[EventOut])
async def list_events(
    is_public: Optional[bool] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Event).options(
        selectinload(Event.room).selectinload(Room.building),
        selectinload(Event.organizer)
    ).order_by(Event.start_time.asc())
    
    if is_public is not None:
        stmt = stmt.where(Event.is_public == is_public)

    res = await db.execute(stmt)
    return res.scalars().all()

@router.post("", response_model=EventOut, status_code=201)
async def create_event(
    event_in: EventCreate,
    organizer_id: str = Query(..., description="Organizer User ID"),
    db: AsyncSession = Depends(get_db)
):
    event = Event(
        title=event_in.title,
        description=event_in.description,
        organizer_id=organizer_id,
        room_id=event_in.room_id,
        start_time=event_in.start_time,
        end_time=event_in.end_time,
        max_seats=event_in.max_seats,
        is_public=event_in.is_public
    )
    db.add(event)
    await db.commit()
    await db.refresh(event)

    stmt = select(Event).options(
        selectinload(Event.room).selectinload(Room.building),
        selectinload(Event.organizer)
    ).where(Event.id == event.id)
    res = await db.execute(stmt)
    return res.scalars().first()

@router.post("/{event_id}/register")
async def register_event(
    event_id: str,
    user_id: str = Query(..., description="User ID"),
    db: AsyncSession = Depends(get_db)
):
    # Check if event exists
    event_res = await db.execute(select(Event).where(Event.id == event_id))
    event = event_res.scalars().first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found.")

    # Check capacity
    reg_count = await db.execute(select(func.count(EventRegistration.id)).where(EventRegistration.event_id == event_id))
    current = reg_count.scalar() or 0
    if current >= event.max_seats:
        raise HTTPException(status_code=400, detail="Event registration is full.")

    # Check existing registration
    existing = await db.execute(
        select(EventRegistration).where(
            EventRegistration.event_id == event_id,
            EventRegistration.user_id == user_id
        )
    )
    if existing.scalars().first():
        raise HTTPException(status_code=400, detail="Already registered for this event.")

    ticket_code = f"TICK-{uuid.uuid4().hex[:12].upper()}"
    registration = EventRegistration(
        event_id=event_id,
        user_id=user_id,
        ticket_code=ticket_code
    )
    db.add(registration)
    await db.commit()
    await db.refresh(registration)

    qr_image_base64 = QRService.generate_ticket_qr(ticket_code)

    return {
        "registration_id": registration.id,
        "ticket_code": ticket_code,
        "qr_code": qr_image_base64,
        "message": "Event registration successful!"
    }

@router.post("/verify-qr", response_model=QRVerifyResponse)
async def verify_qr(
    req: QRVerifyRequest,
    scanned_by_id: str = Query(..., description="Scanner User ID"),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(EventRegistration).options(
        selectinload(EventRegistration.event),
        selectinload(EventRegistration.user),
        selectinload(EventRegistration.attendance)
    ).where(EventRegistration.ticket_code == req.ticket_code)
    
    res = await db.execute(stmt)
    reg = res.scalars().first()
    if not reg:
        return QRVerifyResponse(valid=False, message="Invalid or fake ticket code.")

    if reg.attendance:
        return QRVerifyResponse(
            valid=False,
            message=f"Ticket already scanned at {reg.attendance.scanned_at.strftime('%H:%M:%S')}.",
            registration=reg
        )

    attendance = Attendance(
        registration_id=reg.id,
        scanned_by_id=scanned_by_id
    )
    db.add(attendance)
    await db.commit()

    return QRVerifyResponse(
        valid=True,
        message=f"Attendance Verified for {reg.user.full_name}!",
        registration=reg
    )

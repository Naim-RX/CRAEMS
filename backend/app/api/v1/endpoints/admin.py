from typing import List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException
from fastapi.responses import StreamingResponse
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, text
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.models.user import User, Role, Department
from app.models.system import AuditLog, Notification
from app.models.booking import RoomBooking
from app.models.equipment import EquipmentReservation, Equipment
from app.models.event import Event
from app.models.facility import Room
from app.schemas.user_schema import UserOut, DepartmentOut
from pydantic import BaseModel

router = APIRouter()

class ReviewRequestPayload(BaseModel):
    request_type: str  # ROOM_BOOKING, EQUIPMENT_RESERVATION, EVENT_ORGANIZATION
    request_id: str
    action: str  # APPROVE, REJECT
    comments: Optional[str] = None

@router.get("/departments", response_model=List[DepartmentOut])
async def list_departments(db: AsyncSession = Depends(get_db)):
    stmt = select(Department).order_by(Department.name.asc())
    res = await db.execute(stmt)
    return res.scalars().all()

@router.get("/users", response_model=List[UserOut])
async def list_all_users(db: AsyncSession = Depends(get_db)):
    stmt = select(User).options(selectinload(User.role), selectinload(User.department))
    res = await db.execute(stmt)
    return res.scalars().all()

@router.get("/audit-logs")
async def list_audit_logs(
    entity: Optional[str] = Query(None),
    action: Optional[str] = Query(None),
    user_id: Optional[str] = Query(None),
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=200),
    format: str = Query("json", regex="^(json|csv)$"),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(AuditLog)
    if entity:
        stmt = stmt.where(AuditLog.entity_name == entity)
    if action:
        stmt = stmt.where(AuditLog.action == action)
    if user_id:
        stmt = stmt.where(AuditLog.user_id == user_id)
    if start_date:
        stmt = stmt.where(AuditLog.timestamp >= start_date)
    if end_date:
        stmt = stmt.where(AuditLog.timestamp <= end_date)
    total_stmt = select(func.count()).select_from(stmt.subquery())
    total_res = await db.execute(total_stmt)
    total = total_res.scalar_one()
    stmt = stmt.order_by(AuditLog.timestamp.desc()).offset((page - 1) * page_size).limit(page_size)
    res = await db.execute(stmt)
    logs = res.scalars().all()
    if format == "csv":
        import csv, io
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(["id", "timestamp", "user_id", "entity_name", "entity_id", "action", "ip_address", "changes"])
        for log in logs:
            writer.writerow([
                log.id,
                log.timestamp.isoformat() if log.timestamp else "",
                log.user_id,
                log.entity_name,
                log.entity_id,
                log.action,
                log.ip_address,
                log.changes,
            ])
        return StreamingResponse(io.BytesIO(output.getvalue().encode()), media_type="text/csv", headers={"Content-Disposition": "attachment; filename=audit_logs.csv"})
    return {
        "total": total,
        "page": page,
        "page_size": page_size,
        "items": [
            {
                "id": log.id,
                "timestamp": log.timestamp.isoformat() if log.timestamp else None,
                "user_id": log.user_id,
                "entity_name": log.entity_name,
                "entity_id": log.entity_id,
                "action": log.action,
                "ip_address": log.ip_address,
                "changes": log.changes,
            }
            for log in logs
        ],
    }

@router.get("/pending-requests")
async def list_pending_requests(db: AsyncSession = Depends(get_db)):
    # 1. Pending Room Bookings
    b_stmt = (
        select(RoomBooking)
        .options(
            selectinload(RoomBooking.room).selectinload(Room.building),
            selectinload(RoomBooking.user).selectinload(User.role),
        )
        .where(RoomBooking.status == "PENDING")
        .order_by(RoomBooking.start_time.asc())
    )
    b_res = await db.execute(b_stmt)
    pending_bookings = b_res.scalars().all()

    # 2. Pending Equipment Reservations
    eq_stmt = (
        select(EquipmentReservation)
        .options(
            selectinload(EquipmentReservation.equipment),
            selectinload(EquipmentReservation.user).selectinload(User.role),
        )
        .where(EquipmentReservation.status == "RESERVED")
        .order_by(EquipmentReservation.start_time.asc())
    )
    eq_res = await db.execute(eq_stmt)
    pending_equipment = eq_res.scalars().all()

    # 3. Pending Event Organizing Requests
    evt_stmt = (
        select(Event)
        .options(
            selectinload(Event.room).selectinload(Room.building),
            selectinload(Event.organizer).selectinload(User.role),
        )
        .where(Event.status == "PENDING_APPROVAL")
        .order_by(Event.start_time.asc())
    )
    evt_res = await db.execute(evt_stmt)
    pending_events = evt_res.scalars().all()

    return {
        "room_bookings": [
            {
                "id": b.id,
                "type": "ROOM_BOOKING",
                "title": b.title,
                "purpose": b.purpose,
                "requester": b.user.full_name if b.user else "User",
                "requester_role": b.user.role.name if b.user and b.user.role else "USER",
                "details": f"Room {b.room.room_number} ({b.room.building.code if b.room and b.room.building else 'Bldg'})",
                "time_slot": f"{b.start_time.strftime('%Y-%m-%d %H:%M')} - {b.end_time.strftime('%H:%M')}",
                "status": b.status,
            }
            for b in pending_bookings
        ],
        "equipment_reservations": [
            {
                "id": eq.id,
                "type": "EQUIPMENT_RESERVATION",
                "title": f"Reservation for {eq.equipment.name if eq.equipment else 'Equipment'}",
                "purpose": f"Serial: {eq.equipment.serial_number if eq.equipment else 'N/A'}",
                "requester": eq.user.full_name if eq.user else "User",
                "requester_role": eq.user.role.name if eq.user and eq.user.role else "USER",
                "details": f"{eq.equipment.name if eq.equipment else 'Gear'}",
                "time_slot": f"{eq.start_time.strftime('%Y-%m-%d %H:%M')} - {eq.expected_return_time.strftime('%H:%M')}",
                "status": eq.status,
            }
            for eq in pending_equipment
        ],
        "event_requests": [
            {
                "id": evt.id,
                "type": "EVENT_ORGANIZATION",
                "title": evt.title,
                "purpose": evt.description,
                "requester": evt.organizer.full_name if evt.organizer else "User",
                "requester_role": evt.organizer.role.name if evt.organizer and evt.organizer.role else "USER",
                "details": f"Venue: Room {evt.room.room_number if evt.room else 'TBD'} • Seats: {evt.max_seats}",
                "time_slot": f"{evt.start_time.strftime('%Y-%m-%d %H:%M')} - {evt.end_time.strftime('%H:%M')}",
                "status": evt.status,
            }
            for evt in pending_events
        ],
    }

@router.post("/requests/review")
async def review_pending_request(payload: ReviewRequestPayload, db: AsyncSession = Depends(get_db)):
    if payload.request_type == "ROOM_BOOKING":
        b_res = await db.execute(
            select(RoomBooking).options(selectinload(RoomBooking.room)).where(RoomBooking.id == payload.request_id)
        )
        booking = b_res.scalars().first()
        if not booking:
            raise HTTPException(status_code=404, detail="Booking request not found.")
        is_approved = payload.action == "APPROVE"
        booking.status = "APPROVED" if is_approved else "REJECTED"
        notif_title = f"Room Booking {'Approved' if is_approved else 'Rejected'}"
        room_info = f"Room {booking.room.room_number}" if booking.room else "requested room"
        notif_msg = f"Your booking for '{booking.title or room_info}' on {booking.start_time.strftime('%Y-%m-%d %H:%M')} has been {'approved' if is_approved else 'rejected'}."
        if payload.comments:
            notif_msg += f" Note: {payload.comments}"
        db.add(Notification(user_id=booking.user_id, title=notif_title, message=notif_msg))

    elif payload.request_type == "EQUIPMENT_RESERVATION":
        eq_res = await db.execute(
            select(EquipmentReservation)
            .options(selectinload(EquipmentReservation.equipment))
            .where(EquipmentReservation.id == payload.request_id)
        )
        res_item = eq_res.scalars().first()
        if not res_item:
            raise HTTPException(status_code=404, detail="Equipment reservation not found.")
        is_approved = payload.action == "APPROVE"
        res_item.status = "CHECKED_OUT" if is_approved else "CANCELLED"
        notif_title = f"Equipment Reservation {'Approved' if is_approved else 'Rejected'}"
        eq_name = res_item.equipment.name if res_item.equipment else "equipment"
        notif_msg = f"Your reservation for '{eq_name}' (Start: {res_item.start_time.strftime('%Y-%m-%d %H:%M')}) has been {'approved' if is_approved else 'rejected'}."
        if payload.comments:
            notif_msg += f" Note: {payload.comments}"
        db.add(Notification(user_id=res_item.user_id, title=notif_title, message=notif_msg))

    elif payload.request_type == "EVENT_ORGANIZATION":
        evt_res = await db.execute(select(Event).where(Event.id == payload.request_id))
        event = evt_res.scalars().first()
        if not event:
            raise HTTPException(status_code=404, detail="Event request not found.")
        is_approved = payload.action == "APPROVE"
        if is_approved:
            event.status = "PUBLISHED"
            event.is_published = True
        else:
            event.status = "REJECTED"
            event.is_published = False
        notif_title = f"Event Request {'Approved' if is_approved else 'Rejected'}"
        notif_msg = f"Your event '{event.title}' has been {'approved and published' if is_approved else 'rejected'}."
        if payload.comments:
            notif_msg += f" Note: {payload.comments}"
        db.add(Notification(user_id=event.organizer_id, title=notif_title, message=notif_msg))

    else:
        raise HTTPException(status_code=400, detail="Invalid request type.")

    await db.commit()
    return {"message": f"Request {payload.action.lower()}d successfully."}

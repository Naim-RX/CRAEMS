from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.core.database import get_db
from app.models.booking import RoomBooking
from app.models.facility import Room
from app.models.equipment import Equipment
from app.models.event import Event
from app.models.user import User

router = APIRouter()

@router.get("/summary")
async def get_analytics_summary(db: AsyncSession = Depends(get_db)):
    total_users = (await db.execute(select(func.count(User.id)))).scalar() or 0
    total_rooms = (await db.execute(select(func.count(Room.id)))).scalar() or 0
    total_bookings = (await db.execute(select(func.count(RoomBooking.id)))).scalar() or 0
    pending_bookings = (await db.execute(select(func.count(RoomBooking.id)).where(RoomBooking.status == "PENDING"))).scalar() or 0
    total_equipment = (await db.execute(select(func.count(Equipment.id)))).scalar() or 0
    total_events = (await db.execute(select(func.count(Event.id)))).scalar() or 0

    return {
        "total_users": total_users,
        "total_rooms": total_rooms,
        "total_bookings": total_bookings,
        "pending_bookings": pending_bookings,
        "total_equipment": total_equipment,
        "total_events": total_events,
        "utilization_rate": round((total_bookings / max(total_rooms * 10, 1)) * 100, 1)
    }

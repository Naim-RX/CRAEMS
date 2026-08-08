import asyncio
from datetime import datetime
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.core.database import AsyncSessionLocal
from app.models.event import Event
from app.models.facility import Room
from app.models.user import User
from app.schemas.event_schema import EventUpdate

async def run():
    async with AsyncSessionLocal() as db:
        stmt = select(Event).where(Event.id == "1d1142f4-2505-450d-ab24-b7a0d9eadb52")
        res = await db.execute(stmt)
        event = res.scalars().first()
        if not event:
            print("Event not found")
            return
            
        payload = {
            "title": "Updated Title",
            "description": "Updated Desc",
            "category_id": None,
            "department_id": None,
            "room_id": None,
            "start_time": datetime(2026, 8, 8, 10, 0, 0),
            "end_time": datetime(2026, 8, 8, 12, 0, 0),
            "registration_deadline": None,
            "max_seats": 50,
            "event_mode": "ONLINE",
            "price_type": "FREE",
            "price_amount": 0.0,
            "is_public": True,
            "cover_image": ""
        }
        
        event_in = EventUpdate(**payload)
        
        for field, val in event_in.model_dump(exclude_unset=True).items():
            setattr(event, field, val)
            
        try:
            await db.commit()
            await db.refresh(event)
        except Exception as e:
            print("Error in commit/refresh:", e)
            import traceback
            traceback.print_exc()
            return

        stmt2 = (
            select(Event)
            .options(
                selectinload(Event.room).selectinload(Room.building),
                selectinload(Event.room).selectinload(Room.floor),
                selectinload(Event.room).selectinload(Room.room_type),
                selectinload(Event.room).selectinload(Room.images),
                selectinload(Event.organizer).selectinload(User.role),
                selectinload(Event.organizer).selectinload(User.department),
                selectinload(Event.category),
                selectinload(Event.speakers)
            )
            .where(Event.id == event.id)
        )
        try:
            res = await db.execute(stmt2)
            final_event = res.scalars().first()
            print("Final Event:", final_event.title)
        except Exception as e:
            print("Error in final query:", e)
            import traceback
            traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(run())

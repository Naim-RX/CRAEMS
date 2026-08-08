import asyncio
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.core.database import AsyncSessionLocal
from app.models.event import Event
from app.models.facility import Room
from app.models.user import User

async def run():
    async with AsyncSessionLocal() as db:
        stmt = (
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
            .where(Event.id == "1d1142f4-2505-450d-ab24-b7a0d9eadb52")
        )
        res = await db.execute(stmt)
        event = res.scalars().first()
        print(f"Event: {event.title if event else 'Not found'}")

if __name__ == "__main__":
    asyncio.run(run())

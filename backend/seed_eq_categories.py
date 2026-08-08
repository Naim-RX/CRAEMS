import asyncio
from sqlalchemy import select
from app.core.database import AsyncSessionLocal
from app.models.equipment import EquipmentCategory

async def main():
    async with AsyncSessionLocal() as db:
        res = await db.execute(select(EquipmentCategory))
        categories = res.scalars().all()
        existing_ids = [c.id for c in categories]
        print("Existing IDs:", existing_ids)
        
        needed = [
            (1, "AV & Multimedia"),
            (2, "Lab Instruments"),
            (3, "Computing Hardware"),
            (4, "Event & Stage Gear")
        ]
        
        to_add = []
        for c_id, c_name in needed:
            if c_id not in existing_ids:
                to_add.append(EquipmentCategory(id=c_id, name=c_name))
        
        if to_add:
            print("Seeding missing categories:", [c.id for c in to_add])
            db.add_all(to_add)
            await db.commit()
            print("Seeded successfully!")
        else:
            print("All categories exist.")

if __name__ == "__main__":
    asyncio.run(main())

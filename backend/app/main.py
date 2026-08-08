import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select, text
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from app.core.config import settings
from app.core.database import engine, Base, AsyncSessionLocal
from app.core.security import get_password_hash
from app.models import Role, Department, Building, Floor, RoomType, Room, User, EquipmentCategory, Equipment
from app.api.v1.api_router import api_router

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("craems.main")

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    version="1.0.0"
)

# CORS Setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
async def root():
    return {
        "system": settings.PROJECT_NAME,
        "status": "ONLINE",
        "docs": "/docs",
        "api_v1": settings.API_V1_STR
    }

@app.on_event("startup")
async def startup_db_seed():
    import app.core.database as _db
    from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession

    logger.info("Initializing database tables and enterprise seed data...")

    async with _db.engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    # ── Schema migrations for existing deployments ──────────────────────────
    try:
        async with _db.engine.begin() as conn:
            # Make events.room_id nullable (online events / requests before venue is assigned)
            try:
                await conn.execute(text("ALTER TABLE events MODIFY COLUMN room_id VARCHAR(36) NULL"))
                logger.info("Migration: events.room_id set to NULLABLE")
            except Exception as exc:
                logger.info(f"Migration note: events.room_id (already nullable or N/A): {exc}")

            for statement, column_name in (
                ("ALTER TABLE users ADD COLUMN password_reset_code VARCHAR(6) NULL", "users.password_reset_code"),
                ("ALTER TABLE users ADD COLUMN password_reset_expires DATETIME NULL", "users.password_reset_expires"),
            ):
                try:
                    await conn.execute(text(statement))
                    logger.info(f"Migration: added {column_name}")
                except Exception as exc:
                    logger.info(f"Migration note: {column_name} already exists or is unavailable: {exc}")
    except Exception as exc:
        logger.error(f"Schema migration failed: {exc}")

    # Install MySQL database triggers for automated audit logging
    try:
        from app.core.triggers import install_database_triggers
        await install_database_triggers(_db.engine)
    except Exception as exc:
        logger.warning(f"Database trigger installation skipped: {exc}")

    async with _db.AsyncSessionLocal() as db:
        # 1. Seed Roles
        roles_data = [
            ("ADMINISTRATOR", "System Administrator with full access"),
            ("FACULTY", "Faculty & Department Academic Staff"),
            ("STUDENT", "Enrolled University Student"),
            ("RESEARCHER", "Lab Research Associate"),
            ("LAB_ASSISTANT", "Laboratory & AV Technical Staff"),
            ("RESOURCE_MANAGER", "Facility & Equipment Manager"),
            ("GUEST", "External Guest / Visitor"),
        ]
        for r_name, r_desc in roles_data:
            res = await db.execute(select(Role).where(Role.name == r_name))
            if not res.scalars().first():
                db.add(Role(name=r_name, description=r_desc))
        await db.commit()

        # 2. Seed Departments
        depts_data = [
            ("CS", "Computer Science & Engineering", "Dr. Alan Turing"),
            ("EEE", "Electrical & Electronic Engineering", "Dr. Nikola Tesla"),
            ("MECH", "Mechanical Engineering", "Dr. James Watt"),
            ("BIOTECH", "Biotechnology & Life Sciences", "Dr. Rosalind Franklin"),
        ]
        for code, name, head in depts_data:
            res = await db.execute(select(Department).where(Department.code == code))
            if not res.scalars().first():
                db.add(Department(code=code, name=name, head_faculty_name=head))
        await db.commit()

        # 3. Seed Buildings & Floors
        b_res = await db.execute(select(Building).where(Building.code == "ENG-01"))
        b1 = b_res.scalars().first()
        if not b1:
            b1 = Building(code="ENG-01", name="Engineering Complex Alpha", total_floors=4)
            db.add(b1)
            await db.flush()
            fl1 = Floor(building_id=b1.id, floor_number=1, floor_name="Ground Floor")
            fl2 = Floor(building_id=b1.id, floor_number=2, floor_name="Second Level Labs")
            db.add_all([fl1, fl2])
            await db.commit()

        # 4. Seed Room Types
        types_data = [
            ("Lecture Hall", "Large capacity tiered auditorium"),
            ("Computer Lab", "Workstation laboratory with PC rigs"),
            ("Conference Room", "Executive meeting room with AV setup"),
            ("Research Wet Lab", "Specialized chemical and biotech testing lab"),
        ]
        for t_name, t_desc in types_data:
            res = await db.execute(select(RoomType).where(RoomType.name == t_name))
            if not res.scalars().first():
                db.add(RoomType(name=t_name, description=t_desc))
        await db.commit()

        # 5. Seed Rooms
        room_res = await db.execute(select(Room).where(Room.room_number == "101"))
        if not room_res.scalars().first():
            b_res = await db.execute(select(Building).limit(1))
            b_item = b_res.scalars().first()
            fl_res = await db.execute(select(Floor).limit(1))
            fl_item = fl_res.scalars().first()
            rt_res = await db.execute(select(RoomType).limit(1))
            rt_item = rt_res.scalars().first()

            if b_item and fl_item and rt_item:
                db.add_all([
                    Room(
                        room_number="101",
                        building_id=b_item.id,
                        floor_id=fl_item.id,
                        room_type_id=rt_item.id,
                        capacity=120,
                        features={"has_projector": True, "has_ac": True, "has_smartboard": True}
                    ),
                    Room(
                        room_number="204-LAB",
                        building_id=b_item.id,
                        floor_id=fl_item.id,
                        room_type_id=rt_item.id,
                        capacity=40,
                        features={"has_projector": True, "has_ac": True, "pc_count": 40}
                    )
                ])
                await db.commit()

        # 6. Seed Initial Users (Admin, Faculty, Student)
        admin_res = await db.execute(select(User).where(User.email == "admin@craems.edu"))
        if not admin_res.scalars().first():
            role_admin = (await db.execute(select(Role).where(Role.name == "ADMINISTRATOR"))).scalars().first()
            role_faculty = (await db.execute(select(Role).where(Role.name == "FACULTY"))).scalars().first()
            role_student = (await db.execute(select(Role).where(Role.name == "STUDENT"))).scalars().first()
            dept_cs = (await db.execute(select(Department).limit(1))).scalars().first()

            if role_admin and role_faculty and role_student:
                db.add_all([
                    User(
                        full_name="Enterprise Admin",
                        email="admin@craems.edu",
                        password_hash=get_password_hash("admin123"),
                        role_id=role_admin.id,
                        department_id=dept_cs.id if dept_cs else None
                    ),
                    User(
                        full_name="Prof. Sarah Jenkins",
                        email="faculty@craems.edu",
                        password_hash=get_password_hash("faculty123"),
                        role_id=role_faculty.id,
                        department_id=dept_cs.id if dept_cs else None
                    ),
                    User(
                        full_name="Alex Morgan",
                        email="student@craems.edu",
                        password_hash=get_password_hash("student123"),
                        role_id=role_student.id,
                        department_id=dept_cs.id if dept_cs else None
                    ),
                ])
                await db.commit()

        # 7. Seed Equipment Categories & Items
        eq_cat_res = await db.execute(select(EquipmentCategory).where(EquipmentCategory.name == "AV Equipment"))
        if not eq_cat_res.scalars().first():
            cat = EquipmentCategory(name="AV Equipment", description="Projectors, Microphones, Audio Systems")
            db.add(cat)
            await db.flush()
            db.add_all([
                Equipment(serial_number="AV-PROJ-901", name="4K Laser Projector Unit", category_id=cat.id, condition="EXCELLENT"),
                Equipment(serial_number="MIC-WIRELESS-04", name="Dual Wireless Lapel Mic", category_id=cat.id, condition="GOOD"),
            ])
            await db.commit()

    logger.info("Enterprise database seed completed successfully!")

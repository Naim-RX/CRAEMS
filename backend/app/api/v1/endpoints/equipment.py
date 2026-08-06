from typing import List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.core.database import get_db
from app.models.equipment import Equipment, EquipmentCategory, EquipmentReservation
from app.schemas.equipment_schema import EquipmentOut, EquipmentReservationCreate, EquipmentReservationOut

from app.models.user import User

router = APIRouter()

@router.get("", response_model=List[EquipmentOut])
async def list_equipment(
    category_id: Optional[int] = Query(None),
    is_available: Optional[bool] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Equipment).options(selectinload(Equipment.category))
    if category_id:
        stmt = stmt.where(Equipment.category_id == category_id)
    if is_available is not None:
        stmt = stmt.where(Equipment.is_available == is_available)

    res = await db.execute(stmt)
    return res.scalars().all()

@router.get("/reservations", response_model=List[EquipmentReservationOut])
async def list_equipment_reservations(
    user_id: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    stmt = (
        select(EquipmentReservation)
        .options(
            selectinload(EquipmentReservation.equipment).selectinload(Equipment.category),
            selectinload(EquipmentReservation.user).selectinload(User.role),
            selectinload(EquipmentReservation.user).selectinload(User.department)
        )
        .order_by(EquipmentReservation.start_time.desc())
    )
    if user_id:
        stmt = stmt.where(EquipmentReservation.user_id == user_id)
    if status:
        stmt = stmt.where(EquipmentReservation.status == status)

    res = await db.execute(stmt)
    return res.scalars().all()

@router.post("/reserve", response_model=EquipmentReservationOut, status_code=201)
async def reserve_equipment(
    res_in: EquipmentReservationCreate,
    user_id: str = Query(..., description="User ID"),
    db: AsyncSession = Depends(get_db)
):
    eq_res = await db.execute(select(Equipment).where(Equipment.id == res_in.equipment_id))
    eq = eq_res.scalars().first()
    if not eq or not eq.is_available:
        raise HTTPException(status_code=400, detail="Equipment is unavailable for reservation.")

    stmt_conflict = select(EquipmentReservation).where(
        EquipmentReservation.equipment_id == res_in.equipment_id,
        EquipmentReservation.status.not_in(["CANCELLED", "RETURNED"]),
        EquipmentReservation.start_time < res_in.expected_return_time,
        EquipmentReservation.expected_return_time > res_in.start_time
    )
    conflict_res = await db.execute(stmt_conflict)
    if conflict_res.scalars().first():
        raise HTTPException(status_code=400, detail="Selected slot is already reserved for this equipment.")

    reservation = EquipmentReservation(
        equipment_id=res_in.equipment_id,
        user_id=user_id,
        start_time=res_in.start_time,
        expected_return_time=res_in.expected_return_time,
        status="RESERVED"
    )
    db.add(reservation)
    await db.commit()
    await db.refresh(reservation)

    stmt = select(EquipmentReservation).options(
        selectinload(EquipmentReservation.equipment).selectinload(Equipment.category),
        selectinload(EquipmentReservation.user).selectinload(User.role),
        selectinload(EquipmentReservation.user).selectinload(User.department)
    ).where(EquipmentReservation.id == reservation.id)
    res = await db.execute(stmt)
    return res.scalars().first()

from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.core.database import get_db
from app.models.user import User, Role
from app.models.system import AuditLog
from app.schemas.user_schema import UserOut

router = APIRouter()

@router.get("/users", response_model=List[UserOut])
async def list_all_users(db: AsyncSession = Depends(get_db)):
    stmt = select(User).options(selectinload(User.role), selectinload(User.department))
    res = await db.execute(stmt)
    return res.scalars().all()

@router.get("/audit-logs")
async def list_audit_logs(db: AsyncSession = Depends(get_db)):
    stmt = select(AuditLog).order_by(AuditLog.timestamp.desc()).limit(100)
    res = await db.execute(stmt)
    logs = res.scalars().all()
    return [
        {
            "id": log.id,
            "action": log.action,
            "entity_name": log.entity_name,
            "entity_id": log.entity_id,
            "ip_address": log.ip_address,
            "timestamp": log.timestamp.isoformat() if log.timestamp else None
        }
        for log in logs
    ]

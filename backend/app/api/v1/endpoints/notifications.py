from typing import List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete
from app.core.database import get_db
from app.models.system import Notification
from app.schemas.notification_schema import NotificationOut, NotificationCreate

router = APIRouter()

@router.get("", response_model=List[NotificationOut])
async def get_user_notifications(
    user_id: str = Query(..., description="Target User ID"),
    limit: int = Query(50, ge=1, le=100),
    db: AsyncSession = Depends(get_db)
):
    stmt = (
        select(Notification)
        .where(Notification.user_id == user_id)
        .order_by(Notification.created_at.desc())
        .limit(limit)
    )
    res = await db.execute(stmt)
    return res.scalars().all()

@router.put("/{notification_id}/read", response_model=NotificationOut)
async def mark_notification_as_read(
    notification_id: int,
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Notification).where(Notification.id == notification_id)
    res = await db.execute(stmt)
    notification = res.scalars().first()
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found.")
    
    notification.is_read = True
    await db.commit()
    await db.refresh(notification)
    return notification

@router.put("/read-all/user/{user_id}")
async def mark_all_as_read(
    user_id: str,
    db: AsyncSession = Depends(get_db)
):
    stmt = (
        update(Notification)
        .where(Notification.user_id == user_id, Notification.is_read == False)
        .values(is_read=True)
    )
    await db.execute(stmt)
    await db.commit()
    return {"message": "All notifications marked as read."}

@router.delete("/{notification_id}")
async def delete_notification(
    notification_id: int,
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Notification).where(Notification.id == notification_id)
    res = await db.execute(stmt)
    notification = res.scalars().first()
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found.")
    
    await db.delete(notification)
    await db.commit()
    return {"message": "Notification deleted successfully."}

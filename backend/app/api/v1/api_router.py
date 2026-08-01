from fastapi import APIRouter
from app.api.v1.endpoints import auth, rooms, bookings, equipment, events, reports, admin

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(rooms.router, prefix="/rooms", tags=["Rooms & Facilities"])
api_router.include_router(bookings.router, prefix="/bookings", tags=["Room Bookings"])
api_router.include_router(equipment.router, prefix="/equipment", tags=["Equipment Management"])
api_router.include_router(events.router, prefix="/events", tags=["Event Management"])
api_router.include_router(reports.router, prefix="/reports", tags=["Reports & Analytics"])
api_router.include_router(admin.router, prefix="/admin", tags=["Admin System"])

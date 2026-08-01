from app.models.user import User, Role, Permission, Department
from app.models.facility import Building, Floor, RoomType, Room, RoomImage
from app.models.booking import RoomBooking, BookingApproval
from app.models.equipment import EquipmentCategory, Equipment, EquipmentReservation
from app.models.event import Event, EventRegistration, Attendance
from app.models.system import AuditLog, SystemSetting, Notification

# Aliases for backward compatibility with main.py imports
Booking = RoomBooking
EquipmentLoan = EquipmentReservation
SystemNotification = Notification

__all__ = [
    "User", "Role", "Permission", "Department",
    "Building", "Floor", "RoomType", "Room", "RoomImage",
    "RoomBooking", "BookingApproval",
    "EquipmentCategory", "Equipment", "EquipmentReservation",
    "Event", "EventRegistration", "Attendance",
    "AuditLog", "SystemSetting", "Notification",
    # Aliases
    "Booking", "EquipmentLoan", "SystemNotification",
]

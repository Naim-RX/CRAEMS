from app.models.user import User, Role, Permission, Department
from app.models.facility import Building, Floor, RoomType, Room, RoomImage
from app.models.booking import RoomBooking, BookingApproval
from app.models.equipment import EquipmentCategory, Equipment, EquipmentReservation
from app.models.event import (
    EventCategory, Event, EventSpeaker, EventGallery,
    EventAnnouncement, EventSponsor, EventFAQ, EventRegistration,
    Certificate, Attendance
)
# Notification & system models — imported AFTER event models to avoid table redefinition
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
    "EventCategory", "Event", "EventSpeaker", "EventGallery",
    "EventAnnouncement", "EventSponsor", "EventFAQ", "EventRegistration",
    "Certificate", "Attendance",
    "AuditLog", "SystemSetting", "Notification",
    # Aliases
    "Booking", "EquipmentLoan", "SystemNotification",
]

import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.core.database import Base

class EquipmentCategory(Base):
    __tablename__ = "equipment_categories"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(50), unique=True, nullable=False)
    description = Column(Text, nullable=True)

    items = relationship("Equipment", back_populates="category")

class Equipment(Base):
    __tablename__ = "equipment"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    serial_number = Column(String(100), unique=True, nullable=False)
    name = Column(String(100), nullable=False)
    category_id = Column(Integer, ForeignKey("equipment_categories.id", ondelete="RESTRICT"), nullable=False)
    assigned_room_id = Column(String(36), ForeignKey("rooms.id", ondelete="SET NULL"), nullable=True)
    condition = Column(String(30), default="EXCELLENT")  # EXCELLENT, GOOD, FAIR, DAMAGED, UNDER_MAINTENANCE
    is_available = Column(Boolean, default=True)

    category = relationship("EquipmentCategory", back_populates="items")
    assigned_room = relationship("Room", back_populates="equipment")
    reservations = relationship("EquipmentReservation", back_populates="equipment")

class EquipmentReservation(Base):
    __tablename__ = "equipment_reservations"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    equipment_id = Column(String(36), ForeignKey("equipment.id", ondelete="RESTRICT"), nullable=False)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="RESTRICT"), nullable=False)
    start_time = Column(DateTime, nullable=False)
    expected_return_time = Column(DateTime, nullable=False)
    actual_return_time = Column(DateTime, nullable=True)
    status = Column(String(20), default="RESERVED")  # RESERVED, CHECKED_OUT, RETURNED, OVERDUE, CANCELLED

    equipment = relationship("Equipment", back_populates="reservations")
    user = relationship("User", back_populates="equipment_reservations")

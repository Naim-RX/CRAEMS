import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Text, Enum
from sqlalchemy.orm import relationship
from app.core.database import Base

class RoomBooking(Base):
    __tablename__ = "room_bookings"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    booking_reference = Column(String(20), unique=True, nullable=False, index=True)
    room_id = Column(String(36), ForeignKey("rooms.id", ondelete="RESTRICT"), nullable=False, index=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="RESTRICT"), nullable=False, index=True)
    title = Column(String(150), nullable=False)
    purpose = Column(Text, nullable=False)
    start_time = Column(DateTime, nullable=False, index=True)
    end_time = Column(DateTime, nullable=False, index=True)
    status = Column(String(20), default="PENDING", nullable=False)  # PENDING, APPROVED, REJECTED, CANCELLED, COMPLETED
    attendees_count = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    room = relationship("Room", back_populates="bookings")
    user = relationship("User", back_populates="bookings")
    approvals = relationship("BookingApproval", back_populates="booking", cascade="all, delete-orphan")

class BookingApproval(Base):
    __tablename__ = "booking_approvals"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    booking_id = Column(String(36), ForeignKey("room_bookings.id", ondelete="CASCADE"), nullable=False)
    approver_id = Column(String(36), ForeignKey("users.id", ondelete="RESTRICT"), nullable=False)
    action = Column(String(20), nullable=False)  # APPROVED, REJECTED
    comments = Column(Text, nullable=True)
    action_timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    booking = relationship("RoomBooking", back_populates="approvals")
    approver = relationship("User")

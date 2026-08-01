import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.core.database import Base

class Event(Base):
    __tablename__ = "events"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    organizer_id = Column(String(36), ForeignKey("users.id", ondelete="RESTRICT"), nullable=False)
    room_id = Column(String(36), ForeignKey("rooms.id", ondelete="RESTRICT"), nullable=False)
    start_time = Column(DateTime, nullable=False)
    end_time = Column(DateTime, nullable=False)
    max_seats = Column(Integer, nullable=False)
    is_public = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    organizer = relationship("User")
    room = relationship("Room", back_populates="events")
    registrations = relationship("EventRegistration", back_populates="event", cascade="all, delete-orphan")

class EventRegistration(Base):
    __tablename__ = "event_registrations"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    event_id = Column(String(36), ForeignKey("events.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    ticket_code = Column(String(64), unique=True, nullable=False, index=True)
    registered_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    event = relationship("Event", back_populates="registrations")
    user = relationship("User", back_populates="event_registrations")
    attendance = relationship("Attendance", back_populates="registration", uselist=False, cascade="all, delete-orphan")

class Attendance(Base):
    __tablename__ = "attendance"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    registration_id = Column(String(36), ForeignKey("event_registrations.id", ondelete="CASCADE"), nullable=False)
    scanned_by_id = Column(String(36), ForeignKey("users.id", ondelete="RESTRICT"), nullable=False)
    scanned_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    registration = relationship("EventRegistration", back_populates="attendance")
    scanned_by = relationship("User")

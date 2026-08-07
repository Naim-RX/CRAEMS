import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Boolean, DateTime, ForeignKey, Text, Float, Index
from sqlalchemy.orm import relationship
from app.core.database import Base

class EventCategory(Base):
    __tablename__ = "event_categories"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(50), unique=True, nullable=False)
    icon = Column(String(50), nullable=True)
    description = Column(Text, nullable=True)

    events = relationship("Event", back_populates="category")

class Event(Base):
    __tablename__ = "events"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    category_id = Column(Integer, ForeignKey("event_categories.id", ondelete="SET NULL"), nullable=True, index=True)
    department_id = Column(Integer, ForeignKey("departments.id", ondelete="SET NULL"), nullable=True, index=True)
    organizer_id = Column(String(36), ForeignKey("users.id", ondelete="RESTRICT"), nullable=False, index=True)
    room_id = Column(String(36), ForeignKey("rooms.id", ondelete="RESTRICT"), nullable=True)
    start_time = Column(DateTime, nullable=False, index=True)
    end_time = Column(DateTime, nullable=False)
    registration_deadline = Column(DateTime, nullable=True)
    max_seats = Column(Integer, nullable=False)
    event_mode = Column(String(20), default="OFFLINE")  # ONLINE, OFFLINE, HYBRID
    price_type = Column(String(20), default="FREE")     # FREE, PAID
    price_amount = Column(Float, default=0.0)
    cover_image = Column(String(500), nullable=True)
    status = Column(String(30), default="PUBLISHED")    # PENDING_APPROVAL, APPROVED, REJECTED, PUBLISHED
    is_public = Column(Boolean, default=True)
    is_published = Column(Boolean, default=True)
    is_deleted = Column(Boolean, default=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    category = relationship("EventCategory", back_populates="events")
    department = relationship("Department")
    organizer = relationship("User")
    room = relationship("Room", back_populates="events")
    registrations = relationship("EventRegistration", back_populates="event", cascade="all, delete-orphan")
    speakers = relationship("EventSpeaker", back_populates="event", cascade="all, delete-orphan")
    gallery = relationship("EventGallery", back_populates="event", cascade="all, delete-orphan")
    announcements = relationship("EventAnnouncement", back_populates="event", cascade="all, delete-orphan")
    sponsors = relationship("EventSponsor", back_populates="event", cascade="all, delete-orphan")
    faqs = relationship("EventFAQ", back_populates="event", cascade="all, delete-orphan")

class EventSpeaker(Base):
    __tablename__ = "event_speakers"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    event_id = Column(String(36), ForeignKey("events.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(100), nullable=False)
    title = Column(String(100), nullable=True)
    bio = Column(Text, nullable=True)
    photo_url = Column(String(500), nullable=True)
    organization = Column(String(100), nullable=True)

    event = relationship("Event", back_populates="speakers")

class EventGallery(Base):
    __tablename__ = "event_gallery"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    event_id = Column(String(36), ForeignKey("events.id", ondelete="CASCADE"), nullable=False)
    image_url = Column(String(500), nullable=False)
    caption = Column(String(200), nullable=True)

    event = relationship("Event", back_populates="gallery")

class EventAnnouncement(Base):
    __tablename__ = "event_announcements"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    event_id = Column(String(36), ForeignKey("events.id", ondelete="CASCADE"), nullable=True)
    title = Column(String(200), nullable=False)
    content = Column(Text, nullable=False)
    type = Column(String(50), default="UPDATE") # VENUE_CHANGE, DEADLINE_EXTENSION, UPDATE, NOTICE
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    event = relationship("Event", back_populates="announcements")

class EventSponsor(Base):
    __tablename__ = "event_sponsors"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    event_id = Column(String(36), ForeignKey("events.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(100), nullable=False)
    logo_url = Column(String(500), nullable=True)
    tier = Column(String(50), default="PLATINUM") # PLATINUM, GOLD, SILVER, PARTNER

    event = relationship("Event", back_populates="sponsors")

class EventFAQ(Base):
    __tablename__ = "event_faqs"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    event_id = Column(String(36), ForeignKey("events.id", ondelete="CASCADE"), nullable=False)
    question = Column(String(255), nullable=False)
    answer = Column(Text, nullable=False)

    event = relationship("Event", back_populates="faqs")

class EventRegistration(Base):
    __tablename__ = "event_registrations"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    event_id = Column(String(36), ForeignKey("events.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    ticket_code = Column(String(64), unique=True, nullable=False, index=True)
    qr_code = Column(Text, nullable=True)                      # base64 QR image data URL
    status = Column(String(20), default="REGISTERED")          # REGISTERED, ATTENDED, CANCELLED, WAITLIST
    payment_status = Column(String(20), default="FREE")        # FREE, PAID, PENDING
    attendance_status = Column(String(20), nullable=True)      # PRESENT, ABSENT
    registered_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    event = relationship("Event", back_populates="registrations")
    user = relationship("User", back_populates="event_registrations")
    attendance = relationship("Attendance", back_populates="registration", uselist=False, cascade="all, delete-orphan")
    certificate = relationship("Certificate", back_populates="registration", uselist=False, cascade="all, delete-orphan")

class Certificate(Base):
    __tablename__ = "certificates"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    registration_id = Column(String(36), ForeignKey("event_registrations.id", ondelete="CASCADE"), nullable=False)
    certificate_number = Column(String(64), unique=True, nullable=False)
    issued_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    pdf_url = Column(String(500), nullable=True)

    registration = relationship("EventRegistration", back_populates="certificate")

class Attendance(Base):
    __tablename__ = "attendance"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    registration_id = Column(String(36), ForeignKey("event_registrations.id", ondelete="CASCADE"), nullable=False)
    scanned_by_id = Column(String(36), ForeignKey("users.id", ondelete="RESTRICT"), nullable=False)
    scanned_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    registration = relationship("EventRegistration", back_populates="attendance")
    scanned_by = relationship("User")
    # Notification model lives in system.py — do NOT redefine it here

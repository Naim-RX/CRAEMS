import uuid
from sqlalchemy import Column, String, Integer, Boolean, ForeignKey, JSON, Text
from sqlalchemy.orm import relationship
from app.core.database import Base

class Building(Base):
    __tablename__ = "buildings"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    code = Column(String(20), unique=True, nullable=False)
    name = Column(String(100), nullable=False)
    total_floors = Column(Integer, nullable=False, default=1)

    floors = relationship("Floor", back_populates="building", cascade="all, delete-orphan")
    rooms = relationship("Room", back_populates="building")

class Floor(Base):
    __tablename__ = "floors"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    building_id = Column(Integer, ForeignKey("buildings.id", ondelete="CASCADE"), nullable=False)
    floor_number = Column(Integer, nullable=False)
    floor_name = Column(String(50), nullable=True)

    building = relationship("Building", back_populates="floors")
    rooms = relationship("Room", back_populates="floor")

class RoomType(Base):
    __tablename__ = "room_types"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(50), unique=True, nullable=False)
    description = Column(Text, nullable=True)

    rooms = relationship("Room", back_populates="room_type")

class Room(Base):
    __tablename__ = "rooms"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    room_number = Column(String(20), nullable=False)
    building_id = Column(Integer, ForeignKey("buildings.id", ondelete="RESTRICT"), nullable=False)
    floor_id = Column(Integer, ForeignKey("floors.id", ondelete="RESTRICT"), nullable=False)
    room_type_id = Column(Integer, ForeignKey("room_types.id", ondelete="RESTRICT"), nullable=False)
    capacity = Column(Integer, nullable=False)
    is_active = Column(Boolean, default=True)
    is_maintenance = Column(Boolean, default=False)
    features = Column(JSON, nullable=True)

    building = relationship("Building", back_populates="rooms")
    floor = relationship("Floor", back_populates="rooms")
    room_type = relationship("RoomType", back_populates="rooms")
    images = relationship("RoomImage", back_populates="room", cascade="all, delete-orphan")
    bookings = relationship("RoomBooking", back_populates="room")
    equipment = relationship("Equipment", back_populates="assigned_room")
    events = relationship("Event", back_populates="room")

class RoomImage(Base):
    __tablename__ = "room_images"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    room_id = Column(String(36), ForeignKey("rooms.id", ondelete="CASCADE"), nullable=False)
    image_url = Column(String(500), nullable=False)
    is_primary = Column(Boolean, default=False)

    room = relationship("Room", back_populates="images")

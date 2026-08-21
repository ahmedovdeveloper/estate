import json
import datetime
from sqlalchemy import Column, String, Integer, Float, Boolean, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(String(64), primary_key=True, index=True)
    username = Column(String(64), unique=True, index=True, nullable=False)
    name = Column(String(128), nullable=False)
    email = Column(String(128), unique=True, index=True, nullable=False)
    phone = Column(String(64), default="+998 90 000-00-00")
    hashed_password = Column(String(256), nullable=True)
    role = Column(String(32), default="seeker")  # admin, owner, seeker
    avatar = Column(String(512), default="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80")
    agency_name = Column(String(128), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    saved_property_ids = Column(Text, default="[]")  # JSON string of IDs

    properties = relationship("Property", back_populates="owner", cascade="all, delete-orphan")
    leads = relationship("Lead", back_populates="user")

    def __repr__(self):
        return f"<User {self.username} ({self.role})>"


class Property(Base):
    __tablename__ = "properties"

    id = Column(String(64), primary_key=True, index=True)
    title = Column(String(256), nullable=False, index=True)
    description = Column(Text, nullable=False)
    price = Column(Float, nullable=False, index=True)
    price_period = Column(String(32), default="")  # "/ мес" or ""
    currency = Column(String(16), default="$")  # "$", "UZS", "€"
    deal_type = Column(String(32), nullable=False, index=True)  # rent, sale
    property_type = Column(String(32), nullable=False, index=True)  # apartment, house, office, villa, land
    
    # Location fields
    address = Column(String(256), default="")
    neighborhood = Column(String(128), default="", index=True)
    city = Column(String(64), default="Ташкент", index=True)
    country = Column(String(64), default="Узбекистан")
    lat = Column(Float, default=41.311081)
    lng = Column(Float, default=69.240562)

    # Specs fields
    bedrooms = Column(Integer, default=2, index=True)
    bathrooms = Column(Integer, default=1)
    area_sq_m = Column(Float, default=65.0)
    built_year = Column(Integer, default=2023)
    living_rooms = Column(Integer, default=1)
    parking_spaces = Column(Integer, default=1)
    floor = Column(Integer, default=1)
    total_floors = Column(Integer, default=9)

    # Media & Meta
    photos_json = Column(Text, default="[]")  # JSON list of photo URLs
    amenities_json = Column(Text, default="[]")  # JSON list of amenities
    facilities_json = Column(Text, default="[]")  # JSON list of nearby facilities
    rating = Column(Float, default=4.9)
    reviews_count = Column(Integer, default=0)
    featured = Column(Boolean, default=False, index=True)
    status = Column(String(32), default="published")  # published, pending, archived

    # Relations
    owner_id = Column(String(64), ForeignKey("users.id"), nullable=True)
    owner = relationship("User", back_populates="properties")
    leads = relationship("Lead", back_populates="property", cascade="all, delete-orphan")

    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    def __repr__(self):
        return f"<Property {self.title} ({self.price} {self.currency})>"


class Lead(Base):
    __tablename__ = "leads"

    id = Column(String(64), primary_key=True, index=True)
    property_id = Column(String(64), ForeignKey("properties.id"), nullable=False)
    user_id = Column(String(64), ForeignKey("users.id"), nullable=True)
    client_name = Column(String(128), nullable=False)
    client_phone = Column(String(64), nullable=False)
    client_email = Column(String(128), nullable=True)
    message = Column(Text, default="")
    status = Column(String(32), default="new")  # new, in_progress, closed, rejected
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    property = relationship("Property", back_populates="leads")
    user = relationship("User", back_populates="leads")

    def __repr__(self):
        return f"<Lead from {self.client_name} for {self.property_id}>"


class Agent(Base):
    __tablename__ = "agents"

    id = Column(String(64), primary_key=True, index=True)
    name = Column(String(128), nullable=False)
    role = Column(String(64), default="Ведущий риелтор")
    phone = Column(String(64), default="+998 90 123-45-67")
    email = Column(String(128), default="agent@uzestate.uz")
    avatar = Column(String(512), default="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=300&q=80")
    verified = Column(Boolean, default=True)
    rating = Column(Float, default=4.9)
    deals_count = Column(Integer, default=24)

    def __repr__(self):
        return f"<Agent {self.name}>"

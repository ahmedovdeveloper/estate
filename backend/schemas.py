from typing import List, Optional, Any, Dict
from pydantic import BaseModel, Field
from datetime import datetime

# Location Schemas
class LocationInfoSchema(BaseModel):
    address: str = "ул. Амира Темура, 10"
    neighborhood: str = "Юнусабад"
    city: str = "Ташкент"
    country: str = "Узбекистан"
    lat: float = 41.311081
    lng: float = 69.240562

# Property Specs Schemas
class PropertySpecsSchema(BaseModel):
    bedrooms: int = 2
    bathrooms: int = 1
    areaSqFt: float = Field(default=65.0, alias="area_sq_m")
    builtYear: int = Field(default=2023, alias="built_year")
    livingRooms: int = Field(default=1, alias="living_rooms")
    parkingSpaces: int = Field(default=1, alias="parking_spaces")
    floor: Optional[int] = 1
    totalFloors: Optional[int] = Field(default=9, alias="total_floors")

    class Config:
        populate_by_name = True

# Facility Schema
class FacilitySchema(BaseModel):
    type: str = "metro"
    name: str
    distance: str

# Agent Schemas
class AgentSchema(BaseModel):
    id: str
    name: str
    role: str = "Риелтор"
    phone: str = "+998 90 123-45-67"
    email: str = "agent@uzestate.uz"
    avatar: str = "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=300&q=80"
    verified: bool = True
    rating: float = 4.9
    dealsCount: int = 24

# Property Schemas
class PropertyBase(BaseModel):
    title: str
    description: str
    price: float
    pricePeriod: Optional[str] = ""
    currency: str = "$"
    dealType: str = "sale"  # rent, sale
    propertyType: str = "apartment"  # apartment, house, office, villa, land
    location: LocationInfoSchema
    specs: PropertySpecsSchema
    photos: List[str] = []
    amenities: List[str] = []
    facilities: List[FacilitySchema] = []
    featured: bool = False
    status: str = "published"

class PropertyCreate(PropertyBase):
    pass

class PropertyUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    pricePeriod: Optional[str] = None
    currency: Optional[str] = None
    dealType: Optional[str] = None
    propertyType: Optional[str] = None
    location: Optional[LocationInfoSchema] = None
    specs: Optional[PropertySpecsSchema] = None
    photos: Optional[List[str]] = None
    amenities: Optional[List[str]] = None
    facilities: Optional[List[FacilitySchema]] = None
    featured: Optional[bool] = None
    status: Optional[str] = None

class PropertyResponse(BaseModel):
    id: str
    title: str
    description: str
    price: float
    pricePeriod: Optional[str] = ""
    currency: str
    dealType: str
    propertyType: str
    location: LocationInfoSchema
    rating: float
    reviewsCount: int
    photos: List[str]
    featured: bool
    specs: PropertySpecsSchema
    facilities: List[FacilitySchema]
    amenities: List[str]
    agent: Optional[AgentSchema] = None
    createdAt: str
    ownerId: Optional[str] = None
    status: str

    class Config:
        from_attributes = True

# User Schemas
class UserBase(BaseModel):
    username: str
    name: str
    email: str
    phone: str = "+998 90 000-00-00"
    role: str = "seeker"  # admin, owner, seeker
    avatar: Optional[str] = None
    agencyName: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class UserResponse(BaseModel):
    id: str
    username: str
    name: str
    email: str
    phone: str
    role: str
    avatar: str
    agencyName: Optional[str] = None
    createdAt: str
    savedPropertyIds: List[str] = []

    class Config:
        from_attributes = True

class AuthResponse(BaseModel):
    success: bool
    user: Optional[UserResponse] = None
    token: Optional[str] = None
    error: Optional[str] = None

# Lead / Booking Request Schema
class LeadCreate(BaseModel):
    propertyId: str
    clientName: str
    clientPhone: str
    clientEmail: Optional[str] = None
    message: Optional[str] = "Здравствуйте! Хочу посмотреть данный объект."

class LeadResponse(BaseModel):
    id: str
    propertyId: str
    clientName: str
    clientPhone: str
    clientEmail: Optional[str] = None
    message: str
    status: str
    createdAt: str

    class Config:
        from_attributes = True

# AI Assistant Chat Schema
class AIChatRequest(BaseModel):
    message: str
    conversationHistory: Optional[List[Dict[str, Any]]] = None

class AIChatResponse(BaseModel):
    reply: str
    matchedPropertyIds: List[str] = []
    mapCenter: Optional[List[float]] = None
    mapZoom: Optional[int] = 13

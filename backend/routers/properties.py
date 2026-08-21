import json
import uuid
import datetime
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc, asc

from ..database import get_db
from ..models import Property as PropertyModel, User as UserModel
from ..schemas import PropertyCreate, PropertyUpdate, PropertyResponse, LocationInfoSchema, PropertySpecsSchema

router = APIRouter(prefix="/api/properties", tags=["Properties"])

def model_to_response(prop: PropertyModel) -> dict:
    photos = []
    amenities = []
    facilities = []
    try:
        photos = json.loads(prop.photos_json) if prop.photos_json else []
    except Exception:
        photos = []
    try:
        amenities = json.loads(prop.amenities_json) if prop.amenities_json else []
    except Exception:
        amenities = []
    try:
        facilities = json.loads(prop.facilities_json) if prop.facilities_json else []
    except Exception:
        facilities = []

    return {
        "id": prop.id,
        "title": prop.title,
        "description": prop.description,
        "price": prop.price,
        "pricePeriod": prop.price_period,
        "currency": prop.currency,
        "dealType": prop.deal_type,
        "propertyType": prop.property_type,
        "location": {
            "address": prop.address,
            "neighborhood": prop.neighborhood,
            "city": prop.city,
            "country": prop.country,
            "lat": prop.lat,
            "lng": prop.lng
        },
        "rating": prop.rating,
        "reviewsCount": prop.reviews_count,
        "photos": photos,
        "featured": prop.featured,
        "status": prop.status,
        "specs": {
            "bedrooms": prop.bedrooms,
            "bathrooms": prop.bathrooms,
            "areaSqFt": prop.area_sq_m,
            "builtYear": prop.built_year,
            "livingRooms": prop.living_rooms,
            "parkingSpaces": prop.parking_spaces,
            "floor": prop.floor,
            "totalFloors": prop.total_floors
        },
        "facilities": facilities,
        "amenities": amenities,
        "agent": {
            "id": "agent-uz-1",
            "name": "Собственник" if not prop.owner else prop.owner.name,
            "role": "Владелец недвижимости",
            "phone": "+998 90 123-45-67" if not prop.owner else prop.owner.phone,
            "email": "owner@uzestate.uz" if not prop.owner else prop.owner.email,
            "avatar": "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=300&q=80",
            "verified": True,
            "rating": 4.9,
            "dealsCount": 18
        },
        "createdAt": prop.created_at.isoformat() if prop.created_at else datetime.datetime.utcnow().isoformat(),
        "ownerId": prop.owner_id
    }

@router.get("", summary="Get all properties with full filtering")
def get_properties(
    search: Optional[str] = None,
    city: Optional[str] = None,
    neighborhood: Optional[str] = None,
    dealType: Optional[str] = None,
    propertyType: Optional[str] = None,
    minPrice: Optional[float] = None,
    maxPrice: Optional[float] = None,
    bedrooms: Optional[str] = None,
    sortBy: Optional[str] = Query("featured", enum=["featured", "price_asc", "price_desc", "rating", "newest"]),
    db: Session = Depends(get_db)
):
    query = db.query(PropertyModel)

    if search:
        s = f"%{search.strip().lower()}%"
        query = query.filter(
            or_(
                PropertyModel.title.ilike(s),
                PropertyModel.description.ilike(s),
                PropertyModel.neighborhood.ilike(s),
                PropertyModel.city.ilike(s),
                PropertyModel.address.ilike(s)
            )
        )

    if city and city != "all":
        query = query.filter(PropertyModel.city.ilike(f"%{city.strip()}%"))

    if neighborhood and neighborhood != "all":
        query = query.filter(PropertyModel.neighborhood.ilike(f"%{neighborhood.strip()}%"))

    if dealType and dealType != "all":
        query = query.filter(PropertyModel.deal_type == dealType)

    if propertyType and propertyType != "all":
        query = query.filter(PropertyModel.property_type == propertyType)

    if minPrice is not None:
        query = query.filter(PropertyModel.price >= minPrice)

    if maxPrice is not None:
        query = query.filter(PropertyModel.price <= maxPrice)

    if bedrooms and bedrooms != "all":
        try:
            b_count = int(bedrooms)
            query = query.filter(PropertyModel.bedrooms >= b_count)
        except ValueError:
            pass

    # Sorting
    if sortBy == "price_asc":
        query = query.order_by(asc(PropertyModel.price))
    elif sortBy == "price_desc":
        query = query.order_by(desc(PropertyModel.price))
    elif sortBy == "rating":
        query = query.order_by(desc(PropertyModel.rating))
    elif sortBy == "newest":
        query = query.order_by(desc(PropertyModel.created_at))
    else:  # featured
        query = query.order_by(desc(PropertyModel.featured), desc(PropertyModel.created_at))

    results = query.all()
    formatted = [model_to_response(p) for p in results]

    return {
        "success": True,
        "total": len(formatted),
        "data": formatted
    }

@router.get("/{property_id}", summary="Get single property by ID")
def get_property(property_id: str, db: Session = Depends(get_db)):
    prop = db.query(PropertyModel).filter(PropertyModel.id == property_id).first()
    if not prop:
        raise HTTPException(status_code=404, detail="Объект недвижимости не найден")
    return {"success": True, "data": model_to_response(prop)}

@router.post("", status_code=status.HTTP_201_CREATED, summary="Create a new property listing")
def create_property(prop_in: PropertyCreate, db: Session = Depends(get_db)):
    prop_id = f"uz-prop-{uuid.uuid4().hex[:8]}"

    new_prop = PropertyModel(
        id=prop_id,
        title=prop_in.title,
        description=prop_in.description,
        price=prop_in.price,
        price_period=prop_in.pricePeriod or ("/ мес" if prop_in.dealType == "rent" else ""),
        currency=prop_in.currency or "$",
        deal_type=prop_in.dealType,
        property_type=prop_in.propertyType,
        
        # Location
        address=prop_in.location.address,
        neighborhood=prop_in.location.neighborhood,
        city=prop_in.location.city,
        country=prop_in.location.country,
        lat=prop_in.location.lat,
        lng=prop_in.location.lng,

        # Specs
        bedrooms=prop_in.specs.bedrooms,
        bathrooms=prop_in.specs.bathrooms,
        area_sq_m=prop_in.specs.areaSqFt,
        built_year=prop_in.specs.builtYear,
        living_rooms=prop_in.specs.livingRooms,
        parking_spaces=prop_in.specs.parkingSpaces,
        floor=prop_in.specs.floor or 1,
        total_floors=prop_in.specs.totalFloors or 9,

        # Media & Meta
        photos_json=json.dumps(prop_in.photos if prop_in.photos else []),
        amenities_json=json.dumps(prop_in.amenities if prop_in.amenities else []),
        facilities_json=json.dumps([f.model_dump() for f in prop_in.facilities] if prop_in.facilities else []),
        featured=prop_in.featured,
        status="published",
        created_at=datetime.datetime.utcnow()
    )

    db.add(new_prop)
    db.commit()
    db.refresh(new_prop)

    return {"success": True, "data": model_to_response(new_prop), "message": "Объект успешно опубликован"}

@router.put("/{property_id}", summary="Update existing property")
def update_property(property_id: str, prop_in: PropertyUpdate, db: Session = Depends(get_db)):
    prop = db.query(PropertyModel).filter(PropertyModel.id == property_id).first()
    if not prop:
        raise HTTPException(status_code=404, detail="Объект не найден")

    if prop_in.title is not None:
        prop.title = prop_in.title
    if prop_in.description is not None:
        prop.description = prop_in.description
    if prop_in.price is not None:
        prop.price = prop_in.price
    if prop_in.dealType is not None:
        prop.deal_type = prop_in.dealType
    if prop_in.propertyType is not None:
        prop.property_type = prop_in.propertyType
    if prop_in.featured is not None:
        prop.featured = prop_in.featured
    if prop_in.status is not None:
        prop.status = prop_in.status

    if prop_in.location is not None:
        prop.address = prop_in.location.address
        prop.neighborhood = prop_in.location.neighborhood
        prop.city = prop_in.location.city
        prop.lat = prop_in.location.lat
        prop.lng = prop_in.location.lng

    if prop_in.specs is not None:
        prop.bedrooms = prop_in.specs.bedrooms
        prop.bathrooms = prop_in.specs.bathrooms
        prop.area_sq_m = prop_in.specs.areaSqFt
        prop.built_year = prop_in.specs.builtYear

    if prop_in.photos is not None:
        prop.photos_json = json.dumps(prop_in.photos)
    if prop_in.amenities is not None:
        prop.amenities_json = json.dumps(prop_in.amenities)

    db.commit()
    db.refresh(prop)

    return {"success": True, "data": model_to_response(prop), "message": "Объект успешно обновлен"}

@router.delete("/{property_id}", summary="Delete property listing")
def delete_property(property_id: str, db: Session = Depends(get_db)):
    prop = db.query(PropertyModel).filter(PropertyModel.id == property_id).first()
    if not prop:
        raise HTTPException(status_code=404, detail="Объект не найден")

    db.delete(prop)
    db.commit()

    return {"success": True, "message": "Объект успешно удален"}

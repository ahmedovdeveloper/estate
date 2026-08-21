import datetime
import json
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from ..database import get_db
from ..models import User as UserModel, Property as PropertyModel, Lead as LeadModel
from .auth import user_to_dict

router = APIRouter(prefix="/api/admin", tags=["Admin API"])

@router.get("/stats", summary="Get comprehensive admin statistics")
def get_admin_stats(db: Session = Depends(get_db)):
    total_users = db.query(UserModel).count()
    total_properties = db.query(PropertyModel).count()
    rent_count = db.query(PropertyModel).filter(PropertyModel.deal_type == "rent").count()
    sale_count = db.query(PropertyModel).filter(PropertyModel.deal_type == "sale").count()
    total_leads = db.query(LeadModel).count()
    new_leads = db.query(LeadModel).filter(LeadModel.status == "new").count()

    # Cities distribution
    cities = db.query(PropertyModel.city, func.count(PropertyModel.id)).group_by(PropertyModel.city).all()
    city_stats = {c[0]: c[1] for c in cities if c[0]}

    # Total estimated valuation of listings (sum of prices)
    total_valuation = db.query(func.sum(PropertyModel.price)).scalar() or 0.0

    return {
        "success": True,
        "metrics": {
            "totalProperties": total_properties,
            "totalUsers": total_users,
            "totalLeads": total_leads,
            "newLeads": new_leads,
            "rentCount": rent_count,
            "saleCount": sale_count,
            "totalValuation": total_valuation,
            "cities": city_stats
        }
    }

@router.get("/users", summary="Admin: List all registered users with their listings count")
def get_admin_users(db: Session = Depends(get_db)):
    users = db.query(UserModel).all()
    result = []
    for u in users:
        d = user_to_dict(u)
        d["listingsCount"] = db.query(PropertyModel).filter(PropertyModel.owner_id == u.id).count()
        result.append(d)

    return {
        "success": True,
        "total": len(result),
        "users": result
    }

@router.put("/users/{user_id}", summary="Admin: Update user details or role")
def admin_update_user(user_id: str, payload: dict, db: Session = Depends(get_db)):
    user = db.query(UserModel).filter(UserModel.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")

    if "name" in payload:
        user.name = payload["name"]
    if "email" in payload:
        user.email = payload["email"]
    if "phone" in payload:
        user.phone = payload["phone"]
    if "role" in payload:
        user.role = payload["role"]
    if "agencyName" in payload:
        user.agency_name = payload["agencyName"]

    db.commit()
    db.refresh(user)

    return {"success": True, "user": user_to_dict(user), "message": "Данные пользователя обновлены"}

@router.delete("/users/{user_id}", summary="Admin: Delete a user")
def admin_delete_user(user_id: str, db: Session = Depends(get_db)):
    if user_id == "user-admin":
        raise HTTPException(status_code=400, detail="Нельзя удалить главного администратора")

    user = db.query(UserModel).filter(UserModel.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")

    db.delete(user)
    db.commit()

    return {"success": True, "message": "Пользователь успешно удален"}

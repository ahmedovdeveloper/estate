import uuid
import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import desc

from ..database import get_db
from ..models import Lead as LeadModel, Property as PropertyModel
from ..schemas import LeadCreate, LeadResponse

router = APIRouter(prefix="/api/leads", tags=["Leads & Bookings"])

def lead_to_dict(l: LeadModel) -> dict:
    return {
        "id": l.id,
        "propertyId": l.property_id,
        "clientName": l.client_name,
        "clientPhone": l.client_phone,
        "clientEmail": l.client_email,
        "message": l.message,
        "status": l.status,
        "createdAt": l.created_at.isoformat() if l.created_at else datetime.datetime.utcnow().isoformat()
    }

@router.post("", status_code=status.HTTP_201_CREATED, summary="Submit a booking request or lead")
def create_lead(lead_in: LeadCreate, db: Session = Depends(get_db)):
    prop = db.query(PropertyModel).filter(PropertyModel.id == lead_in.propertyId).first()
    if not prop:
        raise HTTPException(status_code=404, detail="Объект недвижимости не найден")

    new_lead = LeadModel(
        id=f"lead-{uuid.uuid4().hex[:8]}",
        property_id=lead_in.propertyId,
        client_name=lead_in.clientName.strip(),
        client_phone=lead_in.clientPhone.strip(),
        client_email=lead_in.clientEmail.strip() if lead_in.clientEmail else None,
        message=lead_in.message or "Заявка на просмотр объекта",
        status="new",
        created_at=datetime.datetime.utcnow()
    )

    db.add(new_lead)
    db.commit()
    db.refresh(new_lead)

    return {
        "success": True,
        "data": lead_to_dict(new_lead),
        "message": "Заявка успешно отправлена владельцу объекта!"
    }

@router.get("", summary="Get all leads (Admin & Owners)")
def get_leads(propertyId: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(LeadModel)
    if propertyId:
        query = query.filter(LeadModel.property_id == propertyId)
    
    leads = query.order_by(desc(LeadModel.created_at)).all()
    return {
        "success": True,
        "total": len(leads),
        "data": [lead_to_dict(l) for l in leads]
    }

@router.put("/{lead_id}/status", summary="Update lead status")
def update_lead_status(lead_id: str, new_status: str, db: Session = Depends(get_db)):
    lead = db.query(LeadModel).filter(LeadModel.id == lead_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Заявка не найдена")

    lead.status = new_status
    db.commit()
    db.refresh(lead)

    return {"success": True, "data": lead_to_dict(lead), "message": "Статус заявки обновлен"}

import os
import json
from typing import List, Optional
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from google import genai
from google.genai import types

from ..database import get_db
from ..models import Property as PropertyModel
from ..schemas import AIChatRequest, AIChatResponse

router = APIRouter(prefix="/api/ai", tags=["AI Real Estate Search"])

def get_ai_client():
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return None
    try:
        return genai.Client(api_key=api_key)
    except Exception:
        return None

@router.post("/assistant", response_model=AIChatResponse, summary="AI Real Estate Consultant with live property matching")
def ai_assistant(req: AIChatRequest, db: Session = Depends(get_db)):
    user_query = req.message.strip()
    properties = db.query(PropertyModel).all()

    # Pre-format real database listings for context injection
    props_summary = []
    for p in properties[:25]:
        props_summary.append({
            "id": p.id,
            "title": p.title,
            "price": f"{p.price} {p.currency}{p.price_period or ''}",
            "deal": p.deal_type,
            "type": p.property_type,
            "city": p.city,
            "neighborhood": p.neighborhood,
            "bedrooms": p.bedrooms,
            "area_sq_m": p.area_sq_m,
            "lat": p.lat,
            "lng": p.lng
        })

    client = get_ai_client()
    
    system_prompt = f"""
Ты — профессиональный, дружелюбный AI-консультант по недвижимости в Узбекистане (Ташкент, Самарканд, Бухара).
Твоя задача — помочь клиенту подобрать идеальное жильё или коммерческую недвижимость из нашей базы данных, ответить на вопросы по районам, ценам, метро, инфраструктуре и ипотеке.

Доступные объекты недвижимости в нашей базе:
{json.dumps(props_summary, ensure_ascii=False)}

ВАЖНЫЕ ПРАВИЛА ОТВЕТА:
1. Отвечай вежливо, четко и структурировано на русском языке.
2. В конце ответа выдели список ID наиболее подходящих объектов в строгом JSON-формате:
```json
{{
  "reply": "Твой детальный ответ с пояснениями, плюсами локации и ценами...",
  "matchedPropertyIds": ["id1", "id2"],
  "mapCenter": [41.311081, 69.240562],
  "mapZoom": 13
}}
```
"""

    if client:
        try:
            response = client.models.generate_content(
                model="gemini-2.5-flash",
                contents=user_query,
                config=types.GenerateContentConfig(
                    system_instruction=system_prompt,
                    temperature=0.3,
                )
            )

            text_resp = response.text or ""
            
            # Extract JSON block
            if "```json" in text_resp:
                json_str = text_resp.split("```json")[1].split("```")[0].strip()
                parsed = json.loads(json_str)
                return AIChatResponse(
                    reply=parsed.get("reply", text_resp),
                    matchedPropertyIds=parsed.get("matchedPropertyIds", []),
                    mapCenter=parsed.get("mapCenter", [41.311081, 69.240562]),
                    mapZoom=parsed.get("mapZoom", 13)
                )
            elif "{" in text_resp and "}" in text_resp:
                start = text_resp.find("{")
                end = text_resp.rfind("}") + 1
                parsed = json.loads(text_resp[start:end])
                return AIChatResponse(
                    reply=parsed.get("reply", text_resp),
                    matchedPropertyIds=parsed.get("matchedPropertyIds", []),
                    mapCenter=parsed.get("mapCenter", [41.311081, 69.240562]),
                    mapZoom=parsed.get("mapZoom", 13)
                )
            else:
                # Return standard response and find keywords
                matched_ids = [p.id for p in properties if any(k in p.title.lower() or k in p.neighborhood.lower() for k in user_query.lower().split())][:4]
                return AIChatResponse(
                    reply=text_resp,
                    matchedPropertyIds=matched_ids if matched_ids else [properties[0].id] if properties else [],
                    mapCenter=[41.311081, 69.240562],
                    mapZoom=13
                )
        except Exception as e:
            print("Gemini API Error in Python backend:", e)

    # Smart Fallback Matcher
    q_low = user_query.lower()
    matched = []
    center = [41.311081, 69.240562]
    zoom = 13

    if "самарканд" in q_low:
        center = [39.6542, 66.9750]
        matched = [p.id for p in properties if "самарканд" in p.city.lower()]
    elif "бухар" in q_low:
        center = [39.7715, 64.4215]
        matched = [p.id for p in properties if "бухар" in p.city.lower()]
    elif "чиланзар" in q_low:
        matched = [p.id for p in properties if "чиланзар" in p.neighborhood.lower()]
    elif "мирабад" in q_low:
        matched = [p.id for p in properties if "мирабад" in p.neighborhood.lower()]
    elif "аренд" in q_low or "снять" in q_low:
        matched = [p.id for p in properties if p.deal_type == "rent"]
    elif "купить" in q_low or "продаж" in q_low:
        matched = [p.id for p in properties if p.deal_type == "sale"]
    else:
        matched = [p.id for p in properties[:4]]

    return AIChatResponse(
        reply=f"Здравствуйте! Я подобрал для вас проверенные объекты недвижимости по запросу «{user_query}». Все варианты отмечены на интерактивной карте с точными ценами и планировками.",
        matchedPropertyIds=matched[:4],
        mapCenter=center,
        mapZoom=zoom
    )

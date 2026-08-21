import json
import datetime
from .database import SessionLocal, engine, Base
from .models import Property, User, Agent

def seed_database():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    # Check if already seeded
    if db.query(Property).count() > 0:
        print("Database already seeded with initial real estate listings.")
        db.close()
        return

    print("Seeding database with Uzbekistan real estate properties...")

    # 1. Admin User
    admin = User(
        id="user-admin",
        username="admin",
        name="Главный Администратор",
        email="admin@uzestate.uz",
        phone="+998 71 200-00-00",
        role="admin",
        avatar="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
        created_at=datetime.datetime.utcnow()
    )
    db.add(admin)

    # 2. Demo Properties in Tashkent, Samarkand, Bukhara
    properties_data = [
        {
            "id": "uz-prop-1",
            "title": "Премиальная 3-комнатная квартира в Tashkent City",
            "description": "Роскошные апартаменты в элитном комплексе Gardens Residence в Tashkent City с панорамным видом на парк и фонтаны. Дизайнерский ремонт, итальянская мебель, система 'Умный дом'.",
            "price": 240000,
            "currency": "$",
            "deal_type": "sale",
            "property_type": "apartment",
            "address": "ул. Батыра Закирова, 7",
            "neighborhood": "Tashkent City (Шайхантахур)",
            "city": "Ташкент",
            "lat": 41.3145,
            "lng": 69.2480,
            "bedrooms": 3,
            "bathrooms": 2,
            "area_sq_m": 125.0,
            "built_year": 2023,
            "floor": 12,
            "total_floors": 24,
            "featured": True,
            "photos_json": json.dumps([
                "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
                "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80"
            ]),
            "amenities_json": json.dumps(["Кондиционер", "Паркинг", "Охрана 24/7", "Умный дом", "Панорамные окна"]),
            "facilities_json": json.dumps([
                {"type": "metro", "name": "Метро Дружба Народов", "distance": "350 м"},
                {"type": "park", "name": "Парк Tashkent City", "distance": "50 м"},
                {"type": "mall", "name": "Tashkent City Mall", "distance": "200 м"}
            ])
        },
        {
            "id": "uz-prop-2",
            "title": "Уютная 2-комнатная квартира на Юнусабаде",
            "description": "Светлая квартира со свежим евроремонтом рядом с метро Шахристан. Полностью укомплектована мебелью и качественной бытовой техникой.",
            "price": 550,
            "price_period": "/ мес",
            "currency": "$",
            "deal_type": "rent",
            "property_type": "apartment",
            "address": "Юнусабад 4 квартал, дом 18",
            "neighborhood": "Юнусабадский район",
            "city": "Ташкент",
            "lat": 41.3650,
            "lng": 69.2885,
            "bedrooms": 2,
            "bathrooms": 1,
            "area_sq_m": 68.0,
            "built_year": 2021,
            "floor": 4,
            "total_floors": 9,
            "featured": True,
            "photos_json": json.dumps([
                "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
                "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80"
            ]),
            "amenities_json": json.dumps(["Wi-Fi", "Кондиционер", "Стиральная машина", "Балкон"]),
            "facilities_json": json.dumps([
                {"type": "metro", "name": "Метро Шахристан", "distance": "400 м"},
                {"type": "mall", "name": "Megaplanet", "distance": "600 м"}
            ])
        },
        {
            "id": "uz-prop-3",
            "title": "Коттедж в элитном районе Мирабад",
            "description": "Просторный 2-этажный дом с бассейном, сауной, летней кухней и ухоженным ландшафтным садом на участке 6 соток.",
            "price": 380000,
            "currency": "$",
            "deal_type": "sale",
            "property_type": "house",
            "address": "ул. Садыка Азимова, 45",
            "neighborhood": "Мирабадский район",
            "city": "Ташкент",
            "lat": 41.3020,
            "lng": 69.2850,
            "bedrooms": 5,
            "bathrooms": 3,
            "area_sq_m": 380.0,
            "built_year": 2022,
            "floor": 2,
            "total_floors": 2,
            "featured": True,
            "photos_json": json.dumps([
                "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80"
            ]),
            "amenities_json": json.dumps(["Бассейн", "Сауна", "Гараж на 2 авто", "Видеонаблюдение", "Ландшафтный сад"]),
            "facilities_json": json.dumps([
                {"type": "school", "name": "Международная школа", "distance": "500 м"},
                {"type": "restaurant", "name": "Рестораны Мирабада", "distance": "300 м"}
            ])
        },
        {
            "id": "uz-prop-4",
            "title": "Видовые апартаменты возле площади Регистан",
            "description": "Уникальное расположение в историческом центре Самарканда. Подходит как для комфортной жизни, так и для посуточной аренды туристам.",
            "price": 95000,
            "currency": "$",
            "deal_type": "sale",
            "property_type": "apartment",
            "address": "ул. Регистанская, 12",
            "neighborhood": "Центральный район",
            "city": "Самарканд",
            "lat": 39.6542,
            "lng": 66.9750,
            "bedrooms": 2,
            "bathrooms": 1,
            "area_sq_m": 72.0,
            "built_year": 2020,
            "floor": 3,
            "total_floors": 5,
            "featured": False,
            "photos_json": json.dumps([
                "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80"
            ]),
            "amenities_json": json.dumps(["Вид на Регистан", "Автономное отопление", "Кондиционер", "Wi-Fi"]),
            "facilities_json": json.dumps([
                {"type": "park", "name": "Площадь Регистан", "distance": "300 м"}
            ])
        }
    ]

    for p in properties_data:
        prop = Property(**p)
        db.add(prop)

    db.commit()
    print("Database seeding completed successfully!")
    db.close()

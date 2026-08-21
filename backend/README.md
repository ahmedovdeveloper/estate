# UzEstate Pro - FastAPI Backend & Admin Dashboard

Полноценный бэкенд на **Python + FastAPI + SQLAlchemy + SQLAdmin (Admin Dashboard) + Gemini AI** для платформы недвижимости в Узбекистане.

---

## 🚀 Возможности

1. **REST API & CRUD**:
   - `/api/properties` — полный каталог объектов с фильтрами по городам (Ташкент, Самарканд, Бухара), ценам, комнатам, типам сделки (Аренда / Продажа).
   - `/api/auth` — регистрация, авторизация (JWT / Session), профиль пользователя.
   - `/api/leads` — прием заявок на просмотр и бронирование объектов.
   - `/api/admin` — статистика, управление ролями и пользователями.
   - `/api/ai/assistant` — умный консультант по недвижимости на базе Gemini 2.5 Flash с привязкой объектов и координат.

2. **Default Admin Dashboard (SQLAdmin)**:
   - Доступен по адресу: `http://localhost:8000/admin`
   - **Логин администратора по умолчанию**: `admin`
   - **Пароль**: `admin`
   - Визуальное управление:
     - 🏢 **Объекты недвижимости** (фильтры, добавление, редактирование, фото, цены, удаление);
     - 👥 **Пользователи и роли** (Admin, Owner, Seeker);
     - 📩 **Заявки и лиды** (смена статусов New / In Progress / Closed);
     - 👔 **Агенты и риелторы**.

3. **Интерактивная документация Swagger**:
   - `http://localhost:8000/docs`
   - `http://localhost:8000/redoc`

---

## 🛠️ Запуск локально (Python)

### 1. Установка зависимостей
```bash
cd backend
python -m venv venv
source venv/bin/activate  # На Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Запуск сервера
```bash
# Из корневой папки проекта:
uvicorn backend.main:app --reload --port 8000
```

Сервер автоматически:
- Создаст базу данных SQLite (`uzestate.db`);
- Наполнит её реальными объектами в Tashkent City, Юнусабаде, Мирабаде и Самарканде;
- Запустит Admin Dashboard на `http://localhost:8000/admin`.

---

## 🐳 Запуск через Docker / Docker Compose

```bash
docker-compose -f backend/docker-compose.yml up --build -d
```
Бэкенд будет доступен на порту `8000`, а база данных PostgreSQL — на порту `5432`.

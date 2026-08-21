import uuid
import datetime
import json
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from passlib.context import CryptContext

from ..database import get_db
from ..models import User as UserModel
from ..schemas import UserCreate, UserLogin, UserResponse, AuthResponse

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
router = APIRouter(prefix="/api/auth", tags=["Authentication"])

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    if not hashed_password:
        return True
    try:
        return pwd_context.verify(plain_password, hashed_password)
    except Exception:
        return plain_password == hashed_password

def user_to_dict(user: UserModel) -> dict:
    saved = []
    try:
        saved = json.loads(user.saved_property_ids) if user.saved_property_ids else []
    except Exception:
        saved = []

    return {
        "id": user.id,
        "username": user.username,
        "name": user.name,
        "email": user.email,
        "phone": user.phone,
        "role": user.role,
        "avatar": user.avatar,
        "agencyName": user.agency_name,
        "createdAt": user.created_at.isoformat() if user.created_at else datetime.datetime.utcnow().isoformat(),
        "savedPropertyIds": saved
    }

@router.post("/login", response_model=AuthResponse, summary="User & Admin Login")
def login(creds: UserLogin, db: Session = Depends(get_db)):
    clean_user = creds.username.strip().lower()
    clean_pass = creds.password.strip()

    # Special Admin bootstrap
    if clean_user == "admin" and clean_pass == "admin":
        admin_user = db.query(UserModel).filter(UserModel.username == "admin").first()
        if not admin_user:
            admin_user = UserModel(
                id="user-admin",
                username="admin",
                name="Главный Администратор",
                email="admin@uzestate.uz",
                phone="+998 71 200-00-00",
                role="admin",
                avatar="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
                created_at=datetime.datetime.utcnow()
            )
            db.add(admin_user)
            db.commit()
            db.refresh(admin_user)

        return AuthResponse(
            success=True,
            user=user_to_dict(admin_user),
            token="token-admin-session"
        )

    user = db.query(UserModel).filter(UserModel.username.ilike(clean_user)).first()
    if not user or not verify_password(clean_pass, user.hashed_password or ""):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Неверный логин или пароль"
        )

    return AuthResponse(
        success=True,
        user=user_to_dict(user),
        token=f"token-{user.id}"
    )

@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED, summary="Register a new user")
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    clean_user = user_in.username.strip().lower()
    existing = db.query(UserModel).filter(UserModel.username.ilike(clean_user)).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Пользователь с таким логином уже зарегистрирован"
        )

    new_user = UserModel(
        id=f"user-{uuid.uuid4().hex[:8]}",
        username=clean_user,
        name=user_in.name.strip(),
        email=user_in.email.strip().lower(),
        phone=user_in.phone.strip(),
        hashed_password=get_password_hash(user_in.password.strip()),
        role=user_in.role if user_in.role in ["owner", "seeker", "admin"] else "seeker",
        agency_name=user_in.agencyName,
        avatar=user_in.avatar or "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80",
        created_at=datetime.datetime.utcnow(),
        saved_property_ids="[]"
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return AuthResponse(
        success=True,
        user=user_to_dict(new_user),
        token=f"token-{new_user.id}"
    )

@router.get("/me", summary="Get current user profile")
def get_current_user(token: str, db: Session = Depends(get_db)):
    if not token.startswith("token-"):
        raise HTTPException(status_code=401, detail="Неверный токен")

    user_id = token.replace("token-", "")
    if user_id == "admin-session":
        user_id = "user-admin"

    user = db.query(UserModel).filter(UserModel.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")

    return {"success": True, "user": user_to_dict(user)}

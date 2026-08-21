import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from .database import engine, Base
from .admin import setup_admin
from .seed_data import seed_database
from .routers import properties, auth, leads, admin_api, ai_search

load_dotenv()

# Create database tables
Base.metadata.create_all(bind=engine)

# Seed initial real estate listings & admin
try:
    seed_database()
except Exception as e:
    print("Database seed notice:", e)

app = FastAPI(
    title="UzEstate Real Estate API & Admin",
    description="FastAPI Backend for Uzbekistan Real Estate Portal with Interactive Admin Dashboard, Gemini AI, and Property Management",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Configuration
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Routers
app.include_router(properties.router)
app.include_router(auth.router)
app.include_router(leads.router)
app.include_router(admin_api.router)
app.include_router(ai_search.router)

# Mount SQLAdmin Dashboard at /admin
admin = setup_admin(app, engine)

@app.get("/", tags=["Health"])
def root():
    return {
        "status": "online",
        "app": "UzEstate FastAPI Backend",
        "docs": "/docs",
        "admin": "/admin",
        "version": "2.0.0"
    }

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("backend.main:app", host="0.0.0.0", port=port, reload=True)

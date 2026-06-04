from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from db.database import SessionLocal
from models import Usermodel

router = APIRouter()


# ---------------------------
# DB dependency
# ---------------------------
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ---------------------------
# User Creation
# ---------------------------
@router.post("/users")
def create_user(user: Usermodel.UserCreate, db: Session = Depends(get_db)):
    db_user = Usermodel.User(
        name=user.name,
        email=user.email
    )

    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    return db_user


# ---------------------------
# Get all users
# ---------------------------
@router.get("/users")
def get_users(db: Session = Depends(get_db)):
    return db.query(Usermodel.User).all()
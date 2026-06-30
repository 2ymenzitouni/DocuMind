# from fastapi import APIRouter, Depends, HTTPException
# from sqlalchemy.orm import Session
# from passlib.context import CryptContext

# from db.database import SessionLocal
# from models import Usermodel

# router = APIRouter()

# # bcrypt config
# pwd_context = CryptContext(
#     schemes=["bcrypt"],
#     deprecated="auto"
# )


# # -----------------------
# # DB Dependency
# # -----------------------
# def get_db():
#     db = SessionLocal()
#     try:
#         yield db
#     finally:
#         db.close()


# # -----------------------
# # Password helpers
# # -----------------------
# def hash_password(password: str):
#     return pwd_context.hash(password)


# def verify_password(plain_password: str, hashed_password: str):
#     return pwd_context.verify(plain_password, hashed_password)


# # -----------------------
# # SIGNUP
# # -----------------------
# @router.post("/signup")
# def signup(user: Usermodel.UserCreate, db: Session = Depends(get_db)):

#     # check if user already exists
#     existing_user = db.query(Usermodel.User).filter(
#         Usermodel.User.email == user.email
#     ).first()

#     if existing_user:
#         raise HTTPException(status_code=400, detail="Email already registered")

#     hashed_password = hash_password(user.password)

#     db_user = Usermodel.User(
#         name=user.name,
#         email=user.email,
#         password=hashed_password
#     )

#     db.add(db_user)
#     db.commit()
#     db.refresh(db_user)

#     return {
#         "message": "User created successfully",
#         "id": db_user.id,
#         "name": db_user.name,
#         "email": db_user.email
#     }


# # -----------------------
# # LOGIN
# # -----------------------
# class LoginSchema(Usermodel.BaseModel):
#     email: str
#     password: str


# @router.post("/login")
# def login(user: LoginSchema, db: Session = Depends(get_db)):

#     db_user = db.query(Usermodel.User).filter(
#         Usermodel.User.email == user.email
#     ).first()

#     if not db_user:
#         raise HTTPException(status_code=400, detail="Invalid credentials")

#     if not verify_password(user.password, db_user.password):
#         raise HTTPException(status_code=400, detail="Invalid credentials")

#     return {
#         "message": "Login successful",
#         "user": {
#             "id": db_user.id,
#             "name": db_user.name,
#             "email": db_user.email
#         }
#     }

# =====================================================

# from fastapi import APIRouter, Depends, HTTPException
# from sqlalchemy.orm import Session
# from passlib.context import CryptContext

# from db.database import SessionLocal
# from models import Usermodel

# router = APIRouter()

# # bcrypt config
# pwd_context = CryptContext(
#     schemes=["bcrypt"],
#     deprecated="auto"
# )


# # -----------------------
# # DB Dependency
# # -----------------------
# def get_db():
#     db = SessionLocal()
#     try:
#         yield db
#     finally:
#         db.close()


# # -----------------------
# # Password helpers
# # -----------------------
# def hash_password(password: str):
#     return pwd_context.hash(password)


# def verify_password(plain_password: str, hashed_password: str):
#     return pwd_context.verify(plain_password, hashed_password)


# # -----------------------
# # SIGNUP
# # -----------------------
# @router.post("/signup")
# def signup(user: Usermodel.UserCreate, db: Session = Depends(get_db)):

#     # check if user already exists
#     existing_user = db.query(Usermodel.User).filter(
#         Usermodel.User.email == user.email
#     ).first()

#     if existing_user:
#         raise HTTPException(status_code=400, detail="Email already registered")

#     hashed_password = hash_password(user.password)

#     db_user = Usermodel.User(
#         name=user.name,
#         email=user.email,
#         password=hashed_password
#     )

#     db.add(db_user)
#     db.commit()
#     db.refresh(db_user)

#     return {
#         "message": "User created successfully",
#         "id": db_user.id,
#         "name": db_user.name,
#         "email": db_user.email
#     }


# # -----------------------
# # LOGIN
# # -----------------------
# class LoginSchema(Usermodel.BaseModel):
#     email: str
#     password: str


# @router.post("/login")
# def login(user: LoginSchema, db: Session = Depends(get_db)):

#     db_user = db.query(Usermodel.User).filter(
#         Usermodel.User.email == user.email
#     ).first()

#     if not db_user:
#         raise HTTPException(status_code=400, detail="Invalid credentials")

#     if not verify_password(user.password, db_user.password):
#         raise HTTPException(status_code=400, detail="Invalid credentials")

#     return {
#         "message": "Login successful",
#         "user": {
#             "id": db_user.id,
#             "name": db_user.name,
#             "email": db_user.email
#         }
#     }

# =====================================================

import os
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from jose import jwt  # Added to generate the token string

from db.database import SessionLocal
from models import Usermodel

router = APIRouter()

# Read your environment configurations
JWT_SECRET = os.getenv("JWT_SECRET", "your_fallback_jwt_secret_key")
ALGORITHM = "HS256"

# bcrypt config
pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)

# -----------------------
# DB Dependency
# -----------------------
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# -----------------------
# Password helpers
# -----------------------
def hash_password(password: str):
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str):
    return pwd_context.verify(plain_password, hashed_password)

# -----------------------
# SIGNUP
# -----------------------
@router.post("/signup")
def signup(user: Usermodel.UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(Usermodel.User).filter(
        Usermodel.User.email == user.email
    ).first()

    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_password = hash_password(user.password)

    db_user = Usermodel.User(
        name=user.name,
        email=user.email,
        password=hashed_password
    )

    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    return {
        "message": "User created successfully",
        "id": db_user.id,
        "name": db_user.name,
        "email": db_user.email
    }

# -----------------------
# LOGIN
# -----------------------
class LoginSchema(Usermodel.BaseModel):
    email: str
    password: str

@router.post("/login")
def login(user: LoginSchema, db: Session = Depends(get_db)):
    db_user = db.query(Usermodel.User).filter(
        Usermodel.User.email == user.email
    ).first()

    if not db_user:
        raise HTTPException(status_code=400, detail="Invalid credentials")

    if not verify_password(user.password, db_user.password):
        raise HTTPException(status_code=400, detail="Invalid credentials")

    # 1. Build the exact payload structure auth.py expects to find
    token_payload = {
        "email": db_user.email,
        "sub": str(db_user.id)
    }

    # 2. Encode and sign the JWT string securely
    access_token = jwt.encode(token_payload, JWT_SECRET, algorithm=ALGORITHM)

    # 3. Return the token in standard OAuth2 format alongside user info
    return {
        "message": "Login successful",
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": db_user.id,
            "name": db_user.name,
            "email": db_user.email
        }
    }
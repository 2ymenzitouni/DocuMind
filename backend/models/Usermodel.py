from sqlalchemy import Column, Integer, String
from pydantic import BaseModel, EmailStr

from db.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    password = Column(String, nullable=False)


class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
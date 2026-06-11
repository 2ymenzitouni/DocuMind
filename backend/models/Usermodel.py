# from sqlalchemy import Column, Integer, String
# from pydantic import BaseModel, EmailStr

# from db.database import Base


# class User(Base):
#     __tablename__ = "users"

#     id = Column(Integer, primary_key=True, index=True)
#     name = Column(String, nullable=False)
#     email = Column(String, unique=True, nullable=False)
#     password = Column(String, nullable=False)


# class UserCreate(BaseModel):
#     name: str
#     email: EmailStr
#     password: str

#====================================================

from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from pydantic import BaseModel, EmailStr

from db.database import Base
# Import the Chat model so SQLAlchemy knows it exists when building the relationship map
from models.ChatModel import Chat


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    password = Column(String, nullable=False)

    # EXACT MATCH: Maps to the "user" relationship inside the Chat model
    chats = relationship("Chat", back_populates="user", cascade="all, delete-orphan")


class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
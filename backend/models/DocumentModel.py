import uuid
from datetime import datetime

from sqlalchemy import Column, String, Text, DateTime, ForeignKey, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

# 1. CRITICAL: Import your User class and the Base it uses 
# (Adjust this import path to match where your exact User model is located)
from models.Usermodel import Base, User 

class Document(Base):
    __tablename__ = "documents"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        index=True
    )

    # 2. FIX: Changed from UUID to Integer to perfectly match your untouched User model id type
    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    filename = Column(String, nullable=True)
    file_url = Column(Text, nullable=True)
    file_type = Column(String, nullable=True)
    status = Column(String, default="pending")

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationship to User model
# Change this line in your Document class:
user = relationship("User", backref="documents")
chunks = relationship("DocumentChunk", back_populates="document", cascade="all, delete-orphan")
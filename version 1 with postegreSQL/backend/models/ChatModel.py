# import uuid
# from sqlalchemy import Column, String, DateTime, ForeignKey
# from sqlalchemy.dialects.postgresql import UUID  # Using Postgres UUID or String fallback
# from sqlalchemy.orm import relationship
# from datetime import datetime
# from db.database import Base

# class Chat(Base):
#     __tablename__ = "chats"

#     # Primary key uses a UUID string to match your frontend UUID creation logic
#     id = Column(String(36), primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    
#     # Foreign key referencing the users table uuid
#     user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    
#     # Conversational Metadata fields from your schema diagram
#     title = Column(String(255), nullable=True, default="New Conversation")
#     created_at = Column(DateTime, default=datetime.utcnow)

#     # Relationship hook strictly linking back to the User model
#     user = relationship("User", back_populates="chats")


##########################################################

import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from db.database import Base

class Chat(Base):
    __tablename__ = "chats"

    id = Column(String(36), primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), nullable=True, default="New Conversation")
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="chats")
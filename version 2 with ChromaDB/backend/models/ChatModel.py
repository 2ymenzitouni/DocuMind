# import uuid
# from datetime import datetime
# from sqlalchemy import Column, String, DateTime, ForeignKey
# from sqlalchemy.orm import relationship
# from db.database import Base

# class Chat(Base):
#     __tablename__ = "chats"

#     id = Column(String(36), primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
#     user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
#     title = Column(String(255), nullable=True, default="New Conversation")
#     created_at = Column(DateTime, default=datetime.utcnow)

#     user = relationship("User", back_populates="chats")

#########################################
import uuid
from sqlalchemy import Integer

from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey, Integer
from sqlalchemy.orm import relationship
from db.database import Base

class Chat(Base):
    __tablename__ = "chats"

    # L'ID du chat reste un UUID textuel unique pour chaque session de discussion
    id = Column(String(36), primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    
    # CORRECTION CRITIQUE : Changement de String(36) à Integer pour correspondre à users.id

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )    
    title = Column(String(255), nullable=True, default="New Conversation")
    created_at = Column(DateTime, default=datetime.utcnow)

    # Cette relation pointe vers le back_populates="chats" de ton modèle User
    user = relationship("User", back_populates="chats")
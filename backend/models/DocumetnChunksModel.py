import uuid
from sqlalchemy import Column, String, Integer, Text, ForeignKey, JSON, DateTime, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

# Assuming your database declarative base is imported from your db configuration file
from db.database import Base 

class DocumentChunk(Base):
    __tablename__ = "document_chunks"

    # Primary key defined as a unique UUID
    id = Column(
        UUID(as_uuid=True), 
        primary_key=True, 
        default=uuid.uuid4, 
        index=True
    )
    
    # Foreign key linking directly to the documents table (NOT NULL / NN)
    document_id = Column(
        UUID(as_uuid=True), 
        ForeignKey("documents.id", ondelete="CASCADE"), 
        nullable=False
    )
    
    # Text data holding the actual string paragraph slice
    content = Column(Text, nullable=True)
    
    # Text placeholder column for vector embeddings 
    # (Note: If using pgvector later, this can change to Vector, but maps to Text/String for now)
    embedding = Column(Text, nullable=True)
    
    # Integer identifying chunk sequence order (0, 1, 2...)
    chunk_index = Column(Integer, nullable=True)
    
    # JSON field type to store flexible structural metadata dictionary shapes
    metadata = Column(JSON, nullable=True)
    
    # Timestamp tracking tracking when the record row entries are initially populated
    created_at = Column(
        DateTime(timezone=True), 
        server_default=func.now(), 
        nullable=True
    )

    # Relationship linking back to the parent Document entity model
    document = relationship("Document", back_populates="chunks")
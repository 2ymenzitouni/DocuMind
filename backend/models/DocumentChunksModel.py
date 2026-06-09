import uuid
from sqlalchemy import Column, String, Integer, Text, ForeignKey, JSON, DateTime, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from db.database import Base

class DocumentChunk(Base):
    __tablename__ = "document_chunks"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        index=True
    )

    document_id = Column(
        UUID(as_uuid=True),
        ForeignKey("documents.id", ondelete="CASCADE"),
        nullable=False
    )

    content = Column(Text, nullable=True)

    embedding = Column(Text, nullable=True)

    chunk_index = Column(Integer, nullable=True)

    # renamed from metadata
    chunk_metadata = Column(JSON, nullable=True)

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )

    document = relationship(
        "Document",
        back_populates="chunks"
    )
import os
import uuid
from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, status
from sqlalchemy.orm import Session
from uuid import UUID

from db.database import SessionLocal
from models import DocumentModel

router = APIRouter()

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# -----------------------
# UPLOAD DOCUMENT (REAL FILE)
# -----------------------
@router.post("/documents")
async def upload_document(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    # 1. Create file identifier and compute local paths
    file_id = uuid.uuid4()
    file_extension = file.filename.split(".")[-1] if "." in file.filename else "txt"
    saved_filename = f"{file_id}.{file_extension}"
    file_path = os.path.join(UPLOAD_DIR, saved_filename)

    # 2. Save incoming stream to disk storage
    with open(file_path, "wb") as buffer:
        buffer.write(await file.read())

    # 3. Save entry to database
    # FIX: Replaced MOCK_USER_ID UUID object with Integer 1 to match your User model primary key
    MOCK_USER_ID = 1

    new_doc = DocumentModel.Document(
        id=file_id,
        user_id=MOCK_USER_ID, 
        filename=file.filename,
        file_url=file_path,
        file_type=file_extension,
        status="Completed"  # Switched from Processing to Completed for testing direct preview
    )

    db.add(new_doc)
    db.commit()
    db.refresh(new_doc)

    # Return structured dict format mapping exactly to React expectations
    return {
        "id": str(new_doc.id),
        "name": new_doc.filename,
        "date": new_doc.created_at.strftime("%Y-%m-%d"),
        "size": os.path.getsize(file_path),
        "status": new_doc.status
    }


# -----------------------
# GET DOCUMENTS
# -----------------------
@router.get("/documents")
def get_documents(db: Session = Depends(get_db)):
    docs = db.query(DocumentModel.Document).all()

    return [
        {
            "id": str(d.id),
            "name": d.filename,
            "date": d.created_at.strftime("%Y-%m-%d"),
            "size": os.path.getsize(d.file_url) if d.file_url and os.path.exists(d.file_url) else 0,
            "status": d.status
        }
        for d in docs
    ]


# -----------------------
# DELETE DOCUMENT
# -----------------------
@router.delete("/documents/{doc_id}")
def delete_document(doc_id: UUID, db: Session = Depends(get_db)):
    doc = db.query(DocumentModel.Document).filter(DocumentModel.Document.id == doc_id).first()

    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Document not found"
        )

    # Clean up file on disk
    if doc.file_url and os.path.exists(doc.file_url):
        os.remove(doc.file_url)

    # Clean up database entry
    db.delete(doc)
    db.commit()

    return {"message": "Deleted successfully", "id": str(doc_id)}
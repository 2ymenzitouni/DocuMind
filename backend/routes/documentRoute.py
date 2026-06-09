# import os
# import uuid
# from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, status
# from sqlalchemy.orm import Session
# from uuid import UUID

# from db.database import SessionLocal
# from models import DocumentModel

# router = APIRouter()

# UPLOAD_DIR = "uploads"
# os.makedirs(UPLOAD_DIR, exist_ok=True)


# def get_db():
#     db = SessionLocal()
#     try:
#         yield db
#     finally:
#         db.close()


# # -----------------------
# # UPLOAD DOCUMENT (REAL FILE)
# # -----------------------
# @router.post("/documents")
# async def upload_document(
#     file: UploadFile = File(...),
#     db: Session = Depends(get_db)
# ):
#     # 1. Create file identifier and compute local paths
#     file_id = uuid.uuid4()
#     file_extension = file.filename.split(".")[-1] if "." in file.filename else "txt"
#     saved_filename = f"{file_id}.{file_extension}"
#     file_path = os.path.join(UPLOAD_DIR, saved_filename)

#     # 2. Save incoming stream to disk storage
#     with open(file_path, "wb") as buffer:
#         buffer.write(await file.read())

#     # 3. Save entry to database
#     # FIX: Replaced MOCK_USER_ID UUID object with Integer 1 to match your User model primary key
#     MOCK_USER_ID = 1

#     new_doc = DocumentModel.Document(
#         id=file_id,
#         user_id=MOCK_USER_ID, 
#         filename=file.filename,
#         file_url=file_path,
#         file_type=file_extension,
#         status="Completed"  # Switched from Processing to Completed for testing direct preview
#     )

#     db.add(new_doc)
#     db.commit()
#     db.refresh(new_doc)

#     # Return structured dict format mapping exactly to React expectations
#     return {
#         "id": str(new_doc.id),
#         "name": new_doc.filename,
#         "date": new_doc.created_at.strftime("%Y-%m-%d"),
#         "size": os.path.getsize(file_path),
#         "status": new_doc.status
#     }


# # -----------------------
# # GET DOCUMENTS
# # -----------------------
# @router.get("/documents")
# def get_documents(db: Session = Depends(get_db)):
#     docs = db.query(DocumentModel.Document).all()

#     return [
#         {
#             "id": str(d.id),
#             "name": d.filename,
#             "date": d.created_at.strftime("%Y-%m-%d"),
#             "size": os.path.getsize(d.file_url) if d.file_url and os.path.exists(d.file_url) else 0,
#             "status": d.status
#         }
#         for d in docs
#     ]


# # -----------------------
# # DELETE DOCUMENT
# # -----------------------
# @router.delete("/documents/{doc_id}")
# def delete_document(doc_id: UUID, db: Session = Depends(get_db)):
#     doc = db.query(DocumentModel.Document).filter(DocumentModel.Document.id == doc_id).first()

#     if not doc:
#         raise HTTPException(
#             status_code=status.HTTP_404_NOT_FOUND, 
#             detail="Document not found"
#         )

#     # Clean up file on disk
#     if doc.file_url and os.path.exists(doc.file_url):
#         os.remove(doc.file_url)

#     # Clean up database entry
#     db.delete(doc)
#     db.commit()

#     return {"message": "Deleted successfully", "id": str(doc_id)}

#---------------------------------------------

import os
import uuid

from fastapi import (
    APIRouter,
    UploadFile,
    File,
    Depends,
    HTTPException,
    status
)

from sqlalchemy.orm import Session
from uuid import UUID

from langchain_text_splitters import RecursiveCharacterTextSplitter

from db.database import SessionLocal

from models import (
    DocumentModel,
    DocumentChunksModel
)

from utils.document_parser import extract_document_text

router = APIRouter()

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


# --------------------------------
# DATABASE SESSION
# --------------------------------
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# --------------------------------
# UPLOAD DOCUMENT
# --------------------------------
@router.post("/documents")
async def upload_document(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    file_id = uuid.uuid4()

    file_extension = os.path.splitext(
        file.filename
    )[1].lower()

    SUPPORTED_EXTENSIONS = [
        ".pdf",
        ".docx",
        ".txt"
    ]

    if file_extension not in SUPPORTED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail="Only PDF, DOCX and TXT files are supported"
        )

    saved_filename = f"{file_id}{file_extension}"

    file_path = os.path.join(
        UPLOAD_DIR,
        saved_filename
    )

    # Save file
    with open(file_path, "wb") as buffer:
        buffer.write(await file.read())

    # Extract text
    try:
        extracted_text = extract_document_text(
            file_path
        )
    except Exception as e:

        if os.path.exists(file_path):
            os.remove(file_path)

        raise HTTPException(
            status_code=422,
            detail=f"Extraction failed: {str(e)}"
        )

    # Split text into chunks
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=100
    )

    chunks = splitter.split_text(
        extracted_text
    )

    try:

        # Your users table uses Integer id
        MOCK_USER_ID = 1

        document = DocumentModel.Document(
            id=file_id,
            user_id=MOCK_USER_ID,
            filename=file.filename,
            file_url=file_path,
            file_type=file_extension.replace(".", ""),
            status="Completed"
        )

        db.add(document)

        # Save chunks
        for index, chunk_text in enumerate(chunks):

            chunk = (
                DocumentChunksModel.DocumentChunk(
                    id=uuid.uuid4(),
                    document_id=file_id,
                    content=chunk_text,
                    embedding=None,
                    chunk_index=index,
                    chunk_metadata={
                        "char_length": len(chunk_text)
                    }
                )
            )

            db.add(chunk)

        db.commit()
        db.refresh(document)

    except Exception as e:

        db.rollback()

        if os.path.exists(file_path):
            os.remove(file_path)

        raise HTTPException(
            status_code=500,
            detail=f"Database error: {str(e)}"
        )

    return {
        "id": str(document.id),
        "name": document.filename,
        "date": document.created_at.strftime(
            "%Y-%m-%d"
        ),
        "size": os.path.getsize(file_path),
        "status": document.status,
        "chunks_processed": len(chunks)
    }


# --------------------------------
# GET DOCUMENTS
# --------------------------------
@router.get("/documents")
def get_documents(
    db: Session = Depends(get_db)
):
    docs = db.query(
        DocumentModel.Document
    ).all()

    return [
        {
            "id": str(doc.id),
            "name": doc.filename,
            "date": doc.created_at.strftime(
                "%Y-%m-%d"
            ),
            "size": (
                os.path.getsize(doc.file_url)
                if doc.file_url
                and os.path.exists(doc.file_url)
                else 0
            ),
            "status": doc.status
        }
        for doc in docs
    ]


# --------------------------------
# DELETE DOCUMENT
# --------------------------------
@router.delete("/documents/{doc_id}")
def delete_document(
    doc_id: UUID,
    db: Session = Depends(get_db)
):
    doc = (
        db.query(DocumentModel.Document)
        .filter(
            DocumentModel.Document.id == doc_id
        )
        .first()
    )

    if not doc:
        raise HTTPException(
            status_code=404,
            detail="Document not found"
        )

    # delete file
    if (
        doc.file_url
        and os.path.exists(doc.file_url)
    ):
        os.remove(doc.file_url)

    # delete db record
    db.delete(doc)
    db.commit()

    return {
        "message": "Deleted successfully",
        "id": str(doc_id)
    }
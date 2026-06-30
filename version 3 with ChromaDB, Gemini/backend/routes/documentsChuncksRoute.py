import os
import uuid

from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, status
from sqlalchemy.orm import Session

from langchain_text_splitters import RecursiveCharacterTextSplitter

from db.database import SessionLocal
from models import DocumentModel, DocumentChunksModel

from utils.document_parser import extract_document_text
from utils.embeddings import get_embedding


router = APIRouter()

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/documents")
async def upload_document(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):

    file_id = uuid.uuid4()

    file_extension = os.path.splitext(file.filename)[1].lower()

    SUPPORTED_EXTENSIONS = [".pdf", ".docx", ".txt"]

    if file_extension not in SUPPORTED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported format. Please upload: {', '.join(SUPPORTED_EXTENSIONS)}"
        )

    saved_filename = f"{file_id}{file_extension}"
    file_path = os.path.join(UPLOAD_DIR, saved_filename)

    try:
        with open(file_path, "wb") as buffer:
            buffer.write(await file.read())

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to save file: {str(e)}"
        )

    try:
        raw_extracted_text = extract_document_text(file_path)

    except Exception as e:

        if os.path.exists(file_path):
            os.remove(file_path)

        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Text extraction failed: {str(e)}"
        )

    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=100,
        length_function=len
    )

    text_chunks = text_splitter.split_text(raw_extracted_text)

    MOCK_USER_ID = uuid.UUID(
        "99999999-9999-9999-9999-999999999999"
    )

    new_doc = DocumentModel.Document(
        id=file_id,
        user_id=MOCK_USER_ID,
        filename=file.filename,
        file_url=file_path,
        file_type=file_extension.replace(".", ""),
        status="Completed"
    )

    try:

        db.add(new_doc)

        for idx, text_segment in enumerate(text_chunks):

            embedding_vector = get_embedding(text_segment)

            chunk_row = DocumentChunksModel.DocumentChunk(
                id=uuid.uuid4(),
                document_id=file_id,
                content=text_segment,
                chunk_index=idx,
                metadata={"char_length": len(text_segment)},
                embedding=None # should be embedding_vector if you want to store the actual embedding
            )

            db.add(chunk_row)

        db.commit()

        db.refresh(new_doc)

    except Exception as e:

        db.rollback()

        if os.path.exists(file_path):
            os.remove(file_path)

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error: {str(e)}"
        )

    return {
        "id": str(new_doc.id),
        "name": new_doc.filename,
        "size": os.path.getsize(file_path),
        "status": new_doc.status,
        "chunks_processed": len(text_chunks)
    }
import os
import uuid
from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, status
from sqlalchemy.orm import Session
from uuid import UUID

# --- LANGCHAIN INTEGRATION ---
from langchain_text_splitters import RecursiveCharacterTextSplitter

from db.database import SessionLocal
from models import DocumentModel, DocumentChunkModel

# Assuming your extraction script functions are saved inside utils/document_parser.py
from utils.document_parser import extract_document_text

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
    # 1. Deduce and validate incoming file type extension strings
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

    # 2. Write incoming stream payload directly to storage disk
    with open(file_path, "wb") as buffer:
        buffer.write(await file.read())

    # 3. USE YOUR PARSER TO EXTRACT RAW CONTENT STRINGS
    try:
        raw_extracted_text = extract_document_text(file_path)
    except Exception as e:
        if os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Text extraction module failed processing file: {str(e)}"
        )

    # 4. CHUNK EXTRACTED TEXT USING LANGCHAIN'S RECURSIVE SPLITTER
    # This intelligently splits text by paragraph, sentence, then word to protect context
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,       # Approximate target character count per database row entry
        chunk_overlap=100,     # Carries context over between adjoining slice splits
        length_function=len
    )
    
    # LangChain splits your raw string directly into an ordered list array
    text_chunks = text_splitter.split_text(raw_extracted_text)

    # 5. COMMIT RESULTS INTO YOUR SCHEMAS
    MOCK_USER_ID = uuid.UUID("99999999-9999-9999-9999-999999999999")
    
    new_doc = DocumentModel.Document(
        id=file_id,
        user_id=MOCK_USER_ID, 
        filename=file.filename,
        file_url=file_path,
        file_type=file_extension.replace(".", ""), # Drops the dot format for database strings
        status="Completed"  
    )

    try:
        db.add(new_doc)
        
        # Iteratively bulk-insert rows into your document_chunks schema layout table
        for idx, text_segment in enumerate(text_chunks):
            chunk_row = DocumentChunkModel.DocumentChunk(
                id=uuid.uuid4(),
                document_id=file_id,
                content=text_segment,
                chunk_index=idx,
                metadata={"char_length": len(text_segment)},
                embedding=None # Set as text placeholder until your vector models initialize
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
            detail=f"Database operational failure: {str(e)}"
        )

    return {
        "id": str(new_doc.id),
        "name": new_doc.filename,
        "size": os.path.getsize(file_path),
        "status": new_doc.status,
        "chunks_processed": len(text_chunks)
    }
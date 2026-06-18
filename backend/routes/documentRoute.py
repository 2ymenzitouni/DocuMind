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
# Importation du moteur d'embeddings Ollama de LangChain
from langchain_ollama import OllamaEmbeddings

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

    # Initialisation du modèle d'embeddings local (ex: nomic-embed-text ou llama3)
    # Assure-toi que le modèle est bien téléchargé localement via `ollama run <nom_modele>`
    try:
        embeddings_engine = OllamaEmbeddings(model="nomic-embed-text")
    except Exception as e:
        if os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(
            status_code=500,
            detail=f"Failed to initialize Embedding engine: {str(e)}"
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

        # Save chunks with actual vectors
        for index, chunk_text in enumerate(chunks):
            
            # Génération du vecteur (liste de floats) pour le chunk courant
            try:
                vector_array = embeddings_engine.embed_query(chunk_text)
            except Exception as embed_error:
                print(f"⚠️ Vector generation failed at chunk index {index}: {embed_error}")
                # Optionnel : lever une exception ou mettre un fallback si Ollama ne répond pas
                raise embed_error

            chunk = (
                DocumentChunksModel.DocumentChunk(
                    id=uuid.uuid4(),
                    document_id=file_id,
                    content=chunk_text,
                    embedding=vector_array,  # Le tableau de réels est maintenant injecté ici
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
            detail=f"Database or Pipeline error: {str(e)}"
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
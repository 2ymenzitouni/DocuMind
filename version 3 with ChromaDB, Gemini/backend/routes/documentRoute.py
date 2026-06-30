# import os
# import uuid
# import numpy as np
# import faiss
# import pickle
# from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, status
# from sqlalchemy.orm import Session
# from langchain_text_splitters import RecursiveCharacterTextSplitter

# from db.database import SessionLocal
# from models import DocumentModel
# # from utils.document_parser import extract_document_text
# from utils.document_parser import extract_text_from_pdf
# from utils.embeddings import get_embedding
# from middlewares.validateJWT import get_current_user  # Assure-toi d'importer ton middleware si tu protèges la route

# router = APIRouter()

# UPLOAD_DIR = "uploads"
# FAISS_INDEX_FILE = "faiss_index.bin"
# FAISS_METADATA_FILE = "faiss_metadata.pkl"
# EMBEDDING_DIM = 384  

# def get_db():
#     db = SessionLocal()
#     try:
#         yield db
#     finally:
#         db.close()

# # ----------------------------------------------------------------
# # 1. GET ALL DOCUMENTS (La route qui provoquait le 405 !)
# # ----------------------------------------------------------------
# @router.get("/documents", status_code=status.HTTP_200_OK)
# def get_documents(db: Session = Depends(get_db)):
#     docs = db.query(DocumentModel.Document).order_by(DocumentModel.Document.id.desc()).all()
    
#     return [
#         {
#             "id": str(doc.id),
#             "name": doc.filename,
#             "status": doc.status,
#             "size": os.path.getsize(doc.file_url) if doc.file_url and os.path.exists(doc.file_url) else 0,
#             "date": doc.created_at.strftime("%Y-%m-%d") if hasattr(doc, 'created_at') and doc.created_at else "N/A"
#         }
#         for doc in docs
#     ]

# # ----------------------------------------------------------------
# # 2. UPLOAD & STREAM TO FAISS INDEX
# # ----------------------------------------------------------------
# @router.post("/documents", status_code=status.HTTP_201_CREATED)
# async def upload_document(file: UploadFile = File(...), db: Session = Depends(get_db)):
#     file_id = uuid.uuid4()
#     file_extension = os.path.splitext(file.filename)[1].lower()
    
#     file_path = os.path.join(UPLOAD_DIR, f"{file_id}{file_extension}")
#     os.makedirs(UPLOAD_DIR, exist_ok=True)
    
#     with open(file_path, "wb") as buffer:
#         buffer.write(await file.read())

#     try:
#         # raw_text = extract_document_text(file_path)
#         raw_text = extract_text_from_pdf(file_path)
#     except Exception as e:
#         if os.path.exists(file_path):
#             os.remove(file_path)
#         raise HTTPException(status_code=422, detail=f"Extraction failed: {str(e)}")

#     text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=100)
#     text_chunks = text_splitter.split_text(raw_text)

#     embeddings_list = []
#     chunk_metadata = {}

#     for idx, chunk in enumerate(text_chunks):
#         vector = get_embedding(chunk)
#         embeddings_list.append(vector)
        
#         chunk_id = f"{file_id}_{idx}"
#         chunk_metadata[chunk_id] = {
#             "text": chunk,
#             "filename": file.filename,
#             "document_id": str(file_id)
#         }

#     embeddings_np = np.array(embeddings_list).astype('float32')

#     if os.path.exists(FAISS_INDEX_FILE) and os.path.exists(FAISS_METADATA_FILE):
#         index = faiss.read_index(FAISS_INDEX_FILE)
#         with open(FAISS_METADATA_FILE, "rb") as f:
#             metadata_store = pickle.load(f)
#     else:
#         quantizer = faiss.IndexFlatL2(EMBEDDING_DIM)
#         index = faiss.IndexIDMap(quantizer)
#         metadata_store = {}

#     start_id = len(metadata_store)
#     faiss_ids = np.arange(start_id, start_id + len(embeddings_np)).astype('int64')

#     index.add_with_ids(embeddings_np, faiss_ids)
    
#     for f_id, (c_id, meta) in zip(faiss_ids, chunk_metadata.items()):
#         metadata_store[int(f_id)] = meta

#     faiss.write_index(index, FAISS_INDEX_FILE)
#     with open(FAISS_METADATA_FILE, "wb") as f:
#         pickle.dump(metadata_store, f)

#     new_doc = DocumentModel.Document(
#         id=file_id, user_id=1, filename=file.filename, file_url=file_path, file_type=file_extension.replace(".", ""), status="Completed"
#     )
#     db.add(new_doc)
#     db.commit()

#     return {
#         "id": str(file_id), 
#         "name": file.filename, 
#         "status": "Completed",
#         "size": os.path.getsize(file_path)
#     }

# # ----------------------------------------------------------------
# # 3. DELETE DOCUMENT
# # ----------------------------------------------------------------
# @router.delete("/documents/{doc_id}", status_code=status.HTTP_200_OK)
# def delete_document(doc_id: uuid.UUID, db: Session = Depends(get_db)):
#     doc = db.query(DocumentModel.Document).filter(DocumentModel.Document.id == doc_id).first()
#     if not doc:
#         raise HTTPException(status_code=404, detail="Document not found")

#     if doc.file_url and os.path.exists(doc.file_url):
#         os.remove(doc.file_url)

#     try:
#         if os.path.exists(FAISS_INDEX_FILE) and os.path.exists(FAISS_METADATA_FILE):
#             index = faiss.read_index(FAISS_INDEX_FILE)
#             with open(FAISS_METADATA_FILE, "rb") as f:
#                 metadata_store = pickle.load(f)
            
#             # Trouver les clés numériques FAISS à supprimer de la RAM
#             ids_to_delete = [
#                 k for k, v in metadata_store.items()
#                 if v.get("document_id") == str(doc_id)
#             ]
            
#             if ids_to_delete:
#                 index.remove_ids(np.array(ids_to_delete).astype('int64'))
#                 faiss.write_index(index, FAISS_INDEX_FILE)
                
#                 # Nettoyer notre store pickle
#                 for k in ids_to_delete:
#                     metadata_store.pop(k, None)
#                 with open(FAISS_METADATA_FILE, "wb") as f:
#                     pickle.dump(metadata_store, f)

#         db.delete(doc)
#         db.commit()
#     except Exception as e:
#         db.rollback()
#         raise HTTPException(status_code=500, detail=f"Deletion failed: {str(e)}")

#     return {"message": "Deleted successfully", "id": str(doc_id)}



####################################################
# import os
# import uuid
# import numpy as np
# import faiss
# import pickle
# from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, status
# from sqlalchemy.orm import Session
# from langchain_text_splitters import RecursiveCharacterTextSplitter

# from db.database import SessionLocal
# from models import DocumentModel
# from utils.document_parser import extract_text_from_pdf
# from utils.embeddings import get_embedding
# from middlewares.validateJWT import get_current_user  # Fully integrated auth dependency

# router = APIRouter()

# UPLOAD_DIR = "uploads"
# FAISS_INDEX_FILE = "faiss_index.bin"
# FAISS_METADATA_FILE = "faiss_metadata.pkl"
# EMBEDDING_DIM = 384  

# def get_db():
#     db = SessionLocal()
#     try:
#         yield db
#     finally:
#         db.close()

# # ----------------------------------------------------------------
# # 1. GET ALL USER-SPECIFIC DOCUMENTS
# # ----------------------------------------------------------------
# @router.get("/documents", status_code=status.HTTP_200_OK)
# def get_documents(
#     db: Session = Depends(get_db),
#     current_user: dict = Depends(get_current_user)
# ):
#     # Only pull documents created by the currently authenticated user session
#     docs = (
#         db.query(DocumentModel.Document)
#         .filter(DocumentModel.Document.user_id == current_user.get("id"))
#         .order_by(DocumentModel.Document.id.desc())
#         .all()
#     )
    
#     return [
#         {
#             "id": str(doc.id),
#             "name": doc.filename,
#             "status": doc.status,
#             "size": os.path.getsize(doc.file_url) if doc.file_url and os.path.exists(doc.file_url) else 0,
#             "date": doc.created_at.strftime("%Y-%m-%d") if hasattr(doc, 'created_at') and doc.created_at else "N/A"
#         }
#         for doc in docs
#     ]

# # ----------------------------------------------------------------
# # 2. UPLOAD & STREAM TO FAISS INDEX (Fixed 422 Parameter Payload)
# # ----------------------------------------------------------------
# @router.post("/documents", status_code=status.HTTP_201_CREATED)
# async def upload_document(
#     file: UploadFile = File(...), # FIXED: Set field parameter name to 'file' matching the frontend schema
#     db: Session = Depends(get_db),
#     current_user: dict = Depends(get_current_user)
# ):
#     if not file.filename.lower().endswith(".pdf"):
#         raise HTTPException(
#             status_code=status.HTTP_400_BAD_REQUEST,
#             detail="Invalid file format layout. Only PDF documents are supported by the pipeline."
#         )

#     file_id = uuid.uuid4()
#     file_extension = os.path.splitext(file.filename)[1].lower()
    
#     file_path = os.path.join(UPLOAD_DIR, f"{file_id}{file_extension}")
#     os.makedirs(UPLOAD_DIR, exist_ok=True)
    
#     # Stream multipart chunk buffer into local directory blocks
#     with open(file_path, "wb") as buffer:
#         buffer.write(await file.read())

#     try:
#         # Extract plain text content configuration assets from PDF layout
#         raw_text = extract_text_from_pdf(file_path)
#     except Exception as e:
#         if os.path.exists(file_path):
#             os.remove(file_path)
#         raise HTTPException(
#             status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, 
#             detail=f"Text extraction tracking process crashed: {str(e)}"
#         )

#     # Chunk layout partitioning splits text properties securely
#     text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=100)
#     text_chunks = text_splitter.split_text(raw_text)

#     embeddings_list = []
#     chunk_metadata = {}

#     for idx, chunk in enumerate(text_chunks):
#         vector = get_embedding(chunk)
#         embeddings_list.append(vector)
        
#         chunk_id = f"{file_id}_{idx}"
#         chunk_metadata[chunk_id] = {
#             "text": chunk,
#             "filename": file.filename,
#             "document_id": str(file_id)
#         }

#     embeddings_np = np.array(embeddings_list).astype('float32')

#     # Read existing vector states or initialize Index ID storage mapping configurations
#     if os.path.exists(FAISS_INDEX_FILE) and os.path.exists(FAISS_METADATA_FILE):
#         index = faiss.read_index(FAISS_INDEX_FILE)
#         with open(FAISS_METADATA_FILE, "rb") as f:
#             metadata_store = pickle.load(f)
#     else:
#         quantizer = faiss.IndexFlatL2(EMBEDDING_DIM)
#         index = faiss.IndexIDMap(quantizer)
#         metadata_store = {}

#     start_id = len(metadata_store)
#     faiss_ids = np.arange(start_id, start_id + len(embeddings_np)).astype('int64')

#     index.add_with_ids(embeddings_np, faiss_ids)
    
#     for f_id, (c_id, meta) in zip(faiss_ids, chunk_metadata.items()):
#         metadata_store[int(f_id)] = meta

#     faiss.write_index(index, FAISS_INDEX_FILE)
#     with open(FAISS_METADATA_FILE, "wb") as f:
#         pickle.dump(metadata_store, f)

#     # Save to your relational database table bound securely to current user context ID
#     new_doc = DocumentModel.Document(
#         id=file_id, 
#         user_id=current_user.get("id"), 
#         filename=file.filename, 
#         file_url=file_path, 
#         file_type=file_extension.replace(".", ""), 
#         status="Completed"
#     )
#     db.add(new_doc)
#     db.commit()

#     # Formatted exactly to clear AppContext React parsing assertions
#     return {
#         "id": str(file_id), 
#         "name": file.filename, 
#         "status": "Completed",
#         "size": os.path.getsize(file_path)
#     }

# # ----------------------------------------------------------------
# # 3. DELETE DOCUMENT
# # ----------------------------------------------------------------
# @router.delete("/documents/{doc_id}", status_code=status.HTTP_200_OK)
# def delete_document(
#     doc_id: uuid.UUID, 
#     db: Session = Depends(get_db),
#     current_user: dict = Depends(get_current_user)
# ):
#     # Authorization boundary check: ensure document ownership verification matches profile identity
#     doc = (
#         db.query(DocumentModel.Document)
#         .filter(DocumentModel.Document.id == doc_id, DocumentModel.Document.user_id == current_user.get("id"))
#         .first()
#     )
#     if not doc:
#         raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document asset context matches no profile records.")

#     if doc.file_url and os.path.exists(doc.file_url):
#         os.remove(doc.file_url)

#     try:
#         if os.path.exists(FAISS_INDEX_FILE) and os.path.exists(FAISS_METADATA_FILE):
#             index = faiss.read_index(FAISS_INDEX_FILE)
#             with open(FAISS_METADATA_FILE, "rb") as f:
#                 metadata_store = pickle.load(f)
            
#             # Find and wipe corresponding embedding array points out of local indexing maps
#             ids_to_delete = [
#                 k for k, v in metadata_store.items()
#                 if v.get("document_id") == str(doc_id)
#             ]
            
#             if ids_to_delete:
#                 index.remove_ids(np.array(ids_to_delete).astype('int64'))
#                 faiss.write_index(index, FAISS_INDEX_FILE)
                
#                 for k in ids_to_delete:
#                     metadata_store.pop(k, None)
#                 with open(FAISS_METADATA_FILE, "wb") as f:
#                     pickle.dump(metadata_store, f)

#         db.delete(doc)
#         db.commit()
#     except Exception as e:
#         db.rollback()
#         raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Wipe operation failed: {str(e)}")

#     return {"message": "Deleted successfully", "id": str(doc_id)}


#################################################

import os
import uuid
import numpy as np
import faiss
import pickle
from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, status
from sqlalchemy.orm import Session
from langchain_text_splitters import RecursiveCharacterTextSplitter

from db.database import SessionLocal
from models import DocumentModel
from utils.document_parser import extract_text_from_pdf
from utils.embeddings import get_embedding
from middlewares.validateJWT import get_current_user

router = APIRouter()

UPLOAD_DIR = "uploads"
FAISS_INDEX_FILE = "faiss_index.bin"
FAISS_METADATA_FILE = "faiss_metadata.pkl"
EMBEDDING_DIM = 384  

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ----------------------------------------------------------------
# 1. GET ALL USER-SPECIFIC DOCUMENTS
# ----------------------------------------------------------------
@router.get("/documents", status_code=status.HTTP_200_OK)
def get_documents(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    docs = (
        db.query(DocumentModel.Document)
        .filter(DocumentModel.Document.user_id == current_user.get("id"))
        .order_by(DocumentModel.Document.id.desc())
        .all()
    )
    
    return [
        {
            "id": str(doc.id),
            "name": doc.filename,
            "status": doc.status,
            "size": os.path.getsize(doc.file_url) if doc.file_url and os.path.exists(doc.file_url) else 0,
            "date": doc.created_at.strftime("%Y-%m-%d") if hasattr(doc, 'created_at') and doc.created_at else "N/A"
        }
        for doc in docs
    ]

# ----------------------------------------------------------------
# 2. UPLOAD & STREAM TO FAISS INDEX (Fixed Corruption Bug)
# ----------------------------------------------------------------
@router.post("/documents", status_code=status.HTTP_201_CREATED)
async def upload_document(
    file: UploadFile = File(...), 
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file format layout. Only PDF documents are supported by the pipeline."
        )

    file_id = uuid.uuid4()
    file_extension = os.path.splitext(file.filename)[1].lower()
    file_path = os.path.join(UPLOAD_DIR, f"{file_id}{file_extension}")
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    
    with open(file_path, "wb") as buffer:
        buffer.write(await file.read())

    try:
        raw_text = extract_text_from_pdf(file_path)
    except Exception as e:
        if os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, 
            detail=f"Text extraction tracking process crashed: {str(e)}"
        )

    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=100)
    text_chunks = text_splitter.split_text(raw_text)

    if not text_chunks:
        return {"id": str(file_id), "name": file.filename, "status": "Completed", "size": os.path.getsize(file_path)}

    embeddings_list = []
    chunk_metadata = {}

    for idx, chunk in enumerate(text_chunks):
        vector = get_embedding(chunk)
        embeddings_list.append(vector)
        
        chunk_id = f"{file_id}_{idx}"
        chunk_metadata[chunk_id] = {
            "text": chunk,
            "filename": file.filename,
            "document_id": str(file_id)
        }

    embeddings_np = np.array(embeddings_list).astype('float32')

    # Read index configurations
    if os.path.exists(FAISS_INDEX_FILE) and os.path.exists(FAISS_METADATA_FILE):
        index = faiss.read_index(FAISS_INDEX_FILE)
        with open(FAISS_METADATA_FILE, "rb") as f:
            metadata_store = pickle.load(f)
    else:
        quantizer = faiss.IndexFlatL2(EMBEDDING_DIM)
        index = faiss.IndexIDMap(quantizer)
        metadata_store = {}

    # FIX: Calculate start_id using the max key value present rather than len() to bypass deleted gaps
    start_id = max(metadata_store.keys()) + 1 if metadata_store else 0
    faiss_ids = np.arange(start_id, start_id + len(embeddings_np)).astype('int64')

    index.add_with_ids(embeddings_np, faiss_ids)
    
    for f_id, (c_id, meta) in zip(faiss_ids, chunk_metadata.items()):
        metadata_store[int(f_id)] = meta

    faiss.write_index(index, FAISS_INDEX_FILE)
    with open(FAISS_METADATA_FILE, "wb") as f:
        pickle.dump(metadata_store, f)

    new_doc = DocumentModel.Document(
        id=file_id, 
        user_id=current_user.get("id"), 
        filename=file.filename, 
        file_url=file_path, 
        file_type=file_extension.replace(".", ""), 
        status="Completed"
    )
    db.add(new_doc)
    db.commit()

    return {
        "id": str(file_id), 
        "name": file.filename, 
        "status": "Completed",
        "size": os.path.getsize(file_path)
    }

# ----------------------------------------------------------------
# 3. DELETE DOCUMENT
# ----------------------------------------------------------------
@router.delete("/documents/{doc_id}", status_code=status.HTTP_200_OK)
def delete_document(
    doc_id: uuid.UUID, 
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    doc = (
        db.query(DocumentModel.Document)
        .filter(DocumentModel.Document.id == doc_id, DocumentModel.Document.user_id == current_user.get("id"))
        .first()
    )
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document asset context matches no profile records.")

    if doc.file_url and os.path.exists(doc.file_url):
        try:
            os.remove(doc.file_url)
        except OSError:
            pass # Keep going if file was already scrubbed on disk manually

    try:
        if os.path.exists(FAISS_INDEX_FILE) and os.path.exists(FAISS_METADATA_FILE):
            index = faiss.read_index(FAISS_INDEX_FILE)
            with open(FAISS_METADATA_FILE, "rb") as f:
                metadata_store = pickle.load(f)
            
            ids_to_delete = [
                k for k, v in metadata_store.items()
                if v.get("document_id") == str(doc_id)
            ]
            
            if ids_to_delete:
                index.remove_ids(np.array(ids_to_delete).astype('int64'))
                faiss.write_index(index, FAISS_INDEX_FILE)
                
                for k in ids_to_delete:
                    metadata_store.pop(k, None)
                with open(FAISS_METADATA_FILE, "wb") as f:
                    pickle.dump(metadata_store, f)

        db.delete(doc)
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Wipe operation failed: {str(e)}")

    return {"message": "Deleted successfully", "id": str(doc_id)}
# from fastapi import APIRouter, Depends, HTTPException, status
# from sqlalchemy.orm import Session
# from pydantic import BaseModel
# import numpy as np
# import faiss
# import pickle
# import os

# from db.database import SessionLocal
# from models.ChatModel import Chat
# from middlewares.validateJWT import get_current_user
# from langchain_ollama import ChatOllama
# from utils.embeddings import get_embedding

# router = APIRouter()
# FAISS_INDEX_FILE = "faiss_index.bin"
# FAISS_METADATA_FILE = "faiss_metadata.pkl"

# llm = ChatOllama(model="llama3", temperature=0.2)
# class ChatMessageSchema(BaseModel):
#     chat_id: str
#     question: str

# def get_db():
#     db = SessionLocal()
#     try:
#         yield db
#     finally:
#         db.close()

# @router.post("/chat")
# async def handle_chat_message(
#     payload: ChatMessageSchema,
#     db: Session = Depends(get_db),
#     current_user: dict = Depends(get_current_user)
# ):
#     try:
#         # Logique de session Chat PostgreSQL
#         existing_chat = db.query(Chat).filter(Chat.id == payload.chat_id).first()
#         if not existing_chat:
#             new_chat = Chat(id=payload.chat_id, user_id=current_user["id"], title=payload.question[:30])
#             db.add(new_chat)
#             db.commit()

#         # ==================================================
#         # RECHERCHE MANUELLE DANS FAISS
#         # ==================================================
#         retrieved_chunks = []

#         if os.path.exists(FAISS_INDEX_FILE) and os.path.exists(FAISS_METADATA_FILE):
#             # 1. Charger l'index et les métadonnées
#             index = faiss.read_index(FAISS_INDEX_FILE)
#             with open(FAISS_METADATA_FILE, "rb") as f:
#                 metadata_store = pickle.load(f)

#             # 2. Vectoriser la question (Retourne la List[float])
#             question_vector = get_embedding(payload.question)
            
#             # 3. Formater pour FAISS (2D array NumPy float32)
#             question_np = np.array([question_vector]).astype('float32')

#             # 4. Rechercher les 5 vecteurs les plus proches
#             # k=5, D contient les distances, I contient les IDs correspondants
#             D, I = index.search(question_np, k=5)

#             # 5. Récupérer les textes originaux correspondants aux IDs trouvés
#             for faiss_id in I[0]:
#                 if faiss_id in metadata_store:
#                     retrieved_chunks.append(metadata_store[faiss_id]["text"])

#         context = "\n\n".join(retrieved_chunks) if retrieved_chunks else "Aucun document pertinent trouvé."

#         # ==================================================
#         # INFERENCE OLLAMA
#         # ==================================================
#         prompt = f"""
# Tu es un assistant virtuel spécialisé dans l'analyse de documents.
# Utilise uniquement les informations du contexte ci-dessous pour répondre.

# Contexte :
# {context}

# Question :
# {payload.question}

# Réponse :
# """
#         response = llm.invoke(prompt)

#         return {
#             "chat_id": payload.chat_id,
#             "question": payload.question,
#             "retrieved_chunks": len(retrieved_chunks),
#             "answer": response.content
#         }

#     except Exception as e:
#         db.rollback()
#         raise HTTPException(status_code=500, detail=str(e))


#####################################################################
import os
import pickle
import faiss
import numpy as np
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from db.database import SessionLocal
from middlewares.validateJWT import get_current_user
# Import the official Google GenAI model wrapper for LangChain
from langchain_google_genai import ChatGoogleGenerativeAI
from models.ChatModel import Chat
from utils.embeddings import get_embedding

router = APIRouter()
FAISS_INDEX_FILE = "faiss_index.bin"
FAISS_METADATA_FILE = "faiss_metadata.pkl"

# =====================================================================
# CONFIGURATION (Hardcoded - No .env file needed)
# =====================================================================
GEMINI_API_KEY = "AQ.Ab8RN6LvzLNIjV5nlHSGph21NzFaO7EO9dowrv0UFl4TCDlFag"
MODEL_NAME = "gemini-3.1-flash-lite"

# Initialize Gemini directly by passing the API key explicitly
llm = ChatGoogleGenerativeAI(
    model=MODEL_NAME, 
    temperature=0.2,
    google_api_key=GEMINI_API_KEY
)


class ChatMessageSchema(BaseModel):
    chat_id: str
    question: str


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/chat")
async def handle_chat_message(
    payload: ChatMessageSchema,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    try:
        # Logique de session Chat PostgreSQL
        existing_chat = db.query(Chat).filter(Chat.id == payload.chat_id).first()
        if not existing_chat:
            new_chat = Chat(
                id=payload.chat_id,
                user_id=current_user["id"],
                title=payload.question[:30],
            )
            db.add(new_chat)
            db.commit()

        # ==================================================
        # RECHERCHE MANUELLE DANS FAISS
        # ==================================================
        retrieved_chunks = []

        if os.path.exists(FAISS_INDEX_FILE) and os.path.exists(FAISS_METADATA_FILE):
            # 1. Charger l'index et les métadonnées
            index = faiss.read_index(FAISS_INDEX_FILE)
            with open(FAISS_METADATA_FILE, "rb") as f:
                metadata_store = pickle.load(f)

            # 2. Vectoriser la question (Retourne la List[float])
            question_vector = get_embedding(payload.question)

            # 3. Formater pour FAISS (2D array NumPy float32)
            question_np = np.array([question_vector]).astype("float32")

            # 4. Rechercher les 5 vecteurs les plus proches
            D, I = index.search(question_np, k=5)

            # 5. Récupérer les textes originaux correspondants aux IDs trouvés
            for faiss_id in I[0]:
                if faiss_id in metadata_store:
                    retrieved_chunks.append(metadata_store[faiss_id]["text"])

        context = (
            "\n\n".join(retrieved_chunks)
            if retrieved_chunks
            else "Aucun document pertinent trouvé."
        )

        # ==================================================
        # INFERENCE GEMINI (LANGCHAIN UNIFIED PIPELINE)
        # ==================================================
        prompt = f"""
Tu es un assistant virtuel spécialisé dans l'analyse de documents.
Utilise uniquement les informations du contexte ci-dessous pour répondre.

Contexte :
{context}

Question :
{payload.question}

Réponse :
"""
        # Triggers inference directly over Google Cloud infrastructure using your hardcoded key
        response = llm.invoke(prompt)

        return {
            "chat_id": payload.chat_id,
            "question": payload.question,
            "retrieved_chunks": len(retrieved_chunks),
            "answer": response.content,
        }

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
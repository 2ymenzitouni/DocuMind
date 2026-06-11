# from fastapi import APIRouter, Depends, HTTPException
# from pydantic import BaseModel
# from sqlalchemy import text
# from sqlalchemy.orm import Session

# from db.database import SessionLocal
# from langchain_ollama import ChatOllama

# router = APIRouter()

# llm = ChatOllama(model="llama3")


# class ChatRequest(BaseModel):
#     question: str


# def get_db():
#     db = SessionLocal()
#     try:
#         yield db
#     finally:
#         db.close()


# @router.post("/chat")
# async def chat(
#     request: ChatRequest,
#     db: Session = Depends(get_db)
# ):
#     try:

#         result = db.execute(
#             text("""
#                 SELECT content
#                 FROM document_chunks
#                 ORDER BY chunk_index
#                 LIMIT 5
#             """)
#         )

#         chunks = [row[0] for row in result.fetchall()]

#         if not chunks:
#             raise HTTPException(
#                 status_code=404,
#                 detail="No document chunks found"
#             )

#         context = "\n\n".join(chunks)

#         prompt = f"""
# You are an assistant that answers questions using only the provided context.

# Context:
# {context}

# Question:
# {request.question}

# Answer:
# """

#         response = llm.invoke(prompt)

#         return {
#             "question": request.question,
#             "answer": response.content
#         }

#     except Exception as e:
#         raise HTTPException(
#             status_code=500,
#             detail=str(e)
#         )

# ----------------------------------------------------------------
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import text
from pydantic import BaseModel

from db.database import SessionLocal
from models.ChatModel import Chat
from middlewares.validateJWT import get_current_user
from langchain_ollama import ChatOllama

router = APIRouter()
llm = ChatOllama(model="llama3")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# A single, clean schema for what the frontend sends
class ChatMessageSchema(BaseModel):
    chat_id: str
    question: str

@router.post("/chat")
async def handle_chat_message(
    payload: ChatMessageSchema,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    try:
        # 1. Dynamic Check/Creation: If the chat session doesn't exist yet, create it on the fly!
        existing_chat = db.query(Chat).filter(Chat.id == payload.chat_id).first()
        if not existing_chat:
            new_chat = Chat(
                id=payload.chat_id,
                user_id=current_user["id"],
                title="Discussion Automatique"
            )
            db.add(new_chat)
            db.commit()

        # 2. Get your document context
        result = db.execute(
            text("""
                SELECT content
                FROM document_chunks
                ORDER BY chunk_index
                LIMIT 5
            """)
        )
        chunks = [row[0] for row in result.fetchall()]
        context = "\n\n".join(chunks) if chunks else "Aucun document disponible."

        # 3. Build the prompt for Llama 3
        prompt = f"""
Tu es un assistant virtuel qui répond aux questions en utilisant uniquement le contexte fourni ci-dessous.

Contexte :
{context}

Question :
{payload.question}

Réponse :
"""

        # 4. Invoke the model
        response = llm.invoke(prompt)

        return {
            "chat_id": payload.chat_id,
            "answer": response.content
        }

    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur interne du serveur : {str(e)}"
        )
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import text
from sqlalchemy.orm import Session

from db.database import SessionLocal
from langchain_ollama import ChatOllama

router = APIRouter()

llm = ChatOllama(model="llama3")


class ChatRequest(BaseModel):
    question: str


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/chat")
async def chat(
    request: ChatRequest,
    db: Session = Depends(get_db)
):
    try:

        result = db.execute(
            text("""
                SELECT content
                FROM document_chunks
                ORDER BY chunk_index
                LIMIT 5
            """)
        )

        chunks = [row[0] for row in result.fetchall()]

        if not chunks:
            raise HTTPException(
                status_code=404,
                detail="No document chunks found"
            )

        context = "\n\n".join(chunks)

        prompt = f"""
You are an assistant that answers questions using only the provided context.

Context:
{context}

Question:
{request.question}

Answer:
"""

        response = llm.invoke(prompt)

        return {
            "question": request.question,
            "answer": response.content
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


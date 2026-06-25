import os
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from db.database import SessionLocal

# Importations explicites basées sur tes modèles
from models.ChatModel import Chat
from models.DocumentModel import Document
import models.MessageModel as MessageModule

router = APIRouter()
UPLOAD_DIR = "uploads"

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_folder_size_gb(folder_path: str) -> float:
    """Calcule la taille réelle du stockage local d'uploads en Go."""
    if not os.path.exists(folder_path):
        return 0.0
    total_size = 0
    try:
        for dirpath, _, filenames in os.walk(folder_path):
            for f in filenames:
                fp = os.path.join(dirpath, f)
                if os.path.exists(fp):
                    total_size += os.path.getsize(fp)
    except Exception:
        pass
    return round(total_size / (1024 ** 3), 4)

@router.get("/dashboard", status_code=status.HTTP_200_OK)
def get_dashboard_statistics(db: Session = Depends(get_db)):
    try:
        # 1. Résolution dynamique de la classe Message (Message ou MessageModel)
        MsgClass = getattr(MessageModule, "Message", None) or getattr(MessageModule, "MessageModel", None)

        # 2. Comptes globaux pour les Bento Cards
        total_docs = db.query(Document).count()
        total_chats = db.query(Chat).count()
        storage_used_gb = get_folder_size_gb(UPLOAD_DIR)

        # 3. Récupération des 3 documents les plus récents
        recent_docs_query = (
            db.query(Document)
            .order_by(Document.created_at.desc())
            .limit(3)
            .all()
        )
        
        recent_documents = [
            {
                "id": str(doc.id),
                "name": doc.filename or "Unnamed Document",
                "status": doc.status or "pending",
                "type": doc.file_type or "pdf",
                "date": doc.created_at.strftime("%Y-%m-%d") if doc.created_at else "Recent"
            }
            for doc in recent_docs_query
        ]

        # 4. Récupération des conversations récentes
        recent_chats_query = (
            db.query(Chat)
            .order_by(Chat.created_at.desc())
            .limit(3)
            .all()
        )
        
        recent_chats = []
        for chat in recent_chats_query:
            snippet = "No messages yet."
            
            # Si la classe Message est trouvée, on extrait le dernier message textuel
            if MsgClass:
                last_msg = (
                    db.query(MsgClass)
                    .filter(MsgClass.chat_id == chat.id)
                    .order_by(MsgClass.created_at.desc() if hasattr(MsgClass, 'created_at') else MsgClass.id.desc())
                    .first()
                )
                if last_msg:
                    snippet = getattr(last_msg, "content", None) or getattr(last_msg, "text", "Empty message")

            if len(snippet) > 60:
                snippet = snippet[:57] + "..."

            recent_chats.append({
                "id": str(chat.id),
                "title": chat.title or "New Conversation",
                "snippet": snippet,
                "time": chat.created_at.strftime("%H:%M") if chat.created_at else "Recent"
            })

        return {
            "total_docs": total_docs,
            "active_chats": total_chats,
            "storage_used": storage_used_gb,
            "recent_documents": recent_documents,
            "recent_chats": recent_chats
        }

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur interne lors de l'agrégation des données : {str(e)}"
        )
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
import os

# Importez votre modèle et votre session de base de données
from models.DocumentModel import Document
from db.database import SessionLocal

# --- Configuration de la session ---
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- Router ---
router = APIRouter()

@router.get("/documents/{document_id}/view")
async def view_document(document_id: str, db: Session = Depends(get_db)):
    # 1. Récupérer le document dans la base de données
    doc = db.query(Document).filter(Document.id == document_id).first()
    
    if not doc:
        raise HTTPException(status_code=404, detail="Document non trouvé")
    
    # 2. Vérifier si le fichier existe physiquement sur le serveur
    # Assurez-vous que doc.file_url est bien le chemin complet vers votre fichier
    if not os.path.exists(doc.file_url):
        raise HTTPException(status_code=404, detail="Fichier introuvable sur le serveur")
    
    # 3. Retourner le fichier
    # media_type='application/pdf' et content_disposition_type="inline" 
    # forcent le navigateur à afficher le PDF dans l'iframe au lieu de le télécharger
    return FileResponse(
        path=doc.file_url, 
        media_type='application/pdf', 
        filename=os.path.basename(doc.file_url),
        content_disposition_type="inline" 
    )
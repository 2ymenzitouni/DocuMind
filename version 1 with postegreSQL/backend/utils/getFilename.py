import sys
import time
from uuid import UUID
from sqlalchemy.orm import Session
from db.database import SessionLocal
from models.DocumentModel import Document

def get_filename_by_id(document_id_str: str, max_retries: int = 10, delay: float = 1.0) -> str:
    """
    Récupère le filename en base de données. Si le fichier vient d'être uploadé,
    la fonction réessaie plusieurs fois pour laisser le temps au commit SQL de se faire.
    """
    clean_id = document_id_str.strip()
    if "." in clean_id:
        clean_id = clean_id.split(".")[0]

    if len(clean_id) != 36:
        print(f"[ATTENTION] Identifiant mal forme ({len(clean_id)} caracteres au lieu de 36). Secours active.")
        return clean_id

    try:
        doc_uuid = UUID(clean_id)
    except ValueError:
        print(f"[ATTENTION] Impossible de convertir '{clean_id}' en UUID. Secours active.")
        return clean_id

    # Boucle d'attente active pour la synchronisation post-upload
    for attempt in range(1, max_retries + 1):
        db: Session = SessionLocal()
        try:
            filename = db.query(Document.filename).filter(Document.id == doc_uuid).scalar()
            if filename is not None:
                return filename  
                
        except Exception as e:
            print(f"Erreur de lecture lors de la tentative {attempt}: {str(e)}")
        finally:
            db.close()
            
        time.sleep(delay)
        
    # Nettoyage : Remplacement du symbole de la croix par [TIMEOUT] pour Windows
    print(f"[TIMEOUT] Le document {clean_id} n'est pas encore visible en base.")
    return clean_id

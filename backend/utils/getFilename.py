import sys
from uuid import UUID
from sqlalchemy.orm import Session
from db.database import SessionLocal
from models.DocumentModel import Document

def get_filename_by_id(document_id_str: str) -> str:
    """
    Récupère le nom d'un document en base de données à partir de son ID UUID.
    """
    # 1. Validation et conversion de la chaîne en UUID natif
    try:
        doc_uuid = UUID(document_id_str)
    except ValueError:
        return f"Erreur : '{document_id_str}' n'est pas un UUID valide."

    # 2. Ouverture de la session de base de données
    db: Session = SessionLocal()
    
    try:
        # 3. Requête optimisée : on ne sélectionne QUE la colonne 'name'
        # .scalar() renvoie directement la chaîne de caractères (ou None)
        filename = db.query(Document.name).filter(Document.id == doc_uuid).scalar()
        
        if filename:
            return filename
        else:
            return f"Aucun document trouvé pour l'ID : {document_id_str}"
            
    except Exception as e:
        return f"Une erreur est survenue lors de la requête : {str(e)}"
        
    finally:
        # 4. Fermeture propre de la connexion
        db.close()

if __name__ == "__main__":
    # Exemple d'utilisation : remplace par un ID existant dans ta base
    test_id = "votre-id-uuid-ici-a1b2c3d4..."
    
    # Si tu veux passer l'ID directement en argument dans ton terminal : python get_document_name.py <UUID>
    if len(sys.argv) > 1:
        test_id = sys.argv[1]
        
    print(f"Recherche du fichier pour l'ID : {test_id}")
    nom_du_fichier = get_filename_by_id(test_id)
    print(f"Résultat : {nom_du_fichier}")
print(get_filename_by_id("18a22df8-2659-4fca-8095-4b6b6a812541"))

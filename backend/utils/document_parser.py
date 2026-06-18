# import os
# from pypdf import PdfReader
# from pdf2image import convert_from_path
# import pytesseract
# from docx import Document

# # =====================================================
# # OCR
# # =====================================================

# def extract_text_with_ocr(pdf_path: str) -> str:
#     """
#     Extract text from scanned PDFs using OCR.
#     """

#     images = convert_from_path(pdf_path)

#     text = ""

#     for image in images:
#         text += pytesseract.image_to_string(image)
#         text += "\n"

#     return text


# # =====================================================
# # PDF
# # =====================================================

# def extract_pdf_text(pdf_path: str) -> str:
#     """
#     Extract text from PDF.
#     Falls back to OCR if needed.
#     """

#     text = ""

#     try:
#         reader = PdfReader(pdf_path)

#         for page in reader.pages:
#             text += page.extract_text() or ""
#             text += "\n"

#     except Exception as e:
#         print(f"PDF extraction error: {e}")

#     # OCR fallback
#     if len(text.strip()) < 50:
#         print("Running OCR...")
#         text = extract_text_with_ocr(pdf_path)

#     return text


# # =====================================================
# # DOCX
# # =====================================================

# def extract_docx_text(docx_path: str) -> str:
#     """
#     Extract text from DOCX.
#     """

#     doc = Document(docx_path)

#     text = ""

#     for paragraph in doc.paragraphs:
#         text += paragraph.text + "\n"

#     return text


# # =====================================================
# # TXT
# # =====================================================

# def extract_txt_text(txt_path: str) -> str:
#     """
#     Extract text from TXT.
#     """

#     with open(txt_path, "r", encoding="utf-8") as f:
#         return f.read()


# # =====================================================
# # MAIN ENTRY POINT
# # =====================================================

# def extract_document_text(file_path: str) -> str:
#     """
#     Detect file type and extract text.
#     """

#     extension = os.path.splitext(file_path)[1].lower()

#     if extension == ".pdf":
#         return extract_pdf_text(file_path)

#     elif extension == ".docx":
#         return extract_docx_text(file_path)

#     elif extension == ".txt":
#         return extract_txt_text(file_path)

#     else:
#         raise ValueError(f"Unsupported file type: {extension}")


########################################################
import os
import re
from pypdf import PdfReader
from pdf2image import convert_from_path
import pytesseract
from docx import Document

# Dictionnaire de correction des ligatures typographiques corrompues
LIGATURES_MAP = {
    "Ɵ": "ti",
    "ﬁ": "fi",
    "ﬂ": "fl",
    "ﬀ": "ff",
    "ﬃ": "ffi",
    "ﬄ": "ffl",
    "ơ": "ti"
}

# CONFIGURATION DU CHEMIN POPPLER
# Ajuste ce chemin selon l'emplacement exact de ton dossier extrait (ex: "C:\poppler\bin")
POPPLER_PATH = r"C:\Users\aymen\Desktop\intelligent-document-agent\poppler-26.02.0\Library\bin"


def clean_extracted_text(text: str) -> str:
    """
    Nettoie le texte extrait en corrigeant les glyphes corrompus ou fusionnés.
    """
    if not text:
        return ""
    for broken, replacement in LIGATURES_MAP.items():
        text = text.replace(broken, replacement)
    
    return text


# =====================================================
# MODULE OCR (BASCULEMENT SÉCURISÉ VIA POPPLER)
# =====================================================

def extract_text_with_ocr(pdf_path: str) -> str:
    """
    Extrait le texte d'un PDF en le convertissant en images, puis utilise Tesseract.
    """
    # Configuration linguistique (Français + Anglais) pour préserver les accents et termes techniques
    tesseract_config = '-l fra+eng'
    
    # Utilisation de Poppler pour transformer les pages du PDF en flux d'images
    images = convert_from_path(pdf_path, poppler_path=POPPLER_PATH)
    text = ""

    for image in images:
        text += pytesseract.image_to_string(image, config=tesseract_config)
        text += "\n"

    return clean_extracted_text(text)


# =====================================================
# EXTRACTION PAR TYPE DE DOCUMENT
# =====================================================

def extract_pdf_text(pdf_path: str) -> str:
    """
    Extrait le texte natif d'un PDF. 
    Bascule automatiquement sur l'OCR de Poppler si le texte est corrompu ou illisible.
    """
    text = ""

    try:
        reader = PdfReader(pdf_path)
        for page in reader.pages:
            text += page.extract_text() or ""
            text += "\n"
    except Exception as e:
        print(f"⚠️ Erreur lors de l'extraction native du PDF : {e}")

    # Nettoyage initial des ligatures (ex: CommunicaƟon -> Communication)
    text = clean_extracted_text(text)

    # Analyse de la qualité du texte extrait : compte les caractères étranges (hors ASCII / accents standards)
    corrupted_chars_count = len(re.findall(r'[^\x00-\x7FÀ-ÿ\s\.,;:!\?\'"\(\)\-\+€%]', text))
    
    # Stratégie de basculement vers l'OCR :
    # Si le texte est trop court (< 50 caractères) ou s'il y a plus de 5 caractères corrompus détectés
    if len(text.strip()) < 50 or corrupted_chars_count > 5:
        print(f" Detected {corrupted_chars_count} corrupted characters or empty layout. Launching Poppler OCR pipeline...")
        text = extract_text_with_ocr(pdf_path)

    return text


def extract_docx_text(docx_path: str) -> str:
    """
    Extrait le texte brut d'un fichier Microsoft Word (.docx).
    """
    doc = Document(docx_path)
    text = ""

    for paragraph in doc.paragraphs:
        text += paragraph.text + "\n"

    return text


def extract_txt_text(txt_path: str) -> str:
    """
    Extrait le texte brut d'un fichier texte (.txt).
    """
    with open(txt_path, "r", encoding="utf-8") as f:
        return f.read()


# =====================================================
# POINT D'ENTRÉE UNIQUE POUR L'INGESTION API
# =====================================================

def extract_document_text(file_path: str) -> str:
    """
    Détecte l'extension du fichier reçu et applique la stratégie d'extraction adaptée.
    """
    extension = os.path.splitext(file_path)[1].lower()

    if extension == ".pdf":
        return file_path + " " + extract_pdf_text(file_path)

    elif extension == ".docx":
        return file_path + " " + extract_docx_text(file_path)

    elif extension == ".txt":
        return file_path + " " + extract_txt_text(file_path)

    else:
        raise ValueError(f"Extension non supportée par le système : {extension}")
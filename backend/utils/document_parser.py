import os
from pypdf import PdfReader
from pdf2image import convert_from_path
import pytesseract
from docx import Document

# =====================================================
# OCR
# =====================================================

def extract_text_with_ocr(pdf_path: str) -> str:
    """
    Extract text from scanned PDFs using OCR.
    """

    images = convert_from_path(pdf_path)

    text = ""

    for image in images:
        text += pytesseract.image_to_string(image)
        text += "\n"

    return text


# =====================================================
# PDF
# =====================================================

def extract_pdf_text(pdf_path: str) -> str:
    """
    Extract text from PDF.
    Falls back to OCR if needed.
    """

    text = ""

    try:
        reader = PdfReader(pdf_path)

        for page in reader.pages:
            text += page.extract_text() or ""
            text += "\n"

    except Exception as e:
        print(f"PDF extraction error: {e}")

    # OCR fallback
    if len(text.strip()) < 50:
        print("Running OCR...")
        text = extract_text_with_ocr(pdf_path)

    return text


# =====================================================
# DOCX
# =====================================================

def extract_docx_text(docx_path: str) -> str:
    """
    Extract text from DOCX.
    """

    doc = Document(docx_path)

    text = ""

    for paragraph in doc.paragraphs:
        text += paragraph.text + "\n"

    return text


# =====================================================
# TXT
# =====================================================

def extract_txt_text(txt_path: str) -> str:
    """
    Extract text from TXT.
    """

    with open(txt_path, "r", encoding="utf-8") as f:
        return f.read()


# =====================================================
# MAIN ENTRY POINT
# =====================================================

def extract_document_text(file_path: str) -> str:
    """
    Detect file type and extract text.
    """

    extension = os.path.splitext(file_path)[1].lower()

    if extension == ".pdf":
        return extract_pdf_text(file_path)

    elif extension == ".docx":
        return extract_docx_text(file_path)

    elif extension == ".txt":
        return extract_txt_text(file_path)

    else:
        raise ValueError(f"Unsupported file type: {extension}")



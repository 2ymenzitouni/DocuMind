# import os
# import re
# from pypdf import PdfReader
# from pdf2image import convert_from_path
# import pytesseract
# from docx import Document

# # =====================================================
# # WINDOWS EXECUTABLE PATH CONFIGURATION
# # =====================================================
# # CRITICAL: If running externally on Windows, you MUST point to the tesseract exe engine
# pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

# POPPLER_PATH = r"C:\Users\aymen\Desktop\poppler-26.02.0\Library\bin"

# LIGATURES_MAP = {
#     "Ɵ": "ti", "ﬁ": "fi", "ﬂ": "fl", "ﬀ": "ff", "ﬃ": "ffi", "ﬄ": "ffl", "ơ": "ti"
# }

# def clean_extracted_text(text: str) -> str:
#     if not text: return ""
#     for broken, replacement in LIGATURES_MAP.items():
#         text = text.replace(broken, replacement)
#     return text

# def extract_text_with_ocr(pdf_path: str) -> str:
#     try:
#         tesseract_config = '-l fra+eng'
#         images = convert_from_path(pdf_path, poppler_path=POPPLER_PATH)
#         text = ""
#         for image in images:
#             text += pytesseract.image_to_string(image, config=tesseract_config)
#             text += "\n"
#         return clean_extracted_text(text)
#     except Exception as e:
#         print(f"❌ OCR Pipeline Error: {e}")
#         return f"[OCR_ERROR: {str(e)}]" # Helpful debug string instead of blank masking

# def extract_pdf_text(pdf_path: str) -> str:
#     text = ""
#     try:
#         reader = PdfReader(pdf_path)
#         for page in reader.pages:
#             text += page.extract_text() or ""
#             text += "\n"
#     except Exception as e:
#         print(f"⚠️ Native read error: {e}")

#     text = clean_extracted_text(text)
#     corrupted_chars_count = len(re.findall(r'[^\x00-\x7FÀ-ÿ\s\.,;:!\?\'"\(\)\-\+€%]', text))
    
#     if len(text.strip()) < 50 or corrupted_chars_count > 5:
#         print(f"Detected {corrupted_chars_count} corrupted characters or empty layout. Launching Poppler OCR...")
#         text = extract_text_with_ocr(pdf_path)

#     return text

# def extract_document_text(file_path: str) -> str:
#     extension = os.path.splitext(file_path)[1].lower()
#     filename = os.path.basename(file_path).split('.')[0]

#     if extension == ".pdf":
#         return filename + " " + extract_pdf_text(file_path)
#     else:
#         raise ValueError(f"Unsupported format: {extension}")

#########################################################################

import base64
import requests
import fitz  # PyMuPDF

# =====================================================================
# CONFIGURATION
# =====================================================================
# Ensure Ollama is running in your background before pressing F5
OLLAMA_URL = "http://localhost:11434/api/chat"

# Updated to use the Qwen 2.5 Vision Language model
MODEL_NAME = "qwen2.5vl:7b"

# Put the exact path to your invoice here
PDF_PATH = r"C:\Users\aymen\Desktop\testing invoices\Invoice 1.pdf"


# =====================================================================
# FUNCTIONS
# =====================================================================
def pdf_to_images(pdf_path: str):
    """Converts PDF pages into base64 strings for the vision model."""
    doc = fitz.open(pdf_path)
    images = []
    
    # 2x matrix zooms the PDF resolution slightly for sharper text OCR
    matrix = fitz.Matrix(2, 2)  

    for page in doc:
        pix = page.get_pixmap(matrix=matrix)
        img_bytes = pix.tobytes("png")
        img_b64 = base64.b64encode(img_bytes).decode("utf-8")
        images.append(img_b64)

    return images


def extract_text_from_pdf(pdf_path: str):
    """Sends images to Ollama and collects the transcribed plain text."""
    images = pdf_to_images(pdf_path)
    
    prompt = (
        "Transcribe all text from this invoice cleanly. "
        "Do not write conversational introductions or notes. Just output the text."
    )

    full_text = []

    # Process page by page to ensure the model doesn't skip details
    for index, img_b64 in enumerate(images):
        payload = {
            "model": MODEL_NAME,
            "messages": [
                {
                    "role": "user",
                    "content": prompt,
                    "images": [img_b64]
                }
            ],
            "options": {
                "temperature": 0  # Low temperature makes OCR highly deterministic
            },
            "stream": False
        }

        # Make direct HTTP Request to Ollama
        response = requests.post(OLLAMA_URL, json=payload)
        
        if response.status_code == 200:
            page_text = response.json()["message"]["content"].strip()
            full_text.append(f"--- PAGE {index + 1} ---\n{page_text}")
        else:
            raise Exception(f"Ollama Error ({response.status_code}): {response.text}")

    return "\n\n".join(full_text)

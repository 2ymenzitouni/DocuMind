# import base64
# import requests
# import fitz  # PyMuPDF

# # =====================================================================
# # CONFIGURATION
# # =====================================================================
# # Ensure Ollama is running in your background before pressing F5
# OLLAMA_URL = "http://localhost:11434/api/chat"

# # Updated to use the Qwen 2.5 Vision Language model
# MODEL_NAME = "qwen2.5vl:7b"

# # Put the exact path to your invoice here
# PDF_PATH = r"C:\Users\aymen\Desktop\testing invoices\Invoice 1.pdf"


# # =====================================================================
# # FUNCTIONS
# # =====================================================================
# def pdf_to_images(pdf_path: str):
#     """Converts PDF pages into base64 strings for the vision model."""
#     doc = fitz.open(pdf_path)
#     images = []
    
#     # 2x matrix zooms the PDF resolution slightly for sharper text OCR
#     matrix = fitz.Matrix(2, 2)  

#     for page in doc:
#         pix = page.get_pixmap(matrix=matrix)
#         img_bytes = pix.tobytes("png")
#         img_b64 = base64.b64encode(img_bytes).decode("utf-8")
#         images.append(img_b64)

#     return images


# def extract_text_from_pdf(pdf_path: str):
#     """Sends images to Ollama and collects the transcribed plain text."""
#     images = pdf_to_images(pdf_path)
    
#     prompt = (
#         "Transcribe all text from this invoice cleanly. "
#         "Do not write conversational introductions or notes. Just output the text."
#     )

#     full_text = []

#     # Process page by page to ensure the model doesn't skip details
#     for index, img_b64 in enumerate(images):
#         payload = {
#             "model": MODEL_NAME,
#             "messages": [
#                 {
#                     "role": "user",
#                     "content": prompt,
#                     "images": [img_b64]
#                 }
#             ],
#             "options": {
#                 "temperature": 0  # Low temperature makes OCR highly deterministic
#             },
#             "stream": False
#         }

#         # Make direct HTTP Request to Ollama
#         response = requests.post(OLLAMA_URL, json=payload)
        
#         if response.status_code == 200:
#             page_text = response.json()["message"]["content"].strip()
#             full_text.append(f"--- PAGE {index + 1} ---\n{page_text}")
#         else:
#             raise Exception(f"Ollama Error ({response.status_code}): {response.text}")

#     return "\n\n".join(full_text)


###############################################################
import fitz  # PyMuPDF
from google import genai  # The official Google GenAI library
from google.genai import types  # Required for proper image byte wrapping

# =====================================================================
# CONFIGURATION
# =====================================================================
# Hardcoded credentials and targeting configurations
GEMINI_API_KEY = "AQ.Ab8RN6LvzLNIjV5nlHSGph21NzFaO7EO9dowrv0UFl4TCDlFag"
MODEL_NAME = "gemini-2.5-flash"
PDF_PATH = r"C:\Users\aymen\Desktop\testing invoices\Invoice 1.pdf"

# Initialize the Gemini Client directly using your hardcoded key
client = genai.Client(api_key=GEMINI_API_KEY)


# =====================================================================
# FUNCTIONS
# =====================================================================
def pdf_to_images(pdf_path: str):
    """Converts PDF pages into native Google SDK Part objects."""
    doc = fitz.open(pdf_path)
    pages_data = []
    
    # 2x matrix zooms the PDF resolution slightly for sharper text OCR
    matrix = fitz.Matrix(2, 2)  

    for page in doc:
        pix = page.get_pixmap(matrix=matrix)
        img_bytes = pix.tobytes("png")
        
        # Wrap raw image bytes cleanly in Gemini's expected Part schema
        image_part = types.Part.from_bytes(
            data=img_bytes,
            mime_type="image/png"
        )
        pages_data.append(image_part)

    return pages_data


def extract_text_from_pdf(pdf_path: str):
    """Sends page assets to Gemini and collects the transcribed text."""
    pages = pdf_to_images(pdf_path)
    
    prompt = (
        "Transcribe all text from this invoice cleanly. "
        "Do not write conversational introductions or notes. Just output the text."
    )

    full_text = []

    # Process page by page
    for index, image_part in enumerate(pages):
        # Fire structural payload directly to Gemini endpoint via the SDK client wrapper
        response = client.models.generate_content(
            model=MODEL_NAME,
            contents=[prompt, image_part]
        )
        
        page_text = response.text.strip()
        full_text.append(f"--- PAGE {index + 1} ---\n{page_text}")

    return "\n\n".join(full_text)
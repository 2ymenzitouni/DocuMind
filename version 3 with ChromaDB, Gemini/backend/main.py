from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Import your central Base object directly from database.py
from db.database import engine, Base

# Import ALL your models here so SQLAlchemy registers them to the Base metadata
from models import Usermodel
from models import DocumentModel
from models import DocumentChunksModel
from models import ChatModel      # Added!
from models import MessageModel   # Added!

from routes.userRoute import router as userRoute
from routes.documentRoute import router as documentRoute
from routes.chatRoute import router as chatRoute
from routes.dashboardRoute import router as dashboardRoute  # <-- AJOUTE CECI

# This now safely creates ALL registered tables (users, documents, document_chunks, chats, messages)
Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"], # <-- This MUST be wildcard or include "Authorization"
    
)

app.include_router(userRoute)
app.include_router(documentRoute)
app.include_router(chatRoute)
app.include_router(dashboardRoute)

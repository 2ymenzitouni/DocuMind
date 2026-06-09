from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from db.database import engine


from models import   Usermodel
from models import  DocumentModel
from models import  DocumentChunksModel

from routes.userRoute import router as userRoute
from routes.documentRoute import router as documentRoute

Usermodel.Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(userRoute)
app.include_router(documentRoute)
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from db.database import engine
from models import Usermodel, DocumentModel  # Imported documentModel to build tables
from routes.userRoute import router as userRoute
from routes.documentRoute import router as documentRoute  # Added documentRoute import

# create tables (Builds both users and documents tables)
Usermodel.Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# register routes
app.include_router(userRoute)
app.include_router(documentRoute)  # Added registration for the documents API endpoints
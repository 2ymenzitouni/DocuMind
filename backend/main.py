from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from db.database import engine
from models import Usermodel
from routes.userRoute import router as userRoute

# create tables
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
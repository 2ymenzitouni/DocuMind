import os
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from sqlalchemy.orm import Session
from db.database import SessionLocal
from models import Usermodel

# Initialize OAuth2 scheme pointing to your login endpoint route
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

JWT_SECRET = os.getenv("JWT_SECRET", "your_fallback_jwt_secret_key")
ALGORITHM = "HS256"

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate security credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        # Decode the signed token string
        payload = jwt.decode(token, JWT_SECRET, algorithms=[ALGORITHM])
        email: str = payload.get("email")
        user_id: str = payload.get("sub")
        
        if email is None or user_id is None:
            raise credentials_exception
            
    except JWTError:
        raise credentials_exception

    # Query the user database to verify the account still exists
    db_user = db.query(Usermodel.User).filter(Usermodel.User.id == int(user_id)).first()
    if db_user is None:
        raise credentials_exception
        
    # Return a clean dictionary to feed into your router endpoint mapping
    return {
        "id": db_user.id,
        "name": db_user.name,
        "email": db_user.email
    }
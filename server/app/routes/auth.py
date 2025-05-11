from fastapi import APIRouter, HTTPException, Header
from ..schemas import User, Token
from ..services.auth_service import create_token
from dotenv import load_dotenv
from jose import jwt
from jose.exceptions import JWTError, ExpiredSignatureError
import os

load_dotenv()

router = APIRouter()

SUPABASE_JWT_SECRET = os.getenv("SUPABASE_JWT_SECRET")

def get_current_user(authorization: str = Header(...)):
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid auth header")

    token = authorization.split(" ")[1]

    try:
        payload = jwt.decode(token, SUPABASE_JWT_SECRET, algorithms=["HS256"], audience="authenticated")
        user_id = payload.get("sub")  # Supabase sets 'sub' as user ID
        if not user_id:
            raise HTTPException(status_code=401, detail="Missing user_id in token")
        return user_id
    except ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except JWTError as e:
        raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")

@router.post("/login", response_model=Token)
def login(user: User):
    if user.username == "test" and user.password == "test":
        return create_token(user.username)
    raise HTTPException(status_code= 401, detail="Invalid credentials")
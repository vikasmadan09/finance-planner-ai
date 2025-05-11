from jose import jwt
import os
from datetime import datetime, timedelta

def create_token(username:str):
    payload={
        "sub": username,
        "exp": datetime.utcnow() + timedelta(days=1)
    }
    token = jwt.encode(payload, "secret", algorithm="HS256")
    return { "access_token": token }
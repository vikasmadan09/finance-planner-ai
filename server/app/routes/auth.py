from fastapi import APIRouter, HTTPException, Header, Cookie, Request, Response, Depends
from ..schemas import PasswordUpdateRequest, CountryUpdateRequest
from dotenv import load_dotenv
from jose import jwt
from jose.exceptions import JWTError, ExpiredSignatureError
import os
import requests
from supabase import create_client
from starlette.status import HTTP_400_BAD_REQUEST

load_dotenv()

router = APIRouter()

SUPABASE_JWT_SECRET = os.getenv("SUPABASE_JWT_SECRET")
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_API_KEY = os.getenv("SUPABASE_API_KEY")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

supabase_admin = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)


@router.post("/login")
async def login(request: Request, response: Response):
    body = await request.json()
    email = body.get("email")
    password = body.get("password")
    # country = body.get("country")
    # send login request to supabase
    supabase_auth_url = f"{SUPABASE_URL}/auth/v1/token?grant_type=password"
    headers = {
        "Content-Type": "application/json",
        "apikey": SUPABASE_API_KEY,
    }
    data = {
        "email": email,
        "password": password,
    }

    res = requests.post(supabase_auth_url, headers=headers, json=data)
    if res.status_code != 200:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token_data = res.json()
    access_token = token_data.get("access_token")
    # user_id = token_data["user"]["id"]

    # Set the access token in httpOnly cookie
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=True,
        samesite="None",
        max_age=3600,
        path="/",
    )

    # new_response = supabase_admin.auth.admin.update_user_by_id(
    #     user_id, {"user_metadata": {"country": country}}
    # )

    # # Step 3: Save country as a separate (optional) cookie (not httpOnly so JS can read it if needed)
    # response.set_cookie(
    #     key="country", value=country, samesite="None", secure=True, path="/"
    # )

    # if new_response.user:
    #     return {"message": "Login successful"}
    # else:
    #     raise HTTPException(
    #         status_code=HTTP_400_BAD_REQUEST, detail="Country update failed"
    #     )
    return {"message": "Login successful"}


def logout_user(response: Response):
    response.delete_cookie("access_token")
    response.delete_cookie("country")
    return {"message": "Logged out"}


@router.post("/logout")
async def logout(response: Response):
    return logout_user(response)


def get_current_user(access_token: str = Cookie(None)):
    if not access_token:
        raise HTTPException(status_code=401, detail="Missing access token")

    try:
        payload = jwt.decode(
            access_token,
            SUPABASE_JWT_SECRET,
            algorithms=["HS256"],
            audience="authenticated",
        )
        user_id = payload.get("sub")  # Supabase sets 'sub' as user ID
        if not user_id:
            raise HTTPException(status_code=401, detail="Missing user_id in token")
        return user_id
    except ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except JWTError as e:
        raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")


@router.get("/me")
def get_me(user_id: str = Depends(get_current_user)):
    return {"user_id": user_id}


@router.get("/user-metadata")
async def get_metadata(
    user_id: str = Depends(get_current_user),
):
    try:
        new_response = supabase_admin.auth.admin.get_user_by_id(user_id)
        if new_response.user:
            return {"data": new_response.user.user_metadata}
        else:
            raise HTTPException(
                status_code=HTTP_400_BAD_REQUEST, detail="User metadata fetch failed"
            )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Supabase error: {str(e)}")


@router.post("/update-password")
async def update_password(
    data: PasswordUpdateRequest,
    response: Response,
    user_id: str = Depends(get_current_user),
):
    try:
        new_response = supabase_admin.auth.admin.update_user_by_id(
            user_id, {"password": data.password}
        )
        if new_response.user:
            logout_user(response)  # Logout user after password change
            return {"message": "Password updated successfully"}
        else:
            raise HTTPException(
                status_code=HTTP_400_BAD_REQUEST, detail="Password update failed"
            )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Supabase error: {str(e)}")


@router.post("/update-country")
async def update_country(
    data: CountryUpdateRequest,
    response: Response,
    user_id: str = Depends(get_current_user),
):
    try:
        # Update user metadata with the new country
        new_response = supabase_admin.auth.admin.update_user_by_id(
            user_id, {"user_metadata": {"country": data.country}}
        )

        response.set_cookie(
            key="country", value=data.country, samesite="None", secure=True, path="/"
        )

        if new_response.user:
            return {"message": "Country updated successfully"}
        else:
            raise HTTPException(
                status_code=HTTP_400_BAD_REQUEST, detail="Country update failed"
            )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Supabase error: {str(e)}")

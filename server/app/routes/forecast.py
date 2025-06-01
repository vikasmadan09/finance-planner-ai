from fastapi import APIRouter, Depends, HTTPException, Request
from datetime import datetime, timedelta
from ..db import database
from .auth import get_current_user
from .helper import get_currency_symbol_from_location
from .auth import supabase_admin

router = APIRouter()


@router.get("/monthly")
async def forecase_next_month(
    request: Request, user_id: str = Depends(get_current_user)
):

    query = """
        SELECT COALESCE(SUM(amount), 0)
        FROM expenses
        WHERE user_id = :user_id
        AND DATE_TRUNC('month', timestamp) = DATE_TRUNC('month', CURRENT_DATE)
    """
    try:
        new_response = supabase_admin.auth.admin.get_user_by_id(user_id)
        if not new_response.user:
            raise HTTPException(status_code=404, detail="User not found")

        location = new_response.user.user_metadata.get("country")
        if not location:
            raise HTTPException(status_code=400, detail="Location not found")

        currency_symbol = get_currency_symbol_from_location(location)
        total_spent = await database.fetch_val(query=query, values={"user_id": user_id})
        return {
            "this_month": f"{currency_symbol} {round(total_spent, 2)}",
            "next_month": f"{currency_symbol} {round(total_spent, 2)}",  # Assuming same as this month
            "next_six_month": f"{currency_symbol} {round(total_spent * 6, 2)}",
            "next_year": f"{currency_symbol} {round(total_spent * 12, 2)}",
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

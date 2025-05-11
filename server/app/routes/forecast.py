from fastapi import APIRouter, Depends, HTTPException
from datetime import datetime, timedelta
from ..db import database
from .auth import get_current_user

router = APIRouter()

@router.get('/monthly')
async def forecase_next_month(user_id: str = Depends(get_current_user)):
    query = """
        SELECT COALESCE(SUM(amount), 0)
        FROM expenses
        WHERE user_id = :user_id
        AND DATE_TRUNC('month', timestamp) = DATE_TRUNC('month', CURRENT_DATE)
    """
    try:
        total_spent = await database.fetch_val(query=query, values={"user_id": user_id})
        return {
            "this_month": round(total_spent, 2),
            "next_month": round(total_spent, 2),        # Assuming same as this month
            "next_six_month": round(total_spent * 6, 2),
            "next_year": round(total_spent * 12, 2)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
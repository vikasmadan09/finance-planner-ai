from fastapi import APIRouter, Depends, HTTPException, Body
# import openai
import google.generativeai as genai
from dotenv import load_dotenv
from typing import Optional
from datetime import datetime 
from ..schemas import SuggestionInput
from .auth import get_current_user
from ..db import database

import os
load_dotenv()

router = APIRouter()
print("GEMINI_API_KEY is:", os.getenv("GEMINI_API_KEY"))
genai.configure(api_key = os.getenv("GEMINI_API_KEY"))

@router.post("/suggest")
async def get_ai_suggestion(data: Optional[SuggestionInput] = Body(default=None), user_id:str = Depends(get_current_user)):

    try:
        # Step 1: Fetch summarized expenses for user
        query = """
            SELECT category, SUM(amount) as total
            FROM expenses
            WHERE user_id = :user_id
            GROUP BY category
        """
        expenses = await database.fetch_all(query=query, values={"user_id": user_id})

        if not expenses:
            raise HTTPException(status_code=400, detail="No expenses found to analyze.")

        summary_text = "\n".join([f"{row['category']}: {row['total']}" for row in expenses])
        print("Summary text", summary_text)
        # Step 2: Build dynamic prompt
        location = data.location if data and data.location else "unknown"
        loan_info = ""

        # Loan info is only shown if all parts are present
        if data and all([
            data.loan_principal, 
            data.loan_tenure_months,
            data.loan_inception_month,
            data.loan_inception_year,
            data.loan_interest_rate
        ]):
            # Calculate months passed
            start_date = datetime(data.loan_inception_year, data.loan_inception_month, 1)
            current_date = datetime.now()
            months_passed = (current_date.year - start_date.year) * 12 + (current_date.month - start_date.month)
            remaining_months = max(data.loan_tenure_months - months_passed, 1)

            # For simplicity, assume flat EMI across period (ignoring amortization for now)
            monthly_interest_rate = data.loan_interest_rate / 1200
            emi = (data.loan_principal * monthly_interest_rate) / (1 - (1 + monthly_interest_rate) ** -data.loan_tenure_months)

            # Remaining principal approximation
            remaining_principal = emi * remaining_months

            loan_info = (
                f"\nThe user has an ongoing loan of {data.loan_principal} taken in "
                f"{start_date.strftime('%B %Y')} for {data.loan_tenure_months} months at "
                f"{data.loan_interest_rate}% interest. They have about {remaining_months} months left "
                f"and an estimated remaining principal of {round(remaining_principal, 2)}.\n"
            )

        # Step 3: Build OpenAI prompt
        prompt = (
            f"The user is from {location}. Consider Purchasing Power Parity while suggesting improvements.\n"
            f"Their recent monthly expense breakdown is:\n{summary_text}\n"
            f"{loan_info}"
            "Based on this, suggest 3 practical and empathetic ways the user can reduce spending, "
            "increase savings, and optionally take small steps to clear outstanding loans faster. "
            "Don't be too personal or judgmental and keep suggestions friendly and realistic. "
            "Focus on helpful, encouraging advice."
        )

        # Step 4: Call OpenAI API
        model = genai.GenerativeModel("gemini-2.5-flash-preview-04-17")
        chat = model.start_chat(history=[
            {"role": "user", "parts": [prompt]}
        ])

        response = chat.send_message(prompt)
        suggestion = response.text
        return {"suggestion": suggestion}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
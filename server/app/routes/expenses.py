from fastapi import APIRouter, HTTPException, Depends, Path, Body, Query
from datetime import date
import google.generativeai as genai
import os
from dotenv import load_dotenv
from uuid import uuid4, UUID
from typing import List, Optional
from datetime import datetime, timedelta
from ..db import database
from ..schemas import ExpenseCreate, ExpenseOut, ExpenseUpdate, ExpenseResponse
from ..routes.auth import get_current_user
from .helper import get_currency_symbol_from_location
from .auth import supabase_admin

router = APIRouter()

load_dotenv()
# Load environment variables
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

CATEGORIES = [
    "Groceries",
    "Dining",
    "Housing",
    "Utilities",
    "Transportation",
    "Healthcare",
    "Insurance",
    "Personal Care",
    "Entertainment",
    "Shopping",
    "Education",
    "Savings",
    "Debt Repayment",
    "Gifts",
    "Childcare",
    "Pets",
    "Miscellaneous",
]


def generate_prompt(item_name: str) -> str:
    return f"""
You are a personal finance assistant. Your task is to categorize user expenses.

Choose one of the following categories:
{', '.join(CATEGORIES)}.

Examples:
"Milk" → Groceries
"Netflix subscription" → Entertainment
"Uber ride" → Transportation
"Shampoo" → Personal Care
"Credit card payment" → Debt Repayment

Now categorize the following:
"{item_name}"

Return only the category name.
"""


async def auto_categorize(item_name: str) -> str:
    try:
        prompt = generate_prompt(item_name)
        response = genai.GenerativeModel(
            "gemini-2.5-flash-preview-04-17"
        ).generate_content(prompt)
        category = response.text.strip()
        if category not in CATEGORIES:
            return "Miscellaneous"
        return category
    except Exception as e:
        print(f"[Gemini Error] {e}")
        return "Miscellaneous"


@router.post("/", response_model=ExpenseOut)
async def add_expense(expense: ExpenseCreate, user_id: str = Depends(get_current_user)):
    category = await auto_categorize(expense.item)

    query = """
        INSERT INTO expenses (id, user_id, amount, category, item, notes)
        VALUES (:id, :user_id, :amount, :category, :item, :notes)
        RETURNING id, amount, category, timestamp, item, notes
    """
    values = {
        "id": str(uuid4()),
        "user_id": user_id,  # later: extract from JWT
        "amount": expense.amount,
        "category": category,
        "item": expense.item,
        "notes": expense.notes,
    }
    try:
        row = await database.fetch_one(query=query, values=values)
        return {
            **dict(row),
            "id": str(row["id"]),  # convert UUID to str for FastAPI validation
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/{expense_id}", response_model=ExpenseOut)
async def update_expense(
    expense_id: UUID,
    update_data: ExpenseUpdate = Body(...),
    user_id: str = Depends(get_current_user),
):
    try:
        update_fields = []
        values = {"expense_id": expense_id, "user_id": user_id}

        if update_data.amount is not None:
            update_fields.append("amount= :amount")
            values["amount"] = update_data.amount
        if update_data.item is not None:
            category = await auto_categorize(update_data.item)
            update_fields.append("category= :category")
            values["category"] = category
        if update_data.notes is not None:
            update_fields.append("notes= :note")
            values["notes"] = update_data.notes

        if not update_fields:
            raise HTTPException(
                status_code=400, detail="No valid fields provided for  update."
            )

        set_clause = ", ".join(update_fields)

        query = f"""
            UPDATE expenses
            SET {set_clause}
            WHERE id = :expense_id AND user_id = :user_id
            RETURNING id, amount, category, notes, timestamp
        """
        updated_expense = await database.fetch_one(query=query, values=values)

        if not updated_expense:
            raise HTTPException(
                status_code=404, detail="Expense not found or not owned by the user."
            )

        return {
            "message": "Expense updated successfully",
            "data": dict(updated_expense),
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occured: {str(e)}")


@router.get("/", response_model=ExpenseResponse)
async def get_expenses(user_id: str = Depends(get_current_user)):
    query = """
        SELECT id, amount, category, item, timestamp, notes
        FROM expenses
        WHERE user_id = :user_id
        ORDER BY timestamp DESC
    """
    try:
        new_response = supabase_admin.auth.admin.get_user_by_id(user_id)
        if not new_response.user:
            raise HTTPException(status_code=404, detail="User not found")

        location = new_response.user.user_metadata.get("country")
        if not location:
            raise HTTPException(status_code=400, detail="Location not found")

        currency_symbol = get_currency_symbol_from_location(location)
        rows = await database.fetch_all(query=query, values={"user_id": user_id})

        # fetch total count
        count_query = "SELECT COUNT(*) FROM expenses WHERE user_id = :user_id"
        count_result = await database.fetch_one(
            query=count_query, values={"user_id": user_id}
        )
        total_count = count_result[0] if count_result else 0

        return {
            "total_count": total_count,
            "data": [
                {
                    **dict(row),
                    "id": str(row["id"]),  # Ensure UUID is serialized as string
                    "display_amount": f"{currency_symbol} {row['amount']:.2f}",  # Assuming category is used for location, adjust as needed
                }
                for row in rows
            ],
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/summary")
async def get_expense_summary(
    user_id: str = Depends(get_current_user),
    # start_date: Optional[date] = Query(None),
    # end_date: Optional[date] = Query(None),
):
    try:
        new_response = supabase_admin.auth.admin.get_user_by_id(user_id)
        if not new_response.user:
            raise HTTPException(status_code=404, detail="User not found")

        location = new_response.user.user_metadata.get("country")
        if not location:
            raise HTTPException(status_code=400, detail="Location not found")

        currency_symbol = get_currency_symbol_from_location(location)

        # Sum per category
        query = """
            SELECT category, SUM(amount) AS total
            FROM expenses
            WHERE user_id = :user_id
            {date_filter}
            GROUP BY category
        """
        date_filter = ""
        values = {"user_id": user_id}

        # if start_date and end_date:
        #     date_filter = "AND timestamp >= :start_date AND timestamp < :end_date"
        #     values["start_date"] = start_date
        #     values["end_date"] = end_date + timedelta(days=1)

        final_query = query.format(date_filter=date_filter)

        rows = await database.fetch_all(query=final_query, values=values)

        total_sum = sum(row["total"] for row in rows)

        processed_rows = [
            {
                **row,
                "display_amount": f"{currency_symbol} {row['total']:.2f}",
            }
            for row in rows
        ]

        return {
            "total": total_sum,
            "total_amount": f"{currency_symbol} {total_sum:.2f}",
            "by_category": processed_rows,
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{expense_id}")
async def delete_expense(
    expense_id: UUID = Path(
        ..., title="Expense ID", description="The ID of the expense to delete"
    ),
    user_id: str = Depends(get_current_user),
):
    query = """
        SELECT * FROM expenses
        WHERE id = :expense_id AND user_id = :user_id
    """
    expense = await database.fetch_one(
        query=query, values={"expense_id": expense_id, "user_id": user_id}
    )

    if not expense:
        raise HTTPException(
            status_code=400, detail="Expense not found or not authorized to delete"
        )

    # Delete the expense
    query_delete = """
        DELETE FROM expenses
        WHERE id = :expense_id AND user_id = :user_id
    """
    await database.execute(
        query=query_delete, values={"expense_id": expense_id, "user_id": user_id}
    )

    return {"message": "Expense deleted successfully."}

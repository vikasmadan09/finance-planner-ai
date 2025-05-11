from fastapi import APIRouter, HTTPException, Depends, Path, Body
from pydantic import BaseModel
from uuid import uuid4, UUID
from typing import List
from datetime import datetime
from ..db import database
from ..schemas import ExpenseCreate, ExpenseOut, ExpenseUpdate, ExpenseResponse
from ..routes.auth import get_current_user

router = APIRouter()

mock_expenses=[]

@router.post("/", response_model=ExpenseOut)
async def add_expense(expense: ExpenseCreate, user_id:str = Depends(get_current_user)):
    query = """
        INSERT INTO expenses (id, user_id, amount, category)
        VALUES (:id, :user_id, :amount, :category)
        RETURNING id, amount, category, timestamp
    """
    values = {
        "id": str(uuid4()),
        "user_id": user_id,  # later: extract from JWT
        "amount": expense.amount,
        "category": expense.category
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
async def update_expense(expense_id: UUID, update_data: ExpenseUpdate = Body(...), user_id:str = Depends(get_current_user)):
    try:
        update_fields=[]
        values={"expense_id": expense_id, "user_id": user_id}

        if update_data.amount is not None:
            update_fields.append("amount= :amount")
            values["amount"] = update_data.amount
        if update_data.category is not None:
            update_fields.append("category= :category")
            values["expense_id"] = update_data.category
        if update_data.notes is not None:
            update_fields.append("notes= :note")
            values["notes"] = update_data.notes

        if not update_fields:
            raise HTTPException(status_code=400, details="No valid fields provided for  update.")
        
        set_clause = ", ".join(update_fields)

        query= f"""
            UPDATE expenses
            SET {set_clause}
            WHERE id = :expense_id AND user_id = :user_id
            RETURNING id, amount, category, notes, timestamp
        """
        updated_expense = await database.fetch_one(query=query, values=values)

        if not updated_expense:
            raise HTTPException(status_code=404,details="Expense not found or not owned by the user.")

        return{"message":"Expense updated successfully", "data":dict(updated_expense)}

    except Exception as e:
        raise HTTPException(status_code=500, details=f"An error occured: {str(e)}")

@router.get("/", response_model=ExpenseResponse)
async def get_expenses(user_id:str = Depends(get_current_user)):
    query = """
        SELECT id, amount, category, timestamp
        FROM expenses
        WHERE user_id = :user_id
        ORDER BY timestamp DESC
    """
    try:
        rows = await database.fetch_all(query=query, values={"user_id": user_id})

        # fetch total count
        count_query = "SELECT COUNT(*) FROM expenses WHERE user_id = :user_id"
        count_result = await database.fetch_one(query=count_query, values={"user_id": user_id})
        total_count = count_result[0] if count_result else 0

        return {
            "total_count": total_count,
            "data": [
            {
                **dict(row),
                "id": str(row["id"]),  # Ensure UUID is serialized as string
            }
            for row in rows
        ]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@router.delete("/{expense_id}")
async def delete_expense(
    expense_id: UUID = Path(..., title="Expense ID", description="The ID of the expense to delete"),
    user_id: str = Depends(get_current_user)
):
    query = """
        SELECT * FROM expenses
        WHERE id = :expense_id AND user_id = :user_id
    """
    expense = await database.fetch_one(query=query,values={"expense_id":expense_id, "user_id": user_id})

    if not expense:
        raise HTTPException(status_code=400, detail="Expense not found or not authorized to delete")
    
    # Delete the expense
    query_delete = """
        DELETE FROM expenses
        WHERE id = :expense_id AND user_id = :user_id
    """
    await database.execute(query=query_delete, values={"expense_id": expense_id, "user_id": user_id})

    return {"message": "Expense deleted successfully."}
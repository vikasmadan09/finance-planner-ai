from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class User(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class ExpenseCreate(BaseModel):
    amount: float
    category: str
    notes: Optional[str] = ""

class ExpenseOut(ExpenseCreate):
    id: Optional[str] = None
    user_id: Optional[str] = None
    timestamp: datetime

class ExpenseResponse(BaseModel):
    total_count: int
    data: List[ExpenseOut]

class ExpenseUpdate(BaseModel):
    amount: Optional[float] = Field(None,gt=0)
    category: Optional[str] = None
    notes: Optional[str] = None

class SuggestionInput(BaseModel):
    location: Optional[str] = None
    loan_principal: Optional[float] = None
    loan_tenure_months: Optional[int] = None
    loan_inception_month: Optional[int] = None  # 1 - 12
    loan_inception_year: Optional[int] = None
    loan_interest_rate: Optional[float] = None  # Annual ROI in %
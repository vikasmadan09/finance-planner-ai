
from fastapi import APIRouter
from . import auth, expenses, forecast, ai  # import all your route modules

router = APIRouter()

router.include_router(auth.router, prefix="/auth")
router.include_router(expenses.router, prefix="/expenses")
router.include_router(forecast.router, prefix="/forecast")
router.include_router(ai.router, prefix="/ai")
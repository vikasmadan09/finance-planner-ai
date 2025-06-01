from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from .routes import router
from .db import database
import uvicorn
import os


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup logic
    await database.connect()
    yield
    # Shutdown logic
    await database.disconnect()


app = FastAPI(lifespan=lifespan)

origins = os.getenv("CORS_ORIGINS", "*").split(",")


app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)


@app.get("/health")
def read_root():
    return {"status": "healthy"}


# if __name__ == "__main__":
#     import uvicorn

#     uvicorn.run(app,host="0.0.0.0", port=8000)

app.include_router(router)

# @app.on_event("startup")
# async def startup():
#     await database.connect()

# @app.on_event("shutdown")
# async def shutdown():
#     await database.disconnect()

is_dev = os.getenv("ENVIRONMENT", "development") == "development"


# Optional: run function for launching via `python main.py`
def run():
    uvicorn.run(
        "app.main:app", host="0.0.0.0", port=int(os.getenv("PORT", 8000)), reload=is_dev
    )


# Ensure it only runs when executed directly
if __name__ == "__main__":
    run()

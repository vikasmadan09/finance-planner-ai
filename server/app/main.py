from fastapi import FastAPI
# from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from .routes import router
from .db import database
import uvicorn


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup logic
    await database.connect()
    yield
    # Shutdown logic
    await database.disconnect()

app = FastAPI(lifespan=lifespan)

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# @app.get("/")
# def read_root():
#     return { "Hello": "World"}

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



# Optional: run function for launching via `python main.py`
def run():
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=False  # Set to False in production
    )

# Ensure it only runs when executed directly
if __name__ == "__main__":
    run()
    

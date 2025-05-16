# tasky/backend/app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.data_manager import load_tasks, tasks_data
from app.routers import tasks_router

# Initialize the FastAPI application
app = FastAPI(
    title="Task Board API",
    version="0.1.0",
    description="API for managing a simple task board application.",
)

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    # Add your deployed frontend URL here when you deploy
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Event handler for application startup
@app.on_event("startup")
async def startup_event():
    """
    Load tasks from the data file when the application starts.
    """
    load_tasks()
    print(f"Loaded {len(tasks_data)} tasks on startup from data_manager.")


app.include_router(tasks_router.router)


@app.get("/", tags=["Root"])
async def read_root():
    """
    Root endpoint of the API.
    Provides a welcome message and confirms the API is running.
    """
    return {"message": "Welcome to the Task Board API!"}

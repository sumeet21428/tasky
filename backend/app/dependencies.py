# tasky/backend/app/dependencies.py
from typing import List
from app.models import Task  # Assuming models.py is in the 'app' directory
from app.data_manager import tasks_data  # Import tasks_data directly


# Dependency to get the DB (in-memory list of tasks)
def get_db() -> List[Task]:
    """
    Dependency function to get the in-memory task database.
    This function will be used by path operations to inject the tasks_data.
    """
    return tasks_data

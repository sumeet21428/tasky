import json
import os
import tempfile
from pathlib import Path
from typing import List
from app.models import Task

DATA_DIR = Path(__file__).resolve().parent.parent / "_data"  # Root/backend/_data
DB_FILE = DATA_DIR / "tasks_db.json"
tasks_data: List[Task] = []


def _ensure_data_dir_exists():
    DATA_DIR.mkdir(parents=True, exist_ok=True)


def load_tasks():
    global tasks_data
    _ensure_data_dir_exists()
    if not DB_FILE.exists():
        tasks_data = []
        return
    try:
        with open(DB_FILE, "r") as f:
            raw_data = json.load(f)
            tasks_data = [Task(**task_dict) for task_dict in raw_data]
    except (json.JSONDecodeError, TypeError) as e:
        print(f"Error loading tasks from {DB_FILE}: {e}. Initializing with empty list.")
        tasks_data = []  # Initialize with empty if file is corrupt or not a list


def save_tasks():
    _ensure_data_dir_exists()
    # Use model_dump for Pydantic v2, or .dict() for v1
    data_to_save = [task.model_dump(mode="json") for task in tasks_data]
    temp_filepath = ""  # Initialize to handle potential error before assignment
    try:
        with tempfile.NamedTemporaryFile(
            mode="w", delete=False, dir=DATA_DIR, suffix=".json", encoding="utf-8"
        ) as tmp_file:
            json.dump(data_to_save, tmp_file, indent=4)
            tmp_file.flush()
            os.fsync(tmp_file.fileno())
            temp_filepath = tmp_file.name

        os.replace(temp_filepath, DB_FILE)
    except Exception as e:
        print(f"An error occurred during atomic save: {e}")
        if temp_filepath and os.path.exists(temp_filepath):
            os.remove(temp_filepath)  # Clean up temp file on error

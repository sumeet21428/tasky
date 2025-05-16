# tasky/backend/app/routers/tasks_router.py
from fastapi import APIRouter, HTTPException, Depends, status
from typing import List  # Removed Dict as it wasn't used for response models here
from uuid import UUID
from app.models import (
    Task,
    TaskCreate,
    TaskUpdate,
    TaskMove,
)  # TaskStatus is used by models
from app.data_manager import save_tasks  # tasks_data is managed via dependency

# Import get_db from the new dependencies.py file
from app.dependencies import get_db

router = APIRouter(prefix="/api/tasks", tags=["Tasks"])


# Helper to find task or raise 404
def find_task_or_404(task_id: UUID, db: List[Task]) -> Task:  # Return type is Task
    task = next((task for task in db if task.id == task_id), None)
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Task not found"
        )
    return task


@router.get("/", response_model=List[Task])
async def get_all_tasks(db: List[Task] = Depends(get_db)):
    """
    Retrieve all tasks.
    """
    return db


@router.post("/", response_model=Task, status_code=status.HTTP_201_CREATED)
async def create_new_task(task_in: TaskCreate, db: List[Task] = Depends(get_db)):
    """
    Create a new task.
    The order of the task within its column is automatically calculated.
    """

    tasks_in_status = [t for t in db if t.status == task_in.status]
    # New order is 1.0 if column is empty, else max existing order + 1.0
    new_order = (
        (max(t.order for t in tasks_in_status) + 1.0) if tasks_in_status else 1.0
    )

    new_task = Task(**task_in.model_dump(), order=new_order)
    db.append(new_task)
    save_tasks()  # Persist changes to the JSON file
    return new_task


@router.get("/{task_id}", response_model=Task)
async def get_task_by_id(task_id: UUID, db: List[Task] = Depends(get_db)):
    """
    Retrieve a specific task by its ID.
    """
    return find_task_or_404(task_id, db)


@router.put("/{task_id}", response_model=Task)
async def update_existing_task(
    task_id: UUID, task_update: TaskUpdate, db: List[Task] = Depends(get_db)
):
    """
    Update an existing task's title or description.
    Status and order are updated via the /move endpoint.
    """
    task_to_update = find_task_or_404(task_id, db)
    # model_dump(exclude_unset=True) ensures only provided fields are used for update
    update_data = task_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(task_to_update, key, value)
    save_tasks()  # Persist changes
    return task_to_update


@router.patch("/{task_id}/move", response_model=Task)
async def move_task(
    task_id: UUID, task_move: TaskMove, db: List[Task] = Depends(get_db)
):
    """
    Move a task to a new status (column) and/or update its order within a column.
    The frontend is expected to provide the correct new 'order' value.
    """
    task_to_move = find_task_or_404(task_id, db)

    update_data = task_move.model_dump(exclude_unset=True)

    for key, value in update_data.items():
        setattr(task_to_move, key, value)

    save_tasks()
    return task_to_move


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_existing_task(task_id: UUID, db: List[Task] = Depends(get_db)):
    """
    Delete an existing task.
    """
    task_to_delete = find_task_or_404(task_id, db)
    db.remove(task_to_delete)
    save_tasks()  # Persist changes
    # No content is returned for a 204 response
    return None

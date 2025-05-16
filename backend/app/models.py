# tasky/backend/app/models.py
from enum import Enum as PyEnum  # Alias to avoid potential name clashes
from typing import Optional  # List and Union were not used here
from pydantic import (
    BaseModel,
    Field,
    ConfigDict,
)  # Import ConfigDict for Pydantic v2 model_config
from uuid import UUID, uuid4  # For generating unique task IDs


# Enum for task statuses
class TaskStatus(str, PyEnum):
    """
    Represents the possible statuses a task can have.
    Uses str mixin for string-based enum values.
    """

    TO_DO = "To Do"
    IN_PROGRESS = "In Progress"
    DONE = "Done"


# Base Pydantic model for common task attributes
class TaskBase(BaseModel):
    """
    Base model for task data, containing fields common to creation and representation.
    """

    title: str = Field(
        ..., min_length=1, max_length=100, description="The title of the task."
    )
    description: Optional[str] = Field(
        None, max_length=500, description="An optional description for the task."
    )


# Model for creating a new task (input)
class TaskCreate(TaskBase):
    """
    Model used when creating a new task.
    Inherits title and description from TaskBase.
    Status defaults to 'To Do'.
    """

    status: TaskStatus = TaskStatus.TO_DO  # Default status for new tasks


# Model representing a task as stored and returned by the API (output)
class Task(TaskBase):
    """
    Model representing a task, including its ID, status, and order.
    This is typically what's stored in the database and returned in API responses.
    """

    id: UUID = Field(
        default_factory=uuid4, description="Unique identifier for the task."
    )
    status: TaskStatus = Field(description="Current status of the task.")
    order: float = Field(
        description="Order of the task within its column, used for sorting."
    )

    # Pydantic model configuration (V2 syntax)
    model_config = ConfigDict(
        from_attributes=True,  # Replaces orm_mode = True for Pydantic V2
        use_enum_values=True,  # Ensures enum values (strings) are used in serialization
        populate_by_name=True,  # Allows using field names or aliases
    )


# Model for updating an existing task's details (input for PUT requests)
class TaskUpdate(BaseModel):
    """
    Model used when updating an existing task's mutable fields (title, description).
    All fields are optional, allowing for partial updates.
    """

    title: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    # Status and order are typically updated via a dedicated 'move' endpoint/model


# Model for moving a task (input for PATCH requests to change status/order)
class TaskMove(BaseModel):
    """
    Model used when moving a task to a different status (column) or reordering it.
    Both status and order are optional, allowing updates to either or both.
    """

    status: Optional[TaskStatus] = None
    order: Optional[float] = None

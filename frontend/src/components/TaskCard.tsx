import React, { useState } from 'react';
// Import types from react-beautiful-dnd using 'import type'
import type { DraggableProvided, DraggableStateSnapshot } from 'react-beautiful-dnd';
import type { Task } from '../types'; // Task is a type
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline'; // Icons are components (values)
import EditTaskModal from './EditTaskModal'; // This will be created in a later step
import { useBoardDispatch } from '../context/BoardContext'; // Hooks are values
import { deleteTask as apiDeleteTask, fetchTasks } from '../services/api'; // Functions are values

interface TaskCardProps {
  task: Task;
  provided: DraggableProvided; // Props from react-beautiful-dnd for the draggable item
  snapshot: DraggableStateSnapshot; // State snapshot for styling during drag
}

const TaskCard: React.FC<TaskCardProps> = ({ task, provided, snapshot }) => {
  const dispatch = useBoardDispatch();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Handler for deleting a task
  const handleDelete = async () => {
    // User confirmation before deleting
    if (
      window.confirm(
        `Are you sure you want to delete the task "${task.title}"? This action cannot be undone.`
      )
    ) {
      try {
        await apiDeleteTask(task.id);
        // Optimistic update: remove task from local state immediately
        dispatch({ type: 'DELETE_TASK', payload: { taskId: task.id, status: task.status } });
        // Optionally, show a success notification (e.g., using a toast library)
      } catch (error) {
        console.error('Failed to delete task:', error);
        alert('Failed to delete task. Please try again. The board will be refreshed.');
        // On error, re-fetch all tasks to ensure UI consistency
        // This is a simple way to handle potential desync after a failed delete.
        try {
          const freshTasks = await fetchTasks();
          dispatch({ type: 'SET_BOARD_DATA', payload: freshTasks });
        } catch (fetchError) {
          console.error('Failed to re-fetch tasks after delete error:', fetchError);
          alert('Critical error: Failed to refresh board data. Please reload the page.');
        }
      }
    }
  };

  // Handler to open the EditTaskModal
  // This function is synchronous, so no-misused-promises should apply here.
  const handleOpenEditModal = () => {
    setIsEditModalOpen(true);
  };

  return (
    <>
      <div
        ref={provided.innerRef} // Hook up the ref for react-beautiful-dnd
        {...provided.draggableProps} // Apply props for dragging
        {...provided.dragHandleProps} // Apply props for the drag handle (the whole card here)
        className={`p-3.5 rounded-lg shadow-lg bg-gray-700 hover:bg-gray-600 
                    transition-all duration-200 ease-in-out border border-gray-600
                    ${snapshot.isDragging ? 'ring-2 ring-pink-500 shadow-2xl transform scale-105' : ''}
                    text-gray-200 mb-3 last:mb-0`} // Add margin-bottom, remove for last card
        style={{
          ...provided.draggableProps.style, // Important for react-beautiful-dnd positioning
        }}
      >
        <h3 className="font-medium text-gray-50 mb-1 break-words">{task.title}</h3>
        {/* The check `task.description &&` is fine and standard. */}
        {task.description && (
          <p className="text-sm text-gray-400 mb-3 break-words whitespace-pre-wrap">
            {task.description}
          </p>
        )}
        {/* Container for action buttons */}
        <div className="mt-3 flex justify-end space-x-2 items-center">
          <button
            onClick={handleOpenEditModal} // Direct pass is fine as handleOpenEditModal is not async
            className="p-1.5 text-blue-400 hover:text-blue-300 hover:bg-gray-600 rounded-md transition-colors"
            aria-label="Edit task"
          >
            <PencilIcon className="h-5 w-5" />
          </button>
          <button
            onClick={() => {
              void handleDelete();
            }} // Wrapped async call with void to handle no-misused-promises
            className="p-1.5 text-red-400 hover:text-red-300 hover:bg-gray-600 rounded-md transition-colors"
            aria-label="Delete task"
          >
            <TrashIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* `isEditModalOpen` is a boolean, this check is standard and fine. */}
      {isEditModalOpen && (
        <EditTaskModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
          }} // Added braces for no-confusing-void-expression
          task={task} // Pass the current task data to the modal
        />
      )}
    </>
  );
};

export default TaskCard;

// tasky/frontend/src/services/api.ts
import axios from 'axios';
// Import AxiosError for better error typing in catch blocks
import type { AxiosError } from 'axios';
// Assuming types/index.ts exports Task, TaskStatus (type)
import type { Task, TaskStatus } from '../types';

// --- Configuration ---
// Determine the API base URL.
// It defaults to 'http://localhost:8000/api' for local development.
// You can override this by setting the VITE_API_URL environment variable
// (e.g., in a .env file in your frontend root: VITE_API_URL=https://your-deployed-api.com/api)
// Explicitly type API_BASE_URL to satisfy no-unsafe-assignment.
const API_BASE_URL: string =
  (import.meta.env.VITE_API_URL as string | undefined) || 'http://localhost:8000/api';

// Create an axios instance with default configuration.
// The type for apiClient will be inferred as AxiosInstance.
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// --- Payload Types for API Requests ---

// Payload for creating a new task.
export interface TaskCreatePayload {
  title: string;
  description?: string | null;
  status: TaskStatus; // e.g., TaskStatusValues.TO_DO (the actual string value)
}

// Payload for updating an existing task's mutable fields.
export interface TaskUpdatePayload {
  title?: string;
  description?: string | null;
  // Status and order changes are handled by moveTask
}

// Payload for moving a task (changing its status and/or order).
export interface TaskMovePayload {
  status?: TaskStatus; // The new status (column) if changed
  order?: number; // The new order within the column
}

// --- Helper Type Guard for Axios Errors ---
// This helps in differentiating Axios errors from other types of errors in catch blocks.
function isAxiosError(error: unknown): error is AxiosError {
  // Check if the 'isAxiosError' property exists and is true.
  // Also check if error is an object and not null before casting.
  return typeof error === 'object' && error !== null && (error as AxiosError).isAxiosError;
}

// --- API Service Functions ---

/**
 * Fetches all tasks from the backend.
 * @returns A promise that resolves to an array of Task objects.
 */
export const fetchTasks = async (): Promise<Task[]> => {
  try {
    const response = await apiClient.get<Task[]>('/tasks');
    return response.data;
  } catch (error) {
    if (isAxiosError(error)) {
      // Log more specific error details if it's an Axios error
      console.error('Error fetching tasks (Axios):', error.response?.data || error.message);
    } else {
      console.error('Error fetching tasks (Unknown):', error);
    }
    // Re-throw the error to be handled by the calling code
    throw error;
  }
};

/**
 * Creates a new task on the backend.
 * @param taskData - The data for the new task (TaskCreatePayload).
 * @returns A promise that resolves to the newly created Task object.
 */
export const createTask = async (taskData: TaskCreatePayload): Promise<Task> => {
  try {
    const response = await apiClient.post<Task>('/tasks', taskData);
    return response.data;
  } catch (error) {
    if (isAxiosError(error)) {
      console.error('Error creating task (Axios):', error.response?.data || error.message);
    } else {
      console.error('Error creating task (Unknown):', error);
    }
    throw error;
  }
};

/**
 * Updates an existing task's details (title, description) on the backend.
 * @param taskId - The ID of the task to update.
 * @param taskData - The data to update (TaskUpdatePayload).
 * @returns A promise that resolves to the updated Task object.
 */
export const updateTask = async (taskId: string, taskData: TaskUpdatePayload): Promise<Task> => {
  try {
    const response = await apiClient.put<Task>(`/tasks/${taskId}`, taskData);
    return response.data;
  } catch (error) {
    if (isAxiosError(error)) {
      console.error(
        `Error updating task ${taskId} (Axios):`,
        error.response?.data || error.message
      );
    } else {
      console.error(`Error updating task ${taskId} (Unknown):`, error);
    }
    throw error;
  }
};

/**
 * Moves a task to a new status and/or order on the backend.
 * @param taskId - The ID of the task to move.
 * @param moveData - The new status and/or order (TaskMovePayload).
 * @returns A promise that resolves to the updated (moved) Task object.
 */
export const moveTask = async (taskId: string, moveData: TaskMovePayload): Promise<Task> => {
  try {
    const response = await apiClient.patch<Task>(`/tasks/${taskId}/move`, moveData);
    return response.data;
  } catch (error) {
    if (isAxiosError(error)) {
      console.error(`Error moving task ${taskId} (Axios):`, error.response?.data || error.message);
    } else {
      console.error(`Error moving task ${taskId} (Unknown):`, error);
    }
    throw error;
  }
};

/**
 * Deletes a task from the backend.
 * @param taskId - The ID of the task to delete.
 * @returns A promise that resolves when the task is successfully deleted (void).
 */
export const deleteTask = async (taskId: string): Promise<void> => {
  try {
    await apiClient.delete(`/tasks/${taskId}`);
    // DELETE requests typically return a 204 No Content status, so no response.data to return.
  } catch (error) {
    if (isAxiosError(error)) {
      console.error(
        `Error deleting task ${taskId} (Axios):`,
        error.response?.data || error.message
      );
    } else {
      console.error(`Error deleting task ${taskId} (Unknown):`, error);
    }
    throw error;
  }
};

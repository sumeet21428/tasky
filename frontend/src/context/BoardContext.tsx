import { createContext, useReducer, useContext, useEffect } from 'react';
import type { Dispatch, ReactNode } from 'react';

import { TaskStatusValues } from '../types';
import type { BoardData, Task, TaskStatus, ColumnType } from '../types';

const initialColumnsTemplate: Readonly<Record<TaskStatus, ColumnType>> = {
  "To Do":       { id: TaskStatusValues.TO_DO,       title: 'To Do',       tasks: [] as Task[] },
  "In Progress": { id: TaskStatusValues.IN_PROGRESS, title: 'In Progress', tasks: [] as Task[] },
  "Done":        { id: TaskStatusValues.DONE,        title: 'Done',        tasks: [] as Task[] },
};

const createInitialColumns = (): BoardData['columns'] => {
  const columns = {} as BoardData['columns']; 
  (Object.values(TaskStatusValues) as TaskStatus[]).forEach((status) => {
    // initialColumnsTemplate[status] is guaranteed to exist
    columns[status] = { 
        ...initialColumnsTemplate[status], 
        tasks: [...initialColumnsTemplate[status].tasks] 
    };
  });
  return columns;
};

const initialState: BoardData = {
  columns: createInitialColumns(),
  columnOrder: [TaskStatusValues.TO_DO, TaskStatusValues.IN_PROGRESS, TaskStatusValues.DONE],
};

// --- Action Type Definitions ---
interface SetBoardDataAction {
  type: 'SET_BOARD_DATA';
  payload: Task[];
}
interface AddTaskAction {
  type: 'ADD_TASK';
  payload: Task;
}
interface UpdateTaskAction {
  type: 'UPDATE_TASK';
  payload: Task;
}
interface DeleteTaskAction {
  type: 'DELETE_TASK';
  payload: {
    taskId: string;
    status: TaskStatus;
  };
}
interface MoveTaskLocallyAction {
    type: 'MOVE_TASK_LOCALLY';
    payload: {
        newColumns: BoardData['columns'];
    };
}

type Action =
  | SetBoardDataAction
  | AddTaskAction
  | UpdateTaskAction
  | DeleteTaskAction
  | MoveTaskLocallyAction;

const boardReducer = (state: BoardData, action: Action): BoardData => {
  switch (action.type) {
    case 'SET_BOARD_DATA': {
      const tasks = action.payload;
      const newColumnsState = createInitialColumns(); 

      tasks.forEach(task => {
        const statusKey = task.status;
        if (Object.prototype.hasOwnProperty.call(newColumnsState, statusKey) && newColumnsState[statusKey].tasks) {
          newColumnsState[statusKey].tasks.push(task);
        } else {
          console.warn(`Task with id ${task.id} has an unknown or uninitialized status: ${statusKey}. Task not added.`);
        }
      });

      Object.values(newColumnsState).forEach(column => {
        column.tasks.sort((a, b) => a.order - b.order);
      });
      return { ...state, columns: newColumnsState };
    }

    case 'ADD_TASK': {
      const newTask = action.payload;
      const targetColumnKey = newTask.status;
      const targetColumn = state.columns[targetColumnKey]; 

      const updatedTasks = [...targetColumn.tasks, newTask].sort((a, b) => a.order - b.order);
      return {
        ...state,
        columns: {
          ...state.columns,
          [targetColumnKey]: { ...targetColumn, tasks: updatedTasks },
        },
      };
    }

    case 'UPDATE_TASK': {
      const updatedTask = action.payload;
      const columnToUpdateKey = updatedTask.status;
      const columnToUpdate = state.columns[columnToUpdateKey]; 
      const updatedTasks = columnToUpdate.tasks.map(task =>
        task.id === updatedTask.id ? updatedTask : task
      ).sort((a, b) => a.order - b.order);
      return {
        ...state,
        columns: {
          ...state.columns,
          [columnToUpdateKey]: { ...columnToUpdate, tasks: updatedTasks },
        },
      };
    }

    case 'DELETE_TASK': {
      const { taskId, status } = action.payload;
      const columnToDeleteFromKey = status;
      const columnToDeleteFrom = state.columns[columnToDeleteFromKey]; 
      const updatedTasks = columnToDeleteFrom.tasks.filter(task => task.id !== taskId);
      return {
        ...state,
        columns: {
          ...state.columns,
          [columnToDeleteFromKey]: { ...columnToDeleteFrom, tasks: updatedTasks },
        },
      };
    }

    case 'MOVE_TASK_LOCALLY': {
        return {
            ...state,
            columns: action.payload.newColumns,
        };
    }
    default:
      return state;
  }
};

const BoardStateContext = createContext<BoardData | undefined>(undefined);
const BoardDispatchContext = createContext<Dispatch<Action> | undefined>(undefined);

export const BoardProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(boardReducer, initialState);
  useEffect(() => {
    // console.log("Board state updated:", state);
  }, [state]);

  return (
    <BoardStateContext.Provider value={state}>
      <BoardDispatchContext.Provider value={dispatch}>
        {children}
      </BoardDispatchContext.Provider>
    </BoardStateContext.Provider>
  );
};

export const useBoardState = (): BoardData => {
  const context = useContext(BoardStateContext);
  if (context === undefined) {
    throw new Error('useBoardState must be used within a BoardProvider');
  }
  return context;
};

export const useBoardDispatch = (): Dispatch<Action> => {
  const context = useContext(BoardDispatchContext);
  if (context === undefined) {
    throw new Error('useBoardDispatch must be used within a BoardProvider');
  }
  return context;
};

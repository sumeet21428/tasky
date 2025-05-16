// tasky/frontend/src/types/index.ts
export type TaskStatus = 'To Do' | 'In Progress' | 'Done';

export const TaskStatusValues = {
  TO_DO: 'To Do' as TaskStatus,
  IN_PROGRESS: 'In Progress' as TaskStatus,
  DONE: 'Done' as TaskStatus,
};

export interface Task {
  id: string;
  title: string;
  description?: string | null;
  status: TaskStatus;
  order: number;
}

export interface ColumnType {
  id: TaskStatus;
  title: string;
  tasks: Task[];
}

export interface BoardData {
  columns: {
    // This is an object with specific, known keys
    [TaskStatusValues.TO_DO]: ColumnType;
    [TaskStatusValues.IN_PROGRESS]: ColumnType;
    [TaskStatusValues.DONE]: ColumnType;
  };
  columnOrder: TaskStatus[];
}

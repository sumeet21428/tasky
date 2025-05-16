// tasky/frontend/src/components/Board.tsx
import React, { useEffect, useState } from 'react';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import type { DropResult, ResponderProvided } from 'react-beautiful-dnd';

import ColumnComponent from './ColumnComponent';
import AddTaskModal from './AddTaskModal';
import { useBoardState, useBoardDispatch } from '../context/BoardContext';
import { fetchTasks, moveTask as apiMoveTask } from '../services/api';
import type { Task, TaskStatus } from '../types';
import { TaskStatusValues } from '../types';

const Board: React.FC = () => {
  const boardData = useBoardState();
  const dispatch = useBoardDispatch();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [defaultStatusForModal, setDefaultStatusForModal] = useState<TaskStatus>(
    TaskStatusValues.TO_DO
  );

  useEffect(() => {
    const loadTasks = async () => {
      try {
        setLoading(true);
        const tasksFromApi = await fetchTasks();
        dispatch({ type: 'SET_BOARD_DATA', payload: tasksFromApi });
        setError(null);
      } catch (err) {
        setError('Failed to load tasks. Please ensure the backend is running and accessible.');
        console.error('Error fetching tasks:', err);
      } finally {
        setLoading(false);
      }
    };
    void loadTasks();
  }, [dispatch]);

  const handleOpenAddTaskModal = (status: TaskStatus) => {
    setDefaultStatusForModal(status);
    setIsAddTaskModalOpen(true);
  };

  const reorder = (list: Task[], startIndex: number, endIndex: number): Task[] => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    return result.map((task, index) => ({ ...task, order: index + 1 }));
  };

  const move = (
    sourceList: Task[],
    destinationList: Task[],
    droppableSource: { index: number; droppableId: string },
    droppableDestination: { index: number; droppableId: string }
  ): { [key: string]: Task[] } => {
    const sourceClone = Array.from(sourceList);
    const destClone = Array.from(destinationList);
    const [removed] = sourceClone.splice(droppableSource.index, 1);

    removed.status = droppableDestination.droppableId as TaskStatus;
    destClone.splice(droppableDestination.index, 0, removed);

    const result: { [key: string]: Task[] } = {};
    result[droppableSource.droppableId] = sourceClone.map((task, index) => ({
      ...task,
      order: index + 1,
    }));
    result[droppableDestination.droppableId] = destClone.map((task, index) => ({
      ...task,
      order: index + 1,
    }));

    return result;
  };

  // Add eslint-disable-next-line for the intentionally unused 'provided' parameter from react-beautiful-dnd
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const onDragEnd = async (result: DropResult, _providedUnused: ResponderProvided) => {
    console.log('onDragEnd triggered. Result:', result);
    const { source, destination, draggableId } = result;

    if (!destination) {
      return;
    }

    const sourceColumnId = source.droppableId as TaskStatus;
    const destColumnId = destination.droppableId as TaskStatus;

    let newColumns = { ...boardData.columns };

    if (sourceColumnId === destColumnId) {
      const column = boardData.columns[sourceColumnId];
      const reorderedTasks = reorder(column.tasks, source.index, destination.index);
      const updatedColumn = { ...column, tasks: reorderedTasks };
      newColumns = {
        ...boardData.columns,
        [sourceColumnId]: updatedColumn,
      };

      dispatch({ type: 'MOVE_TASK_LOCALLY', payload: { newColumns } });

      const movedTask = reorderedTasks.find((t) => t.id === draggableId);
      if (movedTask) {
        try {
          await apiMoveTask(draggableId, { order: movedTask.order });
        } catch (apiError) {
          console.error('Failed to update task order on server:', apiError);
          alert('Error saving task order. Reverting changes.');
          try {
            const tasksFromApi = await fetchTasks();
            dispatch({ type: 'SET_BOARD_DATA', payload: tasksFromApi });
          } catch (fetchErr) {
            console.error('Failed to re-fetch tasks after order update error:', fetchErr);
          }
        }
      }
    } else {
      const sourceColumnData = boardData.columns[sourceColumnId];
      const destColumnData = boardData.columns[destColumnId];
      const movedResult = move(sourceColumnData.tasks, destColumnData.tasks, source, destination);

      const updatedSourceColumn = { ...sourceColumnData, tasks: movedResult[sourceColumnId] };
      const updatedDestColumn = { ...destColumnData, tasks: movedResult[destColumnId] };
      newColumns = {
        ...boardData.columns,
        [sourceColumnId]: updatedSourceColumn,
        [destColumnId]: updatedDestColumn,
      };

      dispatch({ type: 'MOVE_TASK_LOCALLY', payload: { newColumns } });

      const finalDestColumnTasks = newColumns[destColumnId].tasks;
      const movedTask = finalDestColumnTasks.find((t) => t.id === draggableId);

      if (movedTask) {
        try {
          await apiMoveTask(draggableId, { status: destColumnId, order: movedTask.order });
        } catch (apiError) {
          console.error('Failed to move task on server:', apiError);
          alert('Error saving moved task. Reverting changes.');
          try {
            const tasksFromApi = await fetchTasks();
            dispatch({ type: 'SET_BOARD_DATA', payload: tasksFromApi });
          } catch (fetchErr) {
            console.error('Failed to re-fetch tasks after move error:', fetchErr);
          }
        }
      }
    }
  };

  if (loading) {
    return <p className="text-center text-xl mt-10 text-gray-200">Loading board...</p>;
  }
  if (error) {
    return (
      <p className="text-center text-red-300 text-xl mt-10 bg-red-900 bg-opacity-50 p-4 rounded-md">
        {error}
      </p>
    );
  }

  return (
    <>
      <DragDropContext
        onDragEnd={(result, provided) => {
          void onDragEnd(result, provided);
        }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 items-start">
          {boardData.columnOrder.map((columnId) => {
            const column = boardData.columns[columnId];
            return (
              <Droppable key={column.id} droppableId={column.id}>
                {(provided, snapshot) => {
                  return (
                    <ColumnComponent
                      column={column}
                      provided={provided}
                      snapshot={snapshot}
                      onOpenModal={handleOpenAddTaskModal}
                    />
                  );
                }}
              </Droppable>
            );
          })}
        </div>
      </DragDropContext>
      {isAddTaskModalOpen && (
        <AddTaskModal
          isOpen={isAddTaskModalOpen}
          onClose={() => {
            setIsAddTaskModalOpen(false);
          }}
          defaultStatus={defaultStatusForModal}
        />
      )}
    </>
  );
};

export default Board;

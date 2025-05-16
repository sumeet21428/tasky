// tasky/frontend/src/components/ColumnComponent.tsx
import React from 'react';
// Draggable is a component (value)
import { Draggable } from 'react-beautiful-dnd';
// Import types separately using 'import type'
import type { DroppableProvided, DroppableStateSnapshot } from 'react-beautiful-dnd';

import TaskCard from './TaskCard';
import type { ColumnType, TaskStatus } from '../types'; // TaskStatus is a type
import { PlusCircleIcon } from '@heroicons/react/24/outline'; // Using outline icons

interface ColumnComponentProps {
  column: ColumnType; // ColumnType interface defines tasks as Task[], not optional
  provided: DroppableProvided; // Props from react-beautiful-dnd for the droppable area
  snapshot: DroppableStateSnapshot; // State snapshot for styling during drag
  onOpenModal: (status: TaskStatus) => void; // Callback to open the AddTaskModal
}

const ColumnComponent: React.FC<ColumnComponentProps> = ({
  column,
  provided,
  snapshot,
  onOpenModal,
}) => {
  return (
    <div
      {...provided.droppableProps} // Apply props to the droppable DOM element
      ref={provided.innerRef} // Hook up the ref for react-beautiful-dnd
      className={`p-4 rounded-lg shadow-xl bg-gray-800 bg-opacity-60
                  transition-colors duration-200 ease-in-out
                  ${snapshot.isDraggingOver ? 'bg-gray-700 ring-2 ring-pink-500' : 'border border-gray-700'}
                  min-h-[200px] flex flex-col w-full max-w-md mx-auto md:max-w-none`} // Ensure min height and responsive width
    >
      {/* Column Header */}
      <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-700">
        <h2 className="text-xl font-semibold text-gray-100">{column.title}</h2>
        <button
          onClick={() => {
            onOpenModal(column.id);
          }} // Added braces for no-confusing-void-expression
          className="text-pink-400 hover:text-pink-300 transition-colors p-1 rounded-full hover:bg-gray-700"
          aria-label={`Add new task to ${column.title} column`}
        >
          <PlusCircleIcon className="h-8 w-8" />
        </button>
      </div>

      {/* Task List Area */}
      {/* This div will grow to take available space if tasks overflow */}
      {/* Added custom-scrollbar class for styling (ensure this class is defined in your global CSS) */}
      <div className="space-y-3 flex-grow overflow-y-auto max-h-[60vh] pr-1 custom-scrollbar">
        {/*
          Since `column.tasks` is typed as `Task[]` in `ColumnType` (meaning it's always an array, possibly empty),
          the `column.tasks &&` check before `.map` is considered unnecessary by the linter.
          Mapping over an empty array is safe and results in nothing being rendered.
        */}
        {column.tasks.map((task, index) => (
          // Each task is Draggable
          <Draggable key={task.id} draggableId={task.id} index={index}>
            {(providedDraggable, snapshotDraggable) => (
              <TaskCard
                task={task}
                provided={providedDraggable}
                snapshot={snapshotDraggable}
                // Edit and Delete modals will be handled within TaskCard
              />
            )}
          </Draggable>
        ))}
        {provided.placeholder} {/* Placeholder for spacing during drag */}
      </div>
    </div>
  );
};

export default ColumnComponent;

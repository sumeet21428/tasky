// tasky/frontend/src/components/EditTaskModal.tsx
import React, { Fragment, useEffect } from 'react';
// Ensure these are direct named imports for Headless UI v2+
import { Dialog, Transition, DialogPanel, DialogTitle, TransitionChild } from '@headlessui/react';
import { useForm } from 'react-hook-form';
import type { SubmitHandler } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useBoardDispatch } from '../context/BoardContext';
import { updateTask as apiUpdateTask } from '../services/api';
import type { TaskUpdatePayload } from '../services/api';
import type { Task } from '../types';

// Zod schema for form validation
const taskEditSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be 100 characters or less'),
  description: z
    .string()
    .max(500, 'Description must be 500 characters or less')
    .optional()
    .nullable(),
});

// TypeScript type inferred from the Zod schema
type TaskEditFormData = z.infer<typeof taskEditSchema>;

// Props interface for the EditTaskModal component
interface EditTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task; // Assuming task is always provided when isOpen is true based on typical usage
}

const EditTaskModal: React.FC<EditTaskModalProps> = ({ isOpen, onClose, task }) => {
  const dispatch = useBoardDispatch();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isValid },
    setValue,
    setFocus,
  } = useForm<TaskEditFormData>({
    resolver: zodResolver(taskEditSchema),
    mode: 'onChange', // Validate form on input change
    // Default values are set via useEffect when the task prop is available
  });

  // Effect to populate form with task data when the modal opens or the task prop changes.
  // Since `task` is a required prop for this component when `isOpen` is true,
  // we can rely on `task` being defined here.
  useEffect(() => {
    if (isOpen) {
      setValue('title', task.title);
      setValue('description', task.description || ''); // Set to empty string if description is null/undefined
      const timer = setTimeout(() => {
        // Braces added to satisfy no-confusing-void-expression
        setFocus('title');
      }, 100); // Small delay for transition to complete
      return () => {
        clearTimeout(timer);
      }; // Cleanup timer on unmount or before effect re-runs
    }
  }, [isOpen, task, setValue, setFocus]); // `task` is a dependency for re-populating if it changes

  // Form submission handler
  // `handleSubmit` from react-hook-form correctly handles the async nature of `onSubmit`.
  // The `no-misused-promises` error for `handleSubmit(onSubmit)` is often an overly strict interpretation
  // by ESLint for this specific library pattern. Disabling for this line.
  const onSubmit: SubmitHandler<TaskEditFormData> = async (data) => {
    const updatePayload: TaskUpdatePayload = {
      title: data.title,
      description: data.description || null, // Send null if description is empty
    };

    try {
      // Assuming task.id is always present as per Task type when this modal is open
      const updatedTaskFromApi = await apiUpdateTask(task.id, updatePayload);
      dispatch({ type: 'UPDATE_TASK', payload: updatedTaskFromApi }); // Update global state
      onClose(); // Close modal on successful update
    } catch (error) {
      console.error('Failed to update task:', error);
      alert(`Failed to update task: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Custom handler for closing the modal (e.g., via backdrop click or cancel button)
  const handleCloseModal = () => {
    // Reset form to the current task's values when closing,
    // as `task` prop is guaranteed to be a valid Task object by the component's props.
    reset({
      title: task.title,
      description: task.description || '',
    });
    onClose();
  };

  return (
    // Headless UI Transition component for modal open/close animations
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-30" onClose={handleCloseModal}>
        {/* Modal Backdrop */}
        <TransitionChild // Use direct named import: TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm" />
        </TransitionChild>

        {/* Modal Panel Container */}
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            {/* Transition for the modal panel itself */}
            <TransitionChild // Use direct named import: TransitionChild
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              {/* Main modal panel */}
              <DialogPanel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-gray-800 p-6 text-left align-middle shadow-xl transition-all border border-gray-700">
                {' '}
                {/* Use direct named import: DialogPanel */}
                {/* Modal Title */}
                <DialogTitle // Use direct named import: DialogTitle
                  as="h3"
                  className="text-xl font-semibold leading-6 text-gray-100 mb-4"
                >
                  Edit Task
                </DialogTitle>
                {/* Form for editing a task */}
                {/* eslint-disable-next-line @typescript-eslint/no-misused-promises */}
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                  {/* Title Input Field */}
                  <div>
                    <label
                      htmlFor="edit-title"
                      className="block text-sm font-medium text-gray-300 mb-1"
                    >
                      Title <span className="text-red-400">*</span>
                    </label>
                    <input
                      id="edit-title" // Unique ID for accessibility
                      type="text"
                      {...register('title')}
                      className="mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-gray-200 shadow-sm focus:border-pink-500 focus:ring-pink-500 sm:text-sm p-2.5 placeholder-gray-500"
                      placeholder="e.g., Refine homepage design"
                    />
                    {errors.title && (
                      <p className="mt-1.5 text-xs text-red-400">{errors.title.message}</p>
                    )}
                  </div>

                  {/* Description Textarea Field */}
                  <div>
                    <label
                      htmlFor="edit-description"
                      className="block text-sm font-medium text-gray-300 mb-1"
                    >
                      Description (Optional)
                    </label>
                    <textarea
                      id="edit-description" // Unique ID for accessibility
                      {...register('description')}
                      rows={4}
                      className="mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-gray-200 shadow-sm focus:border-pink-500 focus:ring-pink-500 sm:text-sm p-2.5 placeholder-gray-500"
                      placeholder="e.g., Update color palette and typography..."
                    />
                    {errors.description && (
                      <p className="mt-1.5 text-xs text-red-400">{errors.description.message}</p>
                    )}
                  </div>

                  {/* Modal Action Buttons */}
                  <div className="mt-8 flex justify-end space-x-3 pt-2">
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="px-5 py-2.5 text-sm font-medium text-gray-300 bg-gray-600 hover:bg-gray-500 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-500 focus-visible:ring-offset-gray-900 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting || !isValid} // Disable button during submission or if form is invalid
                      className="px-5 py-2.5 text-sm font-medium text-white bg-pink-600 hover:bg-pink-700 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-pink-500 focus-visible:ring-offset-gray-900 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                    >
                      {isSubmitting ? 'Saving Changes...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              </DialogPanel>
            </TransitionChild>{' '}
            {/* Closing tag for the TransitionChild wrapping DialogPanel */}
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default EditTaskModal;

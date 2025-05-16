// tasky/frontend/src/components/AddTaskModal.tsx
import React, { Fragment, useEffect } from 'react';
// Ensure these are direct named imports for Headless UI v2+
import { Dialog, Transition, DialogPanel, DialogTitle, TransitionChild } from '@headlessui/react';
import { useForm } from 'react-hook-form';
import type { SubmitHandler } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useBoardDispatch } from '../context/BoardContext';
import { createTask as apiCreateTask } from '../services/api';
import type { TaskCreatePayload } from '../services/api';
import type { TaskStatus } from '../types';

// Zod schema for form validation
const taskFormSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be 100 characters or less'),
  description: z
    .string()
    .max(500, 'Description must be 500 characters or less')
    .optional()
    .nullable(),
});

// TypeScript type inferred from the Zod schema
type TaskFormData = z.infer<typeof taskFormSchema>;

// Props interface for the AddTaskModal component
interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultStatus: TaskStatus;
}

const AddTaskModal: React.FC<AddTaskModalProps> = ({ isOpen, onClose, defaultStatus }) => {
  const dispatch = useBoardDispatch();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isValid },
    setFocus,
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskFormSchema),
    mode: 'onChange', // Validate form on input change
    defaultValues: {
      // Default values for the form fields
      title: '',
      description: '',
    },
  });

  // Effect to focus the title input when the modal becomes open
  useEffect(() => {
    if (isOpen) {
      // Use a short timeout to ensure the element is focusable after the transition
      const timer = setTimeout(() => {
        // Braces added to satisfy no-confusing-void-expression
        setFocus('title');
      }, 100);
      return () => {
        clearTimeout(timer);
      }; // Cleanup the timer
    }
  }, [isOpen, setFocus]);

  // Form submission handler
  const onSubmit: SubmitHandler<TaskFormData> = async (data) => {
    const taskPayload: TaskCreatePayload = {
      title: data.title,
      description: data.description || null, // Send null if description is empty
      status: defaultStatus,
    };

    try {
      const newTaskFromApi = await apiCreateTask(taskPayload);
      dispatch({ type: 'ADD_TASK', payload: newTaskFromApi }); // Update global state
      reset(); // Reset form fields
      onClose(); // Close the modal
    } catch (error) {
      console.error('Failed to create task:', error);
      alert(`Failed to create task: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Custom handler for closing the modal (e.g., via backdrop click or cancel button)
  const handleCloseModal = () => {
    reset(); // Reset form fields on close
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
                  Add New Task to "{defaultStatus}"
                </DialogTitle>
                {/* The `no-misused-promises` rule for `handleSubmit(onSubmit)` is often a false positive
                  with react-hook-form, as the library is designed to handle async submit handlers.
                  If this is the only remaining error of this type and the code is functionally correct,
                  an eslint-disable comment can be used for this specific line.
                */}
                {/* eslint-disable-next-line @typescript-eslint/no-misused-promises */}
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                  {/* Title Input Field */}
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-1">
                      Title <span className="text-red-400">*</span>
                    </label>
                    <input
                      id="title"
                      type="text"
                      {...register('title')}
                      className="mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-gray-200 shadow-sm focus:border-pink-500 focus:ring-pink-500 sm:text-sm p-2.5 placeholder-gray-500"
                      placeholder="e.g., Design homepage"
                    />
                    {errors.title && (
                      <p className="mt-1.5 text-xs text-red-400">{errors.title.message}</p>
                    )}
                  </div>

                  {/* Description Textarea Field */}
                  <div>
                    <label
                      htmlFor="description"
                      className="block text-sm font-medium text-gray-300 mb-1"
                    >
                      Description (Optional)
                    </label>
                    <textarea
                      id="description"
                      {...register('description')}
                      rows={4}
                      className="mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-gray-200 shadow-sm focus:border-pink-500 focus:ring-pink-500 sm:text-sm p-2.5 placeholder-gray-500"
                      placeholder="e.g., Create wireframes, mockups, and final design..."
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
                      {isSubmitting ? 'Adding Task...' : 'Add Task'}
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

export default AddTaskModal;

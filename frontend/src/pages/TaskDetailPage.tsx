import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { tasksApi } from '../lib/api';
import { formatDate, getTaskStatusColor, getTaskPriorityColor, isOverdue } from '../lib/utils';
import LoadingSpinner from '../components/LoadingSpinner';
import TaskModal from '../components/TaskModal';
import { 
  Edit, 
  Trash2, 
  Calendar, 
  AlertTriangle,
  ArrowLeft,
  FileText
} from 'lucide-react';
import toast from 'react-hot-toast';

const TaskDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const { data, isLoading } = useQuery(
    ['task', id],
    () => tasksApi.getTask(id!),
    {
      enabled: !!id,
    }
  );

  const deleteMutation = useMutation(
    () => tasksApi.deleteTask(id!),
    {
      onSuccess: () => {
        toast.success('Task deleted successfully!');
        queryClient.invalidateQueries('tasks');
        navigate('/tasks');
      },
      onError: () => {
        toast.error('Failed to delete task');
      },
    }
  );

  const task = data?.task;

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center py-12">
          <h3 className="mt-2 text-sm font-medium text-gray-900">Task not found</h3>
          <p className="mt-1 text-sm text-gray-500">
            The task you're looking for doesn't exist or has been deleted.
          </p>
          <div className="mt-6">
            <button
              onClick={() => navigate('/tasks')}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Tasks
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this task? This action cannot be undone.')) {
      deleteMutation.mutate();
    }
  };

  const handleEditSuccess = () => {
    setIsEditModalOpen(false);
    queryClient.invalidateQueries(['task', id]);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center mb-4">
          <button
            onClick={() => navigate('/tasks')}
            className="mr-4 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Task Details</h1>
        </div>
      </div>

      {/* Task Details */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          {/* Title and Actions */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {task.title}
              </h2>
              <div className="flex items-center space-x-4">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTaskPriorityColor(
                    task.priority
                  )}`}
                >
                  {task.priority}
                </span>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getTaskStatusColor(
                    task.status
                  )}`}
                >
                  {task.status.replace('_', ' ')}
                </span>
                {task.dueDate && isOverdue(task.dueDate) && task.status !== 'COMPLETED' && (
                  <span className="inline-flex items-center text-red-600">
                    <AlertTriangle className="w-4 h-4 mr-1" />
                    Overdue
                  </span>
                )}
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Edit className="w-4 h-4 mr-1" />
                Edit
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteMutation.isLoading}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
              >
                {deleteMutation.isLoading ? (
                  <LoadingSpinner size="sm" className="mr-1" />
                ) : (
                  <Trash2 className="w-4 h-4 mr-1" />
                )}
                Delete
              </button>
            </div>
          </div>

          {/* Description */}
          {task.description && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Description</h3>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">
                {task.description}
              </p>
            </div>
          )}

          {/* Metadata */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 mb-6">
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-2">Created</h3>
              <p className="text-sm text-gray-700">{formatDate(task.createdAt)}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-2">Last Updated</h3>
              <p className="text-sm text-gray-700">{formatDate(task.updatedAt)}</p>
            </div>
            {task.dueDate && (
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  Due Date
                </h3>
                <p className="text-sm text-gray-700">{formatDate(task.dueDate)}</p>
              </div>
            )}
          </div>

          {/* Files */}
          {task.files && task.files.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                <FileText className="w-4 h-4 mr-1" />
                Attached Files ({task.files.length})
              </h3>
              <div className="space-y-2">
                {task.files.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-md"
                  >
                    <div className="flex items-center">
                      <FileText className="w-5 h-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {file.originalName}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatDate(file.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      <TaskModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={handleEditSuccess}
        task={task}
      />
    </div>
  );
};

export default TaskDetailPage;

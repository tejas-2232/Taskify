import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation } from 'react-query';
import { tasksApi, filesApi } from '../lib/api';
import { CreateTaskData, Task, TaskFile } from '../types';
import LoadingSpinner from './LoadingSpinner';
import { formatFileSize } from '../lib/utils';
import { 
  X, 
  Target, 
  Zap, 
  Upload, 
  FileText, 
  Trash2, 
  Paperclip,
  Image,
  File,
  Archive,
  Video,
  Music,
  Calendar,
  Clock
} from 'lucide-react';
import toast from 'react-hot-toast';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  task?: Task; // For editing
}

interface TaskFormData extends CreateTaskData {
  dueTime?: string; // Add time field
}

const TaskModal: React.FC<TaskModalProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess, 
  task 
}) => {
  const isEditing = !!task;
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<TaskFile[]>([]);
  const [isUploadingFiles, setIsUploadingFiles] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<TaskFormData>();

  // Watch the due date to show/hide time field
  const watchedDueDate = watch('dueDate');

  // Set form values when editing
  useEffect(() => {
    if (isEditing && task) {
      setValue('title', task.title);
      setValue('description', task.description || '');
      setValue('status', task.status);
      setValue('priority', task.priority);
      
      // Parse existing dueDate to separate date and time
      if (task.dueDate) {
        const dueDateTime = new Date(task.dueDate);
        const dateStr = dueDateTime.toISOString().split('T')[0];
        const timeStr = dueDateTime.toTimeString().slice(0, 5); // HH:MM format
        setValue('dueDate', dateStr);
        setValue('dueTime', timeStr);
      }
      
      setUploadedFiles(task.files || []);
    } else {
      reset();
      setUploadedFiles([]);
    }
    setSelectedFiles([]);
  }, [isEditing, task, setValue, reset]);

  // Get file icon based on type
  const getFileIcon = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'svg'].includes(ext || '')) return Image;
    if (['mp4', 'avi', 'mov', 'wmv'].includes(ext || '')) return Video;
    if (['mp3', 'wav', 'ogg'].includes(ext || '')) return Music;
    if (['zip', 'rar', '7z'].includes(ext || '')) return Archive;
    return File;
  };

  const createMutation = useMutation(
    async (data: TaskFormData) => {
      try {
        // Combine date and time if both are provided
        let dueDate: string | undefined;
        if (data.dueDate) {
          const dateTime = new Date(data.dueDate);
          if (data.dueTime) {
            const [hours, minutes] = data.dueTime.split(':');
            dateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
          }
          dueDate = dateTime.toISOString();
        }

        // Create task data without dueTime field
        const { dueTime, ...taskData } = data;
        const submitData: CreateTaskData = {
          ...taskData,
          dueDate,
        };

        console.log('Creating task with data:', submitData);

        // Create task first
        const taskResponse = await tasksApi.createTask(submitData);
        const createdTask = taskResponse.task;

        console.log('Task created successfully:', createdTask);

        // Upload files if any are selected
        if (selectedFiles.length > 0) {
          console.log('Uploading files:', selectedFiles.length);
          setIsUploadingFiles(true);
          
          try {
            const uploadPromises = selectedFiles.map(async (file, index) => {
              console.log(`Uploading file ${index + 1}/${selectedFiles.length}:`, file.name);
              try {
                const result = await filesApi.uploadFile(file, createdTask.id);
                console.log(`File ${index + 1} uploaded successfully:`, result);
                return result;
              } catch (error) {
                console.error(`Failed to upload file ${index + 1}:`, error);
                throw error;
              }
            });

            await Promise.all(uploadPromises);
            console.log('All files uploaded successfully');
          } catch (uploadError) {
            console.error('File upload error:', uploadError);
            toast.error('❌ Some files failed to upload. Task was created successfully.');
            throw uploadError;
          } finally {
            setIsUploadingFiles(false);
          }
        }

        return taskResponse;
      } catch (error) {
        console.error('Task creation error:', error);
        throw error;
      }
    },
    {
      onSuccess: () => {
        toast.success('🎉 Task created successfully with timeline! Time to get productive!');
        reset();
        setSelectedFiles([]);
        setUploadedFiles([]);
        onSuccess();
      },
      onError: (error: any) => {
        console.error('Create mutation error:', error);
        const message = error?.response?.data?.message || error?.message || 'Failed to create task';
        toast.error(`❌ ${message}`);
      },
    }
  );

  const updateMutation = useMutation(
    async (data: TaskFormData) => {
      try {
        // Combine date and time if both are provided
        let dueDate: string | undefined;
        if (data.dueDate) {
          const dateTime = new Date(data.dueDate);
          if (data.dueTime) {
            const [hours, minutes] = data.dueTime.split(':');
            dateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
          }
          dueDate = dateTime.toISOString();
        }

        // Create task data without dueTime field
        const { dueTime, ...taskData } = data;
        const submitData: CreateTaskData = {
          ...taskData,
          dueDate,
        };

        console.log('Updating task with data:', submitData);

        // Update task first
        const taskResponse = await tasksApi.updateTask(task!.id, submitData);

        console.log('Task updated successfully:', taskResponse);

        // Upload new files if any are selected
        if (selectedFiles.length > 0) {
          console.log('Uploading new files:', selectedFiles.length);
          setIsUploadingFiles(true);
          
          try {
            const uploadPromises = selectedFiles.map(async (file, index) => {
              console.log(`Uploading new file ${index + 1}/${selectedFiles.length}:`, file.name);
              try {
                const result = await filesApi.uploadFile(file, task!.id);
                console.log(`New file ${index + 1} uploaded successfully:`, result);
                return result;
              } catch (error) {
                console.error(`Failed to upload new file ${index + 1}:`, error);
                throw error;
              }
            });

            await Promise.all(uploadPromises);
            console.log('All new files uploaded successfully');
          } catch (uploadError) {
            console.error('New file upload error:', uploadError);
            toast.error('❌ Some new files failed to upload. Task was updated successfully.');
            throw uploadError;
          } finally {
            setIsUploadingFiles(false);
          }
        }

        return taskResponse;
      } catch (error) {
        console.error('Task update error:', error);
        throw error;
      }
    },
    {
      onSuccess: () => {
        toast.success('✨ Task updated successfully with new timeline! Keep up the great work!');
        setSelectedFiles([]);
        onSuccess();
      },
      onError: (error: any) => {
        console.error('Update mutation error:', error);
        const message = error?.response?.data?.message || error?.message || 'Failed to update task';
        toast.error(`❌ ${message}`);
      },
    }
  );

  const deleteFileMutation = useMutation(
    (fileId: string) => filesApi.deleteFile(fileId),
    {
      onSuccess: (_, fileId) => { // Get fileId from the second parameter
        toast.success('🗑️ File removed successfully!');
        // Refresh uploaded files list
        if (task) {
          setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
        }
      },
      onError: (error: any) => {
        console.error('File delete error:', error);
        toast.error('❌ Failed to delete file. Please try again.');
      },
    }
  );

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    console.log('Files selected:', files.map(f => f.name));
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const removeSelectedFile = (index: number) => {
    console.log('Removing selected file at index:', index);
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleDeleteUploadedFile = (fileId: string) => {
    if (window.confirm('🗑️ Are you sure you want to delete this file?')) {
      console.log('Deleting uploaded file:', fileId);
      deleteFileMutation.mutate(fileId);
    }
  };

  const onSubmit = async (data: TaskFormData) => {
    console.log('Form submitted with data:', data);
    console.log('Selected files:', selectedFiles.map(f => f.name));
    
    if (isEditing) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const isLoading = createMutation.isLoading || updateMutation.isLoading || isUploadingFiles;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
      <div className="relative w-full max-w-4xl bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 rounded-t-3xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-white/20 p-2 rounded-xl mr-3">
                <Target className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-2xl font-bold">
                  {isEditing ? 'Edit Your Task ✏️' : 'Create New Task 🚀'}
                </h3>
                <p className="text-purple-100 text-sm mt-1">
                  {isEditing ? 'Update your task details & timeline' : 'Let\'s plan something amazing with a perfect timeline!'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white hover:bg-white/20 p-2 rounded-xl transition-all duration-200"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Form */}
        <div className="p-8 overflow-y-auto max-h-[calc(90vh-120px)]">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-bold text-gray-700 mb-2">
                Task Title ✨
              </label>
              <input
                {...register('title', { required: 'Title is required' })}
                type="text"
                className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/80 backdrop-blur-sm transition-all duration-200 text-lg"
                placeholder="What awesome task are you planning? 🎯"
              />
              {errors.title && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <span className="mr-1">⚠️</span>
                  {errors.title.message}
                </p>
              )}
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-bold text-gray-700 mb-2">
                Description 📝
              </label>
              <textarea
                {...register('description')}
                rows={4}
                className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/80 backdrop-blur-sm transition-all duration-200 resize-none"
                placeholder="Tell us more about this task... (optional)"
              />
            </div>

            {/* Status and Priority */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="status" className="block text-sm font-bold text-gray-700 mb-2">
                  Status 📊
                </label>
                <select
                  {...register('status')}
                  className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/80 backdrop-blur-sm transition-all duration-200"
                >
                  <option value="PENDING">📅 Pending</option>
                  <option value="IN_PROGRESS">⚡ In Progress</option>
                  <option value="COMPLETED">✅ Completed</option>
                </select>
              </div>

              <div>
                <label htmlFor="priority" className="block text-sm font-bold text-gray-700 mb-2">
                  Priority 🎯
                </label>
                <select
                  {...register('priority')}
                  className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/80 backdrop-blur-sm transition-all duration-200"
                >
                  <option value="LOW">🟢 Low</option>
                  <option value="MEDIUM">🟡 Medium</option>
                  <option value="HIGH">🔴 High</option>
                </select>
              </div>
            </div>

            {/* Enhanced Due Date and Time Section */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-6 rounded-2xl border border-amber-200">
              <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-amber-600" />
                Schedule Your Task ⏰
              </h4>
              
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* Due Date */}
                <div>
                  <label htmlFor="dueDate" className="block text-sm font-bold text-gray-700 mb-2">
                    Due Date 📅
                  </label>
                  <input
                    {...register('dueDate')}
                    type="date"
                    className="w-full px-4 py-3 border-2 border-amber-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white/80 backdrop-blur-sm transition-all duration-200"
                  />
                </div>

                {/* Due Time */}
                <div>
                  <label htmlFor="dueTime" className="block text-sm font-bold text-gray-700 mb-2">
                    Due Time ⏰
                  </label>
                  <div className="relative">
                    <input
                      {...register('dueTime')}
                      type="time"
                      disabled={!watchedDueDate}
                      className="w-full px-4 py-3 border-2 border-amber-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white/80 backdrop-blur-sm transition-all duration-200 disabled:bg-gray-100 disabled:text-gray-400"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <Clock className={`w-4 h-4 ${watchedDueDate ? 'text-amber-500' : 'text-gray-400'}`} />
                    </div>
                  </div>
                  {!watchedDueDate && (
                    <p className="mt-1 text-xs text-gray-500">
                      Select a due date first to set a specific time ⏰
                    </p>
                  )}
                </div>
              </div>

              {/* Time Shortcuts */}
              {watchedDueDate && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Quick Time Shortcuts ⚡</p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { label: '🌅 9:00 AM', value: '09:00' },
                      { label: '🌞 12:00 PM', value: '12:00' },
                      { label: '🌇 3:00 PM', value: '15:00' },
                      { label: '🌆 6:00 PM', value: '18:00' },
                      { label: '🌙 9:00 PM', value: '21:00' },
                    ].map(({ label, value }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setValue('dueTime', value)}
                        className="px-3 py-1 text-xs font-medium text-amber-700 bg-amber-100 hover:bg-amber-200 rounded-lg transition-colors duration-200"
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* File Upload Section */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Attach Files 📎
              </label>
              
              {/* File Input */}
              <div className="border-2 border-dashed border-purple-300 rounded-xl p-6 text-center hover:border-purple-400 transition-colors duration-200 bg-purple-50/30">
                <input
                  type="file"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-upload"
                  accept="*/*"
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer flex flex-col items-center"
                >
                  <div className="bg-purple-100 p-3 rounded-xl mb-3">
                    <Upload className="w-8 h-8 text-purple-600" />
                  </div>
                  <p className="text-gray-700 font-medium mb-1">
                    Click to upload files or drag and drop
                  </p>
                  <p className="text-gray-500 text-sm">
                    Support for images, documents, videos, and more 🚀
                  </p>
                </label>
              </div>

              {/* Selected Files (New uploads) */}
              {selectedFiles.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center">
                    <Paperclip className="w-4 h-4 mr-2 text-purple-600" />
                    Files to Upload ({selectedFiles.length})
                  </h4>
                  <div className="space-y-2">
                    {selectedFiles.map((file, index) => {
                      const FileIcon = getFileIcon(file.name);
                      return (
                        <div key={index} className="flex items-center justify-between bg-blue-50 p-3 rounded-xl border border-blue-200">
                          <div className="flex items-center">
                            <div className="bg-blue-100 p-2 rounded-lg mr-3">
                              <FileIcon className="w-4 h-4 text-blue-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">{file.name}</p>
                              <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeSelectedFile(index)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-100 p-1 rounded-lg transition-colors duration-200"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Uploaded Files (Existing files for editing) */}
              {uploadedFiles.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center">
                    <FileText className="w-4 h-4 mr-2 text-green-600" />
                    Attached Files ({uploadedFiles.length})
                  </h4>
                  <div className="space-y-2">
                    {uploadedFiles.map((file) => {
                      const FileIcon = getFileIcon(file.originalName);
                      return (
                        <div key={file.id} className="flex items-center justify-between bg-green-50 p-3 rounded-xl border border-green-200">
                          <div className="flex items-center">
                            <div className="bg-green-100 p-2 rounded-lg mr-3">
                              <FileIcon className="w-4 h-4 text-green-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">{file.originalName}</p>
                              <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleDeleteUploadedFile(file.id)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-100 p-1 rounded-lg transition-colors duration-200"
                            disabled={deleteFileMutation.isLoading}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 border-2 border-gray-300 rounded-xl text-gray-700 font-medium bg-white hover:bg-gray-50 transition-all duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <LoadingSpinner size="sm" className="mr-3" />
                    {isUploadingFiles ? 'Uploading Files... 📎' : 
                     isEditing ? 'Updating Magic... ✨' : 'Creating Magic... 🚀'}
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Zap className="w-5 h-5 mr-2" />
                    {isEditing ? 'Update Task 🎯' : 'Create Task 🚀'}
                  </div>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TaskModal;

import axios, { AxiosResponse } from 'axios';
import toast from 'react-hot-toast';
import {
  User,
  Task,
  TaskFile,
  CreateTaskData,
  UpdateTaskData,
  LoginCredentials,
  RegisterData,
  AuthResponse,
  TaskStats,
} from '../types';

// Create axios instance
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error) => {
    const message = error.response?.data?.error || 'An unexpected error occurred';
    
    // Don't show toast for 401 errors (handled by auth context)
    if (error.response?.status !== 401) {
      toast.error(message);
    }
    
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    return response.data;
  },

  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/register', data);
    return response.data;
  },

  getCurrentUser: async (): Promise<{ user: User }> => {
    const response = await api.get<{ user: User }>('/auth/me');
    return response.data;
  },

  updateProfile: async (data: { name?: string }): Promise<{ user: User }> => {
    const response = await api.put<{ user: User }>('/auth/profile', data);
    return response.data;
  },
};

// Tasks API
export const tasksApi = {
  getTasks: async (params?: {
    status?: string;
    priority?: string;
    search?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: string;
  }): Promise<{
    tasks: Task[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }> => {
    // Filter out empty string parameters
    const cleanParams = Object.entries(params || {}).reduce((acc, [key, value]) => {
      if (value !== '' && value !== null && value !== undefined) {
        acc[key] = value;
      }
      return acc;
    }, {} as any);
    
    // Debug: Log API calls with search
    if (cleanParams.search) {
      console.log('🔧 API searching for:', cleanParams.search);
    }
    const response = await api.get('/tasks', { params: cleanParams });
    return response.data;
  },

  getTask: async (id: string): Promise<{ task: Task }> => {
    const response = await api.get<{ task: Task }>(`/tasks/${id}`);
    return response.data;
  },

  createTask: async (data: CreateTaskData): Promise<{ task: Task }> => {
    const response = await api.post<{ task: Task }>('/tasks', data);
    return response.data;
  },

  updateTask: async (id: string, data: UpdateTaskData): Promise<{ task: Task }> => {
    const response = await api.put<{ task: Task }>(`/tasks/${id}`, data);
    return response.data;
  },

  deleteTask: async (id: string): Promise<void> => {
    await api.delete(`/tasks/${id}`);
  },

  getStats: async (): Promise<{ stats: TaskStats }> => {
    const response = await api.get<{ stats: TaskStats }>('/tasks/stats/overview');
    return response.data;
  },
};

// Files API
export const filesApi = {
  uploadFile: async (file: File, taskId?: string): Promise<{ file: TaskFile }> => {
    const formData = new FormData();
    formData.append('file', file);
    
    const params = taskId ? { taskId } : {};
    const response = await api.post<{ file: TaskFile }>('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      params,
    });
    return response.data;
  },

  getFiles: async (taskId?: string): Promise<{ files: TaskFile[] }> => {
    // Handle React Query parameters - ignore them if they're not a string
    const actualTaskId = typeof taskId === 'string' ? taskId : undefined;
    const params = actualTaskId ? { taskId: actualTaskId } : {};
    const response = await api.get<{ files: TaskFile[] }>('/files', { params });
    return response.data;
  },

  getFile: async (id: string): Promise<{ file: TaskFile }> => {
    const response = await api.get<{ file: TaskFile }>(`/files/${id}`);
    return response.data;
  },

  downloadFile: async (id: string): Promise<{
    downloadUrl: string;
    filename: string;
    mimeType: string;
    size: number;
  }> => {
    const response = await api.get(`/files/${id}/download`);
    return response.data;
  },

  deleteFile: async (id: string): Promise<void> => {
    await api.delete(`/files/${id}`);
  },

  attachToTask: async (fileId: string, taskId: string): Promise<{ file: TaskFile }> => {
    const response = await api.put<{ file: TaskFile }>(`/files/${fileId}/attach/${taskId}`);
    return response.data;
  },

  detachFromTask: async (fileId: string): Promise<{ file: TaskFile }> => {
    const response = await api.put<{ file: TaskFile }>(`/files/${fileId}/detach`);
    return response.data;
  },
};

export default api;

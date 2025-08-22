import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { tasksApi } from '../lib/api';
import { formatDate, getTaskStatusColor, getTaskPriorityColor, isOverdue } from '../lib/utils';
import LoadingSpinner from '../components/LoadingSpinner';
import TaskModal from '../components/TaskModal';
import { 
  Plus, 
  Search, 
  Filter,
  Calendar,
  FileText,
  AlertTriangle,
  Target,
  Zap,
  CheckSquare,
  Clock,
  Star,
  Rocket,
  TrendingUp,
  Award
} from 'lucide-react';

const TasksPage: React.FC = () => {
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    search: '',
  });
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data, isLoading, refetch } = useQuery(
    ['tasks', filters, page],
    () => {
      const params = {
        ...filters,
        page,
        limit,
        sortBy: 'updatedAt',
        sortOrder: 'desc',
      };
      return tasksApi.getTasks(params);
    },
    {
      keepPreviousData: true,
    }
  );

  const tasks = data?.tasks || [];
  const pagination = data?.pagination;

  const handleTaskCreated = () => {
    setIsModalOpen(false);
    refetch();
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({ status: '', priority: '', search: '' });
    setPage(1);
  };

  // Get motivational message based on task count
  const getTaskMotivation = () => {
    if (tasks.length === 0) {
      return "Ready to build your task empire? 🏗️";
    }
    const completedCount = tasks.filter(t => t.status === 'COMPLETED').length;
    if (completedCount === tasks.length) {
      return "You're absolutely crushing it! 🏆";
    }
    if (completedCount > tasks.length / 2) {
      return "You're on fire! Keep the momentum! 🔥";
    }
    return "Let's tackle these goals together! 💪";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <LoadingSpinner size="lg" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Header */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 rounded-3xl p-8 text-white shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h1 className="text-3xl md:text-4xl font-bold mb-2 flex items-center">
                  <Target className="w-8 h-8 mr-3" />
                  Your Task Command Center 🎯
                </h1>
                <p className="text-xl text-purple-100 font-medium mb-1">
                  {getTaskMotivation()}
                </p>
                <p className="text-purple-200">
                  {tasks.length > 0 
                    ? `Managing ${tasks.length} tasks like a productivity champion!`
                    : "Ready to start your first mission? Every expert was once a beginner!"
                  }
                </p>
              </div>
              <div className="hidden md:block">
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="inline-flex items-center px-8 py-4 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white font-bold rounded-xl transition-all duration-200 hover:scale-105 text-lg"
                >
                  <Plus className="w-6 h-6 mr-3" />
                  Create New Task 🚀
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Filters Section */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900 flex items-center">
              <Filter className="w-5 h-5 mr-2 text-purple-600" />
              Smart Filters ✨
            </h3>
            <button
              onClick={clearFilters}
              className="text-sm text-purple-600 hover:text-purple-700 font-medium"
            >
              Clear All
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search your tasks... 🔍"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/80 backdrop-blur-sm"
              />
            </div>

            {/* Status Filter */}
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-4 py-3 border border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/80 backdrop-blur-sm"
            >
              <option value="">All Status 📋</option>
              <option value="PENDING">📅 Pending</option>
              <option value="IN_PROGRESS">⚡ In Progress</option>
              <option value="COMPLETED">✅ Completed</option>
            </select>

            {/* Priority Filter */}
            <select
              value={filters.priority}
              onChange={(e) => handleFilterChange('priority', e.target.value)}
              className="w-full px-4 py-3 border border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/80 backdrop-blur-sm"
            >
              <option value="">All Priority 🎯</option>
              <option value="LOW">🟢 Low</option>
              <option value="MEDIUM">🟡 Medium</option>
              <option value="HIGH">🔴 High</option>
            </select>

            {/* Mobile Create Button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsModalOpen(true)}
                className="w-full inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold rounded-xl shadow-lg transition-all duration-200"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create Task 🚀
              </button>
            </div>
          </div>
        </div>

        {/* Enhanced Tasks Grid */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50">
          <div className="p-6 border-b border-gray-200/50">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900 flex items-center">
                <CheckSquare className="w-5 h-5 mr-2 text-purple-600" />
                Your Tasks ({tasks.length})
              </h3>
              {tasks.length > 0 && (
                <div className="flex items-center space-x-3">
                  <div className="text-sm text-gray-600">
                    Showing {Math.min(pagination?.limit || 0, tasks.length)} of {pagination?.total || 0}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="p-6">
            {tasks.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Rocket className="w-12 h-12 text-purple-500" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  {filters.search || filters.status || filters.priority 
                    ? "No tasks match your filters 🔍" 
                    : "Ready to launch your productivity journey? 🚀"
                  }
                </h3>
                <p className="text-gray-600 mb-8 max-w-md mx-auto text-lg">
                  {filters.search || filters.status || filters.priority 
                    ? "Try adjusting your filters or create a new task to get started!"
                    : "Every successful student starts with their first task. Let's make it happen!"
                  }
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 text-lg"
                  >
                    <Plus className="w-6 h-6 mr-3" />
                    Create Your First Task 🎯
                  </button>
                  {(filters.search || filters.status || filters.priority) && (
                    <button
                      onClick={clearFilters}
                      className="inline-flex items-center px-8 py-4 border-2 border-purple-300 text-purple-700 font-bold rounded-xl bg-white/80 hover:bg-purple-50 transition-all duration-200"
                    >
                      Clear Filters
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {tasks.map((task) => (
                  <Link
                    key={task.id}
                    to={`/tasks/${task.id}`}
                    className="group block transform hover:scale-105 transition-all duration-200"
                  >
                    <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-6 hover:shadow-xl transition-all duration-200 border border-gray-100 group-hover:border-purple-200 relative overflow-hidden">
                      {/* Status Badge */}
                      <div className="absolute top-4 right-4">
                        {task.status === 'COMPLETED' ? (
                          <Award className="w-6 h-6 text-green-500" />
                        ) : task.status === 'IN_PROGRESS' ? (
                          <Zap className="w-6 h-6 text-purple-500" />
                        ) : (
                          <Clock className="w-6 h-6 text-amber-500" />
                        )}
                      </div>

                      <div className="flex items-start justify-between mb-4 pr-8">
                        <h4 className="font-bold text-gray-900 group-hover:text-purple-600 transition-colors duration-200 line-clamp-2 text-lg">
                          {task.title}
                        </h4>
                        {task.dueDate && isOverdue(task.dueDate) && task.status !== 'COMPLETED' && (
                          <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 ml-2 animate-pulse" />
                        )}
                      </div>
                      
                      {task.description && (
                        <p className="text-gray-600 mb-4 line-clamp-3 text-sm">
                          {task.description}
                        </p>
                      )}

                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-2">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${getTaskPriorityColor(task.priority)}`}
                          >
                            {task.priority === 'HIGH' ? '🔴' : task.priority === 'MEDIUM' ? '🟡' : '🟢'} {task.priority}
                          </span>
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${getTaskStatusColor(task.status)}`}
                          >
                            {task.status === 'COMPLETED' ? '✅' : task.status === 'IN_PROGRESS' ? '⚡' : '📅'} {task.status.replace('_', ' ')}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                        <div className="flex items-center text-xs text-gray-500">
                          <Calendar className="w-4 h-4 mr-1" />
                          {formatDate(task.updatedAt)}
                        </div>
                        {task.files && task.files.length > 0 && (
                          <div className="flex items-center text-xs text-purple-600 font-bold">
                            <FileText className="w-4 h-4 mr-1" />
                            {task.files.length} file{task.files.length !== 1 ? 's' : ''} 📎
                          </div>
                        )}
                      </div>

                      {/* Gradient overlay */}
                      <div className="absolute bottom-0 right-0 w-16 h-16 bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-tl-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* Enhanced Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200/50">
                <div className="text-sm text-gray-600">
                  Page {pagination.page} of {pagination.totalPages} • {pagination.total} total tasks 🎯
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                    className="px-4 py-2 text-sm font-medium text-purple-600 border border-purple-200 rounded-lg hover:bg-purple-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={page === pagination.totalPages}
                    className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Task Modal */}
        <TaskModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={handleTaskCreated}
        />
      </div>
    </div>
  );
};

export default TasksPage;

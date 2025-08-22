import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { tasksApi } from '../lib/api';
import { formatDate, getTaskStatusColor, getTaskPriorityColor, isOverdue } from '../lib/utils';
import LoadingSpinner from '../components/LoadingSpinner';
import TaskModal from '../components/TaskModal';
import { 
  CheckSquare, 
  Clock, 
  AlertTriangle, 
  CheckCircle,
  Plus,
  ArrowRight,
  Calendar,
  FileText,
  TrendingUp,
  Target,
  Zap,
  Star,
  Rocket,
  Coffee,
  BookOpen,
  Award
} from 'lucide-react';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  const { data: statsData, isLoading: statsLoading, refetch: refetchStats } = useQuery(
    'taskStats',
    tasksApi.getStats
  );

  const { data: recentTasksData, isLoading: tasksLoading, refetch: refetchTasks } = useQuery(
    'recentTasks',
    () => tasksApi.getTasks({ limit: 6, sortBy: 'updatedAt', sortOrder: 'desc' })
  );

  const stats = statsData?.stats;
  const recentTasks = recentTasksData?.tasks || [];

  const handleTaskCreated = () => {
    setIsTaskModalOpen(false);
    refetchStats();
    refetchTasks();
  };

  // Get user's first name or fallback
  const getFirstName = () => {
    if (user?.name) {
      return user.name.split(' ')[0];
    }
    return user?.email?.split('@')[0] || 'Student';
  };

  // Dynamic motivational messages for students
  const getMotivationalMessage = () => {
    const hour = new Date().getHours();
    const completedTasks = stats?.completed || 0;
    const totalTasks = stats?.total || 0;
    
    if (hour < 12) {
      return totalTasks > 0 ? "Let's crush today's goals! ☀️" : "Ready to make today awesome? 🌟";
    } else if (hour < 17) {
      return completedTasks > 0 ? "You're on fire! Keep it up! 🔥" : "Afternoon vibes - let's get productive! ⚡";
    } else {
      return "Evening grind time! You've got this! 🌙";
    }
  };

  // Fun emoji for different completion rates
  const getProgressEmoji = () => {
    const totalTasks = stats?.total || 0;
    const completedTasks = stats?.completed || 0;
    const rate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
    
    if (rate >= 80) return "🏆";
    if (rate >= 60) return "🔥";
    if (rate >= 40) return "⚡";
    if (rate >= 20) return "🚀";
    return "💪";
  };

  if (statsLoading || tasksLoading) {
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

  const statCards = [
    {
      name: 'Total Tasks',
      value: stats?.total || 0,
      icon: BookOpen,
      color: 'from-blue-500 to-purple-600',
      bgColor: 'bg-gradient-to-br from-blue-50 to-purple-50',
      textColor: 'text-blue-600',
      description: 'Tasks to conquer',
      emoji: '📚'
    },
    {
      name: 'Pending',
      value: stats?.pending || 0,
      icon: Clock,
      color: 'from-amber-500 to-orange-500',
      bgColor: 'bg-gradient-to-br from-amber-50 to-orange-50',
      textColor: 'text-amber-600',
      description: 'Ready to start',
      emoji: '⏰'
    },
    {
      name: 'In Progress',
      value: stats?.inProgress || 0,
      icon: Zap,
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-gradient-to-br from-purple-50 to-pink-50',
      textColor: 'text-purple-600',
      description: 'Getting done',
      emoji: '⚡'
    },
    {
      name: 'Completed',
      value: stats?.completed || 0,
      icon: Award,
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-gradient-to-br from-green-50 to-emerald-50',
      textColor: 'text-green-600',
      description: 'Victory lap!',
      emoji: '🏆'
    },
  ];

  // Calculate completion rate
  const totalTasks = stats?.total || 0;
  const completedTasks = stats?.completed || 0;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Welcome Section */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 rounded-3xl p-8 text-white shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center mb-2">
                  <h1 className="text-3xl md:text-4xl font-bold">
                    Welcome back, {getFirstName()}! 🎉
                  </h1>
                </div>
                <p className="text-xl md:text-2xl text-purple-100 font-medium mb-1">
                  {getMotivationalMessage()}
                </p>
                <p className="text-purple-200">
                  {totalTasks > 0 
                    ? `You've got ${totalTasks} tasks lined up. Let's make them happen!` 
                    : "Ready to start your productivity journey? Create your first task!"
                  }
                </p>
              </div>
              <div className="hidden md:block ml-8">
                <div className="relative">
                  <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <span className="text-4xl">{getProgressEmoji()}</span>
                  </div>
                  {totalTasks > 0 && (
                    <div className="absolute -bottom-2 -right-2 bg-white text-purple-600 rounded-full px-3 py-1 text-sm font-bold shadow-lg">
                      {completionRate}%
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Quick Action Buttons */}
            <div className="flex flex-wrap gap-3 mt-6">
              <button
                onClick={() => setIsTaskModalOpen(true)}
                className="inline-flex items-center px-6 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white font-medium rounded-xl transition-all duration-200 hover:scale-105"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add New Task
              </button>
              <Link
                to="/tasks"
                className="inline-flex items-center px-6 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white font-medium rounded-xl transition-all duration-200 hover:scale-105"
              >
                <Target className="w-5 h-5 mr-2" />
                View All Tasks
              </Link>
              {totalTasks > 0 && (
                <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm text-white rounded-xl">
                  <Coffee className="w-4 h-4 mr-2" />
                  <span className="text-sm">
                    {completionRate >= 50 ? "You're crushing it!" : "Keep going, you've got this!"}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Enhanced Stats Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          {statCards.map((stat) => (
            <div key={stat.name} className="group transform hover:scale-105 transition-all duration-200">
              <div className={`relative ${stat.bgColor} p-6 rounded-2xl shadow-lg border border-white/50 hover:shadow-xl`}>
                <div className="flex items-center justify-between mb-4">
                  <div className={`inline-flex p-3 rounded-xl bg-white/70 backdrop-blur-sm`}>
                    <stat.icon className={`w-6 h-6 ${stat.textColor}`} />
                  </div>
                  <span className="text-2xl">{stat.emoji}</span>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-700">{stat.name}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-xs text-gray-600">{stat.description}</p>
                </div>
                {/* Animated background element */}
                <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${stat.color} rounded-bl-full opacity-10 group-hover:opacity-20 transition-opacity duration-200`}></div>
              </div>
            </div>
          ))}
        </div>

        {/* Enhanced Recent Tasks */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50">
          <div className="p-6 border-b border-gray-200/50">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 flex items-center">
                  <Rocket className="w-6 h-6 mr-2 text-purple-600" />
                  Your Tasks
                </h3>
                <p className="text-gray-600 mt-1">Recent activity • Stay organized, stay winning! 🎯</p>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setIsTaskModalOpen(true)}
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  New Task
                </button>
                <Link
                  to="/tasks"
                  className="inline-flex items-center px-6 py-3 border-2 border-purple-200 text-purple-700 font-medium rounded-xl bg-white hover:bg-purple-50 transition-all duration-200"
                >
                  View All
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </div>
            </div>
          </div>

          <div className="p-6">
            {recentTasks.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Star className="w-12 h-12 text-purple-500" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Ready to start your journey? 🚀</h3>
                <p className="text-gray-600 mb-8 max-w-md mx-auto text-lg">
                  Every great student starts with their first task. Let's create something amazing together!
                </p>
                <button
                  onClick={() => setIsTaskModalOpen(true)}
                  className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 text-lg"
                >
                  <Plus className="w-6 h-6 mr-3" />
                  Create Your First Task 🎯
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h4 className="text-lg font-semibold text-gray-900">
                    Latest Updates {recentTasks.length > 0 && `(${recentTasks.length})`}
                  </h4>
                  {completedTasks > 0 && (
                    <div className="flex items-center px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      {completedTasks} completed today!
                    </div>
                  )}
                </div>
                
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {recentTasks.map((task, index) => (
                    <Link
                      key={task.id}
                      to={`/tasks/${task.id}`}
                      className="group block transform hover:scale-105 transition-all duration-200"
                    >
                      <div className="bg-white rounded-xl p-5 hover:shadow-lg transition-all duration-200 border border-gray-100 group-hover:border-purple-200">
                        <div className="flex items-start justify-between mb-3">
                          <h4 className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors duration-200 line-clamp-2 text-lg">
                            {task.title}
                          </h4>
                          {task.dueDate && isOverdue(task.dueDate) && task.status !== 'COMPLETED' && (
                            <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 ml-2" />
                          )}
                        </div>
                        
                        {task.description && (
                          <p className="text-gray-600 mb-4 line-clamp-2 text-sm">
                            {task.description}
                          </p>
                        )}

                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-semibold ${getTaskPriorityColor(task.priority)}`}
                            >
                              {task.priority}
                            </span>
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-semibold ${getTaskStatusColor(task.status)}`}
                            >
                              {task.status === 'COMPLETED' ? '✅' : task.status === 'IN_PROGRESS' ? '🔄' : '📋'} {task.status.replace('_', ' ')}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                          <div className="flex items-center text-xs text-gray-500">
                            <Calendar className="w-3 h-3 mr-1" />
                            {formatDate(task.updatedAt)}
                          </div>
                          {task.files && task.files.length > 0 && (
                            <div className="flex items-center text-xs text-purple-600 font-medium">
                              <FileText className="w-3 h-3 mr-1" />
                              {task.files.length} file{task.files.length !== 1 ? 's' : ''}
                            </div>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Task Modal */}
        <TaskModal
          isOpen={isTaskModalOpen}
          onClose={() => setIsTaskModalOpen(false)}
          onSuccess={handleTaskCreated}
        />
      </div>
    </div>
  );
};

export default DashboardPage;

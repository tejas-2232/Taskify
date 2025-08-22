import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  LayoutDashboard, 
  CheckSquare, 
  FileText, 
  User, 
  LogOut,
  Menu,
  X,
  Star,
  Zap,
  Rocket
} from 'lucide-react';
import { cn } from '../lib/utils';

const Layout: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  const navigation = [
    { 
      name: 'Dashboard', 
      href: '/dashboard', 
      icon: LayoutDashboard,
      color: 'from-purple-500 to-purple-600',
      hoverColor: 'hover:from-purple-600 hover:to-purple-700',
      emoji: '🏠'
    },
    { 
      name: 'Tasks', 
      href: '/tasks', 
      icon: CheckSquare,
      color: 'from-blue-500 to-blue-600',
      hoverColor: 'hover:from-blue-600 hover:to-blue-700',
      emoji: '🎯'
    },
    { 
      name: 'Files', 
      href: '/files', 
      icon: FileText,
      color: 'from-green-500 to-green-600',
      hoverColor: 'hover:from-green-600 hover:to-green-700',
      emoji: '📁'
    },
    { 
      name: 'Profile', 
      href: '/profile', 
      icon: User,
      color: 'from-orange-500 to-orange-600',
      hoverColor: 'hover:from-orange-600 hover:to-orange-700',
      emoji: '👤'
    },
  ];

  const handleLogout = () => {
    logout();
  };

  // Get user's first name for display
  const getFirstName = () => {
    if (user?.name) {
      return user.name.split(' ')[0];
    }
    return user?.email?.split('@')[0] || 'Student';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-72 bg-gradient-to-b from-white via-purple-50/30 to-blue-50/50 backdrop-blur-sm shadow-2xl border-r border-white/20 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between h-20 px-6 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 text-white shadow-lg">
          <div className="flex items-center">
            <div className="bg-white/20 p-2 rounded-xl mr-3 backdrop-blur-sm">
              <Rocket className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Task Manager</h1>
              <p className="text-xs text-purple-100">Stay Productive! 🚀</p>
            </div>
          </div>
          <button
            className="lg:hidden text-white/80 hover:text-white hover:bg-white/20 p-2 rounded-xl transition-all duration-200"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Welcome Message */}
        <div className="px-6 py-4 bg-gradient-to-r from-purple-100/50 to-blue-100/50 border-b border-white/20">
          <div className="flex items-center">
            <div className="bg-gradient-to-r from-purple-500 to-blue-500 w-3 h-3 rounded-full mr-3 animate-pulse"></div>
            <p className="text-sm font-medium text-gray-700">
              Welcome back, <span className="font-bold text-purple-600">{getFirstName()}</span>! 🌟
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="mt-6 px-4">
          <div className="space-y-3">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    'group flex items-center px-4 py-4 text-sm font-bold rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg relative overflow-hidden',
                    isActive
                      ? `bg-gradient-to-r ${item.color} text-white shadow-lg scale-105`
                      : `text-gray-700 hover:text-white bg-white/60 hover:bg-gradient-to-r ${item.color} ${item.hoverColor} backdrop-blur-sm border border-white/40 hover:border-transparent`
                  )}
                  onClick={() => setSidebarOpen(false)}
                >
                  {/* Background decoration */}
                  <div className={cn(
                    'absolute top-0 right-0 w-16 h-16 rounded-bl-full opacity-20 transition-opacity duration-300',
                    isActive ? 'bg-white/30' : 'bg-transparent group-hover:bg-white/20'
                  )}></div>
                  
                  <div className={cn(
                    'flex items-center justify-center w-10 h-10 rounded-xl mr-4 transition-all duration-300',
                    isActive 
                      ? 'bg-white/20 backdrop-blur-sm' 
                      : 'bg-gray-100 group-hover:bg-white/20'
                  )}>
                    <item.icon
                      className={cn(
                        'w-5 h-5 transition-all duration-300',
                        isActive ? 'text-white' : 'text-gray-600 group-hover:text-white'
                      )}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-base">{item.name}</span>
                      <span className="text-lg">{item.emoji}</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Motivational Quote */}
        <div className="mx-4 mt-8 p-4 bg-gradient-to-r from-amber-100/80 to-orange-100/80 rounded-2xl border border-amber-200/50 backdrop-blur-sm">
          <div className="text-center">
            <Star className="w-6 h-6 text-amber-500 mx-auto mb-2" />
            <p className="text-xs font-medium text-gray-700 leading-relaxed">
              "Success is not final, failure is not fatal: it is the courage to continue that counts."
            </p>
            <p className="text-xs text-amber-600 font-bold mt-2">Keep going! 💪</p>
          </div>
        </div>

        {/* User info and logout */}
        <div className="absolute bottom-0 w-full p-4">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-white/40 shadow-lg">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-white text-sm font-bold">
                    {user?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="ml-3 flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-900 truncate">
                  {user?.name || 'User'} 🎓
                </p>
                <p className="text-xs text-gray-600 truncate">{user?.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="ml-2 p-2 text-gray-500 hover:text-white hover:bg-gradient-to-r hover:from-red-500 hover:to-red-600 rounded-xl transition-all duration-200 hover:shadow-lg"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
            
            {/* Quick Stats */}
            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="flex items-center justify-center">
                <div className="flex items-center text-xs text-gray-600">
                  <Zap className="w-3 h-3 mr-1 text-amber-500" />
                  <span className="font-medium">Productivity Mode ON!</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <div className="lg:hidden bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 shadow-lg">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <button
                className="text-white/80 hover:text-white hover:bg-white/20 p-2 rounded-xl transition-all duration-200"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="w-6 h-6" />
              </button>
              <div className="flex items-center">
                <Rocket className="w-5 h-5 text-white mr-2" />
                <h1 className="text-lg font-bold text-white">Task Manager</h1>
              </div>
              <div className="w-10" /> {/* Spacer */}
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="py-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;

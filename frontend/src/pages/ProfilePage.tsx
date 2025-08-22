import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  User, 
  Mail, 
  Calendar, 
  Edit, 
  Save, 
  X,
  Award,
  Star,
  Zap,
  Target,
  TrendingUp,
  Shield
} from 'lucide-react';
import { formatDate } from '../lib/utils';

const ProfilePage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      name: user?.name || '',
    },
  });

  const onSubmit = async (data: { name: string }) => {
    setIsLoading(true);
    try {
      await updateUser(data);
      setIsEditing(false);
    } catch (error) {
      // Error handled by auth context
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    reset({ name: user?.name || '' });
    setIsEditing(false);
  };

  // Get user's first name for motivation
  const getFirstName = () => {
    if (user?.name) {
      return user.name.split(' ')[0];
    }
    return user?.email?.split('@')[0] || 'Student';
  };

  // Calculate days since joining
  const getDaysSinceJoining = () => {
    if (!user?.createdAt) return 0;
    const joinDate = new Date(user.createdAt);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - joinDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getProfileMotivation = () => {
    const days = getDaysSinceJoining();
    if (days === 0) return "Welcome to your productivity journey! 🎉";
    if (days < 7) return "You're just getting started - amazing! 🌟";
    if (days < 30) return "Look at you building great habits! 🚀";
    return "You're a productivity champion! 🏆";
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <LoadingSpinner size="lg" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Header */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 rounded-3xl p-8 text-white shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h1 className="text-3xl md:text-4xl font-bold mb-2 flex items-center">
                  <User className="w-8 h-8 mr-3" />
                  Hey there, {getFirstName()}! 👋
                </h1>
                <p className="text-xl text-purple-100 font-medium mb-1">
                  {getProfileMotivation()}
                </p>
                <p className="text-purple-200">
                  {getDaysSinceJoining() > 0 
                    ? `${getDaysSinceJoining()} days of awesome productivity!`
                    : "Your productivity journey starts today!"
                  }
                </p>
              </div>
              <div className="hidden md:block">
                <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <span className="text-4xl">🎓</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-2xl shadow-lg border border-white/50">
            <div className="flex items-center justify-between">
              <div>
                <div className="bg-blue-100 p-3 rounded-xl mb-3 inline-block">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
                <p className="text-sm font-medium text-gray-700">Member Since</p>
                <p className="text-2xl font-bold text-gray-900">{getDaysSinceJoining()}</p>
                <p className="text-xs text-gray-600">days ago 📅</p>
              </div>
              <span className="text-2xl">🗓️</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-2xl shadow-lg border border-white/50">
            <div className="flex items-center justify-between">
              <div>
                <div className="bg-purple-100 p-3 rounded-xl mb-3 inline-block">
                  <Shield className="w-6 h-6 text-purple-600" />
                </div>
                <p className="text-sm font-medium text-gray-700">Account Status</p>
                <p className="text-2xl font-bold text-gray-900">Active</p>
                <p className="text-xs text-gray-600">verified ✅</p>
              </div>
              <span className="text-2xl">🛡️</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-2xl shadow-lg border border-white/50">
            <div className="flex items-center justify-between">
              <div>
                <div className="bg-green-100 p-3 rounded-xl mb-3 inline-block">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
                <p className="text-sm font-medium text-gray-700">Progress Level</p>
                <p className="text-2xl font-bold text-gray-900">Rising</p>
                <p className="text-xs text-gray-600">keep it up! 🚀</p>
              </div>
              <span className="text-2xl">📈</span>
            </div>
          </div>
        </div>

        {/* Profile Information */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50">
          <div className="p-6 border-b border-gray-200/50">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold text-gray-900 flex items-center">
                <Star className="w-6 h-6 mr-2 text-purple-600" />
                Your Profile ✨
              </h3>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Profile
                </button>
              )}
            </div>
          </div>

          <div className="p-8">
            {isEditing ? (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Display Name 🏷️
                  </label>
                  <input
                    type="text"
                    {...register('name', { required: 'Name is required' })}
                    className="w-full px-4 py-3 border border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/80 backdrop-blur-sm text-lg"
                    placeholder="Enter your awesome name..."
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                  )}
                </div>

                <div className="flex space-x-4">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {isLoading ? (
                      <>
                        <LoadingSpinner size="sm" className="mr-2" />
                        Saving Magic... ✨
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5 mr-2" />
                        Save Changes 🎯
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="inline-flex items-center px-6 py-3 border-2 border-gray-300 text-gray-700 font-bold rounded-xl bg-white hover:bg-gray-50 transition-colors duration-200"
                  >
                    <X className="w-5 h-5 mr-2" />
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Name */}
                  <div className="bg-gradient-to-br from-purple-50 to-blue-50 p-6 rounded-xl border border-purple-100">
                    <div className="flex items-center mb-3">
                      <div className="bg-purple-100 p-2 rounded-lg mr-3">
                        <User className="w-5 h-5 text-purple-600" />
                      </div>
                      <h4 className="font-bold text-gray-900">Display Name</h4>
                    </div>
                    <p className="text-xl font-semibold text-gray-900">
                      {user.name || 'Not set'} {user.name && '🎓'}
                    </p>
                  </div>

                  {/* Email */}
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100">
                    <div className="flex items-center mb-3">
                      <div className="bg-blue-100 p-2 rounded-lg mr-3">
                        <Mail className="w-5 h-5 text-blue-600" />
                      </div>
                      <h4 className="font-bold text-gray-900">Email Address</h4>
                    </div>
                    <p className="text-xl font-semibold text-gray-900">
                      {user.email} 📧
                    </p>
                  </div>

                  {/* Join Date */}
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border border-green-100">
                    <div className="flex items-center mb-3">
                      <div className="bg-green-100 p-2 rounded-lg mr-3">
                        <Calendar className="w-5 h-5 text-green-600" />
                      </div>
                      <h4 className="font-bold text-gray-900">Member Since</h4>
                    </div>
                    <p className="text-xl font-semibold text-gray-900">
                      {formatDate(user.createdAt)} 🎉
                    </p>
                  </div>

                  {/* Achievement Badge */}
                  <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-6 rounded-xl border border-amber-100">
                    <div className="flex items-center mb-3">
                      <div className="bg-amber-100 p-2 rounded-lg mr-3">
                        <Award className="w-5 h-5 text-amber-600" />
                      </div>
                      <h4 className="font-bold text-gray-900">Achievement</h4>
                    </div>
                    <p className="text-xl font-semibold text-gray-900">
                      {getDaysSinceJoining() >= 30 ? 'Productivity Master 🏆' : 
                       getDaysSinceJoining() >= 7 ? 'Rising Star ⭐' : 
                       'New Explorer 🚀'}
                    </p>
                  </div>
                </div>

                {/* Motivational Quote */}
                <div className="bg-gradient-to-r from-purple-100 to-blue-100 p-8 rounded-2xl border border-purple-200 text-center">
                  <div className="text-4xl mb-4">🌟</div>
                  <blockquote className="text-xl font-semibold text-gray-900 mb-4">
                    "Success is not final, failure is not fatal: it is the courage to continue that counts."
                  </blockquote>
                  <p className="text-purple-600 font-medium">
                    Keep being awesome, {getFirstName()}! 💪
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;

/**
 * User Login Component
 * Beautiful login form with glassmorphism effect and gradient background
 */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, User, Lock, AlertCircle, Loader2, ChevronDown } from 'lucide-react';
import { useUserAuth } from '../../../context/UserAuthContext';
import { validateLoginForm } from '../../../utils/validation';
import { SUCCESS_MESSAGES, ERROR_MESSAGES, ROUTES } from '../../../utils/constants';

const UserLogin = () => {
  const navigate = useNavigate();
  const { login, loading: authLoading } = useUserAuth();

  const [formData, setFormData] = useState({
    username: '',
    password: '',
    rememberMe: false,
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [notification, setNotification] = useState({ type: '', message: '' });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification({ type: '', message: '' });
    }, 5000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Convert username to email for validation (assuming username can be email)
    const validation = validateLoginForm({
      email: formData.username.includes('@') ? formData.username : `${formData.username}@example.com`,
      password: formData.password,
    });

    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    try {
      setSubmitLoading(true);
      setErrors({});

      // Use username as email or convert appropriately
      await login({
        email: formData.username.includes('@') ? formData.username : formData.username,
        password: formData.password,
      });

      if (formData.rememberMe) {
        localStorage.setItem('remember_me', 'true');
      }

      showNotification('success', SUCCESS_MESSAGES.LOGIN_SUCCESS);

      setTimeout(() => {
        navigate(ROUTES.USER_DASHBOARD);
      }, 1000);
    } catch (error) {
      showNotification('error', error.message || ERROR_MESSAGES.INVALID_CREDENTIALS);
      setErrors({
        submit: error.message || ERROR_MESSAGES.INVALID_CREDENTIALS,
      });
    } finally {
      setSubmitLoading(false);
    }
  };

  const isLoading = submitLoading || authLoading;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 via-indigo-700 to-purple-900 p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Stars */}
        <div className="absolute top-20 left-20 w-2 h-2 bg-white rounded-full opacity-60 animate-pulse"></div>
        <div className="absolute top-40 right-32 w-1.5 h-1.5 bg-white rounded-full opacity-40 animate-pulse [animation-delay:1s]"></div>
        <div className="absolute top-60 left-1/3 w-1 h-1 bg-white rounded-full opacity-50 animate-pulse [animation-delay:2s]"></div>
        <div className="absolute top-32 right-1/4 w-2 h-2 bg-white rounded-full opacity-70 animate-pulse [animation-delay:0.5s]"></div>
        <div className="absolute bottom-40 left-1/4 w-1.5 h-1.5 bg-white rounded-full opacity-50 animate-pulse [animation-delay:1.5s]"></div>
        <div className="absolute bottom-60 right-20 w-1 h-1 bg-white rounded-full opacity-60 animate-pulse [animation-delay:2.5s]"></div>

        {/* Mountains Silhouette */}
        <div className="absolute bottom-0 left-0 right-0 h-64">
          <div className="absolute bottom-0 left-0 w-0 h-0 border-l-[200px] border-l-transparent border-b-[150px] border-b-purple-800/30"></div>
          <div className="absolute bottom-0 left-32 w-0 h-0 border-l-[180px] border-l-transparent border-b-[180px] border-b-indigo-800/40"></div>
          <div className="absolute bottom-0 right-32 w-0 h-0 border-l-[160px] border-l-transparent border-b-[140px] border-b-purple-800/30"></div>
          <div className="absolute bottom-0 right-0 w-0 h-0 border-l-[220px] border-l-transparent border-b-[160px] border-b-indigo-800/40"></div>
        </div>

        {/* Clouds */}
        <div className="absolute top-32 left-10 w-32 h-20 bg-gradient-to-br from-blue-200/20 to-purple-200/20 rounded-full blur-xl"></div>
        <div className="absolute top-48 right-20 w-40 h-24 bg-gradient-to-br from-indigo-200/20 to-purple-200/20 rounded-full blur-xl"></div>
        <div className="absolute bottom-32 left-1/3 w-36 h-22 bg-gradient-to-br from-purple-200/20 to-blue-200/20 rounded-full blur-xl"></div>
      </div>

      {/* Login Card */}
      <div className="relative w-full max-w-md z-10">
        {/* Notification */}
        {notification.message && (
          <div
            className={`mb-4 p-4 rounded-lg flex items-center gap-2 animate-slide-down ${
              notification.type === 'success'
                ? 'bg-green-500/20 text-green-200 border border-green-400/50'
                : 'bg-red-500/20 text-red-200 border border-red-400/50'
            }`}
          >
            <AlertCircle className="w-5 h-5" />
            <span className="text-sm font-medium">{notification.message}</span>
          </div>
        )}

        <div className="bg-black/40 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/10">
          {/* Chevron Down Icon */}
          <div className="flex justify-center mb-4">
            <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
              <ChevronDown className="w-6 h-6 text-white/80" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-white text-center mb-8 tracking-wide">
            USER LOGIN
          </h1>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username Field */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-white/80 mb-2">
                USERNAME
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-3 py-3 border rounded-lg bg-gray-800/50 backdrop-blur-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all ${
                    errors.email || errors.username
                      ? 'border-red-400 focus:ring-red-400'
                      : 'border-gray-600/50'
                  }`}
                  placeholder="Enter your username"
                  disabled={isLoading}
                />
              </div>
              {(errors.email || errors.username) && (
                <p className="mt-1 text-sm text-red-300 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.email || errors.username}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-white/80 mb-2">
                PASSWORD
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-10 py-3 border rounded-lg bg-gray-800/50 backdrop-blur-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all ${
                    errors.password
                      ? 'border-red-400 focus:ring-red-400'
                      : 'border-gray-600/50'
                  }`}
                  placeholder="Enter your password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white transition-colors"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-300 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.password}
                </p>
              )}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600 bg-gray-800/50 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                  disabled={isLoading}
                />
                <span className="ml-2 text-sm text-white/80">Keep me logged in</span>
              </label>
              <Link
                to="#"
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                Forgot Password?
              </Link>
            </div>

            {/* Submit Error */}
            {errors.submit && (
              <div className="p-3 bg-red-500/20 border border-red-400/50 rounded-lg">
                <p className="text-sm text-red-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  {errors.submit}
                </p>
              </div>
            )}

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-4 rounded-lg font-semibold uppercase tracking-wide hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-transparent transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2 shadow-lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>LOGGING IN...</span>
                </>
              ) : (
                'LOGIN'
              )}
            </button>
          </form>

          {/* Signup Link */}
          <div className="mt-6 text-center">
            <p className="text-white/60 text-sm">
              Don't have an account?{' '}
              <Link
                to={ROUTES.USER_SIGNUP}
                className="text-white font-semibold hover:text-white/80 transition-colors underline"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserLogin;

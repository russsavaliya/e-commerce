/**
 * User Signup Component
 * Beautiful signup form with glassmorphism effect and gradient background
 */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Phone,
  AlertCircle,
  Loader2,
  CheckCircle2,
  ChevronDown,
} from 'lucide-react';
import { useUserAuth } from '../../../context/UserAuthContext';
import { validateSignupForm, validatePassword } from '../../../utils/validation';
import { SUCCESS_MESSAGES, ERROR_MESSAGES, ROUTES, PASSWORD_STRENGTH } from '../../../utils/constants';

const UserSignup = () => {
  const navigate = useNavigate();
  const { signup, loading: authLoading } = useUserAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    terms: false,
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [notification, setNotification] = useState({ type: '', message: '' });
  const [passwordStrength, setPasswordStrength] = useState(null);

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

    if (name === 'password') {
      const validation = validatePassword(value);
      setPasswordStrength(validation.strength);
    } else if (name === 'password' && value === '') {
      setPasswordStrength(null);
    }
  };

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification({ type: '', message: '' });
    }, 5000);
  };

  const getPasswordStrengthColor = () => {
    if (!passwordStrength) return '';
    switch (passwordStrength) {
      case PASSWORD_STRENGTH.WEAK:
        return 'bg-red-500';
      case PASSWORD_STRENGTH.MEDIUM:
        return 'bg-yellow-500';
      case PASSWORD_STRENGTH.STRONG:
        return 'bg-green-500';
      default:
        return '';
    }
  };

  const getPasswordStrengthText = () => {
    if (!passwordStrength) return '';
    switch (passwordStrength) {
      case PASSWORD_STRENGTH.WEAK:
        return 'Weak';
      case PASSWORD_STRENGTH.MEDIUM:
        return 'Medium';
      case PASSWORD_STRENGTH.STRONG:
        return 'Strong';
      default:
        return '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validation = validateSignupForm(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    try {
      setSubmitLoading(true);
      setErrors({});

      await signup({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || undefined,
        password: formData.password,
      });

      showNotification('success', SUCCESS_MESSAGES.SIGNUP_SUCCESS);

      setTimeout(() => {
        navigate(ROUTES.USER_LOGIN);
      }, 2000);
    } catch (error) {
      showNotification('error', error.message || ERROR_MESSAGES.UNKNOWN_ERROR);
      setErrors({
        submit: error.message || ERROR_MESSAGES.UNKNOWN_ERROR,
      });
    } finally {
      setSubmitLoading(false);
    }
  };

  const isLoading = submitLoading || authLoading;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 via-indigo-700 to-purple-900 p-4 py-8 relative overflow-hidden">
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

      {/* Signup Card */}
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
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
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
            USER SIGNUP
          </h1>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name Field */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-white/80 mb-2">
                FULL NAME
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-3 py-3 border rounded-lg bg-gray-800/50 backdrop-blur-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all ${
                    errors.name
                      ? 'border-red-400 focus:ring-red-400'
                      : 'border-gray-600/50'
                  }`}
                  placeholder="John Doe"
                  disabled={isLoading}
                />
              </div>
              {errors.name && (
                <p className="mt-1 text-sm text-red-300 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.name}
                </p>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-white/80 mb-2">
                EMAIL ADDRESS
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-3 py-3 border rounded-lg bg-gray-800/50 backdrop-blur-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all ${
                    errors.email
                      ? 'border-red-400 focus:ring-red-400'
                      : 'border-gray-600/50'
                  }`}
                  placeholder="user@example.com"
                  disabled={isLoading}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-300 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.email}
                </p>
              )}
            </div>

            {/* Phone Field */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-white/80 mb-2">
                PHONE NUMBER <span className="text-gray-400">(Optional)</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-3 py-3 border rounded-lg bg-gray-800/50 backdrop-blur-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all ${
                    errors.phone
                      ? 'border-red-400 focus:ring-red-400'
                      : 'border-gray-600/50'
                  }`}
                  placeholder="9876543210"
                  maxLength="10"
                  disabled={isLoading}
                />
              </div>
              {errors.phone && (
                <p className="mt-1 text-sm text-red-300 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.phone}
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
                  placeholder="Create a strong password"
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
              {/* Password Strength Indicator */}
              {formData.password && passwordStrength && (
                <div className="mt-2">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                        style={{
                          width:
                            passwordStrength === PASSWORD_STRENGTH.WEAK
                              ? '33%'
                              : passwordStrength === PASSWORD_STRENGTH.MEDIUM
                              ? '66%'
                              : '100%',
                        }}
                      ></div>
                    </div>
                    <span
                      className={`text-xs font-medium ${
                        passwordStrength === PASSWORD_STRENGTH.WEAK
                          ? 'text-red-300'
                          : passwordStrength === PASSWORD_STRENGTH.MEDIUM
                          ? 'text-yellow-300'
                          : 'text-green-300'
                      }`}
                    >
                      {getPasswordStrengthText()}
                    </span>
                  </div>
                </div>
              )}
              {errors.password && (
                <p className="mt-1 text-sm text-red-300 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.password}
                </p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-white/80 mb-2">
                CONFIRM PASSWORD
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-10 py-3 border rounded-lg bg-gray-800/50 backdrop-blur-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all ${
                    errors.confirmPassword
                      ? 'border-red-400 focus:ring-red-400'
                      : 'border-gray-600/50'
                  }`}
                  placeholder="Confirm your password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white transition-colors"
                  disabled={isLoading}
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-300 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* Terms & Conditions */}
            <div>
              <label className="flex items-start">
                <input
                  type="checkbox"
                  name="terms"
                  checked={formData.terms}
                  onChange={handleChange}
                  className="mt-1 w-4 h-4 text-blue-600 bg-gray-800/50 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                  disabled={isLoading}
                />
                <span className="ml-2 text-sm text-white/80">
                  I agree to the{' '}
                  <Link to="#" className="text-blue-400 hover:text-blue-300 underline">
                    Terms & Conditions
                  </Link>
                </span>
              </label>
              {errors.terms && (
                <p className="mt-1 text-sm text-red-300 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.terms}
                </p>
              )}
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

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-4 rounded-lg font-semibold uppercase tracking-wide hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-transparent transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2 shadow-lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>CREATING ACCOUNT...</span>
                </>
              ) : (
                'SIGN UP'
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-white/60 text-sm">
              Already have an account?{' '}
              <Link
                to={ROUTES.USER_LOGIN}
                className="text-white font-semibold hover:text-white/80 transition-colors underline"
              >
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserSignup;

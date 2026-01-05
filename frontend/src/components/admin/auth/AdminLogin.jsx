import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, AlertCircle, Loader2 } from 'lucide-react';
import { adminLogin } from '../../../services/admin/authService';
import adminLoginImage from '../../../assets/images/admin-login.jpg';
import logo from '../../../assets/images/logo.png'
const AdminLogin = () => {
  const navigate = useNavigate();

  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Loading and error states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Form submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    // Basic validation
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    if (!email.includes('@')) {
      setError('Please enter a valid email');
      return;
    }
    try {
      setLoading(true);

      // API call yaha karein
      const response = await adminLogin({ email, password });

      if (response.status === 200) {
        const { name, token } = response.data.result;

        // Store token and user data
        localStorage.setItem("admin_token", token);
        localStorage.setItem("admin_name", JSON.stringify(name));
        // Success
        setSuccessMessage('Login successful!');
        // Remember me handle karein
        if (rememberMe) {
          localStorage.setItem('remember_me', 'true');
        }
        // Dashboard pe redirect karein
        setTimeout(() => {
          navigate('/admin/dashboard');
        }, 1000);

      } else {
        throw new Error('Login failed. Please try again.');
      }

    } catch (err) {
      setError(err.response.data.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative"
      style={{
        background: 'linear-gradient(135deg, rgba(72,29,111,0.95) 0%, rgba(72,29,111,0.85) 50%, rgba(57,14,96,0.95) 100%)',
      }}
    >
      {/* Decorative gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-[rgba(72,29,111,0.3)] via-transparent to-[rgba(72,29,111,0.2)]"></div>
      
      {/* Subtle pattern overlay */}
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)',
        backgroundSize: '40px 40px',
      }}></div>

      {/* Login Card */}
      <div className="relative w-full max-w-lg z-10">

        {/* Success Message */}
        {successMessage && (
          <div className="mb-4 p-4 rounded-lg bg-green-50 text-green-800 text-base border border-green-200 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 rounded-lg bg-red-50 text-red-800 text-base border border-red-200 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        )}
        <div className="flex items-center justify-center mb-4 -mt-8">
          <Link to="/" className="flex items-center justify-center">
            <img 
              src={logo || ""} 
              alt="Logo"
              className="h-24 w-auto max-w-[220px] object-contain"
            />
          </Link>
        </div>
        {/* Card */}
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-10 border border-[rgba(72,29,111,0.2)]">

          {/* Title */}
          <h1 className="text-4xl font-bold text-center mb-10" style={{ color: 'rgb(72,29,111)' }}>
            ADMIN LOGIN
          </h1>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Email Input */}
            <div>
              <label className="block text-base font-medium mb-2" style={{ color: 'rgb(72,29,111)' }}>
                EMAIL ADDRESS
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 h-5 w-5" style={{ color: 'rgb(72,29,111)' }} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3 py-3.5 bg-white border border-gray-300 rounded-lg text-gray-900 text-base placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[rgb(72,29,111)] focus:border-[rgb(72,29,111)]"
                  placeholder="admin@example.com"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-base font-medium mb-2" style={{ color: 'rgb(72,29,111)' }}>
                PASSWORD
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 h-5 w-5" style={{ color: 'rgb(72,29,111)' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-3.5 bg-white border border-gray-300 rounded-lg text-gray-900 text-base placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[rgb(72,29,111)] focus:border-[rgb(72,29,111)]"
                  placeholder="Enter your password"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-gray-400 hover:text-[rgb(72,29,111)] transition-colors"
                  disabled={loading}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-[rgb(72,29,111)] focus:ring-[rgb(72,29,111)]"
                  disabled={loading}
                />
                <span className="ml-2 text-base text-gray-700">Keep me logged in</span>
              </label>
              <Link to="#" className="text-base text-gray-600 hover:text-[rgb(72,29,111)] transition-colors">
                Forgot Password?
              </Link>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full text-white py-4 px-4 rounded-lg text-lg font-semibold uppercase disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
              style={{
                background: 'linear-gradient(135deg, rgb(72,29,111) 0%, rgb(57,14,96) 100%)',
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'linear-gradient(135deg, rgb(57,14,96) 0%, rgb(72,29,111) 100%)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'linear-gradient(135deg, rgb(72,29,111) 0%, rgb(57,14,96) 100%)';
              }}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>LOGGING IN...</span>
                </>
              ) : (
                'LOGIN'
              )}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
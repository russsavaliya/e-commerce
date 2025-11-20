/**
 * Admin Dashboard
 * Main dashboard page for authenticated admin users with nebula background
 */

import { useAdminAuth } from '../../context/AdminAuthContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, User, Mail, Shield } from 'lucide-react';
import { ROUTES } from '../../utils/constants';

const AdminDashboard = () => {
  const { user, logout } = useAdminAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate(ROUTES.ADMIN_LOGIN);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-black">
      {/* Nebula Background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Base gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/30 via-purple-900/40 to-fuchsia-900/30"></div>
        
        {/* Teal/Cyan Nebula Clouds */}
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-gradient-to-br from-cyan-400/20 to-teal-500/15 rounded-full blur-3xl animate-blob"></div>
        <div className="absolute top-1/3 -left-20 w-[500px] h-[500px] bg-gradient-to-br from-teal-400/15 to-cyan-300/10 rounded-full blur-3xl animate-blob [animation-delay:3s]"></div>
        <div className="absolute bottom-20 left-1/4 w-[400px] h-[400px] bg-gradient-to-br from-cyan-500/15 to-teal-400/10 rounded-full blur-3xl animate-blob [animation-delay:6s]"></div>
        
        {/* Magenta/Pink Nebula Clouds */}
        <div className="absolute -top-20 right-1/4 w-[550px] h-[550px] bg-gradient-to-br from-fuchsia-500/20 to-pink-500/15 rounded-full blur-3xl animate-blob [animation-delay:2s]"></div>
        <div className="absolute top-1/2 right-10 w-[450px] h-[450px] bg-gradient-to-br from-pink-500/15 to-magenta-400/10 rounded-full blur-3xl animate-blob [animation-delay:5s]"></div>
        <div className="absolute bottom-1/4 right-1/3 w-[500px] h-[500px] bg-gradient-to-br from-fuchsia-600/15 to-pink-400/10 rounded-full blur-3xl animate-blob [animation-delay:4s]"></div>
        
        {/* Blended Purple Area */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-gradient-to-br from-purple-500/10 via-violet-500/8 to-indigo-500/10 rounded-full blur-3xl animate-blob [animation-delay:1s]"></div>
        
        {/* Stars */}
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute bg-white rounded-full animate-pulse"
            style={{
              width: Math.random() * 2 + 1 + 'px',
              height: Math.random() * 2 + 1 + 'px',
              left: Math.random() * 100 + '%',
              top: Math.random() * 100 + '%',
              opacity: Math.random() * 0.6 + 0.2,
              animationDelay: Math.random() * 3 + 's',
              animationDuration: Math.random() * 2 + 1 + 's',
            }}
          ></div>
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <header className="bg-black/40 backdrop-blur-xl shadow-lg border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Shield className="w-8 h-8 text-cyan-400" />
                <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-600/80 hover:bg-red-700 text-white rounded-lg transition-colors backdrop-blur-sm"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Card */}
          <div className="bg-black/40 backdrop-blur-xl rounded-2xl shadow-2xl p-8 mb-8 border border-white/10">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-fuchsia-600 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">
                  Welcome back, {user?.name || 'Admin'}!
                </h2>
                <p className="text-white/60 mt-1">Manage your e-commerce platform</p>
              </div>
            </div>

            {/* User Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-4 bg-white/5 rounded-lg border border-white/10">
                <Mail className="w-5 h-5 text-cyan-400" />
                <div>
                  <p className="text-sm text-white/60">Email</p>
                  <p className="font-semibold text-white">{user?.email || 'N/A'}</p>
                </div>
              </div>
              {user?.phone && (
                <div className="flex items-center gap-3 p-4 bg-white/5 rounded-lg border border-white/10">
                  <User className="w-5 h-5 text-cyan-400" />
                  <div>
                    <p className="text-sm text-white/60">Phone</p>
                    <p className="font-semibold text-white">{user.phone}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Dashboard Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-black/40 backdrop-blur-xl rounded-xl shadow-lg p-6 border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-2">Total Orders</h3>
              <p className="text-3xl font-bold text-cyan-400">0</p>
              <p className="text-sm text-white/60 mt-2">No orders yet</p>
            </div>
            <div className="bg-black/40 backdrop-blur-xl rounded-xl shadow-lg p-6 border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-2">Total Products</h3>
              <p className="text-3xl font-bold text-fuchsia-400">0</p>
              <p className="text-sm text-white/60 mt-2">No products yet</p>
            </div>
            <div className="bg-black/40 backdrop-blur-xl rounded-xl shadow-lg p-6 border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-2">Total Revenue</h3>
              <p className="text-3xl font-bold text-green-400">₹0</p>
              <p className="text-sm text-white/60 mt-2">No revenue yet</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-black/40 backdrop-blur-xl rounded-xl shadow-lg p-6 border border-white/10">
            <h3 className="text-xl font-bold text-white mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <button className="p-4 bg-cyan-500/20 hover:bg-cyan-500/30 rounded-lg transition-colors text-left border border-cyan-500/30">
                <p className="font-semibold text-white">Add Product</p>
                <p className="text-sm text-cyan-300 mt-1">Create new product</p>
              </button>
              <button className="p-4 bg-fuchsia-500/20 hover:bg-fuchsia-500/30 rounded-lg transition-colors text-left border border-fuchsia-500/30">
                <p className="font-semibold text-white">View Orders</p>
                <p className="text-sm text-fuchsia-300 mt-1">Manage orders</p>
              </button>
              <button className="p-4 bg-purple-500/20 hover:bg-purple-500/30 rounded-lg transition-colors text-left border border-purple-500/30">
                <p className="font-semibold text-white">Analytics</p>
                <p className="text-sm text-purple-300 mt-1">View reports</p>
              </button>
              <button className="p-4 bg-teal-500/20 hover:bg-teal-500/30 rounded-lg transition-colors text-left border border-teal-500/30">
                <p className="font-semibold text-white">Settings</p>
                <p className="text-sm text-teal-300 mt-1">Configure app</p>
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;

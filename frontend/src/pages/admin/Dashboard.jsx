/**
 * Dashboard Page
 * Modern admin dashboard with metrics and data visualization
 */

import { useEffect, useState } from 'react';
import {
  FolderTree,
  Package,
  ShoppingCart,
  TrendingUp,
  Activity,
  Users,
  Database,
  Loader2,
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { getAllCategories } from '../../services/admin/categoryService';
import { addRandomData } from '../../services/admin/utilsService';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addingData, setAddingData] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await getAllCategories();
      setCategories(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddRandomData = async () => {
    if (!window.confirm('Are you sure you want to add random data? This will create attributes, categories, and products.')) {
      return;
    }

    try {
      setAddingData(true);
      const response = await addRandomData();

      if (response.status) {
        toast.success(
          `Successfully added: ${response.data.attributesCreated} attributes, ${response.data.categoriesCreated} categories, ${response.data.productsCreated} products!`
        );
        // Refresh categories
        await fetchCategories();
      } else {
        toast.error(response.message || 'Failed to add random data');
      }
    } catch (error) {
      toast.error(error.message || 'Failed to add random data');
    } finally {
      setAddingData(false);
    }
  };

  // Sample data for charts (replace with real data from API)
  const revenueData = [
    { month: 'Jan', revenue: 45000, orders: 120 },
    { month: 'Feb', revenue: 52000, orders: 145 },
    { month: 'Mar', revenue: 48000, orders: 138 },
    { month: 'Apr', revenue: 61000, orders: 165 },
    { month: 'May', revenue: 55000, orders: 152 },
    { month: 'Jun', revenue: 67000, orders: 180 },
  ];

  const categoryDistribution = [
    { name: 'Electronics', count: 45 },
    { name: 'Clothing', count: 32 },
    { name: 'Food', count: 28 },
    { name: 'Books', count: 15 },
    { name: 'Other', count: 10 },
  ];

  const totalCategories = categories.length;
  const totalProducts = 0; // Replace with actual API call
  const totalOrders = 0; // Replace with actual API call
  const totalRevenue = 0; // Replace with actual API call

  const metricCards = [
    {
      title: 'Total Categories',
      value: loading ? '...' : totalCategories,
      icon: FolderTree,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
    },
    {
      title: 'Total Products',
      value: totalProducts,
      icon: Package,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
    },
    {
      title: 'Total Orders',
      value: totalOrders,
      icon: ShoppingCart,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
    },
    {
      title: 'Total Revenue',
      value: `₹${totalRevenue.toLocaleString()}`,
      icon: TrendingUp,
      color: 'bg-orange-500',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section with Add Random Data Button */}
      <div className="bg-white rounded-xl shadow-sm p-6 lg:p-8 border border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
              Welcome to Admin Dashboard
            </h1>
            <p className="text-base text-gray-600">
              Manage your e-commerce platform efficiently with real-time insights and analytics.
            </p>
          </div>
          <button
            onClick={handleAddRandomData}
            disabled={addingData}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {addingData ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Adding Data...
              </>
            ) : (
              <>
                <Database className="w-4 h-4" />
                Add Random Data
              </>
            )}
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metricCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div
              key={index}
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`${card.bgColor} p-3 rounded-lg`}>
                  <Icon className={`w-6 h-6 ${card.textColor}`} />
                </div>
                <Activity className="w-5 h-5 text-gray-400" />
              </div>
              <h3 className="text-base text-gray-600 mb-1">{card.title}</h3>
              <p className={`text-2xl font-bold ${card.textColor}`}>{card.value}</p>
            </div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Revenue & Orders</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#22c55e"
                strokeWidth={2}
                name="Revenue (₹)"
              />
              <Line
                type="monotone"
                dataKey="orders"
                stroke="#16a34a"
                strokeWidth={2}
                name="Orders"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Category Distribution Chart */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Category Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={categoryDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Bar dataKey="count" fill="#22c55e" radius={[8, 8, 0, 0]} name="Products" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Activity</h2>
        <div className="space-y-4">
          {[
            { action: 'New category added', item: 'Electronics', time: '2 hours ago' },
            { action: 'Product updated', item: 'iPhone 15 Pro', time: '5 hours ago' },
            { action: 'Order placed', item: 'Order #1234', time: '1 day ago' },
            { action: 'Category updated', item: 'Clothing', time: '2 days ago' },
          ].map((activity, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div>
                  <p className="text-base font-medium text-gray-900">{activity.action}</p>
                  <p className="text-sm text-gray-600">{activity.item}</p>
                </div>
              </div>
              <span className="text-sm text-gray-500">{activity.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;


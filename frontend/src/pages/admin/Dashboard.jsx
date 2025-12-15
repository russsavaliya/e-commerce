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
import { getDashboardSummary } from '../../services/admin/dashboardService';
import toast from 'react-hot-toast';

const PRIMARY_GREEN = 'rgb(78, 166, 116)';

const Dashboard = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [addingData, setAddingData] = useState(false);

  useEffect(() => {
    fetchInitial();
  }, []);

  const fetchInitial = async () => {
    try {
      setLoading(true);
      const [categoryData, summaryData] = await Promise.all([
        getAllCategories(),
        getDashboardSummary(),
      ]);
      setCategories(Array.isArray(categoryData) ? categoryData : []);
      if (summaryData?.status) {
        setSummary(summaryData.data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
      toast.error(error.message || 'Failed to fetch dashboard data');
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
        // Refresh data
        await fetchInitial();
      } else {
        toast.error(response.message || 'Failed to add random data');
      }
    } catch (error) {
      toast.error(error.message || 'Failed to add random data');
    } finally {
      setAddingData(false);
    }
  };

  const revenueData = summary?.trends?.monthlyOrders?.length
    ? summary.trends.monthlyOrders.map((m) => ({
      month: `${m.month}`,
      revenue: m.revenue,
      orders: m.orders,
    }))
    : [];

  const categoryDistribution = Array.isArray(categories)
    ? categories.map((c) => ({
      name: c.name || 'Category',
      count: c.productCount || 0,
    }))
    : [];

  const totalCategories = summary?.metrics?.total_categories || 0;
  const totalProducts = summary?.metrics?.total_products || 0;
  const totalOrders = summary?.metrics?.total_orders || 0;
  const totalRevenue = summary?.metrics?.total_revenue || 0;
  const totalCustomers = summary?.metrics?.total_customers || 0;
  const pendingOrders = summary?.metrics?.pending_orders || 0;

  const metricCards = [
    {
      title: 'Total Categories',
      value: loading ? '...' : totalCategories,
      icon: FolderTree,
      textColor: 'green',
    },
    {
      title: 'Total Products',
      value: loading ? '...' : totalProducts,
      icon: Package,
      textColor: 'green',
    },
    {
      title: 'Total Orders',
      value: loading ? '...' : totalOrders,
      icon: ShoppingCart,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
    },
    {
      title: 'Total Revenue',
      value: loading ? '...' : `₹${totalRevenue.toLocaleString()}`,
      icon: TrendingUp,
      color: 'bg-orange-500',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600',
    },
    {
      title: 'Total Customers',
      value: loading ? '...' : totalCustomers,
      icon: Users,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
    },
    {
      title: 'Pending Orders',
      value: loading ? '...' : pendingOrders,
      icon: Activity,
      color: 'bg-yellow-500',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-600',
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
            className="flex items-center gap-2 px-4 py-2 text-white rounded-lg transition-colors font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: PRIMARY_GREEN }}
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-6">
        {metricCards.map((card, index) => {
          const Icon = card.icon;
          const isGreenCard = card.textColor === 'green';
          return (
            <div
              key={index}
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <div
                  className="p-3 rounded-lg"
                  style={
                    isGreenCard
                      ? { backgroundColor: 'rgba(78, 166, 116, 0.12)' }
                      : undefined
                  }
                >
                  <Icon
                    className="w-6 h-6"
                    style={
                      isGreenCard ? { color: PRIMARY_GREEN } : undefined
                    }
                  />
                </div>
                <Activity className="w-5 h-5 text-gray-400" />
              </div>
              <h3 className="text-base text-gray-600 mb-1">{card.title}</h3>
              <p
                className="text-2xl font-bold"
                style={
                  isGreenCard ? { color: PRIMARY_GREEN } : undefined
                }
              >
                {card.value}
              </p>
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
                stroke={PRIMARY_GREEN}
                strokeWidth={2}
                name="Revenue (₹)"
              />
              <Line
                type="monotone"
                dataKey="orders"
                stroke={PRIMARY_GREEN}
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
              <Bar
                dataKey="count"
                fill={PRIMARY_GREEN}
                radius={[8, 8, 0, 0]}
                name="Products"
              />
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
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: PRIMARY_GREEN }}
                ></div>
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


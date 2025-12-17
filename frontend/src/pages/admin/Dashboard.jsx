/**
 * Dashboard Page
 * Modern admin dashboard with metrics and data visualization
 */

import { useEffect, useState } from 'react';
import {
  Package,
  ShoppingCart,
  TrendingUp,
  Activity,
  Users,
  Database,
  Loader2,
  IndianRupee,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { addRandomData } from '../../services/admin/utilsService';
import { getDashboardSummary } from '../../services/admin/dashboardService';
import toast from 'react-hot-toast';

const PRIMARY_GREEN = 'rgb(78, 166, 116)';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [addingData, setAddingData] = useState(false);

  useEffect(() => {
    fetchInitial();
  }, []);

  const fetchInitial = async () => {
    try {
      setLoading(true);
      const summaryData = await getDashboardSummary();
      if (summaryData?.status) {
        setSummary(summaryData.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
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

  const totalProducts = summary?.metrics?.total_products || 0;
  const totalOrders = summary?.metrics?.total_orders || 0;
  const totalRevenue = summary?.metrics?.total_revenue || 0;
  const totalCustomers = summary?.metrics?.total_customers || 0;
  const pendingOrders = summary?.metrics?.pending_orders || 0;

  const metricCards = [
    {
      title: 'Total Products',
      value: loading ? '...' : totalProducts.toLocaleString(),
      icon: Package,
      bgColor: 'bg-green-50',
      iconColor: PRIMARY_GREEN,
      valueColor: PRIMARY_GREEN,
    },
    {
      title: 'Total Orders',
      value: loading ? '...' : totalOrders.toLocaleString(),
      icon: ShoppingCart,
      bgColor: 'bg-purple-50',
      iconColor: '#9333ea',
      valueColor: '#9333ea',
    },
    {
      title: 'Total Revenue',
      value: loading ? '...' : `₹${totalRevenue.toLocaleString()}`,
      icon: IndianRupee,
      bgColor: 'bg-orange-50',
      iconColor: '#ea580c',
      valueColor: '#ea580c',
    },
    {
      title: 'Total Customers',
      value: loading ? '...' : totalCustomers.toLocaleString(),
      icon: Users,
      bgColor: 'bg-blue-50',
      iconColor: '#2563eb',
      valueColor: '#2563eb',
    },
    {
      title: 'Pending Orders',
      value: loading ? '...' : pendingOrders.toLocaleString(),
      icon: Activity,
      bgColor: 'bg-yellow-50',
      iconColor: '#ca8a04',
      valueColor: '#ca8a04',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-sm p-6 lg:p-8 border border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
              Dashboard Overview
            </h1>
            <p className="text-sm text-gray-600">
              Real-time insights and analytics for your e-commerce platform
            </p>
          </div>
          <button
            onClick={handleAddRandomData}
            disabled={addingData}
            className="flex items-center gap-2 px-4 py-2.5 text-white rounded-lg transition-all duration-200 font-medium shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {metricCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div
              key={index}
              className="bg-white rounded-xl shadow-sm p-5 border border-gray-200 hover:shadow-md hover:border-gray-300 transition-all duration-200 group"
            >
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`p-3 rounded-xl ${card.bgColor} transition-transform duration-200 group-hover:scale-110`}
                >
                  <Icon
                    className="w-6 h-6"
                    style={{ color: card.iconColor }}
                  />
                </div>
              </div>
              <h3 className="text-sm font-medium text-gray-600 mb-2">{card.title}</h3>
              <p
                className="text-2xl font-bold tracking-tight"
                style={{ color: card.valueColor }}
              >
                {card.value}
              </p>
            </div>
          );
        })}
      </div>

      {/* Revenue Chart */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow duration-200">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-1">Revenue & Orders Trend</h2>
          <p className="text-sm text-gray-500">Monthly revenue and order statistics</p>
        </div>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={revenueData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="month" 
              stroke="#6b7280" 
              fontSize={12}
              tick={{ fill: '#6b7280' }}
            />
            <YAxis 
              stroke="#6b7280" 
              fontSize={12}
              tick={{ fill: '#6b7280' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              }}
            />
            <Legend 
              wrapperStyle={{ fontSize: '12px' }}
              iconType="line"
            />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke={PRIMARY_GREEN}
              strokeWidth={3}
              name="Revenue (₹)"
              dot={{ fill: PRIMARY_GREEN, r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="orders"
              stroke="#9333ea"
              strokeWidth={3}
              name="Orders"
              dot={{ fill: '#9333ea', r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Recent Activity Section */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow duration-200">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-1">Recent Activity</h2>
          <p className="text-sm text-gray-500">Latest updates and changes in your system</p>
        </div>
        <div className="space-y-3">
          {[
            { action: 'New product added', item: 'iPhone 15 Pro', time: '2 hours ago', color: PRIMARY_GREEN },
            { action: 'Order completed', item: 'Order #1234', time: '5 hours ago', color: '#9333ea' },
            { action: 'Customer registered', item: 'New customer signup', time: '1 day ago', color: '#2563eb' },
            { action: 'Product updated', item: 'Samsung Galaxy S24', time: '2 days ago', color: '#ea580c' },
          ].map((activity, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 hover:shadow-sm transition-all duration-200 border border-transparent hover:border-gray-200"
            >
              <div className="flex items-center gap-4">
                <div
                  className="w-2.5 h-2.5 rounded-full shadow-sm"
                  style={{ backgroundColor: activity.color }}
                ></div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{activity.action}</p>
                  <p className="text-xs text-gray-600 mt-0.5">{activity.item}</p>
                </div>
              </div>
              <span className="text-xs text-gray-500 font-medium">{activity.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;


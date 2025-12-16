/**
 * Admin Layout Component
 * Main layout wrapper for admin panel with sidebar navigation
 */

import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';
import {
  LayoutDashboard,
  Settings,
  ChevronDown,
  ChevronRight,
  LogOut,
  Menu,
  X,
  FolderTree,
  Tag,
  Package,
  List,
  Plus,
  Shield,
  Users,
  IndianRupee,
  Image,
  ShoppingBag,
  Star,
} from 'lucide-react';
import { ROUTES } from '../../utils/constants';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [productsOpen, setProductsOpen] = useState(false);
  const [ordersOpen, setOrdersOpen] = useState(false);
  const [customersOpen, setCustomersOpen] = useState(false);
  const [reviewsOpen, setReviewsOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAdminAuth();

  // Open settings submenu if on a settings page
  useEffect(() => {
    if (location.pathname.startsWith(ROUTES.ADMIN_SETTINGS)) {
      setSettingsOpen(true);
    }
    if (location.pathname.startsWith(ROUTES.ADMIN_PRODUCTS)) {
      setProductsOpen(true);
    }
    if (location.pathname.startsWith(ROUTES.ADMIN_ORDERS)) {
      setOrdersOpen(true);
    }
    if (location.pathname.startsWith(ROUTES.ADMIN_CUSTOMERS)) {
      setCustomersOpen(true);
    }
    if (location.pathname.startsWith(ROUTES.ADMIN_REVIEWS)) {
      setReviewsOpen(true);
    }
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate(ROUTES.ADMIN_LOGIN);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const isActive = (path) => location.pathname === path;
  const isSettingsActive = location.pathname.startsWith(ROUTES.ADMIN_SETTINGS);
  const isProductsActive = location.pathname.startsWith(ROUTES.ADMIN_PRODUCTS);
  const isOrdersActive = location.pathname.startsWith(ROUTES.ADMIN_ORDERS);
  const isCustomersActive = location.pathname.startsWith(ROUTES.ADMIN_CUSTOMERS);
  const isReviewsActive = location.pathname.startsWith(ROUTES.ADMIN_REVIEWS);

  const menuItems = [
    {
      name: 'Dashboard',
      icon: LayoutDashboard,
      path: ROUTES.ADMIN_DASHBOARD,
    },
    {
      name: 'Products',
      icon: Package,
      path: ROUTES.ADMIN_PRODUCTS,
      submenu: [
        {
          name: 'Product List',
          icon: List,
          path: ROUTES.ADMIN_PRODUCTS_LIST,
        },
        {
          name: 'Add Product',
          icon: Plus,
          path: ROUTES.ADMIN_PRODUCTS_ADD,
        },
      ],
    },
    {
      name: 'Marketing Spend',
      icon: IndianRupee,
      path: ROUTES.ADMIN_MARKETING_SPEND,
    },
    {
      name: 'Banner Management',
      icon: Image,
      path: ROUTES.ADMIN_BANNERS,
    },
    {
      name: 'Orders',
      icon: ShoppingBag,
      path: ROUTES.ADMIN_ORDERS,
      submenu: [
        {
          name: 'Order List',
          icon: List,
          path: ROUTES.ADMIN_ORDERS_LIST,
        },
      ],
    },
    {
      name: 'Customers',
      icon: Users,
      path: ROUTES.ADMIN_CUSTOMERS,
      submenu: [
        {
          name: 'Customer List',
          icon: List,
          path: ROUTES.ADMIN_CUSTOMERS_LIST,
        },
      ],
    },
    {
      name: 'Reviews',
      icon: Star,
      path: ROUTES.ADMIN_REVIEWS,
      submenu: [
        {
          name: 'Review List',
          icon: List,
          path: ROUTES.ADMIN_REVIEWS_LIST,
        },
        {
          name: 'Add Review',
          icon: Plus,
          path: ROUTES.ADMIN_REVIEWS_ADD,
        },
      ],
    },
    {
      name: 'Settings',
      icon: Settings,
      path: ROUTES.ADMIN_SETTINGS,
      submenu: [
        {
          name: 'Category',
          icon: FolderTree,
          path: ROUTES.ADMIN_CATEGORIES,
        },
        {
          name: 'Attributes',
          icon: Tag,
          path: ROUTES.ADMIN_ATTRIBUTES,
        },
        {
          name: 'Roles',
          icon: Shield,
          path: ROUTES.ADMIN_ROLES,
        },
        {
          name: 'Admins',
          icon: Users,
          path: ROUTES.ADMIN_MANAGEMENT,
        },
      ],
    },
  ];

  const getPageTitle = () => {
    const path = location.pathname;

    if (path === ROUTES.ADMIN_DASHBOARD) return 'Dashboard';
    if (path === ROUTES.ADMIN_PRODUCTS_LIST) return 'Product List';
    if (path === ROUTES.ADMIN_PRODUCTS_ADD) return 'Add Product';
    if (path.startsWith('/admin/products/edit/')) return 'Update Product';

    if (path === ROUTES.ADMIN_MARKETING_SPEND) return 'Marketing Spend Management';
    if (path === ROUTES.ADMIN_BANNERS) return 'Banner Management';

    if (path === ROUTES.ADMIN_ORDERS_LIST) return 'Order List';
    if (path.startsWith('/admin/orders/') && path !== ROUTES.ADMIN_ORDERS_LIST) {
      return 'Order Detail';
    }

    if (path === ROUTES.ADMIN_CATEGORIES) return 'Category Management';
    if (path === ROUTES.ADMIN_ATTRIBUTES) return 'Attribute Management';
    if (path === ROUTES.ADMIN_ROLES) return 'Role Management';
    if (path === ROUTES.ADMIN_MANAGEMENT) return 'Admin Management';
    if (path === ROUTES.ADMIN_CUSTOMERS_LIST) return 'Customer List';
    if (path === ROUTES.ADMIN_REVIEWS_LIST) return 'Review List';
    if (path === ROUTES.ADMIN_REVIEWS_ADD) return 'Add Review';
    if (path === ROUTES.ADMIN_PROFILE) return 'Profile';

    return 'Settings';
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          bg-white border-r border-gray-200
          transition-all duration-300 ease-in-out
          ${sidebarOpen ? 'w-64' : 'w-20'}
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Logo/Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            {sidebarOpen && (
              <h1 className="text-2xl font-bold" style={{ color: '#4EA674' }}>Admin Panel</h1>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:flex hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Toggle sidebar"
            >
              <Menu className="w-5 h-5 text-gray-600" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Close menu"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isItemActive = item.name === 'Settings'
                ? isSettingsActive
                : item.name === 'Products'
                  ? isProductsActive
                  : item.name === 'Orders'
                    ? isOrdersActive
                    : item.name === 'Customers'
                      ? isCustomersActive
                      : item.name === 'Reviews'
                        ? isReviewsActive
                        : isActive(item.path);
              // Only mark as active if this specific item is active, not if any submenu is active
              const active = isItemActive;

              if (item.submenu) {
                const isOpen = item.name === 'Settings' 
                  ? settingsOpen 
                  : item.name === 'Products'
                    ? productsOpen
                    : item.name === 'Orders'
                      ? ordersOpen
                      : item.name === 'Customers'
                        ? customersOpen
                        : item.name === 'Reviews'
                          ? reviewsOpen
                          : false;
                const toggleOpen = item.name === 'Settings'
                  ? () => setSettingsOpen(!settingsOpen)
                  : item.name === 'Products'
                    ? () => setProductsOpen(!productsOpen)
                    : item.name === 'Orders'
                      ? () => setOrdersOpen(!ordersOpen)
                      : item.name === 'Customers'
                        ? () => setCustomersOpen(!customersOpen)
                        : item.name === 'Reviews'
                          ? () => setReviewsOpen(!reviewsOpen)
                          : () => {};

                return (
                  <div key={item.name}>
                    <button
                      onClick={toggleOpen}
                      className={`
                        w-full flex items-center gap-3 px-4 py-3 rounded-lg
                        transition-all duration-200 relative
                        ${active
                          ? 'text-white font-semibold shadow-md'
                          : 'text-gray-700 hover:bg-gray-100'
                        }
                      `}
                      style={active ? { backgroundColor: '#4EA674' } : {}}
                      aria-expanded={isOpen}
                    >
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      {sidebarOpen && (
                        <>
                          <span className="flex-1 text-left text-base">{item.name}</span>
                          {isOpen ? (
                            <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )}
                        </>
                      )}
                    </button>

                    {/* Submenu */}
                    {isOpen && sidebarOpen && (
                      <div className="ml-4 mt-2 space-y-1">
                        {item.submenu.map((subItem) => {
                          const SubIcon = subItem.icon;
                          const subActive = isActive(subItem.path);

                          return (
                            <button
                              key={subItem.name}
                              onClick={() => {
                                navigate(subItem.path);
                                setMobileMenuOpen(false);
                              }}
                              className={`
                                w-full flex items-center gap-3 px-4 py-2.5 rounded-lg
                                transition-all duration-200 text-base relative
                                ${subActive
                                  ? 'text-white font-semibold shadow-md'
                                  : 'text-gray-600 hover:bg-gray-50'
                                }
                              `}
                              style={subActive ? { backgroundColor: '#4EA674' } : {}}
                            >
                              <SubIcon className="w-4 h-4 flex-shrink-0" />
                              <span>{subItem.name}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <button
                  key={item.name}
                  onClick={() => {
                    navigate(item.path);
                    setMobileMenuOpen(false);
                  }}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-lg
                    transition-all duration-200 text-base relative
                    ${active
                      ? 'text-white font-semibold shadow-md'
                      : 'text-gray-700 hover:bg-gray-100'
                    }
                  `}
                  style={active ? { backgroundColor: '#4EA674' } : {}}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {sidebarOpen && <span className="flex-1 text-left">{item.name}</span>}
                </button>
              );
            })}
          </nav>

          {/* User Info & Logout */}
          <div className="p-4 border-t border-gray-200">
            {sidebarOpen && (
              <button
                onClick={() => navigate(ROUTES.ADMIN_PROFILE)}
                className="w-full mb-3 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors text-left"
              >
                <p className="text-sm font-semibold text-gray-900">{user?.name || 'Admin'}</p>
                <p className="text-xs text-gray-500 truncate">{user?.email || ''}</p>
                <p className="text-xs text-green-600 mt-1 font-medium">View Profile →</p>
              </button>
            )}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors text-base font-medium"
            >
              <LogOut className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && <span>Logout</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 px-4 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Open menu"
            >
              <Menu className="w-6 h-6 text-gray-600" />
            </button>
            <h2 className="text-xl lg:text-2xl font-bold text-gray-900">
              {getPageTitle()}
            </h2>
            <div className="w-10" /> {/* Spacer for mobile menu button */}
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;


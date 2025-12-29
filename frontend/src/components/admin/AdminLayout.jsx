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
  Truck,
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
    if (location.pathname.startsWith(ROUTES.ADMIN_ORDERS) || location.pathname.startsWith('/admin/shipments')) {
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
  const isOrdersActive = location.pathname.startsWith(ROUTES.ADMIN_ORDERS) || location.pathname.startsWith('/admin/shipments');
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
        {
          name: 'Shipment List',
          icon: Truck,
          path: ROUTES.ADMIN_SHIPMENTS_LIST,
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


  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          bg-white border-r border-gray-200 shadow-sm
          transition-all duration-300 ease-in-out
          ${sidebarOpen ? 'w-64' : 'w-20'}
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Logo/Header */}
          <div className="flex items-center justify-between p-5 border-b border-gray-200 bg-gradient-to-r from-white to-gray-50/50">
            {sidebarOpen && (
              <h1 className="text-xl font-bold tracking-tight" style={{ color: '#4EA674' }}>
                Admin Panel
              </h1>
            )}
            {!sidebarOpen && (
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center mx-auto">
                <LayoutDashboard className="w-5 h-5 text-white" />
              </div>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:flex hidden p-2 rounded-lg hover:bg-gray-100 active:bg-gray-200 transition-all duration-200"
              aria-label="Toggle sidebar"
            >
              <Menu className="w-5 h-5 text-gray-600" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 active:bg-gray-200 transition-all duration-200"
              aria-label="Close menu"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-3 space-y-1.5 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
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
                        w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
                        transition-all duration-200 relative group
                        ${active
                          ? 'text-white font-semibold shadow-sm'
                          : 'text-gray-700 hover:bg-gray-50 active:bg-gray-100'
                        }
                      `}
                      style={active ? { backgroundColor: '#4EA674' } : {}}
                      aria-expanded={isOpen}
                    >
                      <Icon className={`w-5 h-5 flex-shrink-0 transition-transform ${isOpen ? 'scale-110' : ''}`} />
                      {sidebarOpen && (
                        <>
                          <span className="flex-1 text-left text-sm font-medium">{item.name}</span>
                          <div className="transition-transform duration-200">
                            {isOpen ? (
                              <ChevronDown className="w-4 h-4" />
                            ) : (
                              <ChevronRight className="w-4 h-4" />
                            )}
                          </div>
                        </>
                      )}
                    </button>

                    {/* Submenu */}
                    {isOpen && sidebarOpen && (
                      <div className="ml-2 mt-1.5 space-y-1 border-l-2 border-gray-100 pl-2">
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
                                w-full flex items-center gap-2.5 px-3 py-2 rounded-md
                                transition-all duration-200 text-sm relative
                                ${subActive
                                  ? 'text-white font-medium shadow-sm'
                                  : 'text-gray-600 hover:bg-gray-50 active:bg-gray-100'
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
                    w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
                    transition-all duration-200 text-sm relative group
                    ${active
                      ? 'text-white font-semibold shadow-sm'
                      : 'text-gray-700 hover:bg-gray-50 active:bg-gray-100'
                    }
                  `}
                  style={active ? { backgroundColor: '#4EA674' } : {}}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {sidebarOpen && <span className="flex-1 text-left font-medium">{item.name}</span>}
                </button>
              );
            })}
          </nav>

          {/* User Info & Logout */}
          <div className="p-4 border-t border-gray-200 bg-gray-50/50">
            {sidebarOpen && (
              <button
                onClick={() => navigate(ROUTES.ADMIN_PROFILE)}
                className="w-full mb-3 px-4 py-3 rounded-lg hover:bg-white hover:shadow-sm transition-all duration-200 text-left border border-transparent hover:border-gray-200"
              >
                <p className="text-sm font-semibold text-gray-900">{user?.name || 'Admin'}</p>
                <p className="text-xs text-gray-500 truncate mt-0.5">{user?.email || ''}</p>
                <p className="text-xs text-green-600 mt-1.5 font-medium flex items-center gap-1">
                  View Profile <span className="text-green-500">→</span>
                </p>
              </button>
            )}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-red-600 hover:bg-red-50 active:bg-red-100 transition-all duration-200 text-sm font-medium border border-red-100 hover:border-red-200"
            >
              <LogOut className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && <span>Logout</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Menu Button - Sticky Header */}
        <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-30 lg:hidden">
          <div className="px-4 py-4">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 rounded-lg hover:bg-gray-100 active:bg-gray-200 transition-all duration-200"
              aria-label="Open menu"
            >
              <Menu className="w-6 h-6 text-gray-600" />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 lg:p-6">
          <div className="max-w-7xl mx-auto w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;


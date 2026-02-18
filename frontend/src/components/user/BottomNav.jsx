/**
 * ============================================
 * BOTTOM NAVIGATION COMPONENT
 * ============================================
 * 
 * Mobile-first sticky bottom navigation bar
 * Shows on mobile devices only (hidden on larger screens)
 * Highlights the active route
 */

import { useLocation, Link } from 'react-router-dom';
import { Home, Zap, Phone } from 'lucide-react';

function BottomNav() {
  const location = useLocation();

  // Hide BottomNav on product detail page
  const isProductDetailPage = location.pathname.includes('/product/');
  if (isProductDetailPage) return null;

  // Define navigation items
  const navItems = [
    {
      label: 'Home',
      icon: Home,
      path: '/',
      description: 'Go to home page'
    },
    {
      label: 'Sales',
      icon: Zap,
      path: '/sale',
      description: 'View sale products'
    },
    {
      label: 'Contact',
      icon: Phone,
      path: '/contact',
      description: 'Contact us'
    }
  ];

  // Check if current path is active
  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    // Container: Fixed at bottom, visible only on mobile (md:hidden)
    <nav className="fixed bottom-0 left-0 right-0 md:hidden bg-white border-t border-gray-200 shadow-lg shadow-black/10 z-40">
      {/* Navigation items container */}
      <div className="flex items-center justify-around h-20 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          return (
            <Link
              key={item.path}
              to={item.path}
              title={item.description}
              className={`
                flex flex-col items-center justify-center 
                w-full h-full px-2 py-2 transition-all duration-200 ease-out
                ${
                  active
                    ? 'text-blue-600 scale-105'
                    : 'text-gray-600 hover:text-gray-900'
                }
              `}
            >
              {/* Icon */}
              <Icon
                size={24}
                strokeWidth={active ? 2.5 : 2}
                className="mb-1 transition-all duration-200"
              />

              {/* Label */}
              <span
                className={`
                  text-xs font-medium whitespace-nowrap 
                  transition-colors duration-200
                  ${active ? 'text-blue-600' : 'text-gray-600'}
                `}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export default BottomNav;

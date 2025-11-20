/**
 * ============================================
 * MAIN APP COMPONENT - EASY TO UNDERSTAND & SCALABLE
 * ============================================
 * 
 * This is the main component of our application.
 * Think of it as the "home" that decides which page to show
 * when someone visits different URLs (like /admin, /user, etc.)
 * 
 * What this component does:
 * 1. Sets up routing (decides which page to show based on URL)
 * 2. Provides authentication context (keeps track of who is logged in)
 * 3. Shows toast notifications (those popup messages)
 * 
 * ============================================
 * HOW TO ADD NEW PAGES (EASY METHOD!)
 * ============================================
 * 
 * To add a new admin page (like Product, Order, etc.):
 * 1. Create your page component in src/pages/admin/YourPageName.jsx
 * 2. Import it at the top (see Step 5 below)
 * 3. Add it to the ADMIN_ROUTES array (see around line 60)
 * 
 * Example for adding a Product page:
 * - Create: src/pages/admin/ProductManagement.jsx
 * - Import: import ProductManagement from './pages/admin/ProductManagement';
 * - Add to ADMIN_ROUTES: { path: 'products', component: ProductManagement }
 * 
 * That's it! The route will automatically be created.
 */

// ============================================
// STEP 1: Import React Router
// ============================================
// This helps us navigate between pages
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// ============================================
// STEP 2: Import Toast Notifications
// ============================================
// Shows popup messages to users
import { Toaster } from 'react-hot-toast';

// ============================================
// STEP 3: Import Authentication Providers
// ============================================
// These keep track of login status
import { AdminAuthProvider } from './context/AdminAuthContext';
import { UserAuthProvider } from './context/UserAuthContext';

// ============================================
// STEP 4: Import Protected Routes
// ============================================
// These check if user is logged in before showing pages
import { AdminProtectedRoute, UserProtectedRoute } from './components/ProtectedRoute';

// ============================================
// STEP 5: Import Admin Pages
// ============================================
// Import all your admin pages here
// When you create a new page, just add the import here!
import AdminAuthPage from './pages/admin/AdminAuthPage';
import AdminLayout from './components/admin/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import CategoryManagement from './pages/admin/CategoryManagement';

// TODO: When you create new pages, import them here:
// import ProductManagement from './pages/admin/ProductManagement';
// import OrderManagement from './pages/admin/OrderManagement';
// import AttributeManagement from './pages/admin/AttributeManagement';
// import ReturnManagement from './pages/admin/ReturnManagement';

// ============================================
// STEP 6: Import User Pages
// ============================================
// Import all your user pages here
import UserAuthPage from './pages/user/UserAuthPage';
import UserDashboard from './pages/user/UserDashboard';

// TODO: When you create new user pages, import them here:
// import UserOrders from './pages/user/UserOrders';
// import UserReturns from './pages/user/UserReturns';

// ============================================
// STEP 7: Import Route Constants
// ============================================
// These are just URLs stored in one place
import { ROUTES } from './utils/constants';

// ============================================
// ADMIN ROUTES CONFIGURATION
// ============================================
// This array makes it SUPER EASY to add new admin pages!
// Just add a new object to this array when you create a new page.
const ADMIN_ROUTES = [
  {
    path: 'dashboard',                    // URL path (will be /admin/dashboard)
    component: Dashboard,                 // The component to show
    description: 'Admin Dashboard Page'   // Just for documentation
  },
  {
    path: 'settings/categories',          // URL path (will be /admin/settings/categories)
    component: CategoryManagement,        // The component to show
    description: 'Category Management Page'
  },
  // ============================================
  // ADD NEW ADMIN PAGES HERE - IT'S THAT EASY!
  // ============================================
  // Example: To add a Product page, just uncomment and modify:
  // {
  //   path: 'products',                    // URL will be /admin/products
  //   component: ProductManagement,       // Make sure you imported it above!
  //   description: 'Product Management Page'
  // },
  // {
  //   path: 'orders',                      // URL will be /admin/orders
  //   component: OrderManagement,
  //   description: 'Order Management Page'
  // },
  // {
  //   path: 'attributes',                  // URL will be /admin/attributes
  //   component: AttributeManagement,
  //   description: 'Attribute Management Page'
  // },
  // {
  //   path: 'returns',                     // URL will be /admin/returns
  //   component: ReturnManagement,
  //   description: 'Return Management Page'
  // },
];

// ============================================
// USER ROUTES CONFIGURATION
// ============================================
// This array makes it easy to add new user pages!
const USER_ROUTES = [
  {
    path: ROUTES.USER_DASHBOARD,         // Full URL path
    component: UserDashboard,             // The component to show
    description: 'User Dashboard Page',
    isProtected: true                     // Requires login
  },
  // ============================================
  // ADD NEW USER PAGES HERE
  // ============================================
  // Example: To add a User Orders page:
  // {
  //   path: '/user/orders',
  //   component: UserOrders,
  //   description: 'User Orders Page',
  //   isProtected: true
  // },
];

/**
 * Main App Function
 * This is where everything starts!
 */
function App() {
  return (
    // BrowserRouter: This enables routing in our app
    <BrowserRouter>

      {/* AdminAuthProvider: Wraps the app to provide admin login state to all components */}
      <AdminAuthProvider>

        {/* UserAuthProvider: Wraps the app to provide user login state to all components */}
        <UserAuthProvider>

          {/* Toaster: Shows notification popups (like "Login successful!") */}
          <Toaster position="top-right" />

          {/* Routes: This is where we define all the pages in our app */}
          <Routes>

            {/* 
              Route 1: Home Page
              When someone visits "/" (home), redirect them to admin login page
            */}
            <Route
              path={ROUTES.HOME}
              element={<Navigate to={ROUTES.ADMIN_LOGIN} replace />}
            />

            {/* 
              Route 2: Admin Protected Pages
              These pages require the user to be logged in as admin
              All admin pages are automatically added from ADMIN_ROUTES array above!
            */}
            <Route
              path="/admin"
              element={
                <AdminProtectedRoute>
                  <AdminLayout />
                </AdminProtectedRoute>
              }
            >
              {/* If someone visits /admin, redirect to /admin/dashboard */}
              <Route
                index
                element={<Navigate to={ROUTES.ADMIN_DASHBOARD} replace />}
              />

              {/* 
                AUTO-GENERATED ADMIN ROUTES
                These routes are created automatically from the ADMIN_ROUTES array!
                When you add a new page to ADMIN_ROUTES, it will automatically appear here.
              */}
              {ADMIN_ROUTES.map((route) => (
                <Route
                  key={route.path}
                  path={route.path}
                  element={<route.component />}
                />
              ))}

              {/* If someone visits /admin/settings, redirect to categories */}
              <Route
                path="settings"
                element={<Navigate to={ROUTES.ADMIN_CATEGORIES} replace />}
              />
            </Route>

            {/* 
              Route 3: Admin Login Page
              This handles admin login and registration
              The "/*" means it can handle nested routes like /admin/login, /admin/register
            */}
            <Route
              path="/admin/*"
              element={<AdminAuthPage />}
            />

            {/* 
              Route 4: User Login Page
              This handles user login and registration
            */}
            <Route
              path="/user/*"
              element={<UserAuthPage />}
            />

            {/* 
              AUTO-GENERATED USER ROUTES
              These routes are created automatically from the USER_ROUTES array!
              When you add a new page to USER_ROUTES, it will automatically appear here.
            */}
            {USER_ROUTES.map((route) => (
              <Route
                key={route.path}
                path={route.path}
                element={
                  route.isProtected ? (
                    <UserProtectedRoute>
                      <route.component />
                    </UserProtectedRoute>
                  ) : (
                    <route.component />
                  )
                }
              />
            ))}

            {/* 
              Route 5: Catch All Route
              If someone visits a URL that doesn't exist, redirect them to admin login
              This is like a "404 page" but instead of showing error, we redirect
            */}
            <Route
              path="*"
              element={<Navigate to={ROUTES.ADMIN_LOGIN} replace />}
            />

          </Routes>

        </UserAuthProvider>
      </AdminAuthProvider>

    </BrowserRouter>
  );
}

// Export the App component so it can be used in other files
export default App;

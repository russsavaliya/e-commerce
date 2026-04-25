# Frontend Project Context

## 1. Project Overview

A full-featured e-commerce frontend built with React. It serves two distinct audiences:

- **Customers** – browse products, manage a cart (guest or logged-in), apply coupons, check out with Razorpay, track orders, submit returns and contact support.
- **Admins** – a fully featured dashboard to manage products, categories, attributes, orders, shipments, customers, banners, coupons, roles, reviews, marketing spend, draft orders and return orders.

---

## 2. Tech Stack

| Concern | Choice |
|---|---|
| Framework | React 19.2.0 |
| Build tool | Vite 7.2.2 |
| Routing | React Router DOM 7.9.6 |
| UI component library | Ant Design 6.0.1 |
| Icons | Lucide React 0.554.0 |
| Charts | Recharts 3.4.1 |
| State management | React Context API (`AdminAuthContext`, `UserAuthContext`) |
| HTTP client | Axios 1.13.2 |
| Notifications | react-hot-toast 2.6.0 |
| Payments | Razorpay 1.3.2 |
| Styling | Tailwind CSS 3.4.18 + PostCSS |
| Linting | ESLint 9.39.1 |

---

## 3. Folder Structure

```
frontend/src/
├── App.jsx                  Main router; defines ADMIN_ROUTES array + user routes
├── main.jsx                 Entry point, wraps app in AuthContext providers
├── index.css                Tailwind CSS base imports
│
├── pages/
│   ├── admin/               24 admin pages (Dashboard, Product CRUD, Orders, etc.)
│   └── user/                14 user-facing pages (Home, Cart, Checkout, etc.)
│
├── components/
│   ├── ProtectedRoute.jsx   AdminProtectedRoute + UserProtectedRoute
│   ├── admin/               AdminLayout, RichTextEditor, Pagination, OrderFilters
│   └── user/                Navbar, Footer, HeroSection, ProductCard, FilterSidebar, etc.
│
├── context/
│   ├── AdminAuthContext.jsx Admin auth state (user, token, isAuthenticated, loading)
│   └── UserAuthContext.jsx  User auth state (mirrors admin structure)
│
├── services/
│   ├── admin/               One service file per admin domain (authService, productService, …)
│   └── user/                One service file per user domain (authService, cartService, …)
│       └── apiClient.js     Axios instance that attaches x-guest-id header
│
├── utils/
│   ├── api.js               Axios instance with Bearer-token interceptor
│   ├── constants.js         API_BASE_URL, ROUTES, STORAGE_KEYS
│   ├── guestId.js           Generates/persists guest identifier in localStorage
│   ├── validation.js
│   └── orderConstants.js
│
└── hooks/
    ├── useClickOutside.js
    ├── useDebounce.js
    └── useSEO.jsx
```

---

## 4. Pages & Routes

### User Routes

| Path | Page | Purpose |
|---|---|---|
| `/` | `HomePage` | Hero banners, product carousels (bestsellers, new, trending) |
| `/product/:id` | `ProductDetailPage` | Product detail, variants, add-to-cart, reviews |
| `/cart` | `CartPage` | Cart items, coupon input, order summary |
| `/checkout` | `CheckoutPage` | Shipping form, payment method, Razorpay trigger |
| `/order-success` | `OrderSuccessPage` | Confirmation after successful payment |
| `/track-order` | `OrderTrackPage` | Order status timeline by order ID |
| `/sale` | `SalePage` | Filtered product listing with sidebar filters |
| `/new-arrivals` | `NewArrivalPage` | New product listing |
| `/best-sellers` | `BestSellerPage` | Bestseller product listing |
| `/about` | `AboutPage` | Static about page |
| `/contact` | `ContactPage` | Contact form (sends email via backend) |
| `/return-order` | `ReturnOrderPage` | OTP-verified return initiation |
| `/return-policy` | `ReturnPolicyPage` | Static return policy |
| `*` | `NotFoundPage` | 404 fallback |

### Admin Routes (all under `/admin/*`, protected)

| Path | Page | Purpose |
|---|---|---|
| `dashboard` | `Dashboard` | Key metrics, charts |
| `products/list` | `ProductList` | Product table with search |
| `products/add` | `ProductAdd` | Create product form |
| `products/edit/:id` | `ProductEdit` | Edit product form |
| `categories` | `CategoryManagement` | Category CRUD |
| `attributes` | `AttributeManagement` | Attribute CRUD |
| `orders` | `OrderList` | Order table with filters |
| `orders/:id` | `OrderDetail` | Order detail, status update |
| `shipments` | `ShipmentList` | Shipment table |
| `shipments/:id` | `ShipmentDetail` | Shipment detail |
| `customers` | `CustomerList` | Customer table |
| `reviews` | `ReviewList` | Review moderation |
| `reviews/add` | `AddReview` | Manually add a review |
| `roles` | `RoleManagement` | RBAC role CRUD |
| `admins` | `AdminManagement` | Admin user CRUD |
| `coupons` | `CouponManagement` | Coupon CRUD |
| `banners` | `BannerManagement` | Banner CRUD with position selection |
| `marketing-spend` | `MarketingSpendManagement` | Ad spend tracking |
| `draft-orders` | `DraftOrderList` | Abandoned checkout list |
| `return-orders` | `ReturnOrderList` | Return order management |
| `return-orders/:id` | `ReturnOrderDetail` | Return order detail |
| `notes` | `Notes` | Admin sticky notes |
| `profile` | `Profile` | Admin profile & password change |
| `auth` | `AdminAuthPage` | Admin login / signup |

---

## 5. Components

| Component | Location | Role |
|---|---|---|
| `AdminProtectedRoute` | `components/ProtectedRoute.jsx` | Redirects to `/admin/auth` if no token |
| `UserProtectedRoute` | `components/ProtectedRoute.jsx` | Redirects to login if no user token |
| `AdminLayout` | `components/admin/AdminLayout.jsx` | Sidebar nav shell for all admin pages |
| `RichTextEditor` | `components/admin/RichTextEditor.jsx` | Product description (HTML) editor |
| `Pagination` | `components/admin/Pagination.jsx` | Reusable table pagination |
| `OrderFilters` | `components/admin/OrderFilters.jsx` | Date/status filter controls for orders |
| `Navbar` | `components/user/Navbar.jsx` | Top navigation with cart count badge |
| `BottomNav` | `components/user/BottomNav.jsx` | Mobile-only fixed bottom nav |
| `HeroSection` | `components/user/HeroSection.jsx` | Homepage hero banner carousel |
| `CategoryMegaMenu` | `components/user/CategoryMegaMenu.jsx` | Hover mega-menu for category nav |
| `FilterSidebar` | `components/user/FilterSidebar.jsx` | Category + attribute product filters |
| `ProductCard` | `components/user/ProductCard.jsx` | Product tile with add-to-cart |
| `ProductCarousel` | `components/user/ProductCarousel.jsx` | Horizontal scrolling product row |
| `PromoPopup` | `components/user/PromoPopup.jsx` | Auto-show promo modal (3–5 s delay) |
| `WhatsAppSupport` | `components/user/WhatsAppSupport.jsx` | Floating WhatsApp CTA button |
| `ShippingForm` | `components/user/checkout/ShippingForm.jsx` | Checkout address capture |
| `CartItemsReview` | `components/user/checkout/CartItemsReview.jsx` | Order preview in checkout |
| `OrderSummary` | `components/user/checkout/OrderSummary.jsx` | Totals + coupon display in checkout |

---

## 6. API Calls

### Base URL
`http://localhost:1200` — overridden by `VITE_API_BASE_URL` environment variable.

### Axios Instances
- `utils/api.js` — admin API client; attaches `Authorization: Bearer <token>` from `localStorage`.
- `services/user/apiClient.js` — user API client; attaches `x-guest-id` header from `localStorage`.

### Admin Service → Endpoint Mapping

| Service file | Endpoint prefix | Key operations |
|---|---|---|
| `admin/authService.js` | `/admin/auth` | login, logout, token storage |
| `admin/productService.js` | `/product` | list, create, update, getOne |
| `admin/categoryService.js` | `/category` | list, create, update, delete |
| `admin/attributeService.js` | `/attributes` | list, create, update, delete |
| `admin/orderService.js` | `/orders` | list, detail, status update, export PDF |
| `admin/shipmentService.js` | `/shipments` | list, create, status update |
| `admin/customerService.js` | `/customers` | list |
| `admin/reviewService.js` | `/reviews` | list, add, update, delete |
| `admin/roleService.js` | `/role` | list, create, update, delete |
| `admin/adminService.js` | `/admin` | list, create, delete |
| `admin/bannerService.js` | `/banners` | list, create, update, toggle, delete |
| `admin/couponService.js` | `/coupons` | list, create, update, delete |
| `admin/noteService.js` | `/notes` | list, create, update, delete |
| `admin/draftOrderService.js` | `/draft-orders` | list |
| `admin/marketingSpendService.js` | `/marketing-spend` | list, create, update, delete |
| `admin/returnOrderService.js` | `/return-order` | list, detail, status update |
| `admin/dashboardService.js` | `/dashboard` | summary metrics |

### User Service → Endpoint Mapping

| Service file | Endpoint prefix | Key operations |
|---|---|---|
| `user/authService.js` | `/users/auth` | login, signup, logout |
| `user/productService.js` | `/users/products` | bestsellers, trending, new, by-category, detail, related |
| `user/categoryService.js` | `/users/categories` | list, grouped |
| `user/attributeService.js` | `/users/attributes` | list |
| `user/cartService.js` | `/users/cart` | get, add, update, remove, clear, count |
| `user/checkoutService.js` | `/users/checkout` | pincode validation |
| `user/orderTrackService.js` | `/users/orders` | init, payment update, track, cancel |
| `user/bannerService.js` | `/users/banners` | list active banners |
| `user/couponService.js` | `/users/coupons` | available, apply |
| `user/reviewService.js` | `/users/reviews` | get, add |
| `user/returnOrderService.js` | `/users/return` | send OTP, verify OTP, create return |
| `user/supportService.js` | `/users/support` | contact email |

---

## 7. Auth Flow

### Admin Auth
1. Admin visits any `/admin/*` route → `AdminProtectedRoute` checks `localStorage` for `admin_token`.
2. No token → redirect to `/admin/auth`.
3. On login (`POST /admin/auth/login`) → response contains `{ token, name }`.
4. `AdminAuthContext` stores token in `localStorage` (key: `admin_token`) and user in `admin_user`.
5. `utils/api.js` interceptor reads `admin_token` on every request and sets `Authorization: Bearer <token>`.
6. On 401 response → token cleared, user redirected to login.

### User Auth
1. User auth is **optional** — cart and browsing work without login via guest session.
2. `UserAuthContext` stores token (`user_token`) and user data (`user_user`) in `localStorage`.
3. Login/signup via `POST /users/auth/login` or `/signup`.
4. `services/user/apiClient.js` attaches `x-guest-id` header on every request for cart session continuity.
5. Guest ID is a UUID generated once and persisted in `localStorage` via `utils/guestId.js`.

---

## 8. Known Issues / TODOs

- **`VITE_API_BASE_URL`** is not set in `.env` — the fallback `http://localhost:1200` must be replaced for production.
- **No token refresh logic** — once a JWT expires the user is silently redirected to login without explanation.
- **User login is not enforced at checkout** — a guest can place an order; user auth context may not reflect this.
- **`PromoPopup`** has no persistence — it re-appears on every page load; should be gated by a session/localStorage flag.
- **`useSEO.jsx` hook** exists but coverage of user pages is inconsistent.
- **Cart count** in `Navbar` may not sync immediately after add-to-cart on product pages.
- **`RichTextEditor`** dependency needs verification — ensure `react-quill` or equivalent is declared in `package.json`.
- **Admin route guarding** only checks token presence, not token validity or expiry.
- **No loading skeletons** on most user pages — blank flash before data loads.

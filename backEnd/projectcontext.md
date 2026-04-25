# Backend Project Context

## 1. Project Overview

An Express.js REST API for a full-featured e-commerce platform. It handles two separate surface areas:

- **Admin API** (`/admin/*`, `/category/*`, `/product/*`, `/orders/*`, etc.) — JWT-protected endpoints for product management, order fulfilment, customer management, banners, coupons, roles, marketing spend and analytics.
- **User/Public API** (`/users/*`) — publicly accessible endpoints for browsing products, managing a guest cart, placing orders with Razorpay, tracking orders, submitting returns, applying coupons and contacting support.

External integrations: **Razorpay** (payments), **Shiprocket** (shipping + returns), **Cloudinary** (image storage), **Nodemailer** (email), **WhatsApp API**.

---

## 2. Tech Stack

| Concern | Choice |
|---|---|
| Language | Node.js |
| Framework | Express.js 4.16.1 |
| Database | MongoDB (cloud) via Mongoose 8.20.0 |
| Auth | JWT (jsonwebtoken 9.0.2) + bcrypt 6.0.0 |
| File upload | multer 2.0.2 |
| Image storage | Cloudinary 2.8.0 |
| Email | Nodemailer 7.0.11 |
| PDF generation | pdfkit 0.17.2, html-pdf 3.0.1 |
| Payments | Razorpay 2.9.6 |
| Shipping | Shiprocket REST API (via axios) |
| HTTP logging | Morgan 1.9.1 |
| Dev runner | nodemon 3.1.11 |

---

## 3. Folder Structure

```
backEnd/
├── server.js                  HTTP server, listens on PORT 1200
├── app.js                     Express app setup: CORS, body-parser, Morgan, route mounting
├── .env                       Secrets (DB, JWT, Cloudinary, Razorpay, Shiprocket, email)
│
├── routes/
│   ├── index.js               Admin routes — all protected by JWT authorization middleware
│   └── users.js               User/public routes — no auth middleware
│
├── controllers/
│   ├── admin.js               Admin CRUD, login
│   ├── admin_order.js         Order management, PDF export
│   ├── admin_customer.js      Customer listing
│   ├── admin_review.js        Review moderation
│   ├── admin_returnOrder.js   Return order management + Shiprocket RTO
│   ├── admin_draftOrder.js    Abandoned checkout list
│   ├── category.js
│   ├── attributes.js
│   ├── product.js             Product CRUD with variants and Cloudinary images
│   ├── role.js                RBAC role management
│   ├── banner.js              Position-based banner management
│   ├── shipment.js            Shiprocket shipment lifecycle
│   ├── coupon.js
│   ├── note.js                Admin sticky notes
│   ├── marketing_spend.js     Ad spend records per product
│   ├── dashboard.js           Aggregated metrics
│   └── users/
│       ├── customer.js        Register customer on order creation
│       ├── banner.js          Active banners for homepage
│       ├── product.js         Product browsing (bestsellers, new, trending, detail)
│       ├── category.js
│       ├── attribute.js
│       ├── cart.js            Guest cart — keyed by guestId
│       ├── checkout.js        Pincode delivery validation
│       ├── order.js           Order init, payment, track, cancel
│       ├── payment.js         Razorpay order creation + verification
│       ├── review.js          Product reviews
│       ├── coupon.js          Available coupons, apply
│       ├── returnOrder.js     OTP-based return initiation
│       └── support.js         Contact email
│
├── model/                     Mongoose schema definitions (see Section 5)
├── auth/
│   └── authorization.js       JWT middleware — validates Bearer token, populates req.admin
├── helper/
│   ├── multer.js              Multer disk/memory storage config
│   ├── cloudinary_upload.js   Upload buffer to Cloudinary, return URL
│   ├── emailHelper.js         Email template helpers
│   ├── mailer.js              Nodemailer transporter config
│   ├── otpHelper.js           Generate and verify OTPs (in-memory or DB)
│   ├── permission.js          RBAC middleware — checkPermission(action)
│   ├── sequenceHelper.js      Auto-increment number_id via Counter model
│   ├── slugHelper.js          Generate URL-friendly slugs from product names
│   ├── cartHelper.js          Cart total recalculation helpers
│   ├── utils.js               General-purpose utilities
│   └── whatsappHelper.js      WhatsApp API integration
├── database/
│   └── mongodb.js             Mongoose.connect() call
└── config/
    └── cloudinary.js          Cloudinary SDK configuration
```

---

## 4. API Endpoints

### Admin Endpoints (all require `Authorization: Bearer <token>`)

#### Admin Management
| Method | Path | Permission | Purpose |
|---|---|---|---|
| POST | `/admin/auth/signup` | `admin_create` | Create new admin |
| POST | `/admin/auth/login` | — | Login, returns JWT |
| GET | `/admin/list` | — | List all admins |
| GET | `/admin/profile` | — | Logged-in admin profile |
| PUT | `/admin/update-password` | — | Change own password |
| DELETE | `/admin/delete` | `admin_delete` | Delete an admin |

#### Categories
| Method | Path | Permission | Purpose |
|---|---|---|---|
| POST | `/category/create` | `category_add` | Create category |
| GET | `/category/list` | — | List all categories |
| PUT | `/category/update` | `category_update` | Update category |
| DELETE | `/category/delete` | `category_delete` | Delete category |

#### Attributes
| Method | Path | Permission | Purpose |
|---|---|---|---|
| POST | `/attributes/create` | `attribute_add` | Create attribute |
| PUT | `/attributes/update/:id` | `attribute_update` | Update attribute |
| GET | `/attributes/list` | — | List all attributes |
| DELETE | `/attributes/delete/:id` | `attribute_delete` | Delete attribute |

#### Products
| Method | Path | Permission | Purpose |
|---|---|---|---|
| POST | `/product/create` | `product_add` | Create product with images (multipart) |
| PUT | `/product/update/:id` | `product_update` | Update product (multipart) |
| GET | `/product/get_one/:id` | — | Get single product |
| GET | `/product/list` | — | List all products |

#### Roles
| Method | Path | Permission | Purpose |
|---|---|---|---|
| POST | `/role/create` | `role_create` | Create role with permissions array |
| GET | `/role/list` | — | List roles |
| GET | `/role/one` | — | Get single role |
| PUT | `/role/update` | `role_update` | Update role |
| DELETE | `/role/delete` | `role_delete` | Delete role |

#### Banners
| Method | Path | Permission | Purpose |
|---|---|---|---|
| POST | `/banners` | `banner_add` | Create banner (single image) |
| GET | `/banners` | — | List all banners |
| PUT | `/banners/:id` | `banner_update` | Update banner |
| DELETE | `/banners/:id` | `banner_delete` | Delete banner |
| PATCH | `/banners/:id/toggle` | `banner_update` | Toggle active status |

#### Orders
| Method | Path | Permission | Purpose |
|---|---|---|---|
| GET | `/orders/list` | — | List all orders |
| GET | `/orders/accepted` | — | Accepted orders ready for shipment |
| GET | `/orders/export` | — | Export all orders as PDF |
| GET | `/orders/export-one` | — | Export single order as PDF |
| GET | `/orders/:orderId` | — | Order detail |
| PATCH | `/orders/:orderId/status` | `order_update` | Update order status |
| PATCH | `/orders/:orderId/payment-status` | `order_update` | Update payment status |

#### Shipments
| Method | Path | Permission | Purpose |
|---|---|---|---|
| POST | `/shipments/create/:orderId` | `order_update` | Create Shiprocket shipment |
| GET | `/shipments/one` | — | Get single shipment |
| GET | `/shipments/order/:orderId` | — | Get shipments for an order |
| GET | `/shipments/list` | — | List all shipments |
| PATCH | `/shipments/:shipmentId/status` | `order_update` | Update shipment status |

#### Customers
| Method | Path | Purpose |
|---|---|---|
| GET | `/customers/list` | List all customers |

#### Reviews (Admin)
| Method | Path | Permission | Purpose |
|---|---|---|---|
| GET | `/reviews/list` | — | List all reviews |
| POST | `/reviews` | `review_add` | Add review manually |
| GET | `/reviews/:reviewId` | — | Get review |
| PUT | `/reviews/:reviewId` | `review_update` | Update review |
| DELETE | `/reviews/:reviewId` | `review_delete` | Delete review |

#### Coupons
| Method | Path | Permission | Purpose |
|---|---|---|---|
| POST | `/coupons` | `coupon_add` | Create coupon |
| GET | `/coupons/list` | — | List coupons |
| GET | `/coupons/get-one` | — | Get single coupon |
| PUT | `/coupons/update` | `coupon_update` | Update coupon |
| DELETE | `/coupons/delete` | `coupon_delete` | Delete coupon |

#### Return Orders (Admin)
| Method | Path | Permission | Purpose |
|---|---|---|---|
| GET | `/return-order/list` | — | List return orders |
| GET | `/return-order/get-one` | — | Get single return order |
| GET | `/return-order/get-shipment-details` | — | Shiprocket RTO details |
| PATCH | `/return-order/update-status` | `order_update` | Update return status |
| POST | `/return-order/create-shiprocket-return` | `order_update` | Initiate Shiprocket RTO |

#### Draft Orders
| Method | Path | Purpose |
|---|---|---|
| GET | `/draft-orders/list` | List abandoned checkouts |

#### Notes
| Method | Path | Purpose |
|---|---|---|
| POST | `/notes/create` | Create note |
| GET | `/notes/list` | List all notes |
| GET | `/notes/one/:id` | Get note |
| PUT | `/notes/update/:id` | Update note |
| DELETE | `/notes/delete/:id` | Delete note |

#### Marketing Spend
| Method | Path | Permission | Purpose |
|---|---|---|---|
| POST | `/marketing-spend/create` | `marketing_spend_add` | Log ad spend |
| GET | `/marketing-spend/list` | — | List records |
| GET | `/marketing-spend/one/:id` | — | Get record |
| PUT | `/marketing-spend/update/:id` | `marketing_spend_update` | Update record |
| DELETE | `/marketing-spend/delete/:id` | `marketing_spend_delete` | Delete record |

#### Dashboard
| Method | Path | Purpose |
|---|---|---|
| GET | `/dashboard/summary` | Aggregated KPI metrics |

---

### User / Public Endpoints (no auth required)

#### Banners
| Method | Path | Purpose |
|---|---|---|
| GET | `/users/banners/list` | Active banners for homepage sections |

#### Products
| Method | Path | Purpose |
|---|---|---|
| GET | `/users/products/bestsellers` | Bestseller product list |
| GET | `/users/products/trending` | Trending product list |
| GET | `/users/products/new` | New arrivals |
| GET | `/users/products/by-category` | Products filtered by category |
| GET | `/users/products/all` | Paginated full product list |
| GET | `/users/products/:id` | Product detail |
| GET | `/users/products/:id/related` | Related products |

#### Categories & Attributes
| Method | Path | Purpose |
|---|---|---|
| GET | `/users/categories/list` | Flat category list |
| GET | `/users/categories/grouped` | Hierarchical category tree |
| GET | `/users/attributes/list` | Attribute list |

#### Cart (Session-based via `x-guest-id` header)
| Method | Path | Purpose |
|---|---|---|
| GET | `/users/cart` | Get cart for guest |
| POST | `/users/cart/add` | Add item |
| PUT | `/users/cart/update/:cartItemId` | Update quantity |
| DELETE | `/users/cart/remove/:cartItemId` | Remove item |
| DELETE | `/users/cart/clear` | Clear cart |
| GET | `/users/cart/count` | Item count badge |

#### Checkout & Orders
| Method | Path | Purpose |
|---|---|---|
| GET | `/users/checkout/pincode/validate` | Validate delivery pincode |
| POST | `/users/orders/init` | Create order from cart |
| PATCH | `/users/orders/payment` | Update payment status after Razorpay |
| GET | `/users/orders/track` | Track order by ID |
| POST | `/users/orders/cancel` | Cancel order |

#### Payments (Razorpay)
| Method | Path | Purpose |
|---|---|---|
| POST | `/users/payments/razorpay/create` | Create Razorpay order |
| POST | `/users/payments/razorpay/verify` | Verify payment signature |
| GET | `/users/payments/status/:orderId` | Get payment status |

#### Coupons
| Method | Path | Purpose |
|---|---|---|
| GET | `/users/coupons/available` | List coupons visible to users |
| POST | `/users/coupons/apply` | Apply coupon code |

#### Reviews
| Method | Path | Purpose |
|---|---|---|
| GET | `/users/reviews` | Reviews for a product |
| POST | `/users/reviews` | Submit a review |

#### Returns
| Method | Path | Purpose |
|---|---|---|
| POST | `/users/return/send-otp` | Send OTP to verify return request |
| POST | `/users/return/verify-otp` | Verify OTP |
| POST | `/users/return/create` | Create return order |

#### Support
| Method | Path | Purpose |
|---|---|---|
| POST | `/users/support/contact` | Send contact/support email |

---

## 5. Database Models

### Admin (`model/admin.js`)
- `name` String, required
- `email` String, unique, lowercase
- `password` String, bcrypt-hashed
- `isSuperAdmin` Boolean, default false
- `role` ObjectId → Role
- `createdAt` Date

### Product (`model/product.js`)
- `name` String, required
- `SKU` String
- `description`, `details` String
- `images` [String] — Cloudinary URLs
- `category` ObjectId → Category
- `slug` String, indexed
- `status` enum: `ACTIVE` | `DRAFT`
- `selling_price`, `original_price`, `cost_price` Number
- `discount_percentage` Number
- `quantity` Number
- `attributes` [{attributeId, attributeValuesIds}]
- `variants` [{variant_name, variant_SKU, variant_price, variant_image, variant_attributes}]
- `is_best_seller`, `is_new`, `is_trending` Boolean
- `sort_order` Number

### Order (`model/order.js`)
- `number_id` Number, unique (auto-incremented)
- `order_id` String, unique
- `products` [{product_id, variant_id, product_name, quantity, unit_price, total}]
- `sub_total`, `shipping_amount`, `total_tax`, `total_amount` Number
- `order_status` enum: `pending` | `confirmed` | `accepted` | `shipment` | `delivered` | `missing` | `failed` | `cancelled`
- `payment_method`, `payment_status` String
- Customer fields: `email`, `phone`, `shipping_address`, `billing_address`
- timestamps

### Cart (`model/cart.js`)
- `guestId` String, unique, indexed
- `items` [{cartItemId, productId, variantId, quantity, price}]
- `totals` {subtotal, discount, total}
- timestamps

### Customer (`model/customer.js`)
- `name`, `email` (unique), `phone` String
- `shipping_address` {fullName, phone, email, address, landmark, city, state, pincode}
- `orders` [String] — order_ids
- timestamps

### Category (`model/category.js`)
- `name` String, required
- `parent_category_id` ObjectId → Category (self-referencing for hierarchy)

### Attributes (`model/attributes.js`)
- `name` String, required
- `values` [{value: String}]

### Role (`model/role.js`)
- `name`, `title` String, required
- `permissions` [enum] — e.g. `super_admin`, `admin_create`, `product_add`, `order_update`, `coupon_add`, etc.

### Coupon (`model/coupon.js`)
- `code` String, unique, uppercase
- `description` String
- `discountType` enum: `percentage` | `flat`
- `discountValue`, `minOrderValue`, `maxDiscountAmount` Number
- `usageLimit`, `usedCount` Number
- `validFrom`, `validTill` Date
- `isActive`, `showOnUserSide` Boolean
- `applicableToCOD`, `applicableToOnline` Boolean
- timestamps

### Review (`model/review.js`)
- `product` ObjectId → Product
- `name`, `email` String
- `rating` Number (1–5)
- `comment` String, max 1000
- `added_by` enum: `user` | `admin`
- timestamps

### Banner (`model/banner.js`)
- `image_url` String, required (Cloudinary URL)
- `title` String
- `position` enum: `homepage_hero` | `homepage_middle` | `homepage_bottom` | `homepage_category_strip` | `category_page` | `product_page`
- `category` ObjectId → Category
- `order` Number (display order)
- `is_active` Boolean
- timestamps

### Shipment (`model/shipment.js`)
- `number_id` Number, unique
- `order_id` ObjectId → Order
- `shiprocket_order_id`, `shipment_id`, `awb_code` String
- `courier_name` String, `courier_id` Number
- `pickup_scheduled` Boolean
- `shipment_status` enum: `created` | `pickup_scheduled` | `picked_up` | `in_transit` | `out_for_delivery` | `delivered` | `rto` | `cancelled`
- `tracking_url` String
- Dimensions: `weight`, `length`, `breadth`, `height` Number
- timestamps

### ReturnOrder (`model/returnOrder.js`)
- `number_id` Number, unique
- `order_id` ObjectId → Order
- `products` [{product_id, variant_id, product_name, quantity, unit_price}]
- `reason` String
- `status`, `shiprocket_return_id`, `rto_tracking_url` String
- timestamps

### DraftOrder (`model/draftOrder.js`)
- `email` String, indexed
- `shipping_address` {fullName, phone, email, address, city, state, pincode, landmark}
- `cart_items` [{productId, variantId, quantity}]
- `step` enum: `address` | `payment`
- `status` enum: `in_progress` | `converted`
- `sub_total`, `shipping_amount`, `total_tax`, `total_amount` Number
- timestamps

### Note (`model/note.js`)
- `title` String, required, max 200
- `content` String, required
- `createdBy` ObjectId → Admin
- timestamps

### MarketingSpend (`model/marketing_spend.js`)
- `product_id` ObjectId → Product
- `date` String (e.g. `"1/2024"` for month/year)
- `description` String
- `amount` Number

### Counter (`model/counter.js`)
- Used internally by `sequenceHelper.js` to generate auto-incrementing `number_id` values for orders and shipments.

---

## 6. Auth System

### Mechanism
- **Type**: Stateless JWT (Bearer token in `Authorization` header)
- **Token generation**: `jsonwebtoken.sign()` on login, returns token to client
- **Token validation**: `auth/authorization.js` middleware — runs before every admin route
  1. Reads `Authorization: Bearer <token>` header
  2. Verifies with `jwt.verify(token, secret)`
  3. Looks up admin in DB, populates `role` with permissions
  4. Sets `req.admin` for downstream handlers

### RBAC (Role-Based Access Control)
- `helper/permission.js` exports `checkPermission(action)` — a middleware factory
- Checks `req.admin.role.permissions` array for the required action string
- Super-admins bypass permission checks (`isSuperAdmin === true`)
- Routes that mutate data wrap their handler: `router.post('/path', checkPermission('action'), controller)`

### Security Issues to Address
- JWT secret is hardcoded as the string `"rushabh"` in `auth/authorization.js` — **must be moved to `JWT_SECRET` env var**.
- MongoDB connection string is hardcoded in `database/mongodb.js` — **must be moved to `MONGODB_URI` env var**.

---

## 7. Environment Variables

The following keys are required in `.env`:

```
# Database
MONGODB_URI

# Cloudinary
CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY
CLOUDINARY_SECRET_KEY
CLOUDINARY_ENV

# JWT
JWT_SECRET

# Email (Nodemailer)
SUPPORT_EMAIL
ADMIN_EMAIL
ADMIN_EMAIL_PASSWORD

# Razorpay
RAZORPAY_KEY_ID
RAZORPAY_KEY_SECRET

# Shiprocket
SHIPROCKET_EMAIL
SHIPROCKET_PASSWORD
SHIPROCKET_PICKUP_LOCATION_NAME

# Server
PORT
```

---

## 8. Known Issues / TODOs

- **JWT secret hardcoded** — `auth/authorization.js` uses `"rushabh"` instead of `process.env.JWT_SECRET`. Critical security issue.
- **MongoDB URI hardcoded** — `database/mongodb.js` connects with a literal Atlas URI instead of an env var.
- **No token expiry refresh** — JWT tokens expire silently; no refresh-token mechanism.
- **OTP storage** — verify whether OTPs are stored in-memory (lost on restart) or persisted in DB (`helper/otpHelper.js`).
- **Razorpay test mode** — keys in `.env` are test-mode; swap for live keys before going to production.
- **Rate limiting** — no rate limiting on auth or OTP endpoints; vulnerable to brute force.
- **Input validation** — no schema-level request validation middleware (e.g. Joi/Zod); validation relies on Mongoose and ad-hoc checks.
- **Error handling** — error responses are inconsistent across controllers; a global error handler would standardise `{ error, message }` shape.
- **`/utils/add-random-data`** seed endpoint is accessible in production — should be removed or gated.
- **CORS** — verify `app.js` CORS config allows only expected origins before production deploy.
- **PDF generation** — `html-pdf` uses PhantomJS which is unmaintained; consider migrating to Puppeteer.

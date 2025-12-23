# Razorpay Payment Integration Setup Guide

## Backend Setup

### 1. Install Dependencies
```bash
cd backEnd
npm install razorpay
```

### 2. Environment Variables
Add these to your `.env` file in the `backEnd` directory:

```env
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

### 3. Get Razorpay Credentials
1. Sign up at https://razorpay.com
2. Go to Dashboard → Settings → API Keys
3. Generate Test/Live API keys
4. Copy Key ID and Key Secret to `.env` file

## Frontend Setup

### 1. Install Dependencies
```bash
cd frontend
npm install razorpay
```

### 2. Razorpay Script
The Razorpay checkout script is automatically loaded when user selects "Online Payment" option.

## Payment Flow

### Step 1: Create Order (Shipping Details)
- User fills shipping form
- Backend creates order with status `pending`
- Order ID is returned to frontend

### Step 2: Payment Selection
- User selects payment method (COD or Online)
- If Online: Razorpay checkout is initialized

### Step 3: Razorpay Payment (Online Only)
1. Frontend calls `/users/payments/razorpay/create/:orderId`
2. Backend creates Razorpay order
3. Frontend opens Razorpay checkout modal
4. User completes payment

### Step 4: Payment Verification
1. Razorpay returns payment response
2. Frontend calls `/users/payments/razorpay/verify/:orderId`
3. Backend verifies payment signature
4. Backend updates order status to `paid` and `confirmed`
5. Cart is cleared
6. User redirected to success page

## API Endpoints

### Create Razorpay Order
```
POST /users/payments/razorpay/create/:orderId
Body: { amount: number, currency: 'INR' }
Response: { status, data: { order_id, amount, currency, key_id } }
```

### Verify Payment
```
POST /users/payments/razorpay/verify/:orderId
Body: { 
  razorpay_order_id, 
  razorpay_payment_id, 
  razorpay_signature 
}
Response: { status, data: { order_id, payment_status, order_status } }
```

### Get Payment Status
```
GET /users/payments/status/:orderId
Response: { status, data: { payment_status, payment_method, order_status } }
```

## Testing

### Test Mode
- Use Razorpay test credentials
- Test card: 4111 1111 1111 1111
- Any future expiry date
- Any CVV
- Any name

### Production
- Switch to live credentials
- Update `.env` with live keys
- Test with real payment methods

## Security Notes

1. **Never expose Key Secret** in frontend
2. Always verify payment signature on backend
3. Use HTTPS in production
4. Validate amounts on backend
5. Store Razorpay order IDs in database

## Order Model Updates

The order model now includes:
- `razorpay_order_id`: Razorpay order ID
- `razorpay_payment_id`: Razorpay payment ID
- `paid_at`: Payment timestamp

## Error Handling

- Payment failures are caught and displayed to user
- Failed payments don't update order status
- Users can retry payment
- All errors are logged for debugging

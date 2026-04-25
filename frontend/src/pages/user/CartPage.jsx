import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/user/Navbar';
import Footer from '../../components/user/Footer';
import { Loader2, ShoppingBag, Trash2, Plus, Minus, IndianRupee, PackageSearch, Tag } from 'lucide-react';
import { getCart, updateCartItem, removeFromCart, clearCart } from '../../services/user/cartService';
import { getAvailableCoupons, applyCoupon } from '../../services/user/couponService';
import toast from 'react-hot-toast';
import useSEO from '../../hooks/useSEO';

const CartPage = () => {
  const navigate = useNavigate();
  useSEO({
    title: 'Shopping Cart | SIYARA',
    description: 'Review items in your shopping cart. Proceed to checkout for secure payment.',
    noindex: true,
  });
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [clearing, setClearing] = useState(false);
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [couponInput, setCouponInput] = useState('');
  const [couponPreview, setCouponPreview] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState('');
  const [codWarning, setCodWarning] = useState('');

  useEffect(() => {
    // Scroll to top when cart page loads
    window.scrollTo(0, 0);
    fetchCart();
    fetchAvailableCoupons();
  }, []);

  const fetchAvailableCoupons = async () => {
    try {
      const response = await getAvailableCoupons();
      if (response.status) {
        setAvailableCoupons(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching coupons:', error);
      setAvailableCoupons([]);
    }
  };

  const handlePreviewCoupon = async () => {
    const code = couponInput.trim().toUpperCase();
    if (!code || !cart?.subtotal) return;

    setPreviewLoading(true);
    setPreviewError('');
    setCodWarning('');
    setCouponPreview(null);

    try {
      // Call without paymentMethod so COD restriction is not enforced for preview
      const response = await applyCoupon(code, cart.subtotal);
      if (response.status) {
        setCouponPreview(response.data);
        // Soft warning if coupon is not valid for COD
        const matched = availableCoupons.find((c) => c.code === code);
        if (matched && !matched.applicableToCOD) {
          setCodWarning('This coupon is not valid for Cash on Delivery');
        }
        localStorage.setItem('previewedCouponCode', code);
        localStorage.setItem('previewedCouponData', JSON.stringify(response.data));
      }
    } catch (error) {
      setPreviewError(error.message || 'Invalid coupon code');
      localStorage.removeItem('previewedCouponCode');
      localStorage.removeItem('previewedCouponData');
    } finally {
      setPreviewLoading(false);
    }
  };

  const fetchCart = async () => {
    try {
      setLoading(true);
      const response = await getCart();
      if (response.status) {
        setCart(response.data);
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
      toast.error(error.message || 'Failed to load cart');
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = async (cartItemId, newQuantity) => {
    if (newQuantity < 1) return;

    try {
      setUpdating(cartItemId);
      const response = await updateCartItem(cartItemId, newQuantity);
      if (response.status) {
        await fetchCart();
        window.dispatchEvent(new Event('cart-updated'));
        toast.success('Cart updated');
      }
    } catch (error) {
      console.error('Error updating cart:', error);
      toast.error(error.message || 'Failed to update cart');
    } finally {
      setUpdating(null);
    }
  };

  const handleRemoveItem = async (cartItemId) => {
    try {
      setUpdating(cartItemId);
      const response = await removeFromCart(cartItemId);
      if (response.status) {
        await fetchCart();
        window.dispatchEvent(new Event('cart-updated'));
        toast.success('Item removed from cart');
      }
    } catch (error) {
      console.error('Error removing item:', error);
      toast.error(error.message || 'Failed to remove item');
    } finally {
      setUpdating(null);
    }
  };

  const handleClearCart = async () => {
    if (!window.confirm('Are you sure you want to clear your cart?')) {
      return;
    }

    try {
      setClearing(true);
      const response = await clearCart();
      if (response.status) {
        await fetchCart();
        window.dispatchEvent(new Event('cart-updated'));
        toast.success('Cart cleared');
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
      toast.error(error.message || 'Failed to clear cart');
    } finally {
      setClearing(false);
    }
  };

  const normalizeImagePath = (imagePath) => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    return imagePath;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
        </main>
        <Footer />
      </div>
    );
  }

  const isEmpty = !cart || !cart.items || cart.items.length === 0;

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 lg:px-6 py-10">
        <div className="mb-6 sm:mb-8">
          <div className="flex items-start justify-between gap-3 sm:gap-4 flex-wrap">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold text-[#481d6f]">Shopping Cart</h1>
              <p className="text-xs sm:text-sm text-[#481d6f] mt-1 sm:mt-2">
                {isEmpty ? 'Your cart is empty' : `${cart.totalItems} ${cart.totalItems === 1 ? 'item' : 'items'} in your cart`}
              </p>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              <button
                onClick={() => navigate('/order/track')}
                className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 border-[1.5px] border-[rgb(72,29,111)] text-[rgb(72,29,111)] rounded-full text-xs sm:text-sm font-semibold hover:bg-[rgba(72,29,111,0.08)] transition-all duration-200"
              >
                <PackageSearch className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden xs:inline">Track Order</span>
                <span className="xs:hidden">Track</span>
              </button>
              {!isEmpty && (
                <button
                  onClick={handleClearCart}
                  disabled={clearing}
                  className="text-xs sm:text-sm text-red-600 hover:text-red-700 font-medium disabled:opacity-50 whitespace-nowrap"
                >
                  {clearing ? 'Clearing...' : 'Clear'}
                </button>
              )}
            </div>
          </div>
        </div>

        {isEmpty ? (
          <div className="text-center py-20">
            <ShoppingBag className="w-24 h-24 text-gray-300 mx-auto mb-6" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Your cart is empty</h2>
            <p className="text-gray-500 mb-8">Start shopping to add items to your cart</p>
            <button
              onClick={() => navigate('/sale')}
              className="px-6 py-3 bg-[rgb(72,29,111)] text-white rounded-full font-semibold hover:bg-[#390e60] transition-all duration-200"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {/* Cart Items List */}
              {cart.items.map((item) => (
                <div
                  key={item.cartItemId}
                  className="bg-white border-2 border-gray-100 rounded-lg p-3 sm:p-6 hover:border-gray-200 transition-all"
                >
                  <div className="flex gap-3 sm:gap-4">
                    {/* Product Image - Shows variant image if variant selected, otherwise product image */}
                    <div
                      className="w-20 h-24 sm:w-24 sm:h-32 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 cursor-pointer flex items-center justify-center"
                      onClick={() => navigate(item.product.slug ? `/product/${item.product.slug}/${item.productId}` : `/product/${item.productId}`)}
                    >
                      <img
                        src={normalizeImagePath(item.image || item.product.images?.[0])}
                        alt={item.product.name}
                        className="max-h-full max-w-full object-contain"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/200x300?text=Image';
                        }}
                      />
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 sm:gap-4">
                        <div className="flex-1 min-w-0">
                          <h3
                            className="font-semibold text-gray-900 text-base sm:text-lg mb-1 cursor-pointer hover:text-[#481d6f]-600 transition-colors line-clamp-2"
                            onClick={() => navigate(item.product.slug ? `/product/${item.product.slug}/${item.productId}` : `/product/${item.productId}`)}
                          >
                            {item.product.name}
                          </h3>
                          {item.variantName && (
                            <p className="text-xs sm:text-sm text-gray-500 mb-2">
                              Option: <span className="font-medium text-gray-700">{item.variantName}</span>
                            </p>
                          )}
                          <div className="flex items-center gap-2 mb-2 sm:mb-3">
                            <div className="flex items-center gap-1">
                              <IndianRupee className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-900" />
                              <span className="text-base sm:text-lg font-bold text-gray-900">
                                {item.price?.toLocaleString('en-IN') || '0'}
                              </span>
                            </div>
                            {item.product.original_price && item.product.original_price > item.price && (
                              <span className="text-xs sm:text-sm text-gray-400 line-through">
                                ₹ {item.product.original_price.toLocaleString('en-IN')}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Remove Button */}
                        <button
                          onClick={() => handleRemoveItem(item.cartItemId)}
                          disabled={updating === item.cartItemId}
                          className="p-1.5 sm:p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 flex-shrink-0"
                          title="Remove item"
                        >
                          {updating === item.cartItemId ? (
                            <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                          )}
                        </button>
                      </div>

                      {/* Quantity Controls - Horizontal layout with subtotal */}
                      <div className="flex items-center justify-between gap-2 sm:gap-4 mt-3 sm:mt-4">
                        <div className="flex items-center gap-2">
                          <span className="text-xs sm:text-sm font-medium text-gray-700">Qty:</span>
                          <div className="flex items-center border-2 border-gray-200 rounded-lg">
                            <button
                              onClick={() => handleQuantityChange(item.cartItemId, item.quantity - 1)}
                              disabled={item.quantity <= 1 || updating === item.cartItemId}
                              className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-l-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Minus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            </button>
                            <span className="px-2 sm:px-4 py-1.5 sm:py-2 text-sm font-semibold text-gray-900 min-w-[2rem] sm:min-w-[3rem] text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => handleQuantityChange(item.cartItemId, item.quantity + 1)}
                              disabled={updating === item.cartItemId}
                              className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-r-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            </button>
                          </div>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="text-[10px] sm:text-xs text-gray-500">Subtotal</span>
                          <div className="flex items-center gap-0.5 sm:gap-1">
                            <IndianRupee className="w-3 h-3 sm:w-4 sm:h-4 text-gray-900" />
                            <span className="text-sm sm:text-lg font-bold text-gray-900">
                              {(item.subtotal || 0).toLocaleString('en-IN')}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white border-2 border-gray-200 rounded-lg p-6 sticky top-4">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>

                {/* Coupon Preview */}
                <div className="mb-6 pb-6 border-b border-gray-200">
                  <p className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
                    <Tag className="w-4 h-4 text-[rgb(72,29,111)]" />
                    Have a coupon? Preview your discount
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => {
                        setCouponInput(e.target.value.toUpperCase());
                        setCouponPreview(null);
                        setPreviewError('');
                        setCodWarning('');
                        if (!e.target.value) {
                          localStorage.removeItem('previewedCouponCode');
                          localStorage.removeItem('previewedCouponData');
                        }
                      }}
                      onKeyDown={(e) => e.key === 'Enter' && handlePreviewCoupon()}
                      placeholder="Enter coupon code"
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[rgb(72,29,111)] uppercase"
                    />
                    <button
                      onClick={handlePreviewCoupon}
                      disabled={previewLoading || !couponInput.trim()}
                      className="px-4 py-2 bg-[rgb(72,29,111)] text-white text-sm font-semibold rounded-lg hover:bg-[#390e60] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                    >
                      {previewLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Check'}
                    </button>
                  </div>

                  {previewError && (
                    <p className="text-xs text-red-600 mt-2">{previewError}</p>
                  )}

                  {codWarning && (
                    <div className="mt-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                      ⚠️ {codWarning}
                    </div>
                  )}

                  {couponPreview && (
                    <div className="mt-3 bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Tag className="w-4 h-4 text-green-700" />
                        <span className="text-sm font-semibold text-green-800">{couponPreview.couponCode}</span>
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Preview</span>
                      </div>
                      <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span>Discount</span>
                        <span className="text-green-700 font-semibold">−₹{couponPreview.discountAmount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-xs mb-2">
                        <span className="text-gray-600">Estimated total</span>
                        <span className="font-bold text-gray-900">₹{Math.round(couponPreview.finalAmount).toLocaleString('en-IN')}</span>
                      </div>
                      <p className="text-[10px] text-gray-500">Final discount applied at checkout • Subject to payment method</p>
                    </div>
                  )}

                  {availableCoupons.length > 0 && !couponPreview && (
                    <p className="text-xs text-[rgb(72,29,111)] mt-2">
                      {availableCoupons.length} {availableCoupons.length === 1 ? 'coupon' : 'coupons'} available for this order
                    </p>
                  )}
                </div>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-gray-700">
                    <span>Subtotal</span>
                    <div className="flex items-center gap-1">
                      <IndianRupee className="w-4 h-4" />
                      <span className="font-semibold">
                        {(cart.subtotal || 0).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                  {couponPreview && (
                    <div className="flex justify-between text-green-700">
                      <span className="text-sm">Coupon ({couponPreview.couponCode})</span>
                      <div className="flex items-center gap-1">
                        <IndianRupee className="w-4 h-4" />
                        <span className="font-semibold">−{couponPreview.discountAmount.toFixed(2)}</span>
                      </div>
                    </div>
                  )}
                  <div className="flex justify-between text-gray-700">
                    <span>Shipping</span>
                    <span className="font-semibold text-green-600">Free</span>
                  </div>
                  <div className="border-t border-gray-300 pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-gray-900">
                        {couponPreview ? 'Est. Total' : 'Total'}
                      </span>
                      <div className="flex flex-col items-end">
                        {couponPreview && (
                          <span className="text-sm text-gray-400 line-through">
                            ₹{(cart.subtotal || 0).toLocaleString('en-IN')}
                          </span>
                        )}
                        <div className="flex items-center gap-1">
                          <IndianRupee className="w-5 h-5 text-gray-900" />
                          <span className="text-2xl font-bold text-gray-900">
                            {couponPreview
                              ? Math.round(couponPreview.finalAmount).toLocaleString('en-IN')
                              : (cart.subtotal || 0).toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => navigate('/checkout')}
                  className="w-full bg-[rgb(72,29,111)] text-white py-4 rounded-full font-semibold hover:bg-[#390e60] transition-all duration-200 mb-3"
                >
                  Proceed to Checkout
                </button>

                {/*  <button
                  onClick={() => navigate('/order/track')}
                  className="w-full bg-white border-[1.5px] border-[rgb(72,29,111)] text-[rgb(72,29,111)] py-3 rounded-full font-semibold hover:bg-[rgba(72,29,111,0.08)] transition-all duration-200 mb-3 flex items-center justify-center gap-2"
                >
                  <PackageSearch className="w-4 h-4" />
                  Track Order
                </button> */}

                <button
                  onClick={() => navigate('/sale')}
                  className="w-full bg-white border-[1.5px] border-[rgb(72,29,111)] text-[rgb(72,29,111)] py-3 rounded-full font-semibold hover:bg-[rgba(72,29,111,0.08)] transition-all duration-200"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default CartPage;


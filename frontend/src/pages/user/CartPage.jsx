import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/user/Navbar';
import Footer from '../../components/user/Footer';
import { Loader2, ShoppingBag, Trash2, Plus, Minus, IndianRupee, X } from 'lucide-react';
import { getCart, updateCartItem, removeFromCart, clearCart } from '../../services/user/cartService';
import toast from 'react-hot-toast';

const CartPage = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [clearing, setClearing] = useState(false);

  useEffect(() => {
    fetchCart();
  }, []);

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
        await fetchCart(); // Refresh cart
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
        await fetchCart(); // Refresh cart
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
        await fetchCart(); // Refresh cart
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
      <div className="min-h-screen flex flex-col bg-white">
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
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 lg:px-6 py-10">
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
            <p className="text-sm text-gray-500 mt-2">
              {isEmpty ? 'Your cart is empty' : `${cart.totalItems} ${cart.totalItems === 1 ? 'item' : 'items'} in your cart`}
            </p>
          </div>
          {!isEmpty && (
            <button
              onClick={handleClearCart}
              disabled={clearing}
              className="text-sm text-red-600 hover:text-red-700 font-medium disabled:opacity-50"
            >
              {clearing ? 'Clearing...' : 'Clear Cart'}
            </button>
          )}
        </div>

        {isEmpty ? (
          <div className="text-center py-20">
            <ShoppingBag className="w-24 h-24 text-gray-300 mx-auto mb-6" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Your cart is empty</h2>
            <p className="text-gray-500 mb-8">Start shopping to add items to your cart</p>
            <button
              onClick={() => navigate('/sale')}
              className="px-6 py-3 bg-gray-900 text-white rounded-full font-semibold hover:bg-black transition-colors"
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
                  className="bg-white border-2 border-gray-100 rounded-lg p-6 hover:border-gray-200 transition-all"
                >
                  <div className="flex gap-4">
                    {/* Product Image - Shows variant image if variant selected, otherwise product image */}
                    <div
                      className="w-24 h-32 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 cursor-pointer flex items-center justify-center"
                      onClick={() => navigate(`/product/${item.productId}`)}
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
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <h3
                            className="font-semibold text-gray-900 text-lg mb-1 cursor-pointer hover:text-rose-600 transition-colors"
                            onClick={() => navigate(`/product/${item.productId}`)}
                          >
                            {item.product.name}
                          </h3>
                          {item.variantName && (
                            <p className="text-sm text-gray-500 mb-2">
                              Option: <span className="font-medium text-gray-700">{item.variantName}</span>
                            </p>
                          )}
                          <div className="flex items-center gap-2 mb-3">
                            <div className="flex items-center gap-1">
                              <IndianRupee className="w-4 h-4 text-gray-900" />
                              <span className="text-lg font-bold text-gray-900">
                                {item.price?.toLocaleString('en-IN') || '0'}
                              </span>
                            </div>
                            {item.product.original_price && item.product.original_price > item.price && (
                              <span className="text-sm text-gray-400 line-through">
                                ₹ {item.product.original_price.toLocaleString('en-IN')}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Remove Button */}
                        <button
                          onClick={() => handleRemoveItem(item.cartItemId)}
                          disabled={updating === item.cartItemId}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                          title="Remove item"
                        >
                          {updating === item.cartItemId ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : (
                            <Trash2 className="w-5 h-5" />
                          )}
                        </button>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-4 mt-4">
                        <span className="text-sm font-medium text-gray-700">Quantity:</span>
                        <div className="flex items-center gap-2 border-2 border-gray-200 rounded-lg">
                          <button
                            onClick={() => handleQuantityChange(item.cartItemId, item.quantity - 1)}
                            disabled={item.quantity <= 1 || updating === item.cartItemId}
                            className="p-2 hover:bg-gray-100 rounded-l-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="px-4 py-2 text-sm font-semibold text-gray-900 min-w-[3rem] text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleQuantityChange(item.cartItemId, item.quantity + 1)}
                            disabled={updating === item.cartItemId}
                            className="p-2 hover:bg-gray-100 rounded-r-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="ml-auto">
                          <span className="text-sm text-gray-500">Subtotal:</span>
                          <div className="flex items-center gap-1">
                            <IndianRupee className="w-4 h-4 text-gray-900" />
                            <span className="text-lg font-bold text-gray-900">
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
              <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-6 sticky top-4">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>

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
                  <div className="flex justify-between text-gray-700">
                    <span>Shipping</span>
                    <span className="font-semibold text-green-600">Free</span>
                  </div>
                  <div className="border-t border-gray-300 pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-gray-900">Total</span>
                      <div className="flex items-center gap-1">
                        <IndianRupee className="w-5 h-5 text-gray-900" />
                        <span className="text-2xl font-bold text-gray-900">
                          {(cart.subtotal || 0).toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => navigate('/checkout')}
                  className="w-full bg-gray-900 text-white py-4 rounded-full font-semibold hover:bg-black transition-colors mb-4"
                >
                  Proceed to Checkout
                </button>

                <button
                  onClick={() => navigate('/sale')}
                  className="w-full bg-white border-2 border-gray-300 text-gray-900 py-3 rounded-full font-semibold hover:border-gray-400 transition-colors"
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


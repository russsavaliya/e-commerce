/**
 * Checkout Page
 * User can add shipping details and review order before placing it
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/user/Navbar';
import Footer from '../../components/user/Footer';
import { Loader2, IndianRupee, MapPin, User, Phone, Mail, Home, ArrowLeft } from 'lucide-react';
import { getCart } from '../../services/user/cartService';
import { validatePincode } from '../../services/user/checkoutService';
import toast from 'react-hot-toast';
import ShippingForm from '../../components/user/checkout/ShippingForm';
import OrderSummary from '../../components/user/checkout/OrderSummary';
import CartItemsReview from '../../components/user/checkout/CartItemsReview';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [shippingData, setShippingData] = useState({
    fullName: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    landmark: '',
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pincodeValidating, setPincodeValidating] = useState(false);
  const [pincodeValid, setPincodeValid] = useState(null);
  const [pincodeValidationTimeout, setPincodeValidationTimeout] = useState(null);

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const response = await getCart();
      if (response.status) {
        setCart(response.data);
        // Redirect to cart if cart is empty
        if (!response.data.items || response.data.items.length === 0) {
          toast.error('Your cart is empty');
          navigate('/cart');
        }
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
      toast.error(error.message || 'Failed to load cart');
      navigate('/cart');
    } finally {
      setLoading(false);
    }
  };

  const handleShippingChange = (field, value) => {
    setShippingData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }

    // Validate pincode when it's entered (with debounce)
    if (field === 'pincode') {
      // Clear previous timeout
      if (pincodeValidationTimeout) {
        clearTimeout(pincodeValidationTimeout);
      }

      if (value.length === 6) {
        // Debounce validation - wait 500ms after user stops typing
        const timeout = setTimeout(() => {
          validatePincodeValue(value);
        }, 500);
        setPincodeValidationTimeout(timeout);
      } else if (value.length < 6) {
        setPincodeValid(null);
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.pincode;
          return newErrors;
        });
      }
    }
  };

  const validatePincodeValue = async (pincode) => {
    if (!pincode || pincode.length !== 6) {
      setPincodeValid(null);
      return;
    }

    // Format validation first
    if (!/^[1-9][0-9]{5}$/.test(pincode)) {
      setPincodeValid(false);
      setErrors(prev => ({
        ...prev,
        pincode: 'Invalid pincode format'
      }));
      return;
    }

    try {
      setPincodeValidating(true);
      const response = await validatePincode(pincode);
      
      if (response.status && response.valid) {
        setPincodeValid(true);
        // Auto-fill city and state if available
        if (response.data) {
          setShippingData(prev => ({
            ...prev,
            city: response.data.city || prev.city,
            state: response.data.state || prev.state
          }));
        }
        // Clear any previous pincode error
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.pincode;
          return newErrors;
        });
      } else {
        setPincodeValid(false);
        setErrors(prev => ({
          ...prev,
          pincode: response.message || 'Invalid pincode. Please enter a valid Indian pincode'
        }));
      }
    } catch (error) {
      console.error('Error validating pincode:', error);
      // Don't show error if API fails, just mark as unknown
      setPincodeValid(null);
    } finally {
      setPincodeValidating(false);
    }
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (pincodeValidationTimeout) {
        clearTimeout(pincodeValidationTimeout);
      }
    };
  }, [pincodeValidationTimeout]);

  const validateForm = () => {
    const newErrors = {};

    if (!shippingData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!shippingData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[6-9]\d{9}$/.test(shippingData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
    }

    if (!shippingData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(shippingData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!shippingData.address.trim()) {
      newErrors.address = 'Address is required';
    }

    if (!shippingData.city.trim()) {
      newErrors.city = 'City is required';
    }

    if (!shippingData.state.trim()) {
      newErrors.state = 'State is required';
    }

    if (!shippingData.pincode.trim()) {
      newErrors.pincode = 'Pincode is required';
    } else if (!/^[1-9][0-9]{5}$/.test(shippingData.pincode)) {
      newErrors.pincode = 'Please enter a valid 6-digit pincode';
    } else if (pincodeValid === false) {
      newErrors.pincode = 'Invalid pincode. Please enter a valid Indian pincode';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePlaceOrder = async () => {
    if (!validateForm()) {
      toast.error('Please fill all required fields correctly');
      return;
    }

    try {
      setIsSubmitting(true);
      // TODO: Implement order placement API call
      // const response = await placeOrder({ shippingData, cart });
      
      // For now, just show success message
      toast.success('Order placed successfully!', {
        icon: '🎉',
      });
      
      // Navigate to order confirmation page (to be created)
      // navigate('/order-confirmation');
      
      // For now, redirect to home
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (error) {
      console.error('Error placing order:', error);
      toast.error(error.message || 'Failed to place order');
    } finally {
      setIsSubmitting(false);
    }
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

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Navbar />
        <main className="flex-1 flex items-center justify-center py-20">
          <div className="text-center">
            <p className="text-lg text-gray-600 mb-4">Your cart is empty</p>
            <button
              onClick={() => navigate('/cart')}
              className="px-6 py-3 bg-gray-900 text-white rounded-full font-semibold hover:bg-black transition-colors"
            >
              Go to Cart
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 lg:px-6 py-10">
        {/* Back Button */}
        <button
          onClick={() => navigate('/cart')}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Cart
        </button>

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Checkout</h1>
          <p className="text-gray-600">Review your order and add shipping details</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Left Column - Shipping Form and Cart Items */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Address Form */}
            <ShippingForm
              shippingData={shippingData}
              errors={errors}
              onChange={handleShippingChange}
              pincodeValid={pincodeValid}
              pincodeValidating={pincodeValidating}
            />

            {/* Cart Items Review */}
            <CartItemsReview cart={cart} />
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <OrderSummary
              cart={cart}
              onPlaceOrder={handlePlaceOrder}
              isSubmitting={isSubmitting}
            />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CheckoutPage;


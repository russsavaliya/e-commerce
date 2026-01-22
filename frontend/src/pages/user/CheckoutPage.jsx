/**
 * Checkout Page
 * User can add shipping details and review order before placing it
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/user/Navbar';
import Footer from '../../components/user/Footer';
import { Loader2, ArrowLeft, CreditCard, Wallet, Tag, X, CheckCircle2 } from 'lucide-react';
import { getCart } from '../../services/user/cartService';
import { validatePincode, initOrder, updatePayment, createRazorpayOrder, verifyRazorpayPayment } from '../../services/user/checkoutService';
import { applyCoupon, getAvailableCoupons } from '../../services/user/couponService';
import toast from 'react-hot-toast';
import ShippingForm from '../../components/user/checkout/ShippingForm';
import OrderSummary from '../../components/user/checkout/OrderSummary';
import CartItemsReview from '../../components/user/checkout/CartItemsReview';

const normalizeCouponPayload = (rawCoupon) => {
  if (!rawCoupon) {
    return null;
  }

  const rawDiscount = rawCoupon.roundedDiscountAmount ?? rawCoupon.discountAmount ?? 0;
  const safeDiscount = typeof rawDiscount === 'number' ? rawDiscount : Number(rawDiscount) || 0;
  const normalizedDiscount = Number(safeDiscount.toFixed(2));
  const rawFinal = rawCoupon.roundedFinalAmount ?? rawCoupon.finalAmount ?? Math.max(0, (rawCoupon.cartTotal || 0) - normalizedDiscount);
  const safeFinal = typeof rawFinal === 'number' ? rawFinal : Number(rawFinal) || 0;
  const normalizedFinal = Number(safeFinal);

  return {
    ...rawCoupon,
    discountAmount: normalizedDiscount,
    roundedDiscountAmount: normalizedDiscount,
    finalAmount: normalizedFinal,
    roundedFinalAmount: normalizedFinal,
  };
};

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
  const [currentStep, setCurrentStep] = useState('shipping'); // 'shipping' | 'payment'
  const [selectedPayment, setSelectedPayment] = useState('cod');
  const [draftOrderId, setDraftOrderId] = useState(null);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [applyingCoupon, setApplyingCoupon] = useState(null); // Track which coupon is being applied
  const [couponError, setCouponError] = useState('');
  const [availableCoupons, setAvailableCoupons] = useState([]);

  useEffect(() => {
    fetchCart();
  }, []);

  // Fetch available coupons when payment method changes or step changes
  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        // Fetch coupons for both payment methods to show instruction in shipping step
        const response = await getAvailableCoupons();
        if (response.status) {
          setAvailableCoupons(response.data || []);
        }
      } catch (error) {
        console.error('Error fetching coupons:', error);
        setAvailableCoupons([]);
      }
    };

    // Fetch coupons when component mounts or step changes
    fetchCoupons();
  }, [currentStep]);

  // Filter coupons based on selected payment method when in payment step
  useEffect(() => {
    if (currentStep === 'payment' && appliedCoupon) {
      // Check if applied coupon is compatible with selected payment method
      const isCompatible = selectedPayment === 'cod'
        ? availableCoupons.some(c => c.code === appliedCoupon.couponCode && c.applicableToCOD)
        : availableCoupons.some(c => c.code === appliedCoupon.couponCode && c.applicableToOnline);

      if (!isCompatible) {
        const couponData = availableCoupons.find(c => c.code === appliedCoupon.couponCode);
        const paymentMethodName = selectedPayment === 'cod' ? 'Cash on Delivery' : 'Online Payment';
        setAppliedCoupon(null);
        toast.error(`Coupon ${appliedCoupon.couponCode} is not applicable for ${paymentMethodName} orders and has been removed`);
      }
    }
  }, [selectedPayment, currentStep, appliedCoupon, availableCoupons]);

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

  const handleContinueToPayment = async () => {
    if (!validateForm()) {
      toast.error('Please fill all required fields correctly');
      return;
    }

    // If draft order already created, just move to payment step
    if (draftOrderId) {
      setCurrentStep('payment');
      return;
    }

    try {
      setIsSubmitting(true);
      const orderData = {
        ...shippingData,
        ...(appliedCoupon ? {
          coupon_id: appliedCoupon.couponId,
          coupon_code: appliedCoupon.couponCode,
          discount_amount: appliedCoupon.discountAmount,
        } : {}),
      };
      const response = await initOrder(orderData);
      if (response.status) {
        setDraftOrderId(response.data.draft_order_id);
        toast.success('Address saved. Proceed to payment.');
        setCurrentStep('payment');
      }
    } catch (error) {
      console.error('Error creating draft order:', error);
      toast.error(error.message || 'Failed to save address');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Load Razorpay script
  useEffect(() => {
    if (selectedPayment === 'online' && currentStep === 'payment') {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      document.body.appendChild(script);

      return () => {
        // Cleanup script on unmount
        const existingScript = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
        if (existingScript) {
          document.body.removeChild(existingScript);
        }
      };
    }
  }, [selectedPayment, currentStep]);

  const handleRazorpayPayment = async () => {
    if (!draftOrderId || !cart) {
      toast.error('Draft order information missing');
      return;
    }

    try {
      setIsSubmitting(true);

      // Calculate total amount
      const subtotal = cart.subtotal || 0;
      const shipping = 0; // Free shipping
      const discount = appliedCoupon ? appliedCoupon.discountAmount : 0;
      const baseTotal = Math.max(0, subtotal + shipping - discount);
      const totalAmount = Math.max(
        0,
        appliedCoupon ? (appliedCoupon.finalAmount ?? baseTotal) : baseTotal
      );

      // Create Razorpay order
      const razorpayResponse = await createRazorpayOrder(draftOrderId, totalAmount);

      if (!razorpayResponse.status) {
        throw new Error(razorpayResponse.message || 'Failed to create payment order');
      }

      const { data } = razorpayResponse;

      // Initialize Razorpay checkout
      const options = {
        key: data.key_id,
        amount: data.amount,
        currency: data.currency,
        name: 'SIYARA',
        description: `Draft Order ${data.draft_order_id}`,
        order_id: data.order_id,
        handler: async function (response) {
          try {
            // Verify payment on backend with coupon details
            const verifyResponse = await verifyRazorpayPayment(
              data.draft_order_id,
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              },
              appliedCoupon ? {
                couponId: appliedCoupon.couponId,
                couponCode: appliedCoupon.couponCode,
                discountAmount: appliedCoupon.discountAmount,
              } : null
            );

            if (verifyResponse.status) {
              toast.success('Payment successful!', { icon: '🎉' });
              setCart(null);
              navigate(`/order-success/${verifyResponse.data.order_id}`);
            } else {
              toast.error(verifyResponse.message || 'Payment verification failed');
              // Stop loading state if verification failed
              setIsSubmitting(false);
            }
          } catch (error) {
            console.error('Payment verification error:', error);
            toast.error(error.message || 'Payment verification failed');
            // Stop loading state on error
            setIsSubmitting(false);
          }
        },
        prefill: {
          name: shippingData.fullName,
          email: shippingData.email,
          contact: shippingData.phone,
        },
        theme: {
          color: '#481d6f',
        },
        modal: {
          ondismiss: function () {
            setIsSubmitting(false);
            toast.error('Payment cancelled');
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.on('payment.failed', function (response) {
        toast.error(`Payment failed: ${response.error.description}`);
        setIsSubmitting(false);
      });
      razorpay.open();
    } catch (error) {
      console.error('Error initiating Razorpay payment:', error);
      toast.error(error.message || 'Failed to initiate payment');
      setIsSubmitting(false);
    }
  };

  const handleApplyCoupon = async (coupon) => {
    if (!cart || !cart.subtotal) {
      toast.error('Cart is empty');
      return;
    }

    if (currentStep !== 'payment') {
      toast.error('Please proceed to payment step to apply coupon');
      return;
    }

    // Check if another coupon is already applied
    if (appliedCoupon && appliedCoupon.couponCode !== coupon.code) {
      toast.error('Only one coupon can be applied per order. Please remove the current coupon first.');
      return;
    }

    // Check if this coupon is already applied
    if (appliedCoupon && appliedCoupon.couponCode === coupon.code) {
      toast.info('This coupon is already applied');
      return;
    }

    // Check payment method compatibility before API call
    const isCompatibleWithSelected = selectedPayment === 'cod'
      ? coupon.applicableToCOD
      : coupon.applicableToOnline;

    if (!isCompatibleWithSelected) {
      const paymentMethodName = selectedPayment === 'cod' ? 'Cash on Delivery' : 'Online Payment';
      toast.error(`This coupon is not applicable for ${paymentMethodName} orders`);
      return;
    }

    try {
      setApplyingCoupon(coupon.code);
      setCouponError('');

      // Pass payment method to validate coupon compatibility
      const response = await applyCoupon(coupon.code, cart.subtotal, selectedPayment);

      if (response.status) {
        const normalizedCoupon = normalizeCouponPayload(response.data);
        setAppliedCoupon(normalizedCoupon);
        const savedDiscount = normalizedCoupon?.discountAmount ?? 0;
        toast.success(
          `Coupon ${normalizedCoupon?.couponCode} applied! You saved ₹${savedDiscount.toFixed(2)}`
        );
      } else {
        // Show API error as toast notification
        toast.error(response.message || 'Failed to apply coupon');
        setCouponError(response.message || 'Failed to apply coupon');
      }
    } catch (error) {
      console.error('Error applying coupon:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to apply coupon';
      toast.error(errorMessage);
      setCouponError(errorMessage);
    } finally {
      setApplyingCoupon(null);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponError('');
    toast.success('Coupon removed');
  };

  const handlePlaceOrder = async () => {
    if (currentStep !== 'payment') {
      await handleContinueToPayment();
      return;
    }

    if (!draftOrderId) {
      toast.error('Please save address first');
      setCurrentStep('shipping');
      return;
    }

    // Handle online payment with Razorpay
    if (selectedPayment === 'online') {
      await handleRazorpayPayment();
      return;
    }

    // Handle COD payment
    try {
      setIsSubmitting(true);
      const response = await updatePayment(
        draftOrderId,
        selectedPayment,
        appliedCoupon ? {
          couponId: appliedCoupon.couponId,
          couponCode: appliedCoupon.couponCode,
          discountAmount: appliedCoupon.discountAmount,
        } : null
      );

      if (response.status) {
        toast.success(`Order ${response.data.order_id} confirmed!`, {
          icon: '🎉',
        });
        setCart(null);
        navigate(`/order-success/${response.data.order_id}`);
      }
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
              className="px-6 py-3 bg-[rgb(72,29,111)] text-white rounded-full font-semibold hover:bg-[#390e60] transition-all duration-200"
            >
              Go to Cart
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const hasCodCoupon = Array.isArray(availableCoupons) && availableCoupons.some((c) => c?.applicableToCOD);
  const hasOnlineCoupon = Array.isArray(availableCoupons) && availableCoupons.some((c) => c?.applicableToOnline);

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 lg:px-6 py-10">
        {/* Top bar with back button on right */}
        <div className="flex items-center justify-end mb-4">
          <button
            onClick={() => navigate('/cart')}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Cart
          </button>
        </div>

        {/* Page Header */}
        <div className="mb-5">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-1">Checkout</h1>
          <p className="text-gray-600">Review your order and add shipping details</p>
        </div>

        {/* Steps row under heading with more spacing */}
        <div className="flex items-center gap-4 text-sm font-semibold mb-12">
          <div className={`flex items-center gap-2 ${currentStep === 'shipping' ? 'text-gray-900' : 'text-gray-400'}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center ${currentStep === 'shipping' ? 'bg-gray-900 text-white' : 'bg-gray-200 text-gray-700'}`}>1</span>
            <span>Shipping</span>
          </div>
          <div className="h-px w-12 bg-gray-200" />
          <div className={`flex items-center gap-2 ${currentStep === 'payment' ? 'text-gray-900' : 'text-gray-400'}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center ${currentStep === 'payment' ? 'bg-gray-900 text-white' : 'bg-gray-200 text-gray-700'}`}>2</span>
            <span>Payment</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Left Column - Steps */}
          <div className="lg:col-span-2 space-y-6">
            {/* Coupon Instruction */}
            {availableCoupons.length > 0 && currentStep !== 'payment' && (
              <div className="bg-[rgba(72,29,111,0.05)] border border-[rgb(72,29,111)] rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    <Tag className="w-5 h-5 text-[rgb(72,29,111)]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-[rgb(72,29,111)] mb-1">
                      Have a coupon code?
                    </p>
                    <p className="text-xs text-gray-700">
                      You can apply your coupon code in the next step (Payment) to get discounts on your order.
                    </p>
                  </div>
                </div>
              </div>
            )}
            {currentStep === 'shipping' && (
              <div className="space-y-4">
                <ShippingForm
                  shippingData={shippingData}
                  errors={errors}
                  onChange={handleShippingChange}
                  pincodeValid={pincodeValid}
                  pincodeValidating={pincodeValidating}
                />
              </div>
            )}

            {currentStep === 'payment' && (
              <div className="space-y-6">
                {/* Payment Method Selection */}
                <div className="bg-white border border-gray-200 rounded-lg p-5">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Payment Method</h3>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:border-gray-400 transition-colors">
                      <input
                        type="radio"
                        name="payment"
                        value="cod"
                        checked={selectedPayment === 'cod'}
                        onChange={() => setSelectedPayment('cod')}
                        className="h-4 w-4"
                      />
                      <div className="flex items-center gap-2">
                        <Wallet className="w-5 h-5 text-gray-700" />
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-semibold text-gray-900">Cash on Delivery</p>
                            {hasCodCoupon && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold 
                                bg-purple-50 text-purple-700 border border-purple-200 
                                animate-pulse">
                                <Tag className="w-3 h-3" />
                                Coupon Available
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500">Pay when you receive the order</p>
                        </div>
                      </div>
                    </label>
                    <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:border-gray-400 transition-colors">
                      <input
                        type="radio"
                        name="payment"
                        value="online"
                        checked={selectedPayment === 'online'}
                        onChange={() => setSelectedPayment('online')}
                        className="h-4 w-4"
                      />
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-gray-700" />
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-semibold text-gray-900">Online Payment</p>
                            {hasOnlineCoupon && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold 
                                bg-purple-50 text-purple-700 border border-purple-200 
                                animate-pulse">
                                <Tag className="w-3 h-3" />
                                Coupon Available
                              </span>
                            )}

                          </div>
                          <p className="text-xs text-gray-500">We'll confirm without charging for now</p>
                        </div>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Available Coupons Display */}
                {availableCoupons.length > 0 && (
                  <div className="bg-white border border-gray-200 rounded-lg p-5">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Available Coupons</h3>
                    <div className="space-y-3">
                      {availableCoupons
                        .map((coupon) => {
                          const discountText = coupon.discountType === 'percentage'
                            ? `${coupon.discountValue}% OFF`
                            : `₹${coupon.discountValue} OFF`;

                          const isCompatibleWithSelected = selectedPayment === 'cod'
                            ? coupon.applicableToCOD
                            : coupon.applicableToOnline;

                          return (
                            <div
                              key={coupon._id}
                              className={`p-4 border-2 rounded-lg transition-all ${isCompatibleWithSelected
                                ? 'border-green-300 bg-green-50/30 hover:border-green-400'
                                : 'border-gray-200 bg-gray-50/50 hover:border-gray-300 opacity-75'
                                }`}
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex-1">
                                  {/* Coupon Code and Discount */}
                                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                                    <Tag className={`w-4 h-4 ${isCompatibleWithSelected ? 'text-green-600' : 'text-gray-400'}`} />
                                    <span className="font-bold text-gray-900 text-base">{coupon.code}</span>
                                    {/* Payment Method Badges - Next to coupon name */}
                                    {coupon.applicableToCOD && (
                                      <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${selectedPayment === 'cod' && isCompatibleWithSelected
                                        ? 'bg-blue-100 text-blue-700 border border-blue-300'
                                        : 'bg-gray-100 text-gray-600 border border-gray-300'
                                        }`}>
                                        💵 COD
                                      </span>
                                    )}
                                    {coupon.applicableToOnline && (
                                      <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${selectedPayment === 'online' && isCompatibleWithSelected
                                        ? 'bg-purple-100 text-purple-700 border border-purple-300'
                                        : 'bg-gray-100 text-gray-600 border border-gray-300'
                                        }`}>
                                        💳 Online
                                      </span>
                                    )}
                                    <span className={`text-sm font-semibold ${isCompatibleWithSelected ? 'text-green-600' : 'text-gray-500'}`}>
                                      {discountText}
                                    </span>
                                  </div>

                                  {/* Description */}
                                  {coupon.description && (
                                    <p className="text-sm text-gray-700 mb-2">{coupon.description}</p>
                                  )}

                                  {/* Min Order Value */}
                                  <p className="text-xs text-gray-500">
                                    Minimum order: ₹{coupon.minOrderValue.toLocaleString('en-IN')}
                                  </p>
                                </div>

                                {/* Apply/Remove Button */}
                                {appliedCoupon?.couponCode === coupon.code ? (
                                  <button
                                    onClick={handleRemoveCoupon}
                                    className="px-4 py-2 text-xs font-semibold rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors flex-shrink-0 flex items-center gap-1"
                                  >
                                    <X className="w-3 h-3" />
                                    Remove
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => handleApplyCoupon(coupon)}
                                    disabled={applyingCoupon === coupon.code || (appliedCoupon && appliedCoupon.couponCode !== coupon.code)}
                                    className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors flex-shrink-0 flex items-center gap-1 ${
                                      isCompatibleWithSelected && !appliedCoupon
                                        ? 'bg-green-600 text-white hover:bg-green-700'
                                        : appliedCoupon
                                        ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                                        : 'bg-gray-300 text-gray-600 hover:bg-gray-400'
                                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                                  >
                                    {applyingCoupon === coupon.code ? (
                                      <>
                                        <Loader2 className="w-3 h-3 animate-spin" />
                                        Applying...
                                      </>
                                    ) : (
                                      <>
                                        <CheckCircle2 className="w-3 h-3" />
                                        Apply
                                      </>
                                    )}
                                  </button>
                                )}
                              </div>

                              {/* Compatibility Notice */}
                              {!isCompatibleWithSelected && (
                                <div className="mt-2 pt-2 border-t border-gray-200">
                                  <p className="text-xs text-amber-600 flex items-center gap-1">
                                    <span>⚠️</span>
                                    <span>This coupon is not applicable for {selectedPayment === 'cod' ? 'COD' : 'Online'} payment. Switch payment method to use it.</span>
                                  </p>
                                </div>
                              )}

                              {/* One Coupon Notice */}
                              {appliedCoupon && appliedCoupon.couponCode !== coupon.code && (
                                <div className="mt-2 pt-2 border-t border-gray-200">
                                  <p className="text-xs text-blue-600 flex items-center gap-1">
                                    <span>ℹ️</span>
                                    <span>Only one coupon can be applied per order. Remove the current coupon to apply this one.</span>
                                  </p>
                                </div>
                              )}
                            </div>
                          );
                        })}
                    </div>
                  </div>
                )}

                {/* Cart Items Review */}
                <CartItemsReview cart={cart} />

                <div className="flex justify-start">
                  <button
                    onClick={() => setCurrentStep('shipping')}
                    className="px-5 py-3 border-[1.5px] border-[rgb(72,29,111)] text-[rgb(72,29,111)] rounded-full font-semibold hover:bg-[rgba(72,29,111,0.08)] transition-all duration-200"
                  >
                    Back to Shipping
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <OrderSummary
              cart={cart}
              onPlaceOrder={currentStep === 'payment' ? handlePlaceOrder : handleContinueToPayment}
              isSubmitting={isSubmitting}
              buttonLabel={currentStep === 'payment' ? 'Place Order' : 'Continue to Payment'}
              currentStep={currentStep}
              appliedCoupon={appliedCoupon}
              onRemoveCoupon={handleRemoveCoupon}
            />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CheckoutPage;


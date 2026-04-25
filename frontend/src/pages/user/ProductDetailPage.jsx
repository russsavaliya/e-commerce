import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../../components/user/Navbar';
import Footer from '../../components/user/Footer';
import ProductCarousel from '../../components/user/ProductCarousel';
import { getProductDetail, getRelatedProducts } from '../../services/user/productService';
import { addToCart } from '../../services/user/cartService';
import { getReviews, addReview } from '../../services/user/reviewService';
import { getAvailableCoupons } from '../../services/user/couponService';
import { Loader2, ChevronLeft, ChevronRight, IndianRupee, Package, X, ShoppingBag, Star, Truck, Box, Tag, Copy, CheckCircle2, CreditCard, RotateCcw, Calendar, ZoomIn, ZoomOut } from 'lucide-react';
import toast from 'react-hot-toast';
import paymentGroupSvg from '../../assets/images/payment-group.svg';
import useSEO from '../../hooks/useSEO';

const ProductDetailPage = () => {
  const { productId, slug } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeImage, setActiveImage] = useState('');
  const [selectedVariantId, setSelectedVariantId] = useState(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [reviewSummary, setReviewSummary] = useState({
    average: 0,
    count: 0,
    perRating: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
  });
  const [reviewPage, setReviewPage] = useState(1);
  const [reviewTotalPages, setReviewTotalPages] = useState(1);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    name: '',
    email: '',
    rating: 5,
    comment: '',
  });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [loadingCoupons, setLoadingCoupons] = useState(false);
  const [copiedCode, setCopiedCode] = useState(null);
  const [mobileTab, setMobileTab] = useState('description');
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loadingRelatedProducts, setLoadingRelatedProducts] = useState(false);
  const [modalImageIndex, setModalImageIndex] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panPosition, setPanPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [lastTouchDistance, setLastTouchDistance] = useState(null);
  const modalImageAreaRef = React.useRef(null);

  const renderStars = (rating, size = 'sm') => {
    const total = 5;
    const filled = Math.round(rating || 0);
    const sizeClass =
      size === 'lg' ? 'text-xl' : size === 'md' ? 'text-base' : 'text-xs';

    return (
      <div className={`flex items-center gap-0.5 ${sizeClass}`}>
        {Array.from({ length: total }).map((_, idx) => (
          <span
            key={idx}
            className={
              idx < filled ? 'text-[rgb(72,29,111)]' : 'text-[#E5E7EB]'
            }
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  const normalizeImagePath = (imagePath) => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    return imagePath;
  };

  // Prevent right-click and image download
  const handleContextMenu = (e) => {
    e.preventDefault();
    return false;
  };

  // Prevent drag and drop
  const handleDragStart = (e) => {
    e.preventDefault();
    return false;
  };

  const openImageModal = (index = 0) => {
    setModalImageIndex(index);
    setZoomLevel(1);
    setPanPosition({ x: 0, y: 0 });
    setIsImageModalOpen(true);
  };

  const closeImageModal = () => {
    setIsImageModalOpen(false);
    setZoomLevel(1);
    setPanPosition({ x: 0, y: 0 });
    setIsDragging(false);
  };

  const handleZoomIn = () => setZoomLevel(prev => Math.min(4, parseFloat((prev + 0.5).toFixed(1))));
  const handleZoomOut = () => setZoomLevel(prev => {
    const next = Math.max(1, parseFloat((prev - 0.5).toFixed(1)));
    if (next <= 1) setPanPosition({ x: 0, y: 0 });
    return next;
  });
  const handleResetZoom = () => { setZoomLevel(1); setPanPosition({ x: 0, y: 0 }); };

  const handleModalMouseDown = (e) => {
    if (zoomLevel > 1) {
      e.preventDefault();
      setIsDragging(true);
      setDragStart({ x: e.clientX - panPosition.x, y: e.clientY - panPosition.y });
    }
  };
  const handleModalMouseMove = (e) => {
    if (isDragging) setPanPosition({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };
  const handleModalMouseUp = () => setIsDragging(false);
  const handleModalDoubleClick = () => zoomLevel > 1 ? handleResetZoom() : setZoomLevel(2.5);

  const getTouchDistance = (touches) => {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };
  const handleModalTouchStart = (e) => {
    if (e.touches.length === 2) setLastTouchDistance(getTouchDistance(e.touches));
  };
  const handleModalTouchMove = (e) => {
    if (e.touches.length === 2 && lastTouchDistance) {
      const dist = getTouchDistance(e.touches);
      setZoomLevel(prev => Math.max(1, Math.min(4, prev * (dist / lastTouchDistance))));
      setLastTouchDistance(dist);
    }
  };
  const handleModalTouchEnd = () => {
    setLastTouchDistance(null);
    setZoomLevel(prev => { if (prev <= 1) { setPanPosition({ x: 0, y: 0 }); return 1; } return prev; });
  };

  const goToModalPrev = () => {
    setModalImageIndex(prev => (prev > 0 ? prev - 1 : (product?.images?.length ?? 1) - 1));
    handleResetZoom();
  };
  const goToModalNext = () => {
    setModalImageIndex(prev => (prev < (product?.images?.length ?? 1) - 1 ? prev + 1 : 0));
    handleResetZoom();
  };

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true);
        const res = await getProductDetail(productId);
        if (res.status && res.data) {
          const prod = res.data;
          setProduct(prod);
          const firstImage = prod.images && prod.images.length > 0 ? prod.images[0] : '';
          setActiveImage(firstImage);
          // Don't auto-select first variant - show main product price initially
          setSelectedVariantId(null);
          // Fetch related products
          fetchRelatedProducts(productId);
        } else {
          setError('Product not found');
        }
      } catch (err) {
        setError(err?.message || 'Failed to load product');
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
    fetchAvailableCoupons();
  }, [productId]);

  const fetchAvailableCoupons = async () => {
    try {
      setLoadingCoupons(true);
      const response = await getAvailableCoupons();
      if (response.status) {
        setAvailableCoupons(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching coupons:', error);
      // Silently fail - coupons are optional
    } finally {
      setLoadingCoupons(false);
    }
  };

  const fetchRelatedProducts = async (pid) => {
    try {
      setLoadingRelatedProducts(true);
      const response = await getRelatedProducts(pid, 4);
      if (response.status && response.data) {
        setRelatedProducts(response.data);
      }
    } catch (error) {
      console.error('Error fetching related products:', error);
      // Silently fail - related products are optional
    } finally {
      setLoadingRelatedProducts(false);
    }
  };

  const handleCopyCouponCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success('Coupon code copied!', { icon: '📋' });
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Fetch reviews when productId or page changes
  useEffect(() => {
    if (!productId) return;
    fetchReviews(reviewPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId, reviewPage]);

  // Keyboard navigation for image modal
  useEffect(() => {
    if (!isImageModalOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') closeImageModal();
      else if (e.key === 'ArrowLeft') goToModalPrev();
      else if (e.key === 'ArrowRight') goToModalNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isImageModalOpen]);

  // Scroll-to-zoom (non-passive wheel listener)
  useEffect(() => {
    const el = modalImageAreaRef.current;
    if (!el || !isImageModalOpen) return;
    const onWheel = (e) => {
      e.preventDefault();
      const delta = e.deltaY < 0 ? 0.3 : -0.3;
      setZoomLevel(prev => {
        const next = parseFloat(Math.max(1, Math.min(4, prev + delta)).toFixed(1));
        if (next <= 1) setPanPosition({ x: 0, y: 0 });
        return next;
      });
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [isImageModalOpen]);

  // Lock body scroll when modal open
  useEffect(() => {
    document.body.style.overflow = isImageModalOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isImageModalOpen]);

  const fetchReviews = async (page = 1) => {
    try {
      setReviewLoading(true);
      const res = await getReviews(productId, page, 5);
      if (res.status && res.data) {
        setReviews(res.data.reviews || []);
        setReviewSummary(
          res.data.ratingSummary || {
            average: 0,
            count: 0,
            perRating: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
          }
        );
        setReviewPage(res.data.page || page);
        setReviewTotalPages(res.data.total_pages || 1);
      } else {
        setReviews([]);
        setReviewSummary({
          average: 0,
          count: 0,
          perRating: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        });
        setReviewTotalPages(1);
      }
    } catch (err) {
      console.error('Error loading reviews:', err);
      setReviews([]);
      setReviewSummary({
        average: 0,
        count: 0,
        perRating: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      });
      setReviewTotalPages(1);
    } finally {
      setReviewLoading(false);
    }
  };

  const activeVariant = useMemo(() => {
    if (!product || !product.variants) return null;
    if (!selectedVariantId) return null;
    return product.variants.find((v) => v._id === selectedVariantId) || null;
  }, [product, selectedVariantId]);

  // Show variant price only if variant is selected, otherwise show main product selling_price
  const displayPrice = selectedVariantId && activeVariant?.variant_price
    ? activeVariant.variant_price
    : (product?.selling_price ?? 0);
  // Use discount_percentage from database first, otherwise calculate from prices
  const discountPercent = product?.discount_percentage && product.discount_percentage > 0
    ? product.discount_percentage
    : (product?.original_price && product.original_price > displayPrice
      ? Math.round(((product.original_price - displayPrice) / product.original_price) * 100)
      : 0);
  // Show variant image only if variant is selected, otherwise show main product image
  const displayImage = selectedVariantId && activeVariant?.variant_image
    ? activeVariant.variant_image
    : activeImage;

  // Calculate available quantity (variant quantity if variant selected, otherwise product quantity)
  const availableQuantity = useMemo(() => {
    if (!product) return 0;
    if (selectedVariantId && activeVariant) {
      return activeVariant.quantity ?? 0;
    }
    return product.quantity ?? 0;
  }, [product, selectedVariantId, activeVariant]);

  // Check if product is out of stock
  const isOutOfStock = availableQuantity <= 0;

  const handleVariantSelect = (variantId) => {
    setSelectedVariantId(variantId);
    const variant = product?.variants?.find((v) => v._id === variantId);
    if (variant && variant.variant_image) {
      setActiveImage(variant.variant_image);
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;

    // Prevent adding to cart if out of stock
    if (isOutOfStock) {
      toast.error('This product is currently out of stock');
      return;
    }

    try {
      setAddingToCart(true);
      const response = await addToCart(product._id, selectedVariantId, 1);
      if (response.status) {
        toast.success('Added to cart!', { icon: '🛍️' });
        window.dispatchEvent(new Event('cart-updated'));
        navigate('/cart');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error(error.message || 'Failed to add to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleReviewInputChange = (e) => {
    const { name, value } = e.target;
    setReviewForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!product?._id) return;

    if (!reviewForm.name || !reviewForm.rating) {
      toast.error('Please enter your name and rating.');
      return;
    }

    try {
      setSubmittingReview(true);
      const payload = {
        productId: product._id,
        name: reviewForm.name,
        email: reviewForm.email || undefined,
        rating: Number(reviewForm.rating),
        comment: reviewForm.comment,
      };
      const res = await addReview(payload);
      if (res.status) {
        toast.success('Review submitted!');
        setReviewForm({
          name: '',
          email: '',
          rating: 5,
          comment: '',
        });
        // Close modal and reload first page of reviews so user can see their review
        setIsReviewModalOpen(false);
        setReviewPage(1);
        fetchReviews(1);
      } else {
        toast.error(res.message || 'Failed to submit review');
      }
    } catch (err) {
      console.error('Error submitting review:', err);
      toast.error(err.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  // Dynamic SEO for product detail page — must be before early returns to satisfy rules of hooks
  useSEO({
    title: product ? `${product.name} | Buy Online at SIYARA` : 'Product Detail | SIYARA',
    description: product
      ? `Buy ${product.name} online at SIYARA. ${product.category?.name ? product.category.name + '. ' : ''}Price ₹${displayPrice?.toLocaleString('en-IN')}${discountPercent > 0 ? ` (${discountPercent}% off)` : ''}. Premium quality ethnic wear with free shipping.`
      : 'Shop premium ethnic wear at SIYARA',
    keywords: product
      ? `${product.name}, buy ${product.name} online, ${product.category?.name || 'saree'}, designer ${product.category?.name || 'ethnic wear'}, siyara ${product.category?.name || 'saree'}`
      : 'buy sarees online, ethnic wear',
    canonicalUrl: product
      ? `https://siyara.online/product/${slug ? slug + '/' : ''}${productId}`
      : `https://siyara.online/product/${productId}`,
    ogTitle: product ? `${product.name} | SIYARA` : undefined,
    ogDescription: product
      ? `Buy ${product.name} at ₹${displayPrice?.toLocaleString('en-IN')}. Shop now at SIYARA.`
      : undefined,
    ogImage: product?.images?.[0] || undefined,
    ogType: 'product',
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF9F5]">
        <Loader2 className="w-8 h-8 animate-spin text-[rgb(72,29,111)]" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FAF9F5]">
        <Navbar />
        <main className="flex-1 max-w-6xl mx-auto px-4 py-16">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm text-[#6B7280] hover:text-[rgb(72,29,111)] mb-6 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Back
          </button>
          <div className="bg-white border border-[#E5E7EB] rounded-lg p-8 text-center shadow-sm">
            <p className="text-lg text-[#374151]">{error || 'Product not found'}</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const images = product.images || [];

  const DescriptionCard = ({ className = '' }) => {
    if (!product?.description) return null;
    return (
      <div
        className={`bg-white border border-[#E5E7EB] rounded-xl shadow-sm overflow-hidden ${className}`}
      >
        <div className="px-6 py-4 border-b border-[#E5E7EB] bg-[#FAF9F5]">
          <h3 className="text-sm font-semibold text-[rgb(72,29,111)] uppercase tracking-wide">
            Product Description
          </h3>
        </div>
        <div className="px-6 py-5">
          <div
            // className="text-base text-[#374151] leading-relaxed rich-text-content"
            className="text-base text-[#374151] leading-relaxed prose prose-sm max-w-none whitespace-pre-wrap"
            dangerouslySetInnerHTML={{ __html: product.description }}
          />
        </div>
      </div>
    );
  };

  const ReviewSummaryCard = ({ className = '' }) => (
    <div className={`border-t border-[#E5E7EB] pt-8 ${className}`}>
      <div className="bg-white border border-[#E5E7EB] rounded-2xl shadow-sm px-6 py-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          <div className="flex flex-col items-center md:items-start gap-2">
            <h2 className="text-base font-semibold text-[rgb(72,29,111)]">
              Customer Reviews
            </h2>
            {renderStars(reviewSummary.average, 'lg')}
            <p className="text-3xl font-bold text-[#1F2937]">
              {reviewSummary.average?.toFixed(1) || '0.0'}
            </p>
            <p className="text-xs text-[#6B7280]">
              {reviewSummary.count > 0
                ? `Based on ${reviewSummary.count} review${reviewSummary.count > 1 ? 's' : ''
                }`
                : 'No reviews yet'}
            </p>
          </div>

          <div className="space-y-1.5">
            {[5, 4, 3, 2, 1].map((star) => {
              const perRating = reviewSummary.perRating || {};
              const count = perRating[star] || 0;
              const total = reviewSummary.count || 0;
              const percent =
                total > 0 ? Math.round((count / total) * 100) : 0;
              return (
                <div
                  key={star}
                  className="flex items-center gap-3 text-xs text-[#6B7280]"
                >
                  <span className="w-10 flex items-center justify-end gap-0.5">
                    <span>{star}</span>
                    <span className="text-[rgb(72,29,111)] text-[11px]">★</span>
                  </span>
                  <div className="flex-1 h-2 rounded-full bg-[#E5E7EB] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[rgb(72,29,111)] transition-all"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <span className="w-4 text-right text-[11px] text-[#6B7280]">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex justify-center md:justify-end">
            <button
              type="button"
              onClick={() => setIsReviewModalOpen(true)}
              className="px-5 py-3 rounded-full border-[1.5px] border-[#EC4899] text-sm font-semibold text-[#EC4899] hover:bg-[rgba(236,72,153,0.08)] transition-all duration-200"
            >
              Write a review
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const ReviewsListing = ({ className = '' }) => (
    <div className={`w-full ${className}`}>
      {reviewLoading ? (
        <div className="flex items-center justify-center gap-2 py-12 text-sm text-[#6B7280]">
          <Loader2 className="w-5 h-5 animate-spin text-[rgb(72,29,111)]" />
          <span>Loading reviews...</span>
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-sm text-[#6B7280]">
            No reviews for this product yet.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {reviews.map((rev) => (
              <div
                key={rev._id}
                className="border border-[#E5E7EB] rounded-xl p-5 bg-white shadow-sm hover:shadow-md transition-all duration-200 hover:border-[rgb(72,29,111)] flex flex-col h-full"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-[#374151] mb-1.5">
                      {rev.name}
                    </p>
                    <div className="mb-2">
                      {renderStars(rev.rating, 'sm')}
                    </div>
                  </div>
                  <p className="text-xs text-[#6B7280] whitespace-nowrap ml-3">
                    {rev.createdAt
                      ? new Date(rev.createdAt).toLocaleDateString(
                        'en-IN',
                        {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        }
                      )
                      : ''}
                  </p>
                </div>

                {rev.comment && (
                  <p className="text-sm text-[#374151] whitespace-pre-line flex-1 leading-relaxed">
                    {rev.comment}
                  </p>
                )}
              </div>
            ))}
          </div>

          {reviewTotalPages > 1 && (
            <div className="flex items-center justify-between pt-6 mt-6 border-t border-[#E5E7EB] text-sm text-[#6B7280]">
              <span>
                Page {reviewPage} of {reviewTotalPages}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setReviewPage((p) => Math.max(1, p - 1))
                  }
                  disabled={reviewPage === 1 || reviewLoading}
                  className="px-4 py-2 border border-[#E5E7EB] rounded-lg hover:bg-[#F9FAFB] disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-[#374151] font-medium"
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setReviewPage((p) =>
                      Math.min(reviewTotalPages, p + 1)
                    )
                  }
                  disabled={
                    reviewPage === reviewTotalPages || reviewLoading
                  }
                  className="px-4 py-2 border border-[#E5E7EB] rounded-lg hover:bg-[#F9FAFB] disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-[#374151] font-medium"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FAF9F5]">
      {/* Product Schema - Structured Data for Google Rich Results */}
      {product && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Product",
          "name": product.name,
          "image": product.images || [],
          "description": product.description ? product.description.replace(/<[^>]*>/g, '').substring(0, 300) : '',
          "brand": {
            "@type": "Brand",
            "name": "SIYARA"
          },
          "category": product.category?.name || 'Ethnic Wear',
          "offers": {
            "@type": "Offer",
            "url": `https://siyara.online/product/${slug ? slug + '/' : ''}${productId}`,
            "priceCurrency": "INR",
            "price": displayPrice || 0,
            ...(product.original_price && product.original_price > displayPrice ? {
              "priceValidUntil": new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
            } : {}),
            "availability": isOutOfStock
              ? "https://schema.org/OutOfStock"
              : "https://schema.org/InStock",
            "seller": {
              "@type": "Organization",
              "name": "SIYARA"
            }
          },
          ...(reviewSummary.count > 0 ? {
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": reviewSummary.average?.toFixed(1) || "0",
              "reviewCount": reviewSummary.count || 0,
              "bestRating": "5",
              "worstRating": "1"
            }
          } : {})
        }) }} />
      )}

      {/* BreadcrumbList Schema */}
      {product && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": [
            {
              "@type": "ListItem",
              "position": 1,
              "name": "Home",
              "item": "https://siyara.online/"
            },
            ...(product.category?.name ? [{
              "@type": "ListItem",
              "position": 2,
              "name": product.category.name,
              "item": "https://siyara.online/sale"
            }] : []),
            {
              "@type": "ListItem",
              "position": product.category?.name ? 3 : 2,
              "name": product.name
            }
          ]
        }) }} />
      )}

      <Navbar />
      <main className="max-w-6xl mx-auto px-4 lg:px-6 py-10 pb-24 md:pb-10">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-[#6B7280] hover:text-[rgb(72,29,111)] mb-6 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Left Column: Images, Thumbnails, Description */}
          <div className="space-y-6">
            {/* Main Image */}
            <div>
              <div
                className="relative bg-gray-100 overflow-hidden cursor-pointer flex items-center justify-center select-none"
                style={{ minHeight: '400px', maxHeight: '720px' }}
                onClick={() => {
                  if (!displayImage) return;
                  const idx = images.indexOf(activeImage);
                  openImageModal(Math.max(0, idx));
                }}
                onContextMenu={handleContextMenu}
              >
                {displayImage ? (
                  <img
                    src={normalizeImagePath(displayImage)}
                    alt={product.name}
                    className="max-h-[720px] w-full h-full object-cover pointer-events-none select-none"
                    draggable="false"
                    onContextMenu={handleContextMenu}
                    onDragStart={handleDragStart}
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/500x600?text=Image+Not+Available';
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                    <Package className="w-16 h-16 text-gray-400" />
                  </div>
                )}
              </div>
              {images.length > 1 && (
                <div className="mt-4 grid grid-cols-4 sm:grid-cols-6 gap-3">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setActiveImage(img);
                        // Clear variant selection when clicking on main product image
                        setSelectedVariantId(null);
                      }}
                      className={`border overflow-hidden h-20 bg-gray-100 aspect-[3/4] select-none transition-colors ${activeImage === img && !selectedVariantId ? 'border-[rgb(72,29,111)]' : 'border-[#E5E7EB]'
                        }`}
                      onContextMenu={handleContextMenu}
                    >
                      <img
                        src={normalizeImagePath(img)}
                        alt={`thumb-${idx}`}
                        className="w-full h-full object-cover pointer-events-none select-none"
                        draggable="false"
                        onContextMenu={handleContextMenu}
                        onDragStart={handleDragStart}
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/200x200?text=Image';
                        }}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <DescriptionCard className="hidden md:block" />
          </div>

          {/* Right Column: Details, Price, Variants, Actions, Reviews */}
          <div className="space-y-6">
            <div>
              <div className="flex items-start justify-between gap-3 mb-2">
                <h1
                  className="text-3xl md:text-4xl font-bold text-[rgb(72,29,111)] leading-tight flex-1"
                  style={{ fontFamily: '"GeorgiaBallpark Serif", serif' }}
                >
                  {product.name}
                </h1>
                {/* Out of Stock Badge */}
                {isOutOfStock && (
                  <span className="px-3 py-1.5 bg-red-100 text-red-700 text-xs font-semibold rounded-full border border-red-200 whitespace-nowrap flex-shrink-0">
                    Out of Stock
                  </span>
                )}
              </div>
              {product.category?.name && (
                <p className="text-sm text-[#6B7280] mt-2 uppercase tracking-wide">{product.category.name}</p>
              )}
              {activeVariant && activeVariant.variant_name && (
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-sm font-medium text-[#6B7280]">Selected Option:</span>
                  <span className="text-sm font-semibold text-[rgb(72,29,111)] bg-[rgba(72,29,111,0.06)] px-2 py-1 rounded-lg border border-[rgb(72,29,111)]">
                    {activeVariant.variant_name}
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-baseline gap-3 flex-wrap">
              <div className="flex items-baseline gap-1">
                <IndianRupee className="w-5 h-5 text-[#1F2937] self-center" />
                <span className="text-3xl font-bold text-[#1F2937] leading-none">
                  {displayPrice?.toLocaleString('en-IN') || '0'}
                </span>
              </div>
              {product.original_price && product.original_price > displayPrice && (
                <span className="text-lg text-[#9CA3AF] line-through whitespace-nowrap leading-none">
                  ₹ {product.original_price.toLocaleString('en-IN')}
                </span>
              )}
              {discountPercent > 0 && (
                <span className="text-sm font-semibold text-[rgb(72,29,111)] whitespace-nowrap leading-none">
                  {discountPercent}% off
                </span>
              )}
            </div>
            {/* Product-level Details (read-only display) */}
            {product.details && (
              <div className="mt-4 space-y-2 border-t border-[#E5E7EB] pt-4">
                <div className="text-sm font-semibold text-[#374151] mb-3 uppercase tracking-wide">Product Details</div>
                <div
                  className="text-sm text-[#374151] rich-text-content"
                  dangerouslySetInnerHTML={{ __html: product.details }}
                />
              </div>
            )}

            {/* Product-level attributes (read-only display) */}
            {/* {product.attributesvalues &&
              product.attributesvalues.length > 0 &&
              product.attributesvalues.some(attr => attr.values && attr.values.length > 0) && (
                <div className="space-y-2 border-t border-[#E5E7EB] pt-4">
                  <div className="text-sm font-semibold text-[#374151] mb-3 uppercase tracking-wide">Product Attributes</div>
                  {product.attributesvalues
                    .filter(attr => attr.values && attr.values.length > 0)
                    .map((attr, idx) => (
                      <div key={attr._id || idx} className="flex items-start gap-2 py-0.5">
                        <div className="text-sm font-medium text-[#6B7280] w-20 sm:w-24 flex-shrink-0">
                          {attr.name || 'Attribute'}:
                        </div>
                        <div className="flex-1 text-sm text-[#374151] flex flex-wrap items-center">
                          {attr.values.map((val, vIdx) => (
                            <span key={val._id || vIdx} className="inline-flex items-center">
                              {val.value || 'Value'}
                              {vIdx < attr.values.length - 1 && <span className="text-[#9CA3AF] mx-2 text-[10px]">•</span>}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                </div>
              )} */}

            {/* Variants list */}
            {product.variants && product.variants.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="text-sm font-semibold text-[#374151] uppercase tracking-wide">Select Options</div>
                  {selectedVariantId && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedVariantId(null);
                        // Reset to first product image if available
                        if (product.images && product.images.length > 0) {
                          setActiveImage(product.images[0]);
                        }
                      }}
                      className="text-xs font-medium text-red-600 hover:text-red-700 hover:underline transition-colors flex items-center gap-1"
                    >
                      <X className="w-3.5 h-3.5" />
                      Remove
                    </button>
                  )}
                </div>
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                  {product.variants.map((variant) => {
                    const variantOutOfStock = (variant.quantity ?? 0) <= 0;
                    return (
                      <button
                        key={variant._id}
                        onClick={() => !variantOutOfStock && handleVariantSelect(variant._id)}
                        disabled={variantOutOfStock}
                        className={`group flex-shrink-0 border-2 rounded-xl overflow-hidden transition-all duration-200 relative ${variantOutOfStock
                          ? 'opacity-60 cursor-not-allowed border-gray-200'
                          : selectedVariantId === variant._id
                            ? 'border-[rgb(72,29,111)] bg-[rgba(72,29,111,0.06)] shadow-lg'
                            : 'border-[#E5E7EB] hover:border-[rgb(72,29,111)] hover:shadow-md'
                          }`}
                      >
                        {/* Hover Tooltip - Variant Name */}
                        <div className={`absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs font-medium px-3 py-1.5 rounded-lg whitespace-nowrap opacity-0 pointer-events-none transition-all duration-200 z-20 shadow-lg ${!variantOutOfStock ? 'group-hover:opacity-100 group-hover:-top-14' : ''
                          }`}>
                          {variant.variant_name || 'Variant'}
                          <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
                        </div>

                        {variantOutOfStock && (
                          <div className="absolute inset-0 bg-gray-100/80 flex items-center justify-center z-10 rounded-xl">
                            <span className="text-[10px] font-semibold text-red-600 bg-white px-2.5 py-1 rounded-lg border border-red-200 shadow-sm">
                              Out of Stock
                            </span>
                          </div>
                        )}

                        {/* Variant Image */}
                        {variant.variant_image ? (
                          <div className="w-20 h-28 bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden select-none relative">
                            <img
                              src={normalizeImagePath(variant.variant_image)}
                              alt={variant.variant_name}
                              className="w-full h-full object-cover pointer-events-none select-none transition-transform duration-200 group-hover:scale-105"
                              draggable="false"
                              onContextMenu={handleContextMenu}
                              onDragStart={handleDragStart}
                              onError={(e) => {
                                e.target.src = 'https://via.placeholder.com/100x150?text=Image';
                              }}
                            />
                            {/* Overlay with variant name - shows only when NOT selected */}
                            {selectedVariantId !== variant._id && (
                              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-100 group-hover:opacity-0 transition-opacity duration-200 pointer-events-none">
                                <div className="text-white text-xs font-semibold text-center px-2 leading-tight">
                                  {variant.variant_name || 'Variant'}
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="w-20 h-28 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                            <Package className="w-6 h-6 text-gray-400" />
                          </div>
                        )}

                        {/* Variant Name Below Image */}
                        <div className={`px-2 pt-1.5 pb-2 w-20 ${selectedVariantId === variant._id ? 'bg-[rgba(72,29,111,0.06)]' : 'bg-white'}`}>
                          <div className={`text-xs font-bold text-center truncate ${selectedVariantId === variant._id
                            ? 'text-[rgb(72,29,111)]'
                            : 'text-[#374151]'
                            }`} title={variant.variant_name || 'Variant'}>
                            {variant.variant_name || 'Variant'}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Actions - Desktop Only (Hidden on Mobile) */}
            <div className="hidden md:flex gap-3">
              {isOutOfStock ? (
                <button
                  disabled
                  className="flex-1 flex items-center justify-center gap-2 bg-gray-400 text-white py-3 rounded-full text-sm font-semibold opacity-60 cursor-not-allowed transition-all duration-200"
                >
                  <Package className="w-4 h-4" />
                  Out of Stock
                </button>
              ) : (
                <button
                  onClick={handleAddToCart}
                  disabled={addingToCart}
                  className={`flex-1 flex items-center justify-center gap-2 bg-[rgb(72,29,111)] text-white py-3 rounded-full text-sm font-semibold hover:bg-[#390e60] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${!addingToCart && !isOutOfStock ? 'animate-pulse-button' : ''}`}
                >
                  {addingToCart ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" />
                      Add to Bag
                    </>
                  )}
                </button>
              )}
              <button
                onClick={() => navigate('/cart')}
                className="px-5 py-3 rounded-full border-[1.5px] border-[rgb(72,29,111)] text-sm font-semibold text-[rgb(72,29,111)] hover:bg-[rgba(72,29,111,0.08)] transition-all duration-200"
              >
                View Cart
              </button>
            </div>

            {/* Product Features - COD, Easy Return, 7 Day Return */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-3 gap-2 md:gap-3 md:grid-cols-3 overflow-hidden md:overflow-visible">
                {/* COD Available */}
                <div className="flex items-center gap-1.5 md:gap-2 p-1 md:p-2 bg-white rounded-lg md:rounded-xl border border-gray-200 hover:border-[rgb(72,29,111)] hover:shadow-sm transition-all duration-200 min-w-0">
                  <div className="flex-shrink-0">
                    <div className="w-6 h-6 md:w-10 md:h-10 rounded-md md:rounded-lg bg-[rgba(72,29,111,0.1)] flex items-center justify-center">
                      <CreditCard className="w-3 h-3 md:w-5 md:h-5 text-[rgb(72,29,111)]" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] leading-tight md:text-xs font-semibold text-gray-900 whitespace-nowrap">
                        COD Available
                      </span>
                    </div>
                  </div>
                </div>

                {/* Easy Return */}
                <div className="flex items-center gap-1.5 md:gap-2 p-1 md:p-2 bg-white rounded-lg md:rounded-xl border border-gray-200 hover:border-[rgb(72,29,111)] hover:shadow-sm transition-all duration-200 min-w-0">
                  <div className="flex-shrink-0">
                    <div className="w-6 h-6 md:w-10 md:h-10 rounded-md md:rounded-lg bg-[rgba(72,29,111,0.1)] flex items-center justify-center">
                      <RotateCcw className="w-3 h-3 md:w-5 md:h-5 text-[rgb(72,29,111)]" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] leading-tight md:text-xs font-semibold text-gray-900 whitespace-nowrap">
                        Easy Return
                      </span>
                    </div>
                  </div>
                </div>

                {/* 7 Day Return */}
                <div className="flex items-center gap-1.5 md:gap-2 p-1 md:p-2 bg-white rounded-lg md:rounded-xl border border-gray-200 hover:border-[rgb(72,29,111)] hover:shadow-sm transition-all duration-200 min-w-0">
                  <div className="flex-shrink-0">
                    <div className="w-6 h-6 md:w-10 md:h-10 rounded-md md:rounded-lg bg-[rgba(72,29,111,0.1)] flex items-center justify-center">
                      <Calendar className="w-3 h-3 md:w-5 md:h-5 text-[rgb(72,29,111)]" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] leading-tight md:text-xs font-semibold text-gray-900 whitespace-nowrap">
                        7 Day Return
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Available Coupons Section */}
            {availableCoupons.length > 0 && (
              <div className="pt-6 mt-6 border-t border-gray-200">
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Tag className="w-5 h-5 text-green-700" />
                    <h3 className="text-base font-semibold text-green-900">Available Coupons</h3>
                  </div>
                  <div className="space-y-2">
                    {availableCoupons.slice(0, 3).map((coupon) => (
                      <div
                        key={coupon._id}
                        className="flex items-center justify-between bg-white rounded-lg p-3 border border-green-200 hover:border-green-300 transition-colors"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-semibold text-gray-900">{coupon.code}</span>
                            <span className="text-xs font-semibold text-green-700 bg-green-100 px-2 py-0.5 rounded">
                              {coupon.discountText}
                            </span>
                          </div>
                          {coupon.description && (
                            <p className="text-xs text-gray-600">{coupon.description}</p>
                          )}
                        </div>
                        <button
                          onClick={() => handleCopyCouponCode(coupon.code)}
                          className="ml-3 flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-green-700 bg-green-100 hover:bg-green-200 rounded-lg transition-colors"
                        >
                          {copiedCode === coupon.code ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Copied!
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              Copy
                            </>
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Payment & Delivery Info Section */}
            <div className="pt-6 mt-6 border-t border-gray-200 space-y-4">
              {/* Payment Method Logos */}
              <div className="flex items-center">
                <img
                  src={paymentGroupSvg}
                  alt="Payment Methods"
                  className="h-10 w-auto opacity-90 hover:opacity-100 transition-opacity"
                />
              </div>

              {/* Delivery Info Rows */}
              <div className="space-y-3">
                {/* Estimated Delivery */}
                <div className="flex items-center gap-3 text-sm text-[#374151]">
                  <Truck className="w-4 h-4 text-[#6B7280] flex-shrink-0" strokeWidth={1.5} />
                  <span>
                    <span className="font-medium">Estimated Delivery:</span>{' '}
                    {(() => {
                      const today = new Date();
                      const startDate = new Date(today);
                      startDate.setDate(today.getDate() + 3);
                      const endDate = new Date(today);
                      endDate.setDate(today.getDate() + 7);
                      const formatDate = (date) => {
                        return date.toLocaleDateString('en-IN', { month: 'short', day: '2-digit' });
                      };
                      return `${formatDate(startDate)} – ${formatDate(endDate)}`;
                    })()}
                  </span>
                </div>

                {/* Free Shipping & Returns */}
                <div className="flex items-center gap-3 text-sm text-[#374151]">
                  <Box className="w-4 h-4 text-[#6B7280] flex-shrink-0" strokeWidth={1.5} />
                  <span>
                    <span className="font-medium">Free Shipping & Returns:</span> On all orders
                  </span>
                </div>
              </div>
            </div>

            <ReviewSummaryCard className="mt-10 hidden md:block" />
          </div>
        </div>

        {/* Divider Section */}
        <div className="mt-12 mb-8">
          <div className="border-t border-[#E5E7EB]"></div>
        </div>

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <div className="mb-12 animate-fade-in-up">
            <div className="mb-8 text-center">
              <h2
                className="text-2xl md:text-3xl font-bold text-[#374151] leading-tight"
                style={{ fontFamily: '"GeorgiaBallpark Serif", serif' }}
              >
                People Also Viewed
              </h2>
              <p className="text-sm text-[#6B7280] mt-2">Similar products that might interest you</p>
            </div>
            
            {loadingRelatedProducts ? (
              <div className="flex items-center justify-center gap-2 py-12 text-sm text-[#6B7280]">
                <Loader2 className="w-5 h-5 animate-spin text-[rgb(72,29,111)]" />
                <span>Loading related products...</span>
              </div>
            ) : (
              <ProductCarousel products={relatedProducts} />
            )}
          </div>
        )}

        {/* Divider Section Before Reviews */}
        <div className="mt-8 mb-8">
          <div className="border-t border-[#E5E7EB]"></div>
        </div>

        {/* Reviews Listing Section - Full Width Grid Layout */}
        <ReviewsListing className="hidden md:block" />

        {/* Mobile-only tabs for Description & Reviews */}
        <div className="md:hidden mt-8 space-y-4">
          <div className="flex rounded-full border border-[#E5E7EB] bg-white text-xs font-semibold text-[#6B7280] shadow-sm">
            <button
              type="button"
              className={`flex-1 px-3 py-2 transition-colors duration-200 ${mobileTab === 'description'
                ? 'bg-[rgb(72,29,111)] text-white shadow-md'
                : 'hover:bg-[#F3F4F6]'
                }`}
              onClick={() => setMobileTab('description')}
            >
              Product Description
            </button>
            <button
              type="button"
              className={`flex-1 px-3 py-2 transition-colors duration-200 ${mobileTab === 'reviews'
                ? 'bg-[rgb(72,29,111)] text-white shadow-md'
                : 'hover:bg-[#F3F4F6]'
                }`}
              onClick={() => setMobileTab('reviews')}
            >
              Reviews
            </button>
          </div>

          <div className={mobileTab === 'description' ? 'block' : 'hidden'}>
            <DescriptionCard />
          </div>

          <div className={mobileTab === 'reviews' ? 'block space-y-4' : 'hidden'}>
            <ReviewSummaryCard className="mt-0" />
            <ReviewsListing className="mt-0" />
          </div>
        </div>
      </main>
      <Footer />

      {/* Image Lightbox Modal with Zoom */}
      {isImageModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/95 select-none"
          onContextMenu={handleContextMenu}
        >
          {/* Top Bar */}
          <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-4 py-3 bg-gradient-to-b from-black/70 to-transparent">
            <span className="text-white/70 text-sm font-medium">
              {images.length > 1 ? `${modalImageIndex + 1} / ${images.length}` : product.name}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={handleZoomOut}
                disabled={zoomLevel <= 1}
                className="p-2 text-white/80 hover:text-white hover:bg-white/15 rounded-full transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="Zoom out"
              >
                <ZoomOut className="w-5 h-5" />
              </button>
              <span className="text-white/70 text-xs min-w-[3.5rem] text-center tabular-nums">
                {Math.round(zoomLevel * 100)}%
              </span>
              <button
                onClick={handleZoomIn}
                disabled={zoomLevel >= 4}
                className="p-2 text-white/80 hover:text-white hover:bg-white/15 rounded-full transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="Zoom in"
              >
                <ZoomIn className="w-5 h-5" />
              </button>
              {zoomLevel > 1 && (
                <button
                  onClick={handleResetZoom}
                  className="px-3 py-1.5 text-xs font-medium text-white/80 hover:text-white hover:bg-white/15 rounded-full transition-all"
                >
                  Reset
                </button>
              )}
              <div className="w-px h-5 bg-white/20 mx-1" />
              <button
                onClick={closeImageModal}
                className="p-2 text-white/80 hover:text-white hover:bg-white/15 rounded-full transition-all"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Image Area */}
          <div
            ref={modalImageAreaRef}
            className={`absolute inset-0 flex items-center justify-center overflow-hidden ${
              zoomLevel > 1 ? (isDragging ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-zoom-in'
            }`}
            onMouseDown={handleModalMouseDown}
            onMouseMove={handleModalMouseMove}
            onMouseUp={handleModalMouseUp}
            onMouseLeave={handleModalMouseUp}
            onDoubleClick={handleModalDoubleClick}
            onTouchStart={handleModalTouchStart}
            onTouchMove={handleModalTouchMove}
            onTouchEnd={handleModalTouchEnd}
          >
            <img
              src={normalizeImagePath(images[modalImageIndex] || displayImage)}
              alt={product.name}
              className="max-w-full max-h-full object-contain select-none"
              style={{
                transform: `translate(${panPosition.x}px, ${panPosition.y}px) scale(${zoomLevel})`,
                transformOrigin: 'center center',
                transition: isDragging ? 'none' : 'transform 0.15s ease-out',
                userSelect: 'none',
                WebkitUserSelect: 'none',
              }}
              draggable="false"
              onContextMenu={handleContextMenu}
              onDragStart={handleDragStart}
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/800x1000?text=Image+Not+Available';
              }}
            />
          </div>

          {/* Zoom hint */}
          {zoomLevel === 1 && (
            <div className="absolute left-1/2 -translate-x-1/2 z-20 text-white/35 text-xs text-center pointer-events-none hidden md:block"
              style={{ bottom: images.length > 1 ? '96px' : '24px' }}
            >
              Scroll to zoom · Double-click to zoom · Drag to pan when zoomed
            </div>
          )}

          {/* Left / Right Nav Arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={goToModalPrev}
                className="absolute left-3 top-1/2 -translate-y-1/2 z-20 p-3 bg-white/10 hover:bg-white/25 rounded-full text-white transition-all backdrop-blur-sm shadow-lg"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={goToModalNext}
                className="absolute right-3 top-1/2 -translate-y-1/2 z-20 p-3 bg-white/10 hover:bg-white/25 rounded-full text-white transition-all backdrop-blur-sm shadow-lg"
                aria-label="Next image"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          {/* Bottom Thumbnail Strip */}
          {images.length > 1 && (
            <div className="absolute bottom-0 left-0 right-0 z-20 pb-4 pt-8 bg-gradient-to-t from-black/70 to-transparent">
              <div className="flex items-center justify-center gap-2 overflow-x-auto px-4 scrollbar-hide">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => { setModalImageIndex(idx); handleResetZoom(); }}
                    className={`flex-shrink-0 w-12 h-16 rounded overflow-hidden border-2 transition-all duration-200 ${
                      modalImageIndex === idx
                        ? 'border-white scale-110 shadow-lg'
                        : 'border-transparent opacity-50 hover:opacity-90 hover:scale-105'
                    }`}
                  >
                    <img
                      src={normalizeImagePath(img)}
                      alt={`Image ${idx + 1}`}
                      className="w-full h-full object-cover"
                      draggable="false"
                      onContextMenu={handleContextMenu}
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Review Form Modal */}
      {isReviewModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          onClick={() => setIsReviewModalOpen(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-[#E5E7EB] px-6 py-4 flex items-center justify-between z-10">
              <h2 className="text-xl font-bold text-[rgb(72,29,111)]">Write a Review</h2>
              <button
                onClick={() => setIsReviewModalOpen(false)}
                className="p-2 hover:bg-[#F9FAFB] rounded-full transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5 text-[#6B7280]" />
              </button>
            </div>

            {/* Modal Body - Review Form */}
            <form
              onSubmit={handleSubmitReview}
              className="p-6 space-y-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#374151] mb-1.5">
                    Your Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={reviewForm.name}
                    onChange={handleReviewInputChange}
                    className="w-full px-4 py-2.5 border border-[#E5E7EB] rounded-lg text-sm text-[#374151] focus:outline-none focus:ring-2 focus:ring-[rgb(72,29,111)] focus:border-[rgb(72,29,111)]"
                    placeholder="Enter your name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#374151] mb-1.5">
                    Email (optional)
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={reviewForm.email}
                    onChange={handleReviewInputChange}
                    className="w-full px-4 py-2.5 border border-[#E5E7EB] rounded-lg text-sm text-[#374151] focus:outline-none focus:ring-2 focus:ring-[rgb(72,29,111)] focus:border-[rgb(72,29,111)]"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#374151] mb-2">
                  Rating <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewForm(prev => ({ ...prev, rating: star }))}
                        className="transition-transform duration-150 hover:scale-110 active:scale-95"
                        aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                      >
                        <Star
                          className={`w-5 h-5 ${star <= reviewForm.rating
                            ? 'fill-[#F472B6] text-[#F472B6]'
                            : 'text-[#E5E7EB]'
                            } transition-colors duration-150`}
                        />
                      </button>
                    ))}
                  </div>
                  <span className="text-sm font-medium text-[#6B7280] ml-2">
                    {reviewForm.rating} / 5
                  </span>
                </div>
                <p className="text-xs text-[#6B7280] mt-1.5">
                  {reviewForm.rating === 5 && 'Excellent'}
                  {reviewForm.rating === 4 && 'Very Good'}
                  {reviewForm.rating === 3 && 'Good'}
                  {reviewForm.rating === 2 && 'Fair'}
                  {reviewForm.rating === 1 && 'Poor'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#374151] mb-1.5">
                  Your Review
                </label>
                <textarea
                  name="comment"
                  rows={5}
                  value={reviewForm.comment}
                  onChange={handleReviewInputChange}
                  className="w-full px-4 py-2.5 border border-[#E5E7EB] rounded-lg text-sm text-[#374151] focus:outline-none focus:ring-2 focus:ring-[rgb(72,29,111)] focus:border-[rgb(72,29,111)] resize-none"
                  placeholder="Share your experience (optional)"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsReviewModalOpen(false)}
                  className="px-5 py-2.5 border border-[#E5E7EB] rounded-lg text-[#374151] text-sm font-medium hover:bg-[#F9FAFB] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#F472B6] text-white text-sm font-semibold hover:bg-[#EC4899] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submittingReview ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Review'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Mobile Sticky Action Buttons - Fixed at Bottom */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-40 px-4 py-3 safe-area-inset-bottom">
        <div className="flex gap-3">
          {isOutOfStock ? (
            <button
              disabled
              className="flex-1 flex items-center justify-center gap-2 bg-gray-400 text-white py-3 rounded-full text-sm font-semibold opacity-60 cursor-not-allowed"
            >
              <Package className="w-4 h-4" />
              Out of Stock
            </button>
          ) : (
            <button
              onClick={handleAddToCart}
              disabled={addingToCart}
              className={`flex-1 flex items-center justify-center gap-2 bg-[rgb(72,29,111)] text-white py-3 rounded-full text-sm font-semibold active:bg-[#390e60] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${!addingToCart && !isOutOfStock ? 'animate-pulse-button' : ''}`}
            >
              {addingToCart ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4" />
                  Add to Bag
                </>
              )}
            </button>
          )}
          <button
            onClick={() => navigate('/cart')}
            className="px-5 py-3 rounded-full border-[1.5px] border-[rgb(72,29,111)] text-sm font-semibold text-[rgb(72,29,111)] active:bg-[rgba(72,29,111,0.08)] transition-all duration-200"
          >
            View Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;


import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../../components/user/Navbar';
import Footer from '../../components/user/Footer';
import { getProductDetail } from '../../services/user/productService';
import { addToCart } from '../../services/user/cartService';
import { getReviews, addReview } from '../../services/user/reviewService';
import { Loader2, ChevronLeft, IndianRupee, Package, X, ShoppingBag, Star, Truck, Box } from 'lucide-react';
import toast from 'react-hot-toast';
import paymentGroupSvg from '../../assets/images/payment-group.svg';

const ProductDetailPage = () => {
  const { productId } = useParams();
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
  }, [productId]);

  // Fetch reviews when productId or page changes
  useEffect(() => {
    if (!productId) return;
    fetchReviews(reviewPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId, reviewPage]);

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

  const handleVariantSelect = (variantId) => {
    setSelectedVariantId(variantId);
    const variant = product?.variants?.find((v) => v._id === variantId);
    if (variant && variant.variant_image) {
      setActiveImage(variant.variant_image);
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;

    try {
      setAddingToCart(true);
      const response = await addToCart(product._id, selectedVariantId, 1);
      if (response.status) {
        toast.success('Added to cart!', {
          icon: '🛍️',
        });
        // Navigate to cart page after successful add
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

  return (
    <div className="min-h-screen bg-[#FAF9F5]">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 lg:px-6 py-10">
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
                onClick={() => displayImage && setIsImageModalOpen(true)}
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

            {/* Product Description - Moved to Left Column */}
            {product.description && (
              <div className="bg-white border border-[#E5E7EB] rounded-xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-[#E5E7EB] bg-[#FAF9F5]">
                  <h3 className="text-sm font-semibold text-[rgb(72,29,111)] uppercase tracking-wide">
                    Product Description
                  </h3>
                </div>
                <div className="px-6 py-5">
                  <p className="text-base text-[#374151] leading-relaxed whitespace-pre-line">
                    {product.description}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Details, Price, Variants, Actions, Reviews */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-[rgb(72,29,111)] leading-tight">{product.name}</h1>
              {product.category?.name && (
                <p className="text-sm text-[#6B7280] mt-2 uppercase tracking-wide">{product.category.name}</p>
              )}
              {activeVariant && activeVariant.variant_name && (
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-sm font-medium text-[#6B7280]">Selected Option:</span>
                  <span className="text-base font-semibold text-[rgb(72,29,111)] bg-[rgba(72,29,111,0.06)] px-3 py-1.5 rounded-lg border border-[rgb(72,29,111)]">
                    {activeVariant.variant_name}
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-baseline gap-3">
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

            {/* Product-level attributes (read-only display) */}
            {product.attributesvalues &&
              product.attributesvalues.length > 0 &&
              product.attributesvalues.some(attr => attr.values && attr.values.length > 0) && (
                <div className="space-y-3 border-t border-[#E5E7EB] pt-4">
                  <div className="text-sm font-semibold text-[#374151] mb-4 uppercase tracking-wide">Product Details</div>
                  {product.attributesvalues
                    .filter(attr => attr.values && attr.values.length > 0)
                    .map((attr, idx) => (
                      <div key={attr._id || idx} className="flex items-start gap-3">
                        <div className="text-sm font-medium text-[#6B7280] min-w-[100px]">
                          {attr.name || 'Attribute'}:
                        </div>
                        <div className="flex-1 text-sm text-[#374151]">
                          {attr.values.map((val, vIdx) => (
                            <span key={val._id || vIdx}>
                              {val.value || 'Value'}
                              {vIdx < attr.values.length - 1 && <span className="text-[#9CA3AF] mx-2">•</span>}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                </div>
              )}

            {/* Variants list */}
            {product.variants && product.variants.length > 0 && (
              <div>
                <div className="text-sm font-semibold text-[#374151] mb-3 uppercase tracking-wide">Options</div>
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                  {product.variants.map((variant) => (
                    <button
                      key={variant._id}
                      onClick={() => handleVariantSelect(variant._id)}
                      className={`flex-shrink-0 border-2 rounded-lg overflow-hidden transition-all ${selectedVariantId === variant._id
                        ? 'border-[rgb(72,29,111)] bg-[rgba(72,29,111,0.06)] shadow-sm'
                        : 'border-[#E5E7EB] hover:border-[#D1D5DB]'
                        }`}
                    >
                      {variant.variant_image ? (
                        <div className="w-24 h-32 bg-gray-100 overflow-hidden select-none">
                          <img
                            src={normalizeImagePath(variant.variant_image)}
                            alt={variant.variant_name}
                            className="w-full h-full object-cover pointer-events-none select-none"
                            draggable="false"
                            onContextMenu={handleContextMenu}
                            onDragStart={handleDragStart}
                            onError={(e) => {
                              e.target.src = 'https://via.placeholder.com/100x150?text=Image';
                            }}
                          />
                        </div>
                      ) : (
                        <div className="w-24 h-32 bg-gray-100 flex items-center justify-center">
                          <Package className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                      <div className={`p-2 w-24 ${selectedVariantId === variant._id ? 'bg-[rgba(72,29,111,0.06)]' : 'bg-white'}`}>
                        <div className={`text-xs font-semibold mb-0.5 truncate ${selectedVariantId === variant._id
                          ? 'text-[rgb(72,29,111)] font-medium'
                          : 'text-[#374151]'
                          }`}>{variant.variant_name || 'Variant'}</div>
                        <div className="text-[10px] text-[#6B7280]">₹ {variant.variant_price?.toLocaleString('en-IN') || displayPrice}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={handleAddToCart}
                disabled={addingToCart}
                className="flex-1 flex items-center justify-center gap-2 bg-[rgb(72,29,111)] text-white py-3 rounded-full text-sm font-semibold hover:bg-[#390e60] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
              <button
                onClick={() => navigate('/cart')}
                className="px-5 py-3 rounded-full border-[1.5px] border-[rgb(72,29,111)] text-sm font-semibold text-[rgb(72,29,111)] hover:bg-[rgba(72,29,111,0.08)] transition-all duration-200"
              >
                View Cart
              </button>
            </div>

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

            {/* Reviews Section */}
            <div className="mt-10 border-t border-[#E5E7EB] pt-8 space-y-6">
              {/* Summary row */}
              <div className="bg-white border border-[#E5E7EB] rounded-2xl shadow-sm px-6 py-5">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                  {/* Left: average rating */}
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

                  {/* Middle: rating distribution */}
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

                  {/* Right: write review button */}
                  <div className="flex md:justify-end">
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


              {/* Review list */}
              <div className="space-y-3">
                {reviewLoading ? (
                  <div className="flex items-center gap-2 text-sm text-[#6B7280]">
                    <Loader2 className="w-4 h-4 animate-spin text-[rgb(72,29,111)]" />
                    Loading reviews...
                  </div>
                ) : reviews.length === 0 ? (
                  <p className="text-sm text-[#6B7280]">
                    No reviews for this product yet.
                  </p>
                ) : (
                  <>
                    <div className="space-y-3">
                      {reviews.map((rev) => (
                        <div
                          key={rev._id}
                          className="border border-[#E5E7EB] rounded-xl p-4 bg-white shadow-sm"
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <div>
                              <p className="text-sm font-semibold text-[#374151]">
                                {rev.name}
                              </p>
                              <div className="mt-0.5">
                                {renderStars(rev.rating, 'sm')}
                              </div>
                            </div>
                            <p className="text-xs text-[#6B7280]">
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
                            <p className="text-sm text-[#374151] whitespace-pre-line mt-1.5">
                              {rev.comment}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Reviews pagination */}
                    {reviewTotalPages > 1 && (
                      <div className="flex items-center justify-between pt-2 text-xs text-[#6B7280]">
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
                            className="px-3 py-1.5 border border-[#E5E7EB] rounded-full hover:bg-[#F9FAFB] disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-[#374151]"
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
                            className="px-3 py-1.5 border border-[#E5E7EB] rounded-full hover:bg-[#F9FAFB] disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-[#374151]"
                          >
                            Next
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />

      {/* Image Lightbox Modal */}
      {isImageModalOpen && displayImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm select-none"
          onClick={() => setIsImageModalOpen(false)}
          onContextMenu={handleContextMenu}
        >
          <div className="relative max-w-7xl max-h-[90vh] w-full h-full flex items-center justify-center p-4 select-none">
            <button
              onClick={() => setIsImageModalOpen(false)}
              className="absolute top-4 right-4 z-10 p-2 bg-white/90 hover:bg-white rounded-full transition-colors shadow-lg"
              aria-label="Close"
            >
              <X className="w-6 h-6 text-gray-900" />
            </button>
            <img
              src={normalizeImagePath(displayImage)}
              alt={product.name}
              className="max-w-full max-h-full object-contain rounded-lg select-none"
              draggable="false"
              onContextMenu={handleContextMenu}
              onDragStart={handleDragStart}
              onClick={(e) => e.stopPropagation()}
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/800x1000?text=Image+Not+Available';
              }}
            />
          </div>
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
    </div>
  );
};

export default ProductDetailPage;


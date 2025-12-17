import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../../components/user/Navbar';
import Footer from '../../components/user/Footer';
import { getProductDetail } from '../../services/user/productService';
import { addToCart } from '../../services/user/cartService';
import { getReviews, addReview } from '../../services/user/reviewService';
import { Loader2, ChevronLeft, IndianRupee, Package, X, ShoppingBag, Star } from 'lucide-react';
import toast from 'react-hot-toast';

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
              idx < filled ? 'text-rose-500' : 'text-gray-300'
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
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Navbar />
        <main className="flex-1 max-w-6xl mx-auto px-4 py-16">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-6"
          >
            <ChevronLeft className="w-4 h-4" /> Back
          </button>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
            <p className="text-lg text-gray-700">{error || 'Product not found'}</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const images = product.images || [];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 lg:px-6 py-10">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-6"
        >
          <ChevronLeft className="w-4 h-4" /> Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Images */}
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
                    className={`border overflow-hidden h-20 bg-gray-100 aspect-[3/4] select-none ${
                      activeImage === img && !selectedVariantId ? 'border-rose-400' : 'border-gray-200'
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

          {/* Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">{product.name}</h1>
              {product.category?.name && (
                <p className="text-sm text-gray-500 mt-2 uppercase tracking-wide">{product.category.name}</p>
              )}
              {activeVariant && activeVariant.variant_name && (
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-600">Selected Option:</span>
                  <span className="text-base font-semibold text-rose-600 bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-200">
                    {activeVariant.variant_name}
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-baseline gap-3">
              <div className="flex items-baseline gap-1">
                <IndianRupee className="w-5 h-5 text-gray-900 self-center" />
                <span className="text-3xl font-bold text-gray-900 leading-none">
                  {displayPrice?.toLocaleString('en-IN') || '0'}
                </span>
              </div>
              {product.original_price && product.original_price > displayPrice && (
                <span className="text-lg text-gray-400 line-through whitespace-nowrap leading-none">
                  ₹ {product.original_price.toLocaleString('en-IN')}
                </span>
              )}
              {discountPercent > 0 && (
                <span className="text-sm font-semibold text-rose-600 whitespace-nowrap leading-none">
                  {discountPercent}% off
                </span>
              )}
            </div>

            {product.description && (
              <div className="text-base text-gray-700 leading-relaxed bg-gray-50 border border-gray-100 rounded-xl p-4">
                {product.description}
              </div>
            )}

            {/* Product-level attributes (read-only display) */}
            {product.attributesvalues && 
             product.attributesvalues.length > 0 && 
             product.attributesvalues.some(attr => attr.values && attr.values.length > 0) && (
              <div className="space-y-3 border-t border-gray-200 pt-4">
                <div className="text-sm font-semibold text-gray-800 mb-4 uppercase tracking-wide">Product Details</div>
                {product.attributesvalues
                  .filter(attr => attr.values && attr.values.length > 0)
                  .map((attr, idx) => (
                    <div key={attr._id || idx} className="flex items-start gap-3">
                      <div className="text-sm font-medium text-gray-600 min-w-[100px]">
                        {attr.name || 'Attribute'}:
                      </div>
                      <div className="flex-1 text-sm text-gray-800">
                        {attr.values.map((val, vIdx) => (
                          <span key={val._id || vIdx}>
                            {val.value || 'Value'}
                            {vIdx < attr.values.length - 1 && <span className="text-gray-400 mx-2">•</span>}
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
                <div className="text-sm font-semibold text-gray-800 mb-3 uppercase tracking-wide">Options</div>
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                  {product.variants.map((variant) => (
                    <button
                      key={variant._id}
                      onClick={() => handleVariantSelect(variant._id)}
                      className={`flex-shrink-0 border-2 rounded-lg overflow-hidden transition-all ${
                        selectedVariantId === variant._id
                          ? 'border-rose-400 shadow-md'
                          : 'border-gray-200 hover:border-gray-400'
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
                      <div className="p-2 bg-white w-24">
                        <div className="text-xs font-semibold text-gray-900 mb-0.5 truncate">{variant.variant_name || 'Variant'}</div>
                        <div className="text-[10px] text-gray-600">₹ {variant.variant_price?.toLocaleString('en-IN') || displayPrice}</div>
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
                className="flex-1 flex items-center justify-center gap-2 bg-gray-900 text-white py-3 rounded-full text-sm font-semibold hover:bg-black transition disabled:opacity-50 disabled:cursor-not-allowed"
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
                className="px-5 py-3 rounded-full border border-gray-300 text-sm font-semibold text-gray-800 hover:border-gray-500 transition"
              >
                View Cart
              </button>
            </div>

            {/* Reviews Section */}
            <div className="mt-10 border-t border-gray-200 pt-8 space-y-6">
              {/* Summary row */}
              <div className="bg-white border border-gray-200 rounded-2xl shadow-sm px-6 py-5">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                  {/* Left: average rating */}
                  <div className="flex flex-col items-center md:items-start gap-2">
                    <h2 className="text-base font-semibold text-gray-900">
                      Customer Reviews
                    </h2>
                    {renderStars(reviewSummary.average, 'lg')}
                    <p className="text-3xl font-bold text-gray-900">
                      {reviewSummary.average?.toFixed(1) || '0.0'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {reviewSummary.count > 0
                        ? `Based on ${reviewSummary.count} review${
                            reviewSummary.count > 1 ? 's' : ''
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
                          className="flex items-center gap-3 text-xs text-gray-600"
                        >
                          <span className="w-10 flex items-center justify-end gap-0.5">
                            <span>{star}</span>
                            <span className="text-rose-400 text-[11px]">★</span>
                          </span>
                          <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-rose-400 transition-all"
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                          <span className="w-4 text-right text-[11px] text-gray-500">
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
                      className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-rose-400 text-white text-sm font-semibold shadow-sm hover:bg-rose-500 transition"
                    >
                      Write a review
                    </button>
                  </div>
                </div>
              </div>


              {/* Review list */}
              <div className="space-y-3">
                {reviewLoading ? (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Loading reviews...
                  </div>
                ) : reviews.length === 0 ? (
                  <p className="text-sm text-gray-500">
                    No reviews for this product yet.
                  </p>
                ) : (
                  <>
                    <div className="space-y-3">
                      {reviews.map((rev) => (
                        <div
                          key={rev._id}
                          className="border border-gray-200 rounded-xl p-4 bg-white"
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <div>
                              <p className="text-sm font-semibold text-gray-900">
                                {rev.name}
                              </p>
                              <div className="mt-0.5">
                                {renderStars(rev.rating, 'sm')}
                              </div>
                            </div>
                            <p className="text-xs text-gray-500">
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
                            <p className="text-sm text-gray-700 whitespace-pre-line mt-1.5">
                              {rev.comment}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Reviews pagination */}
                    {reviewTotalPages > 1 && (
                      <div className="flex items-center justify-between pt-2 text-xs text-gray-600">
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
                            className="px-3 py-1.5 border border-gray-300 rounded-full hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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
                            className="px-3 py-1.5 border border-gray-300 rounded-full hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
              <h2 className="text-xl font-bold text-gray-900">Write a Review</h2>
              <button
                onClick={() => setIsReviewModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Modal Body - Review Form */}
            <form
              onSubmit={handleSubmitReview}
              className="p-6 space-y-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Your Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={reviewForm.name}
                    onChange={handleReviewInputChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                    placeholder="Enter your name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Email (optional)
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={reviewForm.email}
                    onChange={handleReviewInputChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                    placeholder="you@example.com"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
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
                          className={`w-5 h-5 ${
                            star <= reviewForm.rating
                              ? 'fill-rose-400 text-rose-400'
                              : 'text-gray-300'
                          } transition-colors duration-150`}
                        />
                      </button>
                    ))}
                  </div>
                  <span className="text-sm font-medium text-gray-600 ml-2">
                    {reviewForm.rating} / 5
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1.5">
                  {reviewForm.rating === 5 && 'Excellent'}
                  {reviewForm.rating === 4 && 'Very Good'}
                  {reviewForm.rating === 3 && 'Good'}
                  {reviewForm.rating === 2 && 'Fair'}
                  {reviewForm.rating === 1 && 'Poor'}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Your Review
                </label>
                <textarea
                  name="comment"
                  rows={5}
                  value={reviewForm.comment}
                  onChange={handleReviewInputChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 resize-none"
                  placeholder="Share your experience (optional)"
                />
              </div>
              
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsReviewModalOpen(false)}
                  className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 text-sm font-medium hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-rose-400 text-white text-sm font-semibold hover:bg-rose-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
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


import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../../components/user/Navbar';
import Footer from '../../components/user/Footer';
import { getProductDetail } from '../../services/user/productService';
import { addToCart } from '../../services/user/cartService';
import { Loader2, ChevronLeft, IndianRupee, Star, Package, X, ShoppingBag } from 'lucide-react';
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
  const [addingToCart, setAddingToCart] = useState(false);

  const normalizeImagePath = (imagePath) => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    return imagePath;
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
        // Optionally navigate to cart or show a notification
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error(error.message || 'Failed to add to cart');
    } finally {
      setAddingToCart(false);
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
              className="relative bg-gray-100 overflow-hidden cursor-pointer flex items-center justify-center"
              style={{ minHeight: '400px', maxHeight: '720px' }}
              onClick={() => displayImage && setIsImageModalOpen(true)}
            >
              {displayImage ? (
                <img
                  src={normalizeImagePath(displayImage)}
                  alt={product.name}
                  className="max-h-[720px] w-full h-full object-cover"
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
                    className={`border overflow-hidden h-20 bg-gray-100 aspect-[3/4] ${
                      activeImage === img && !selectedVariantId ? 'border-rose-400' : 'border-gray-200'
                    }`}
                  >
                    <img
                      src={normalizeImagePath(img)}
                      alt={`thumb-${idx}`}
                      className="w-full h-full object-cover"
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

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 text-amber-500">
                {[...Array(5)].map((_, idx) => (
                  <Star key={idx} className="w-5 h-5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span className="text-sm text-gray-600">No reviews yet</span>
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
            {product.attributesvalues && product.attributesvalues.length > 0 && (
              <div className="space-y-3 border-t border-gray-200 pt-4">
                <div className="text-sm font-semibold text-gray-800 mb-4 uppercase tracking-wide">Product Details</div>
                {product.attributesvalues.map((attr, idx) => (
                  <div key={attr._id || idx} className="flex items-start gap-3">
                    <div className="text-sm font-medium text-gray-600 min-w-[100px]">
                      {attr.name || 'Attribute'}:
                    </div>
                    <div className="flex-1 text-sm text-gray-800">
                      {attr.values && attr.values.length > 0 ? (
                        attr.values.map((val, vIdx) => (
                          <span key={val._id || vIdx}>
                            {val.value || 'Value'}
                            {vIdx < attr.values.length - 1 && <span className="text-gray-400 mx-2">•</span>}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-500">-</span>
                      )}
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
                        <div className="w-24 h-32 bg-gray-100 overflow-hidden">
                          <img
                            src={normalizeImagePath(variant.variant_image)}
                            alt={variant.variant_name}
                            className="w-full h-full object-cover"
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
          </div>
        </div>
      </main>
      <Footer />

      {/* Image Lightbox Modal */}
      {isImageModalOpen && displayImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={() => setIsImageModalOpen(false)}
        >
          <div className="relative max-w-7xl max-h-[90vh] w-full h-full flex items-center justify-center p-4">
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
              className="max-w-full max-h-full object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/800x1000?text=Image+Not+Available';
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetailPage;


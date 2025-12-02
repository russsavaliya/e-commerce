/**
 * Homepage - Luxury E-commerce Platform
 * Features: Banner carousel, Featured products (Bestsellers & Trending)
 */

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Star, Sparkles, Loader2 } from 'lucide-react';
import { getActiveBanners } from '../../services/user/bannerService';
import { getBestsellerProducts, getTrendingProducts } from '../../services/user/productService';
import ProductCard from '../../components/user/ProductCard';
import Navbar from '../../components/user/Navbar';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const navigate = useNavigate();
  // State Management
  const [banners, setBanners] = useState([]);
  const [categoryStripBanners, setCategoryStripBanners] = useState([]);
  const [bestsellerProducts, setBestsellerProducts] = useState([]);
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [bannerImageErrors, setBannerImageErrors] = useState(new Set());
    const [isMobile, setIsMobile] = useState(false);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [bannersRes, categoryStripRes, bestsellersRes, trendingRes] = await Promise.all([
          getActiveBanners('homepage_hero'), // hero
          getActiveBanners('homepage_category_strip'), // curved cards
          getBestsellerProducts(12),
          getTrendingProducts(12),
        ]);

        if (bannersRes.status) {
          setBanners(bannersRes.data || []);
        }
        if (categoryStripRes.status) {
          setCategoryStripBanners(categoryStripRes.data || []);
        }
        if (bestsellersRes.status) {
          setBestsellerProducts(bestsellersRes.data || []);
        }
        if (trendingRes.status) {
          setTrendingProducts(trendingRes.data || []);
        }
      } catch (error) {
        console.error('Error fetching homepage data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handle responsive behavior for curved strip (disable heavy transforms on mobile)
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Auto-rotate banners
  useEffect(() => {
    if (banners.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentBannerIndex((prev) => (prev + 1) % banners.length);
    }, 5000); // Change banner every 5 seconds

    return () => clearInterval(interval);
  }, [banners.length]);

  // Navigate banners
  const goToPreviousBanner = () => {
    setCurrentBannerIndex((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const goToNextBanner = () => {
    setCurrentBannerIndex((prev) => (prev + 1) % banners.length);
  };

  const goToBanner = (index) => {
    setCurrentBannerIndex(index);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'Playfair Display', 'Cormorant Garamond', serif" }}>
      {/* Navbar */}
      <Navbar />

      {/* Hero Banner Section */}
      {banners.length > 0 && (
        <section className="relative w-full h-[600px] md:h-[700px] overflow-hidden bg-gray-900">
          {/* Banner Images */}
          <div className="relative w-full h-full">
            {banners.map((banner, index) => (
              <div
                key={banner._id}
                className={`absolute inset-0 transition-opacity duration-1000 ${
                  index === currentBannerIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
                }`}
              >
                {!bannerImageErrors.has(banner._id) ? (
                  <img
                    src={banner.image_url}
                    alt={banner.title || 'Banner'}
                    className="w-full h-full object-cover"
                    onError={() => {
                      setBannerImageErrors((prev) => new Set([...prev, banner._id]));
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                    <p className="text-white text-xl">Image not available</p>
                  </div>
                )}
                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
              </div>
            ))}
          </div>

          {/* Banner Navigation Arrows */}
          {banners.length > 1 && (
            <>
              <button
                onClick={goToPreviousBanner}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 bg-white/10 backdrop-blur-sm text-white rounded-full hover:bg-white/20 transition-all duration-300 hover:scale-110"
                aria-label="Previous banner"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={goToNextBanner}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 bg-white/10 backdrop-blur-sm text-white rounded-full hover:bg-white/20 transition-all duration-300 hover:scale-110"
                aria-label="Next banner"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          {/* Banner Indicators */}
          {banners.length > 1 && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
              {banners.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToBanner(index)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    index === currentBannerIndex
                      ? 'w-8 bg-white'
                      : 'w-2 bg-white/50 hover:bg-white/75'
                  }`}
                  aria-label={`Go to banner ${index + 1}`}
                />
              ))}
            </div>
          )}

          {/* Banner Title (if available) */}
          {banners[currentBannerIndex]?.title && (
            <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-20 text-center">
              <h2 
                className="text-4xl md:text-5xl font-bold text-white mb-2 drop-shadow-lg"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                {banners[currentBannerIndex].title}
              </h2>
            </div>
          )}
        </section>
      )}

      {/* Homepage Category Strip - Curved Cards */}
      {categoryStripBanners.length > 0 && (
        <section className="px-4 md:px-8 py-12 bg-gradient-to-b from-black via-black to-transparent text-white">
          <div className="max-w-7xl mx-auto">
            {/* Perspective wrapper for curved effect */}
            <div
              className="relative w-full overflow-x-auto md:overflow-visible"
              style={{ perspective: '1200px' }}
            >
              <div className="flex items-end gap-2 md:gap-4 lg:gap-6 justify-center min-w-max md:min-w-0" style={{ transformStyle: 'preserve-3d' }}>
                {categoryStripBanners.map((banner, index) => {
                  let cardStyle = {
                    transition: 'transform 500ms ease',
                    transformOrigin: '50% 100%',
                  };

                  if (!isMobile && categoryStripBanners.length > 1) {
                    const total = categoryStripBanners.length;
                    const middle = (total - 1) / 2;
                    const offset = index - middle;
                    const maxDistance = middle;

                    // Desktop / tablet: strong curved strip
                    const rotateY = 0; // keep images facing front
                    const distanceFromCenter = Math.abs(offset);
                    // Center lowest, edges highest
                    const translateY = (maxDistance - distanceFromCenter) * 14; // px
                    // Edges big, center smallest, middle smaller
                    const scale = 0.7 + (distanceFromCenter / maxDistance) * 0.3;

                    cardStyle.transform = `translateY(${translateY}px) scale(${scale}) rotateY(${rotateY}deg)`;
                  } else {
                    // Mobile: simple straight strip, fully visible
                    cardStyle.transform = 'translateY(0) scale(1)';
                  }

                  return (
                    <button
                      key={banner._id}
                      onClick={() => {
                        if (banner.category?._id || banner.category) {
                          const id = banner.category._id || banner.category;
                          navigate(`/sale/${id}`);
                        }
                      }}
                      style={cardStyle}
                      className="relative min-w-[120px] md:min-w-[150px] lg:min-w-[180px] h-56 md:h-64 lg:h-72 rounded-lg overflow-hidden flex-shrink-0 bg-gray-900/60 border border-white/10 shadow-[0_18px_40px_rgba(0,0,0,0.7)] group focus:outline-none hover:translate-y-0 hover:scale-105"
                    >
                      <img
                        src={banner.image_url}
                        alt={banner.title || banner.category?.name || 'Banner'}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        onError={(e) => {
                          e.target.src =
                            'https://via.placeholder.com/300x400?text=Banner';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Featured Products Section - Bestsellers */}
      {bestsellerProducts.length > 0 && (
        <section className="py-16 px-4 md:px-8 bg-gradient-to-b from-white to-gray-50">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
              <Star className="w-8 h-8 text-yellow-500 fill-yellow-500" />
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                Bestsellers
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {bestsellerProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Products Section - Trending */}
      {trendingProducts.length > 0 && (
        <section className="py-16 px-4 md:px-8 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
              <Sparkles className="w-8 h-8 text-purple-500" />
              <h2 
                className="text-3xl md:text-4xl font-bold text-gray-900"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Trending Now
              </h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {trendingProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Empty State */}
      {banners.length === 0 && bestsellerProducts.length === 0 && trendingProducts.length === 0 && (
        <div className="min-h-[60vh] flex items-center justify-center px-4">
          <div className="text-center">
            <p className="text-2xl font-semibold text-gray-900 mb-2">Welcome</p>
            <p className="text-gray-600">Content coming soon...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;


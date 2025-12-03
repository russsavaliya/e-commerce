/**
 * Sale Page - Shows products for a selected category
 */

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, ArrowLeft } from 'lucide-react';
import Navbar from '../../components/user/Navbar';
import ProductCard from '../../components/user/ProductCard';
import { getProductsByCategory } from '../../services/user/productService';

const SalePage = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();

  const [categoryName, setCategoryName] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const res = await getProductsByCategory(categoryId, 1, 40);
        if (res.status && res.data) {
          setProducts(res.data.products || []);
          if (res.data.products && res.data.products.length > 0) {
            const first = res.data.products[0];
            setCategoryName(
              typeof first.category === 'object'
                ? first.category?.name || ''
                : ''
            );
          }
        }
      } catch (error) {
        console.error('Error fetching sale products:', error);
      } finally {
        setLoading(false);
      }
    };

    if (categoryId) {
      fetchProducts();
    }
  }, [categoryId]);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 md:px-8 py-10">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm text-gray-700 hover:text-rose-600 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            {categoryName || 'Sale'}
          </h1>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-green-600" />
          </div>
        ) : products.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-gray-600">No products found for this category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default SalePage;



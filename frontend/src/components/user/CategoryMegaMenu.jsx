import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, ArrowRight } from 'lucide-react';
import { getCategoriesGrouped } from '../../services/user/categoryService';

const CategoryMegaMenu = ({ isOpen, onClose }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hoveredParentId, setHoveredParentId] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await getCategoriesGrouped();
      if (response.status) {
        setCategories(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const hoveredCategory = categories.find(cat => cat._id === hoveredParentId);

  return (
    <div
      className={`absolute top-full left-0 mt-3 w-[700px] max-w-[90vw] bg-white border border-[#E5E7EB] rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.12)] z-50 overflow-hidden transition-all duration-300 ${
        isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'
      }`}
      onMouseEnter={() => {}} // Keep menu open when hovering over it
      onMouseLeave={onClose}
    >
      <div className="flex min-h-[360px]">
        {/* Left Column - Parent Categories */}
        <div className="w-[320px] border-r border-[#E5E7EB] bg-gradient-to-b from-[#FAF9F5] via-[#FAF9F5] to-white max-h-[500px] overflow-y-auto custom-scrollbar">
          <div className="p-6">
            <h3 className="text-[10px] font-bold text-[rgb(72,29,111)] uppercase tracking-[0.15em] mb-6 pb-4 border-b border-[#E5E7EB]">
              Shop by Category
            </h3>
            {loading ? (
              <div className="text-sm text-[#6B7280] py-8 text-center">Loading...</div>
            ) : categories.length === 0 ? (
              <div className="text-sm text-[#6B7280] py-8 text-center">No categories available</div>
            ) : (
              <div className="space-y-1">
                {categories.map((category) => (
                  <div
                    key={category._id}
                    className={`group relative rounded-lg transition-all duration-300 ${
                      hoveredParentId === category._id
                        ? 'bg-white shadow-lg scale-[1.02] translate-x-1'
                        : 'hover:bg-white/70 translate-x-0'
                    }`}
                    onMouseEnter={() => setHoveredParentId(category._id)}
                  >
                    <Link
                      to={`/sale/${category._id}`}
                      className="flex items-center justify-between px-4 py-4 rounded-lg"
                      onClick={onClose}
                    >
                      <span
                        className={`text-sm font-bold transition-colors duration-300 ${
                          hoveredParentId === category._id
                            ? 'text-[rgb(72,29,111)]'
                            : 'text-[#1F2937] group-hover:text-[rgb(72,29,111)]'
                        }`}
                      >
                        {category.name}
                      </span>
                      {category.children && category.children.length > 0 && (
                        <ArrowRight
                          className={`w-4 h-4 transition-all duration-300 ${
                            hoveredParentId === category._id
                              ? 'text-[rgb(72,29,111)] translate-x-1 opacity-100'
                              : 'text-[#9CA3AF] opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5'
                          }`}
                        />
                      )}
                    </Link>
                    {/* Active indicator */}
                    {hoveredParentId === category._id && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-12 bg-[rgb(72,29,111)] rounded-r-full shadow-sm" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Child Categories */}
        <div className="flex-1 bg-white max-h-[500px] overflow-y-auto custom-scrollbar">
          {hoveredCategory && hoveredCategory.children && hoveredCategory.children.length > 0 ? (
            <div className="p-6">
              <Link
                to={`/sale/${hoveredCategory._id}`}
                onClick={onClose}
                className="block mb-6 pb-4 border-b border-[#E5E7EB] group"
              >
                <h4 className="text-base font-bold text-[rgb(72,29,111)] uppercase tracking-wide group-hover:underline transition-all duration-200 mb-1">
                  {hoveredCategory.name}
                </h4>
                <p className="text-xs text-[#6B7280] font-medium">View all products in this category</p>
              </Link>
              <div className="space-y-0.5">
                {hoveredCategory.children.map((child) => (
                  <Link
                    key={child._id}
                    to={`/sale/${child._id}`}
                    className="block px-4 py-3.5 rounded-lg text-sm text-[#374151] hover:bg-[rgba(72,29,111,0.08)] hover:text-[rgb(72,29,111)] transition-all duration-300 hover:translate-x-1 group"
                    onClick={onClose}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-[#1F2937] group-hover:font-semibold group-hover:text-[rgb(72,29,111)] transition-all duration-200">
                        {child.name}
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 text-[#9CA3AF] opacity-0 group-hover:opacity-100 transition-all duration-200 group-hover:translate-x-1" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-6 flex items-center justify-center h-full min-h-[320px]">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-[rgba(72,29,111,0.05)] flex items-center justify-center mx-auto mb-4">
                  <ChevronRight className="w-6 h-6 text-[rgb(72,29,111)] opacity-30" />
                </div>
                <p className="text-sm font-medium text-[#6B7280] mb-1">
                  {hoveredCategory
                    ? 'No subcategories available'
                    : 'Hover over a category'}
                </p>
                <p className="text-xs text-[#9CA3AF]">
                  {hoveredCategory
                    ? 'This category has no subcategories'
                    : 'to see subcategories'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoryMegaMenu;

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { getCategoriesGrouped } from '../../services/user/categoryService';

const CategoryMegaMenu = ({ isOpen, onClose }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

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

  // Limit to maximum 5 parent categories
  const MAX_PARENT_CATEGORIES = 5;
  const MAX_CHILD_CATEGORIES = 5;
  
  const visibleCategories = categories.slice(0, MAX_PARENT_CATEGORIES);
  const hasMoreCategories = categories.length > MAX_PARENT_CATEGORIES;

  // Calculate dynamic width based on number of columns
  const columnCount = Math.min(visibleCategories.length + (hasMoreCategories ? 1 : 0), 6);

  return (
    <div
      className={`absolute left-0 bg-[#FAF9F5] border-t border-[rgba(72,29,111,0.15)] shadow-[0_4px_12px_rgba(0,0,0,0.08)] z-50 overflow-hidden transition-all duration-300 ${
        isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'
      }`}
      style={{
        top: '100%',
        width: `${columnCount * 160 + 64}px`,
        maxWidth: '95vw',
        minWidth: '600px',
        borderRadius: '0',
        margin: '0',
        padding: '0',
      }}
      onMouseEnter={() => {}} // Keep menu open when hovering over it
      onMouseLeave={onClose}
    >
      <div className="p-8">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-sm text-[#6B7280]">Loading categories...</div>
          </div>
        ) : visibleCategories.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-sm text-[#6B7280]">No categories available</div>
          </div>
        ) : (
          <div 
            className="grid gap-6"
            style={{
              gridTemplateColumns: `repeat(${columnCount}, 1fr)`,
            }}
          >
            {visibleCategories.map((parentCategory, index) => {
              const children = parentCategory.children || [];
              const visibleChildren = children.slice(0, MAX_CHILD_CATEGORIES);
              const hasMoreChildren = children.length > MAX_CHILD_CATEGORIES;

              return (
                <div
                  key={parentCategory._id}
                  className={`flex flex-col ${index < visibleCategories.length - 1 || hasMoreCategories ? 'border-r border-[rgba(72,29,111,0.1)] pr-6' : ''}`}
                >
                  {/* Parent Category Title */}
                  <Link
                    to={`/sale/${parentCategory._id}`}
                    onClick={onClose}
                    className="mb-4 group"
                  >
                    <h3
                      className="text-sm font-semibold text-[rgb(72,29,111)] uppercase tracking-wide mb-1 transition-colors duration-200 group-hover:opacity-80"
                      style={{
                        fontFamily: '"Playfair Display", serif',
                        fontWeight: 600,
                        letterSpacing: '0.05em',
                      }}
                    >
                      {parentCategory.name}
                    </h3>
                    <div className="w-12 h-[2px] bg-gradient-to-r from-[rgb(72,29,111)] to-transparent"></div>
                  </Link>

                  {/* Child Categories */}
                  {visibleChildren.length > 0 && (
                    <div className="space-y-1.5 flex-1">
                      {visibleChildren.map((child) => (
                        <Link
                          key={child._id}
                          to={`/sale/${child._id}`}
                          onClick={onClose}
                          className="block py-2 text-sm text-[#374151] hover:text-[rgb(72,29,111)] transition-all duration-200 group"
                          style={{
                            fontFamily: '"Inter", sans-serif',
                            fontWeight: 400,
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <span className="group-hover:font-medium transition-all duration-200">
                              {child.name}
                            </span>
                            <ChevronRight className="w-3 h-3 text-[#9CA3AF] opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-200" />
                          </div>
                        </Link>
                      ))}

                      {/* "View More" Link if parent has more than 5 children */}
                      {hasMoreChildren && (
                        <Link
                          to={`/sale/${parentCategory._id}`}
                          onClick={onClose}
                          className="block py-2 text-xs text-[rgb(72,29,111)] font-medium hover:opacity-80 transition-opacity duration-200 mt-2 pt-2 border-t border-[rgba(72,29,111,0.1)]"
                          style={{
                            fontFamily: '"Inter", sans-serif',
                          }}
                        >
                          View More ({children.length - MAX_CHILD_CATEGORIES} more)
                        </Link>
                      )}
                    </div>
                  )}

                  {/* Empty State for Parent with No Children */}
                  {visibleChildren.length === 0 && (
                    <div className="text-xs text-[#9CA3AF] italic py-2">
                      No subcategories
                    </div>
                  )}
                </div>
              );
            })}

            {/* "More" Indicator Column (if more than 5 parent categories) */}
            {hasMoreCategories && (
              <div className="flex flex-col items-center justify-center border-l border-[rgba(72,29,111,0.1)] pl-6">
                <Link
                  to="/sale"
                  onClick={onClose}
                  className="text-sm font-medium text-[rgb(72,29,111)] hover:opacity-80 transition-opacity duration-200 text-center"
                  style={{
                    fontFamily: '"Playfair Display", serif',
                    fontWeight: 500,
                  }}
                >
                  <div className="mb-2">
                    <ChevronRight className="w-5 h-5 mx-auto rotate-[-90deg] opacity-60" />
                  </div>
                  <div>More</div>
                  <div className="text-xs mt-1 opacity-70">
                    ({categories.length - MAX_PARENT_CATEGORIES} more)
                  </div>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryMegaMenu;

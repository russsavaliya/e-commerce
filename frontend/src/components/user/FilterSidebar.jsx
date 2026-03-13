/**
 * FilterSidebar Component - Reusable filter sidebar for product pages
 * Used in SalePage, BestSellerPage, NewArrivalPage
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  ChevronDown, 
  Filter, 
  ArrowUpDown, 
  Tag, 
  IndianRupee 
} from 'lucide-react';
import { Slider } from 'antd';

const PRICE_BOUNDS = { min: 200, max: 5000 };

const SORT_OPTIONS = [
  { value: 'createdAt-desc', label: 'Newest First' },
  { value: 'createdAt-asc', label: 'Oldest First' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'name-asc', label: 'Name: A to Z' },
  { value: 'name-desc', label: 'Name: Z to A' },
];

const FilterSidebar = ({
  isMobile = false,
  filters,
  updateFilters,
  clearFilters,
  categories = [],
  attributes = [],
  priceRange: externalPriceRange,
  setPriceRange: setExternalPriceRange,
  // State handlers
  categoryDropdownOpen,
  setCategoryDropdownOpen,
  attributeDropdownOpen,
  setAttributeDropdownOpen,
  attributeValueDropdownOpen,
  setAttributeValueDropdownOpen,
  categorySearchTerm,
  setCategorySearchTerm,
  attributeSearchTerm,
  setAttributeSearchTerm,
  attributeValueSearchTerm,
  setAttributeValueSearchTerm,
}) => {
  // Internal price range state - always keep as numbers
  const [testRange, setTestRange] = useState(() => {
    const [min, max] = externalPriceRange || [PRICE_BOUNDS.min, PRICE_BOUNDS.max];
    return [Number(min) || PRICE_BOUNDS.min, Number(max) || PRICE_BOUNDS.max];
  });

  // Refs for search inputs
  const categorySearchRef = useRef(null);
  const attributeSearchRef = useRef(null);
  const attributeValueSearchRef = useRef(null);
  
  // Ref to track if slider is being dragged (to prevent external sync interference)
  const isSliderDragging = useRef(false);

  // Sort dropdown state
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const sortDropdownRef = useRef(null);

  // Close sort dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target)) {
        setSortDropdownOpen(false);
      }
    };

    if (sortDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [sortDropdownOpen]);

  // Sync testRange when external priceRange changes (but not while dragging)
  useEffect(() => {
    if (!isSliderDragging.current && externalPriceRange) {
      const [min, max] = externalPriceRange;
      const newMin = Number(min) || PRICE_BOUNDS.min;
      const newMax = Number(max) || PRICE_BOUNDS.max;
      // Use functional update to compare with current state
      setTestRange(prev => {
        const prevMin = Number(prev[0]) || PRICE_BOUNDS.min;
        const prevMax = Number(prev[1]) || PRICE_BOUNDS.max;
        // Only update if values actually changed
        if (prevMin !== newMin || prevMax !== newMax) {
          return [newMin, newMax];
        }
        return prev;
      });
    }
  }, [externalPriceRange]);

  // Category Dropdown Component
  const CategoryDropdown = () => {
    // Group categories by parent/child relationship
    const parentCategories = categories.filter(cat => !cat.parent_category_id);
    const childCategoriesMap = new Map();
    
    categories.forEach(cat => {
      if (cat.parent_category_id) {
        const parentId = cat.parent_category_id.toString();
        if (!childCategoriesMap.has(parentId)) {
          childCategoriesMap.set(parentId, []);
        }
        childCategoriesMap.get(parentId).push(cat);
      }
    });

    // Helper function to get all child category IDs for a parent
    const getChildCategoryIds = (parentId) => {
      const children = childCategoriesMap.get(parentId?.toString()) || [];
      return children.map(child => child._id);
    };

    // Helper function to check if a category is selected (directly or as parent)
    const isCategorySelected = (categoryId, isParent = false) => {
      if (!filters.category_id) return false;
      
      // Direct match
      if (filters.category_id === categoryId) return true;
      
      // If checking a parent category, see if any child is selected
      if (isParent) {
        const children = getChildCategoryIds(categoryId);
        return children.includes(filters.category_id);
      }
      
      return false;
    };

    // Helper function to get display name for selected category
    const getSelectedCategoryName = () => {
      if (!filters.category_id) return 'All Categories';
      
      const selectedCategory = categories.find(c => c._id === filters.category_id);
      if (!selectedCategory) return 'All Categories';
      
      // If it's a child category, show "Parent > Child" format
      if (selectedCategory.parent_category_id) {
        const parent = categories.find(c => c._id === selectedCategory.parent_category_id);
        return parent ? `${parent.name} > ${selectedCategory.name}` : selectedCategory.name;
      }
      
      return selectedCategory.name;
    };

    // Filter categories based on search term
    const filterCategories = (catList) => {
      if (!categorySearchTerm) return catList;
      const searchLower = categorySearchTerm.toLowerCase();
      return catList.filter(cat => {
        const matchesName = cat.name.toLowerCase().includes(searchLower);
        // Also include if any child matches
        const children = childCategoriesMap.get(cat._id?.toString()) || [];
        const childMatches = children.some(child => 
          child.name.toLowerCase().includes(searchLower)
        );
        return matchesName || childMatches;
      });
    };

    const filteredParentCategories = filterCategories(parentCategories);

    // Handle category selection
    const handleCategorySelect = (categoryId, isParent = false) => {
      if (isParent) {
        // Parent selected: filter by parent ID + all child IDs
        // We'll pass the parent ID and let the backend handle including children
        // OR we can pass comma-separated IDs. For now, let's use parent ID
        // and the backend should handle it, or we modify to pass all IDs
        const childIds = getChildCategoryIds(categoryId);
        // Pass parent ID - backend will need to handle parent+children filtering
        // For now, we'll pass parent ID and update backend if needed
        updateFilters({ category_id: categoryId, attribute_id: '', attribute_value_id: '' });
      } else {
        // Child selected: filter by child ID only
        updateFilters({ category_id: categoryId, attribute_id: '', attribute_value_id: '' });
      }
      setCategoryDropdownOpen(false);
      setCategorySearchTerm('');
    };

    return (
      <div className="mb-6 relative category-dropdown-container">
        <label className="flex items-center gap-2 text-xs font-semibold text-[rgb(72,29,111)] mb-2.5 uppercase tracking-wide">
          <Tag className="w-4 h-4 text-[rgb(72,29,111)]" />
          Category
        </label>
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setCategoryDropdownOpen(!categoryDropdownOpen);
              if (!categoryDropdownOpen) {
                setCategorySearchTerm('');
              }
            }}
            className="w-full px-3 py-2.5 border border-[rgb(72,29,111)] rounded-lg focus:outline-none text-sm text-left flex items-center justify-between bg-[#faf9f5] shadow-sm hover:border-[rgb(72,29,111)] transition-colors"
          >
            <span className="truncate">
              {getSelectedCategoryName()}
            </span>
            <ChevronDown className={`w-4 h-4 text-[rgb(72,29,111)] transition-transform ${categoryDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {categoryDropdownOpen && (
            <div className="absolute z-50 w-full mt-2 bg-[#faf9f5] border border-[rgb(72,29,111)] rounded-lg shadow-xl overflow-hidden">
              <div className="p-3 border-b border-gray-200 bg-gray-50">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  <input
                    ref={categorySearchRef}
                    type="text"
                    placeholder="Search categories..."
                    value={categorySearchTerm}
                    onChange={(e) => {
                      e.stopPropagation();
                      setCategorySearchTerm(e.target.value);
                    }}
                    onKeyDown={(e) => e.stopPropagation()}
                    className="w-full pl-10 pr-3 py-2.5 text-sm border border-[rgb(72,29,111)] rounded-lg focus:outline-none focus:ring-[rgb(72,29,111)] focus:border-[rgb(72,29,111)] bg-[#faf9f5]"
                    onClick={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                    autoFocus
                  />
                </div>
              </div>
              <div className="max-h-[300px] overflow-y-auto">
                <button
                  type="button"
                  onClick={() => {
                    updateFilters({ category_id: '', attribute_id: '', attribute_value_id: '' });
                    setCategoryDropdownOpen(false);
                    setCategorySearchTerm('');
                  }}
                  className={`w-full px-4 py-2.5 text-left text-sm hover:bg-[rgb(72,29,111)] hover:text-[#faf9f5] transition-colors ${
                    !filters.category_id 
                      ? 'bg-[rgb(72,29,111)] text-[#faf9f5] font-semibold' 
                      : 'text-[rgb(72,29,111)]'
                  }`}
                >
                  All Categories
                </button>
                
                {filteredParentCategories.map((parentCat) => {
                  const children = childCategoriesMap.get(parentCat._id?.toString()) || [];
                  const isParentSelected = isCategorySelected(parentCat._id, true);
                  const hasChildren = children.length > 0;
                  
                  // Filter children based on search term
                  const filteredChildren = categorySearchTerm
                    ? children.filter(child => 
                        child.name.toLowerCase().includes(categorySearchTerm.toLowerCase())
                      )
                    : children;
                  
                  // Show parent if it matches search OR if it has matching children
                  const shouldShowParent = !categorySearchTerm || 
                    parentCat.name.toLowerCase().includes(categorySearchTerm.toLowerCase()) ||
                    filteredChildren.length > 0;

                  if (!shouldShowParent) return null;

                  return (
                    <div key={parentCat._id}>
                      {/* Parent Category */}
                      <button
                        type="button"
                        onClick={() => handleCategorySelect(parentCat._id, true)}
                        className={`w-full px-4 py-2.5 text-left text-sm hover:bg-[rgb(72,29,111)] hover:text-[#faf9f5] transition-colors font-medium ${
                          isParentSelected && filters.category_id === parentCat._id
                            ? 'bg-[rgb(72,29,111)] text-[#faf9f5] font-semibold'
                            : 'text-[rgb(72,29,111)]'
                        }`}
                      >
                        {parentCat.name}
                        {hasChildren && (
                          <span className="ml-2 text-xs opacity-75">
                            ({children.length})
                          </span>
                        )}
                      </button>
                      
                      {/* Child Categories - Nested with indentation */}
                      {filteredChildren.length > 0 && (
                        <div className="pl-6 bg-gray-50/50">
                          {filteredChildren.map((childCat) => {
                            const isChildSelected = filters.category_id === childCat._id;
                            return (
                              <button
                                key={childCat._id}
                                type="button"
                                onClick={() => handleCategorySelect(childCat._id, false)}
                                className={`w-full px-4 py-2 text-left text-sm hover:bg-[rgb(72,29,111)] hover:text-[#faf9f5] transition-colors ${
                                  isChildSelected
                                    ? 'bg-[rgb(72,29,111)] text-[#faf9f5] font-semibold'
                                    : 'text-[rgb(72,29,111)]'
                                }`}
                              >
                                <span className="text-xs opacity-60 mr-1">└</span>
                                {childCat.name}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
                
                {filteredParentCategories.length === 0 && (
                  <div className="px-4 py-3 text-sm text-[rgb(72,29,111)] text-center">
                    No categories found
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Price Range Slider Component
  const PriceRangeSlider = () => {
    // Local state for drag visual feedback only (doesn't trigger API)
    const [dragRange, setDragRange] = useState(testRange);
    
    // Local state for input values (to allow empty while typing)
    const [minInputValue, setMinInputValue] = useState(() => String(testRange[0]));
    const [maxInputValue, setMaxInputValue] = useState(() => String(testRange[1]));

    // Sync input values and drag range when testRange changes externally
    useEffect(() => {
      setMinInputValue(String(testRange[0]));
      setMaxInputValue(String(testRange[1]));
      setDragRange(testRange);
    }, [testRange]);

    const applyPriceFilter = () => {
      const [currentMin, currentMax] = dragRange;
      updateFilters({
        min_price: currentMin !== PRICE_BOUNDS.min ? currentMin : '',
        max_price: currentMax !== PRICE_BOUNDS.max ? currentMax : ''
      });
      if (setExternalPriceRange) {
        setExternalPriceRange([currentMin, currentMax]);
      }
    };

    const resetPriceFilter = () => {
      setTestRange([PRICE_BOUNDS.min, PRICE_BOUNDS.max]);
      setDragRange([PRICE_BOUNDS.min, PRICE_BOUNDS.max]);
      setMinInputValue(String(PRICE_BOUNDS.min));
      setMaxInputValue(String(PRICE_BOUNDS.max));
      updateFilters({ min_price: '', max_price: '' });
      if (setExternalPriceRange) {
        setExternalPriceRange([PRICE_BOUNDS.min, PRICE_BOUNDS.max]);
      }
    };

    const handleMinChange = (e) => {
      const value = e.target.value;
      setMinInputValue(value);
      // Update dragRange only if valid number
      if (value !== '' && !isNaN(Number(value))) {
        const numValue = Number(value);
        if (numValue >= PRICE_BOUNDS.min && numValue <= PRICE_BOUNDS.max && numValue <= dragRange[1]) {
          setDragRange([numValue, dragRange[1]]);
        }
      }
    };

    const handleMaxChange = (e) => {
      const value = e.target.value;
      setMaxInputValue(value);
      // Update dragRange only if valid number
      if (value !== '' && !isNaN(Number(value))) {
        const numValue = Number(value);
        if (numValue >= PRICE_BOUNDS.min && numValue <= PRICE_BOUNDS.max && numValue >= dragRange[0]) {
          setDragRange([dragRange[0], numValue]);
        }
      }
    };

    const handleMinBlur = () => {
      const numValue = Number(minInputValue);
      if (isNaN(numValue) || numValue < PRICE_BOUNDS.min) {
        setMinInputValue(String(PRICE_BOUNDS.min));
        setDragRange([PRICE_BOUNDS.min, dragRange[1]]);
      } else if (numValue > dragRange[1]) {
        setMinInputValue(String(dragRange[1]));
        setDragRange([dragRange[1], dragRange[1]]);
      } else if (numValue > PRICE_BOUNDS.max) {
        setMinInputValue(String(PRICE_BOUNDS.max));
        setDragRange([PRICE_BOUNDS.max, dragRange[1]]);
      } else {
        setMinInputValue(String(numValue));
        setDragRange([numValue, dragRange[1]]);
      }
    };

    const handleMaxBlur = () => {
      const numValue = Number(maxInputValue);
      if (isNaN(numValue) || numValue > PRICE_BOUNDS.max) {
        setMaxInputValue(String(PRICE_BOUNDS.max));
        setDragRange([dragRange[0], PRICE_BOUNDS.max]);
      } else if (numValue < dragRange[0]) {
        setMaxInputValue(String(dragRange[0]));
        setDragRange([dragRange[0], dragRange[0]]);
      } else if (numValue < PRICE_BOUNDS.min) {
        setMaxInputValue(String(PRICE_BOUNDS.min));
        setDragRange([dragRange[0], PRICE_BOUNDS.min]);
      } else {
        setMaxInputValue(String(numValue));
        setDragRange([dragRange[0], numValue]);
      }
    };

    return (
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2.5">
          <label className="flex items-center gap-2 text-xs font-semibold text-[rgb(72,29,111)] uppercase tracking-wide">
            <IndianRupee className="w-4 h-4 text-[rgb(72,29,111)]" />
            Price
          </label>
          <button
            onClick={resetPriceFilter}
            className="text-xs text-[rgb(72,29,111)] hover:opacity-80 font-medium uppercase tracking-wide"
          >
            Reset
          </button>
        </div>
        <div className="mt-4 mb-4 px-2">
          <Slider
            range
            min={PRICE_BOUNDS.min}
            max={PRICE_BOUNDS.max}
            step={50}
            value={[Number(dragRange[0]), Number(dragRange[1])]}
            onChange={(value) => {
              // Only update dragRange for smooth visual feedback during drag
              // Don't trigger any API calls or testRange updates yet
              const newMin = Number(value[0]);
              const newMax = Number(value[1]);
              setDragRange([newMin, newMax]);
              setMinInputValue(String(newMin));
              setMaxInputValue(String(newMax));
            }}
            onAfterChange={(value) => {
              // Update actual filter and trigger API call only AFTER drag ends
              if (value && value.length === 2) {
                const newMin = Number(value[0]);
                const newMax = Number(value[1]);
                setTestRange([newMin, newMax]);
                setDragRange([newMin, newMax]);
                setMinInputValue(String(newMin));
                setMaxInputValue(String(newMax));
              }
            }}
            tooltip={{
              formatter: (value) => `₹${value?.toLocaleString('en-IN')}`,
            }}
            styles={{
              track: {
                background: 'rgb(72,29,111)',
              },
              tracks: {
                background: 'rgb(72,29,111)',
              },
              handle: {
                borderColor: 'rgb(72,29,111)',
                backgroundColor: 'white',
              },
              rail: {
                backgroundColor: '#e5e7eb',
              },
            }}
          />
        </div>
        <div className="flex items-end gap-3 mt-4">
          <div className="flex-1 flex items-center gap-2">
            <span className="text-[10px] text-gray-500">Rs.</span>
            <input
              type="text"
              inputMode="numeric"
              value={minInputValue}
              onChange={handleMinChange}
              onBlur={handleMinBlur}
              className="text-sm font-semibold text-[rgb(72,29,111)] border-b border-[rgb(72,29,111)] pb-0.5 focus:outline-none focus:border-[rgb(72,29,111)] w-full bg-transparent"
            />
          </div>
          <div className="flex-1 flex items-center gap-2">
            <span className="text-[10px] text-gray-500">Rs.</span>
            <input
              type="text"
              inputMode="numeric"
              value={maxInputValue}
              onChange={handleMaxChange}
              onBlur={handleMaxBlur}
              className="text-sm font-semibold text-[rgb(72,29,111)] border-b border-[rgb(72,29,111)] pb-0.5 focus:outline-none focus:border-[rgb(72,29,111)] w-full bg-transparent"
            />
          </div>
          <button
            onClick={applyPriceFilter}
            className="px-4 py-1.5 bg-[rgb(72,29,111)] hover:opacity-90 text-white text-sm font-semibold rounded-lg transition-colors whitespace-nowrap flex-shrink-0"
          >
            GO
          </button>
        </div>
      </div>
    );
  };

  // Attribute Filter Component
  // const AttributeFilter = () => {
  //   const selectedAttribute = attributes.find(a => a._id === filters.attribute_id);
  //   const filteredAttributes = attributes.filter(attr =>
  //     attr.name.toLowerCase().includes(attributeSearchTerm.toLowerCase())
  //   );
  //   const filteredAttributeValues = selectedAttribute
  //     ? selectedAttribute.values.filter(val =>
  //         val.value.toLowerCase().includes(attributeValueSearchTerm.toLowerCase())
  //       )
  //     : [];

  //   return (
  //     <div className="mb-6">
  //       <label className="flex items-center gap-2 text-xs font-semibold text-[rgb(72,29,111)] mb-2.5 uppercase tracking-wide">
  //         <Tag className="w-4 h-4 text-[rgb(72,29,111)]" />
  //         Options
  //       </label>
  //       <div className="mb-2.5 relative attribute-dropdown-container">
  //         <button
  //           type="button"
  //           onClick={() => {
  //             setAttributeDropdownOpen(!attributeDropdownOpen);
  //             if (!attributeDropdownOpen) {
  //               setAttributeSearchTerm('');
  //             }
  //           }}
  //           className="w-full px-3 py-2.5 border border-[rgb(72,29,111)] rounded-lg focus:outline-none text-sm text-left flex items-center justify-between bg-[#faf9f5] shadow-sm hover:border-[rgb(72,29,111)] transition-colors"
  //         >
  //           <span className="truncate">
  //             {filters.attribute_id
  //               ? attributes.find(a => a._id === filters.attribute_id)?.name || 'Select Attribute'
  //               : 'Select Attribute'}
  //           </span>
  //           <ChevronDown className={`w-4 h-4 text-[rgb(72,29,111)] transition-transform flex-shrink-0 ${attributeDropdownOpen ? 'rotate-180' : ''}`} />
  //         </button>

  //         {attributeDropdownOpen && (
  //           <div className="absolute z-50 w-full mt-2 bg-[#faf9f5] border border-[rgb(72,29,111)] rounded-lg shadow-xl overflow-hidden">
  //             <div className="p-3 border-b border-gray-200 bg-gray-50">
  //               <div className="relative">
  //                 <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
  //                 <input
  //                   ref={attributeSearchRef}
  //                   type="text"
  //                   placeholder="Search attributes..."
  //                   value={attributeSearchTerm}
  //                   onChange={(e) => {
  //                     e.stopPropagation();
  //                     setAttributeSearchTerm(e.target.value);
  //                   }}
  //                   onKeyDown={(e) => e.stopPropagation()}
  //                   className="w-full pl-10 pr-3 py-2.5 text-sm border border-[rgb(72,29,111)] rounded-lg focus:outline-none focus:ring-[rgb(72,29,111)] focus:border-[rgb(72,29,111)] bg-[#faf9f5]"
  //                   onClick={(e) => e.stopPropagation()}
  //                   onMouseDown={(e) => e.stopPropagation()}
  //                   autoFocus
  //                 />
  //               </div>
  //             </div>
  //             <div className="max-h-[210px] overflow-y-auto">
  //               <button
  //                 type="button"
  //                 onClick={() => {
  //                   updateFilters({ attribute_id: '', attribute_value_id: '' });
  //                   setAttributeDropdownOpen(false);
  //                   setAttributeSearchTerm('');
  //                 }}
  //                 className={`w-full px-4 py-2.5 text-left text-sm hover:bg-[rgb(72,29,111)] hover:text-[#faf9f5] transition-colors ${
  //                   !filters.attribute_id 
  //                     ? 'bg-[rgb(72,29,111)] text-[#faf9f5] font-semibold' 
  //                     : 'text-[rgb(72,29,111)]'
  //                 }`}
  //               >
  //                 Select Attribute
  //               </button>
  //               {filteredAttributes.map((attr) => (
  //                 <button
  //                   key={attr._id}
  //                   type="button"
  //                   onClick={() => {
  //                     updateFilters({ attribute_id: attr._id, attribute_value_id: '' });
  //                     setAttributeDropdownOpen(false);
  //                     setAttributeSearchTerm('');
  //                   }}
  //                   className={`w-full px-4 py-2.5 text-left text-sm hover:bg-[rgb(72,29,111)] hover:text-[#faf9f5] transition-colors ${
  //                     filters.attribute_id === attr._id
  //                       ? 'bg-[rgb(72,29,111)] text-[#faf9f5] font-semibold'
  //                       : 'text-[rgb(72,29,111)]'
  //                   }`}
  //                 >
  //                   {attr.name}
  //                 </button>
  //               ))}
  //               {filteredAttributes.length === 0 && (
  //                 <div className="px-4 py-3 text-sm text-[rgb(72,29,111)] text-center">
  //                   No attributes found
  //                 </div>
  //               )}
  //             </div>
  //           </div>
  //         )}
  //       </div>

  //       {selectedAttribute && (
  //         <div className="relative attribute-value-dropdown-container">
  //           <button
  //             type="button"
  //             onClick={() => {
  //               setAttributeValueDropdownOpen(!attributeValueDropdownOpen);
  //               if (!attributeValueDropdownOpen) {
  //                 setAttributeValueSearchTerm('');
  //               }
  //             }}
  //             className="w-full px-3 py-2.5 border border-[rgb(72,29,111)] rounded-lg focus:outline-none text-sm text-left flex items-center justify-between bg-[#faf9f5] shadow-sm hover:border-[rgb(72,29,111)] transition-colors"
  //           >
  //             <span className="truncate">
  //               {filters.attribute_value_id
  //                 ? selectedAttribute.values.find(v => v._id === filters.attribute_value_id)?.value || 'All Values'
  //                 : `All Values (${selectedAttribute.name})`}
  //             </span>
  //             <ChevronDown className={`w-4 h-4 text-[rgb(72,29,111)] transition-transform flex-shrink-0 ${attributeValueDropdownOpen ? 'rotate-180' : ''}`} />
  //           </button>

  //           {attributeValueDropdownOpen && (
  //             <div className="absolute z-50 w-full mt-2 bg-[#faf9f5] border border-[rgb(72,29,111)] rounded-lg shadow-xl overflow-hidden">
  //               <div className="p-3 border-b border-gray-200 bg-gray-50">
  //                 <div className="relative">
  //                   <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
  //                   <input
  //                     ref={attributeValueSearchRef}
  //                     type="text"
  //                     placeholder="Search values..."
  //                     value={attributeValueSearchTerm}
  //                     onChange={(e) => {
  //                       e.stopPropagation();
  //                       setAttributeValueSearchTerm(e.target.value);
  //                     }}
  //                     onKeyDown={(e) => e.stopPropagation()}
  //                     className="w-full pl-10 pr-3 py-2.5 text-sm border border-[rgb(72,29,111)] rounded-lg focus:outline-none focus:ring-[rgb(72,29,111)] focus:border-[rgb(72,29,111)] bg-[#faf9f5]"
  //                     onClick={(e) => e.stopPropagation()}
  //                     onMouseDown={(e) => e.stopPropagation()}
  //                     autoFocus
  //                   />
  //                 </div>
  //               </div>
  //               <div className="max-h-[210px] overflow-y-auto">
  //                 <button
  //                   type="button"
  //                   onClick={() => {
  //                     updateFilters({ attribute_value_id: '' });
  //                     setAttributeValueDropdownOpen(false);
  //                     setAttributeValueSearchTerm('');
  //                   }}
  //                   className={`w-full px-4 py-2.5 text-left text-sm hover:bg-[rgb(72,29,111)] hover:text-[#faf9f5] transition-colors ${
  //                     !filters.attribute_value_id 
  //                       ? 'bg-[rgb(72,29,111)] text-[#faf9f5] font-semibold' 
  //                       : 'text-[rgb(72,29,111)]'
  //                   }`}
  //                 >
  //                   All Values ({selectedAttribute.name})
  //                 </button>
  //                 {filteredAttributeValues.map((val) => (
  //                   <button
  //                     key={val._id}
  //                     type="button"
  //                     onClick={() => {
  //                       updateFilters({ attribute_value_id: val._id });
  //                       setAttributeValueDropdownOpen(false);
  //                       setAttributeValueSearchTerm('');
  //                     }}
  //                     className={`w-full px-4 py-2.5 text-left text-sm hover:bg-[rgb(72,29,111)] hover:text-[#faf9f5] transition-colors ${
  //                       filters.attribute_value_id === val._id
  //                         ? 'bg-[rgb(72,29,111)] text-[#faf9f5] font-semibold'
  //                         : 'text-[rgb(72,29,111)]'
  //                     }`}
  //                   >
  //                     {val.value}
  //                   </button>
  //                 ))}
  //                 {filteredAttributeValues.length === 0 && (
  //                   <div className="px-4 py-3 text-sm text-[rgb(72,29,111)] text-center">
  //                     No values found
  //                   </div>
  //                 )}
  //               </div>
  //             </div>
  //           )}
  //         </div>
  //       )}
  //     </div>
  //   );
  // };

  return (
    <div className={`bg-[#faf9f5] ${isMobile ? 'p-6' : 'p-5'} rounded-lg border border-gray-200 shadow-md`}>
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-[rgb(72,29,111)]" />
          <h3 className="text-lg font-bold text-[rgb(72,29,111)] uppercase tracking-wide">
            Filters
          </h3>
        </div>
        <button
          onClick={clearFilters}
          className="text-xs text-[rgb(72,29,111)] hover:opacity-80 uppercase tracking-wide font-medium hover:underline transition-all"
        >
          Clear All
        </button>
      </div>
      <div className="mb-6 relative sort-dropdown-container" ref={sortDropdownRef}>
        <label className="flex items-center gap-2 text-xs font-semibold text-[rgb(72,29,111)] mb-2.5 uppercase tracking-wide">
          <ArrowUpDown className="w-4 h-4 text-[rgb(72,29,111)]" />
          Sort By
        </label>
        <div className="relative">
          <button
            type="button"
            onClick={() => setSortDropdownOpen(!sortDropdownOpen)}
            className="w-full px-3 py-2.5 border border-[rgb(72,29,111)] rounded-lg focus:outline-none text-sm text-left flex items-center justify-between bg-[#faf9f5] shadow-sm hover:border-[rgb(72,29,111)] transition-colors"
          >
            <span className="truncate">
              {SORT_OPTIONS.find(opt => opt.value === `${filters.sort_by}-${filters.sort_order}`)?.label || 'Newest First'}
            </span>
            <ChevronDown className={`w-4 h-4 text-[rgb(72,29,111)] transition-transform flex-shrink-0 ${sortDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {sortDropdownOpen && (
            <div className="absolute z-50 w-full mt-2 bg-[#faf9f5] border border-[rgb(72,29,111)] rounded-lg shadow-xl overflow-hidden">
              <div className="max-h-[300px] overflow-y-auto">
                {SORT_OPTIONS.map((option) => {
                  const isSelected = option.value === `${filters.sort_by}-${filters.sort_order}`;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        const [sort_by, sort_order] = option.value.split('-');
                        updateFilters({ sort_by, sort_order });
                        setSortDropdownOpen(false);
                      }}
                      className={`w-full px-4 py-2.5 text-left text-sm hover:bg-[rgb(72,29,111)] hover:text-[#faf9f5] transition-colors ${
                        isSelected
                          ? 'bg-[rgb(72,29,111)] text-[#faf9f5] font-semibold'
                          : 'text-[rgb(72,29,111)]'
                      }`}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
      <CategoryDropdown />
      <PriceRangeSlider />
      {/* <AttributeFilter /> */}
    </div>
  );
};

export default FilterSidebar;
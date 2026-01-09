import React from 'react';
import { Filter } from 'lucide-react';
import { ORDER_STATUS_OPTIONS, PAYMENT_STATUS_OPTIONS } from '../../utils/orderConstants';

const OrderFilters = ({ 
  orderStatusFilter, 
  paymentStatusFilter, 
  onOrderStatusChange, 
  onPaymentStatusChange, 
  onClearFilters,
  hasActiveFilters 
}) => {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-2">
        <Filter className="w-4 h-4 text-gray-500 flex-shrink-0" />
        <label className="text-sm text-gray-700 font-semibold">Filters:</label>
      </div>
      
      {/* Order Status Filter */}
      <div className="relative z-10">
        <select
          value={orderStatusFilter}
          onChange={onOrderStatusChange}
          className="appearance-none bg-white border border-gray-300 rounded-lg px-3.5 py-2 pr-8 text-sm text-gray-700 cursor-pointer hover:border-gray-400 transition-all min-w-[160px]"
        >
          {ORDER_STATUS_OPTIONS.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Payment Status Filter */}
      <div className="relative z-10">
        <select
          value={paymentStatusFilter}
          onChange={onPaymentStatusChange}
          className="appearance-none bg-white border border-gray-300 rounded-lg px-3.5 py-2 pr-8 text-sm text-gray-700 cursor-pointer hover:border-gray-400 transition-all min-w-[160px]"
        >
          {PAYMENT_STATUS_OPTIONS.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Clear Filters Button */}
      {hasActiveFilters && (
        <button
          onClick={onClearFilters}
          className="px-3.5 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all duration-200 font-medium border border-gray-200 hover:border-gray-300"
        >
          Clear Filters
        </button>
      )}
    </div>
  );
};

export default OrderFilters;

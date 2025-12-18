/**
 * Shipping Form Component
 * Form for collecting shipping address details
 */

import React from 'react';
import { MapPin, User, Phone, Mail, Home, Building2, CheckCircle2, XCircle, Loader2 } from 'lucide-react';

const ShippingForm = ({ shippingData, errors, onChange, pincodeValid, pincodeValidating }) => {
  return (
    <div className="bg-[#faf9f5] border-2 border-gray-200 rounded-lg p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-6">
        <MapPin className="w-5 h-5 text-[#481d6f]-600" />
        <h2 className="text-xl font-bold text-gray-900">Shipping Address</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Full Name */}
        <div className="md:col-span-2">
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
            <User className="w-4 h-4 text-[#481d6f]-600" />
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={shippingData.fullName}
            onChange={(e) => onChange('fullName', e.target.value)}
            placeholder="Enter your full name"
            className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-colors ${
              errors.fullName ? 'border-red-300' : 'border-gray-200'
            }`}
          />
          {errors.fullName && (
            <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>
          )}
        </div>

        {/* Phone */}
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
            <Phone className="w-4 h-4 text-[#481d6f]-600" />
            Phone Number <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            value={shippingData.phone}
            onChange={(e) => onChange('phone', e.target.value)}
            placeholder="10-digit mobile number"
            maxLength="10"
            className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-colors ${
              errors.phone ? 'border-red-300' : 'border-gray-200'
            }`}
          />
          {errors.phone && (
            <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
            <Mail className="w-4 h-4 text-[#481d6f]-600" />
            Email Address <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            value={shippingData.email}
            onChange={(e) => onChange('email', e.target.value)}
            placeholder="your.email@example.com"
            className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-colors ${
              errors.email ? 'border-red-300' : 'border-gray-200'
            }`}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
          )}
        </div>

        {/* Address */}
        <div className="md:col-span-2">
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
            <Home className="w-4 h-4 text-[#481d6f]-600" />
            Address <span className="text-red-500">*</span>
          </label>
          <textarea
            value={shippingData.address}
            onChange={(e) => onChange('address', e.target.value)}
            placeholder="House/Flat No., Building Name, Street"
            rows="3"
            className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-colors resize-none ${
              errors.address ? 'border-red-300' : 'border-gray-200'
            }`}
          />
          {errors.address && (
            <p className="mt-1 text-sm text-red-600">{errors.address}</p>
          )}
        </div>

        {/* Landmark */}
        <div className="md:col-span-2">
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
            <Building2 className="w-4 h-4 text-[#481d6f]-600" />
            Landmark (Optional)
          </label>
          <input
            type="text"
            value={shippingData.landmark}
            onChange={(e) => onChange('landmark', e.target.value)}
            placeholder="Nearby landmark or building"
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-colors"
          />
        </div>

        {/* City */}
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
            City <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={shippingData.city}
            onChange={(e) => onChange('city', e.target.value)}
            placeholder="City"
            className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-colors ${
              errors.city ? 'border-red-300' : 'border-gray-200'
            }`}
          />
          {errors.city && (
            <p className="mt-1 text-sm text-red-600">{errors.city}</p>
          )}
        </div>

        {/* State */}
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
            State <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={shippingData.state}
            onChange={(e) => onChange('state', e.target.value)}
            placeholder="State"
            className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-colors ${
              errors.state ? 'border-red-300' : 'border-gray-200'
            }`}
          />
          {errors.state && (
            <p className="mt-1 text-sm text-red-600">{errors.state}</p>
          )}
        </div>

        {/* Pincode */}
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
            Pincode <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              value={shippingData.pincode}
              onChange={(e) => onChange('pincode', e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="6-digit pincode"
              maxLength="6"
              className={`w-full px-4 py-3 pr-12 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-colors ${
                errors.pincode 
                  ? 'border-red-300' 
                  : pincodeValid === true 
                    ? 'border-green-300' 
                    : pincodeValid === false
                      ? 'border-red-300'
                      : 'border-gray-200'
              }`}
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              {pincodeValidating ? (
                <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
              ) : pincodeValid === true ? (
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              ) : pincodeValid === false ? (
                <XCircle className="w-5 h-5 text-red-500" />
              ) : null}
            </div>
          </div>
          {errors.pincode && (
            <p className="mt-1 text-sm text-red-600">{errors.pincode}</p>
          )}
          {pincodeValid === true && shippingData.pincode.length === 6 && !errors.pincode && (
            <p className="mt-1 text-sm text-green-600">✓ Valid pincode</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShippingForm;


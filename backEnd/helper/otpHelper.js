/**
 * OTP Helper
 * Manages OTP generation, storage, and verification
 */

// In-memory OTP storage
// Format: { "orderId:email": { otp: string, expiresAt: Date } }
const otpStore = new Map();

// OTP expiry time: 10 minutes
const OTP_EXPIRY_MS = 10 * 60 * 1000;

/**
 * Generate a 6-digit OTP
 */
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Store OTP for orderId and email combination
 */
const storeOTP = (orderId, email, otp) => {
  const key = `${orderId}:${email.toLowerCase()}`;
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MS);
  
  otpStore.set(key, {
    otp,
    expiresAt,
  });

  // Clean up expired OTPs periodically
  cleanupExpiredOTPs();
};

/**
 * Verify OTP for orderId and email combination
 */
const verifyOTP = (orderId, email, otp) => {
  const key = `${orderId}:${email.toLowerCase()}`;
  const stored = otpStore.get(key);

  if (!stored) {
    return { valid: false, message: 'OTP not found. Please request a new OTP.' };
  }

  if (new Date() > stored.expiresAt) {
    otpStore.delete(key);
    return { valid: false, message: 'OTP has expired. Please request a new OTP.' };
  }

  if (stored.otp !== otp) {
    return { valid: false, message: 'Invalid OTP. Please try again.' };
  }

  // OTP is valid - remove it after verification (one-time use)
  otpStore.delete(key);
  return { valid: true, message: 'OTP verified successfully' };
};

/**
 * Clean up expired OTPs
 */
const cleanupExpiredOTPs = () => {
  const now = new Date();
  for (const [key, value] of otpStore.entries()) {
    if (now > value.expiresAt) {
      otpStore.delete(key);
    }
  }
};

/**
 * Clear OTP for orderId and email (useful for testing or manual cleanup)
 */
const clearOTP = (orderId, email) => {
  const key = `${orderId}:${email.toLowerCase()}`;
  otpStore.delete(key);
};

module.exports = {
  generateOTP,
  storeOTP,
  verifyOTP,
  clearOTP,
};


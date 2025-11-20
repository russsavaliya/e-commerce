/**
 * Validation Utilities
 * Reusable validation functions for form fields
 */

import { VALIDATION_MESSAGES } from './constants';

/**
 * Validates email format
 * @param {string} email - Email to validate
 * @returns {object} - { isValid: boolean, message: string }
 */
export const validateEmail = (email) => {
  if (!email || email.trim() === '') {
    return { isValid: false, message: VALIDATION_MESSAGES.EMAIL_REQUIRED };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, message: VALIDATION_MESSAGES.EMAIL_INVALID };
  }

  return { isValid: true, message: '' };
};

/**
 * Validates password (only checks if not empty - no complexity requirements)
 * @param {string} password - Password to validate
 * @returns {object} - { isValid: boolean, message: string, strength: string }
 */
export const validatePassword = (password) => {
  if (!password || password.trim() === '') {
    return {
      isValid: false,
      message: VALIDATION_MESSAGES.PASSWORD_REQUIRED,
      strength: 'weak',
    };
  }

  // Optional: Calculate strength for visual indicator only (doesn't block submission)
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const strengthCount = [hasUpperCase, hasLowerCase, hasNumber, hasSpecialChar].filter(Boolean).length;

  // Determine strength level for visual feedback only
  let strength = 'weak';
  if (password.length >= 12 && strengthCount === 4) {
    strength = 'strong';
  } else if (password.length >= 6 && strengthCount >= 2) {
    strength = 'medium';
  }

  // Password is valid as long as it's not empty
  return { isValid: true, message: '', strength };
};

/**
 * Validates name
 * @param {string} name - Name to validate
 * @returns {object} - { isValid: boolean, message: string }
 */
export const validateName = (name) => {
  if (!name || name.trim() === '') {
    return { isValid: false, message: VALIDATION_MESSAGES.NAME_REQUIRED };
  }

  if (name.trim().length < 3) {
    return { isValid: false, message: VALIDATION_MESSAGES.NAME_MIN_LENGTH };
  }

  return { isValid: true, message: '' };
};

/**
 * Validates phone number (Indian format - 10 digits)
 * @param {string} phone - Phone number to validate
 * @returns {object} - { isValid: boolean, message: string }
 */
export const validatePhone = (phone) => {
  // Phone is optional, so empty is valid
  if (!phone || phone.trim() === '') {
    return { isValid: true, message: '' };
  }

  // Remove spaces and dashes
  const cleanedPhone = phone.replace(/[\s-]/g, '');

  // Check if it's exactly 10 digits
  const phoneRegex = /^[0-9]{10}$/;
  if (!phoneRegex.test(cleanedPhone)) {
    return { isValid: false, message: VALIDATION_MESSAGES.PHONE_INVALID };
  }

  return { isValid: true, message: '' };
};

/**
 * Validates if passwords match
 * @param {string} password - Original password
 * @param {string} confirmPassword - Confirmation password
 * @returns {object} - { isValid: boolean, message: string }
 */
export const validatePasswordMatch = (password, confirmPassword) => {
  if (!confirmPassword || confirmPassword.trim() === '') {
    return { isValid: false, message: VALIDATION_MESSAGES.PASSWORD_REQUIRED };
  }

  if (password !== confirmPassword) {
    return { isValid: false, message: VALIDATION_MESSAGES.PASSWORD_MISMATCH };
  }

  return { isValid: true, message: '' };
};

/**
 * Validates login form
 * @param {object} formData - { email, password }
 * @returns {object} - { isValid: boolean, errors: object }
 */
export const validateLoginForm = (formData) => {
  const errors = {};
  let isValid = true;

  const emailValidation = validateEmail(formData.email);
  if (!emailValidation.isValid) {
    errors.email = emailValidation.message;
    isValid = false;
  }

  const passwordValidation = validatePassword(formData.password);
  if (!passwordValidation.isValid) {
    errors.password = passwordValidation.message;
    isValid = false;
  }

  return { isValid, errors };
};

/**
 * Validates signup form
 * @param {object} formData - { name, email, phone, password, confirmPassword, terms }
 * @returns {object} - { isValid: boolean, errors: object }
 */
export const validateSignupForm = (formData) => {
  const errors = {};
  let isValid = true;

  const nameValidation = validateName(formData.name);
  if (!nameValidation.isValid) {
    errors.name = nameValidation.message;
    isValid = false;
  }

  const emailValidation = validateEmail(formData.email);
  if (!emailValidation.isValid) {
    errors.email = emailValidation.message;
    isValid = false;
  }

  const phoneValidation = validatePhone(formData.phone);
  if (!phoneValidation.isValid) {
    errors.phone = phoneValidation.message;
    isValid = false;
  }

  const passwordValidation = validatePassword(formData.password);
  if (!passwordValidation.isValid) {
    errors.password = passwordValidation.message;
    isValid = false;
  }

  const passwordMatchValidation = validatePasswordMatch(
    formData.password,
    formData.confirmPassword
  );
  if (!passwordMatchValidation.isValid) {
    errors.confirmPassword = passwordMatchValidation.message;
    isValid = false;
  }

  if (!formData.terms) {
    errors.terms = VALIDATION_MESSAGES.TERMS_REQUIRED;
    isValid = false;
  }

  return { isValid, errors };
};


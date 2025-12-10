// Email Validation
export const validateEmail = (email: string): { valid: boolean; error?: string } => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email.trim()) {
    return { valid: false, error: 'Email is required' };
  }
  if (!emailRegex.test(email)) {
    return { valid: false, error: 'Invalid email format' };
  }
  if (email.length > 255) {
    return { valid: false, error: 'Email is too long' };
  }
  return { valid: true };
};

// Phone Number Validation
export const validatePhoneNumber = (phone: string): { valid: boolean; error?: string } => {
  const phoneRegex = /^[0-9]{10}$/;
  const cleaned = phone.replace(/\D/g, '');
  
  if (!phone.trim()) {
    return { valid: false, error: 'Phone number is required' };
  }
  if (!phoneRegex.test(cleaned)) {
    return { valid: false, error: 'Phone number must be 10 digits' };
  }
  return { valid: true };
};

// Password Validation
export const validatePassword = (password: string): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!password) {
    errors.push('Password is required');
    return { valid: false, errors };
  }

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain an uppercase letter');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain a lowercase letter');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain a number');
  }

  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain a special character');
  }

  return { valid: errors.length === 0, errors };
};

// Full Name Validation
export const validateFullName = (name: string): { valid: boolean; error?: string } => {
  if (!name.trim()) {
    return { valid: false, error: 'Full name is required' };
  }

  if (name.trim().length < 3) {
    return { valid: false, error: 'Name must be at least 3 characters' };
  }

  if (name.length > 100) {
    return { valid: false, error: 'Name is too long' };
  }

  if (!/^[a-zA-Z\s'-]+$/.test(name)) {
    return { valid: false, error: 'Name can only contain letters, spaces, hyphens, and apostrophes' };
  }

  return { valid: true };
};

// Username Validation
export const validateUsername = (username: string): { valid: boolean; error?: string } => {
  if (!username.trim()) {
    return { valid: false, error: 'Username is required' };
  }

  if (username.length < 3) {
    return { valid: false, error: 'Username must be at least 3 characters' };
  }

  if (username.length > 30) {
    return { valid: false, error: 'Username must be at most 30 characters' };
  }

  if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
    return { valid: false, error: 'Username can only contain letters, numbers, underscores, and hyphens' };
  }

  return { valid: true };
};

// URL Validation
export const validateUrl = (url: string): { valid: boolean; error?: string } => {
  if (!url.trim()) {
    return { valid: false, error: 'URL is required' };
  }

  try {
    new URL(url);
    return { valid: true };
  } catch {
    return { valid: false, error: 'Invalid URL format' };
  }
};

// Amount Validation
export const validateAmount = (amount: any, min: number = 0, max: number = 1000000): { valid: boolean; error?: string } => {
  const num = parseFloat(amount);

  if (isNaN(num)) {
    return { valid: false, error: 'Amount must be a valid number' };
  }

  if (num < min) {
    return { valid: false, error: `Amount must be at least ₹${min}` };
  }

  if (num > max) {
    return { valid: false, error: `Amount cannot exceed ₹${max}` };
  }

  return { valid: true };
};

// OTP Validation
export const validateOtp = (otp: string): { valid: boolean; error?: string } => {
  if (!otp.trim()) {
    return { valid: false, error: 'OTP is required' };
  }

  if (!/^[0-9]{6}$/.test(otp)) {
    return { valid: false, error: 'OTP must be 6 digits' };
  }

  return { valid: true };
};

// Coupon Code Validation
export const validateCouponCode = (code: string): { valid: boolean; error?: string } => {
  if (!code.trim()) {
    return { valid: false, error: 'Coupon code is required' };
  }

  if (code.length > 50) {
    return { valid: false, error: 'Coupon code is too long' };
  }

  if (!/^[A-Z0-9]+$/.test(code)) {
    return { valid: false, error: 'Coupon code must contain only uppercase letters and numbers' };
  }

  return { valid: true };
};

// Bank Account Number Validation (Indian)
export const validateBankAccountNumber = (accountNumber: string): { valid: boolean; error?: string } => {
  const cleaned = accountNumber.replace(/\s/g, '');

  if (!cleaned) {
    return { valid: false, error: 'Account number is required' };
  }

  if (!/^[0-9]{9,18}$/.test(cleaned)) {
    return { valid: false, error: 'Account number must be 9-18 digits' };
  }

  return { valid: true };
};

// IFSC Code Validation (Indian)
export const validateIfscCode = (ifsc: string): { valid: boolean; error?: string } => {
  const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;

  if (!ifsc.trim()) {
    return { valid: false, error: 'IFSC code is required' };
  }

  if (!ifscRegex.test(ifsc)) {
    return { valid: false, error: 'Invalid IFSC code format' };
  }

  return { valid: true };
};

// Aadhar Number Validation
export const validateAadharNumber = (aadhar: string): { valid: boolean; error?: string } => {
  const cleaned = aadhar.replace(/\s/g, '');

  if (!cleaned) {
    return { valid: false, error: 'Aadhar number is required' };
  }

  if (!/^[0-9]{12}$/.test(cleaned)) {
    return { valid: false, error: 'Aadhar number must be 12 digits' };
  }

  return { valid: true };
};

// PAN Card Validation
export const validatePanCard = (pan: string): { valid: boolean; error?: string } => {
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

  if (!pan.trim()) {
    return { valid: false, error: 'PAN is required' };
  }

  if (!panRegex.test(pan)) {
    return { valid: false, error: 'Invalid PAN format' };
  }

  return { valid: true };
};

// File Size Validation
export const validateFileSize = (file: File, maxSizeMB: number): { valid: boolean; error?: string } => {
  const maxBytes = maxSizeMB * 1024 * 1024;

  if (file.size > maxBytes) {
    return { valid: false, error: `File size must be less than ${maxSizeMB}MB` };
  }

  return { valid: true };
};

// File Type Validation
export const validateFileType = (file: File, allowedTypes: string[]): { valid: boolean; error?: string } => {
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: `File type must be one of: ${allowedTypes.join(', ')}` };
  }

  return { valid: true };
};

// Audio File Validation
export const validateAudioFile = (file: File): { valid: boolean; error?: string } => {
  const allowedTypes = ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/webm', 'audio/mp4'];
  const maxSizeMB = 50;

  const typeValidation = validateFileType(file, allowedTypes);
  if (!typeValidation.valid) {
    return typeValidation;
  }

  return validateFileSize(file, maxSizeMB);
};

// Image File Validation
export const validateImageFile = (file: File): { valid: boolean; error?: string } => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  const maxSizeMB = 5;

  const typeValidation = validateFileType(file, allowedTypes);
  if (!typeValidation.valid) {
    return typeValidation;
  }

  return validateFileSize(file, maxSizeMB);
};

// Date Range Validation
export const validateDateRange = (
  startDate: Date,
  endDate: Date
): { valid: boolean; error?: string } => {
  if (!startDate || !endDate) {
    return { valid: false, error: 'Both start and end dates are required' };
  }

  if (startDate > endDate) {
    return { valid: false, error: 'Start date cannot be after end date' };
  }

  return { valid: true };
};

// String Length Validation
export const validateStringLength = (
  value: string,
  minLength: number,
  maxLength: number
): { valid: boolean; error?: string } => {
  if (!value && minLength > 0) {
    return { valid: false, error: 'This field is required' };
  }

  if (value.length < minLength) {
    return { valid: false, error: `Minimum length is ${minLength} characters` };
  }

  if (value.length > maxLength) {
    return { valid: false, error: `Maximum length is ${maxLength} characters` };
  }

  return { valid: true };
};

// Quiz Answer Validation
export const validateQuizAnswer = (answer: any, questionType: 'multiple-choice' | 'short-answer'): { valid: boolean; error?: string } => {
  if (!answer) {
    return { valid: false, error: 'Answer is required' };
  }

  if (questionType === 'multiple-choice' && typeof answer !== 'number') {
    return { valid: false, error: 'Select a valid option' };
  }

  if (questionType === 'short-answer' && (typeof answer !== 'string' || !answer.trim())) {
    return { valid: false, error: 'Answer cannot be empty' };
  }

  return { valid: true };
};

// Form Field Validation Combiner
export const validateForm = (
  data: Record<string, any>,
  rules: Record<string, (value: any) => { valid: boolean; error?: string }>
): { valid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};

  for (const [field, rule] of Object.entries(rules)) {
    const result = rule(data[field]);
    if (!result.valid) {
      errors[field] = result.error || 'Invalid field';
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
};

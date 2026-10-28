/**
 * Validation rules according to challenge requirements:
 * - Name: Min 20 characters, Max 60 characters.
 * - Address: Max 400 characters.
 * - Password: 8-16 characters, must include at least one uppercase letter and one special character.
 * - Email: Must follow standard email validation rules.
 */

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,16}$/;

function validateUserData({ name, email, password, address }) {
  const errors = [];

  // 1. Name validation
  if (!name || typeof name !== 'string') {
    errors.push('Name is required.');
  } else if (name.trim().length < 20 || name.trim().length > 60) {
    errors.push('Name must be between 20 and 60 characters.');
  }

  // 2. Email validation
  if (!email || typeof email !== 'string') {
    errors.push('Email is required.');
  } else if (!EMAIL_REGEX.test(email.trim())) {
    errors.push('Email is not a valid email address.');
  }

  // 3. Password validation (only if provided, e.g. for registration or user creation)
  if (password !== undefined) {
    if (!password || typeof password !== 'string') {
      errors.push('Password is required.');
    } else if (!PASSWORD_REGEX.test(password)) {
      errors.push('Password must be 8-16 characters long and include at least one uppercase letter and one special character.');
    }
  }

  // 4. Address validation
  if (!address || typeof address !== 'string') {
    errors.push('Address is required.');
  } else if (address.trim().length > 400) {
    errors.push('Address cannot exceed 400 characters.');
  }

  return errors;
}

function validateStoreData({ name, email, address }) {
  const errors = [];

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    errors.push('Store name is required.');
  } else if (name.trim().length > 100) {
    errors.push('Store name cannot exceed 100 characters.');
  }

  if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
    errors.push('Valid store email address is required.');
  }

  if (!address || typeof address !== 'string' || address.trim().length === 0) {
    errors.push('Store address is required.');
  } else if (address.trim().length > 400) {
    errors.push('Store address cannot exceed 400 characters.');
  }

  return errors;
}

module.exports = {
  validateUserData,
  validateStoreData,
  PASSWORD_REGEX,
  EMAIL_REGEX,
};

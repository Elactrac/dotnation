/**
 * @file Input Validation Middleware
 * Comprehensive request validation and sanitization
 */

const validator = require('validator');

/**
 * Validation schemas for different endpoints
 */
const schemas = {
  generateDescription: {
    title: {
      required: true,
      type: 'string',
      minLength: 10,
      maxLength: 200,
      sanitize: true,
    },
  },

  summarize: {
    description: {
      required: true,
      type: 'string',
      minLength: 50,
      maxLength: 10000,
      sanitize: true,
    },
  },

  contractSummary: {
    title: {
      required: true,
      type: 'string',
      minLength: 10,
      maxLength: 200,
      sanitize: true,
    },
    description: {
      required: true,
      type: 'string',
      minLength: 50,
      maxLength: 10000,
      sanitize: true,
    },
    goal: {
      required: true,
      type: 'number',
      min: 0.1,
      max: 10000000,
    },
    deadline: {
      required: true,
      type: 'string',
      isDate: true,
    },
    beneficiary: {
      required: true,
      type: 'string',
      pattern: /^[1-9A-HJ-NP-Za-km-z]{47,48}$/, // Substrate SS58 address
    },
  },

  fraudDetection: {
    campaign: {
      required: true,
      type: 'object',
      properties: {
        title: {
          required: true,
          type: 'string',
          minLength: 10,
          maxLength: 200,
          sanitize: true,
        },
        description: {
          required: true,
          type: 'string',
          minLength: 50,
          maxLength: 10000,
          sanitize: true,
        },
        goal: {
          type: 'number',
          min: 0,
          max: 10000000,
        },
      },
    },
  },

  generateTitle: {
    keywords: {
      type: 'string',
      maxLength: 200,
      sanitize: true,
    },
    category: {
      type: 'string',
      maxLength: 50,
      sanitize: true,
    },
  },

  captchaChallenge: {
    sessionToken: {
      required: true,
      type: 'string',
      pattern: /^[a-f0-9]{64}$/,
    },
    captchaType: {
      required: true,
      type: 'string',
      enum: ['math', 'image', 'slider', 'pattern'],
    },
    difficulty: {
      type: 'number',
      min: 0,
      max: 2,
    },
  },

  captchaVerify: {
    sessionToken: {
      required: true,
      type: 'string',
      pattern: /^[a-f0-9]{64}$/,
    },
    captchaType: {
      required: true,
      type: 'string',
      enum: ['math', 'image', 'slider', 'pattern'],
    },
    userAnswer: {
      required: true,
    },
    timeTaken: {
      required: true,
      type: 'number',
      min: 0,
      max: 300, // Max 5 minutes
    },
  },

  validateToken: {
    token: {
      required: true,
      type: 'string',
      minLength: 10,
      maxLength: 500,
    },
  },
};

/**
 * Sanitize string input
 */
function sanitizeString(str) {
  if (typeof str !== 'string') return str;
  
  // Remove null bytes
  str = str.replace(/\0/g, '');
  
  // Trim whitespace
  str = str.trim();
  
  // Escape HTML to prevent XSS
  str = validator.escape(str);
  
  // Remove control characters except newlines and tabs
  str = str.replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, '');
  
  return str;
}

/**
 * Validate a single field against a schema
 */
function validateField(value, fieldSchema, fieldName) {
  const errors = [];

  // Required check
  if (fieldSchema.required && (value === undefined || value === null || value === '')) {
    errors.push(`${fieldName} is required`);
    return errors;
  }

  // Skip further validation if field is optional and not provided
  if (!fieldSchema.required && (value === undefined || value === null || value === '')) {
    return errors;
  }

  // Type check
  if (fieldSchema.type) {
    const actualType = Array.isArray(value) ? 'array' : typeof value;
    if (actualType !== fieldSchema.type) {
      errors.push(`${fieldName} must be of type ${fieldSchema.type}`);
      return errors;
    }
  }

  // String validations
  if (fieldSchema.type === 'string' && typeof value === 'string') {
    if (fieldSchema.minLength && value.length < fieldSchema.minLength) {
      errors.push(`${fieldName} must be at least ${fieldSchema.minLength} characters`);
    }

    if (fieldSchema.maxLength && value.length > fieldSchema.maxLength) {
      errors.push(`${fieldName} must not exceed ${fieldSchema.maxLength} characters`);
    }

    if (fieldSchema.pattern && !fieldSchema.pattern.test(value)) {
      errors.push(`${fieldName} format is invalid`);
    }

    if (fieldSchema.isEmail && !validator.isEmail(value)) {
      errors.push(`${fieldName} must be a valid email`);
    }

    if (fieldSchema.isURL && !validator.isURL(value)) {
      errors.push(`${fieldName} must be a valid URL`);
    }

    if (fieldSchema.isDate && !validator.isISO8601(value)) {
      errors.push(`${fieldName} must be a valid ISO 8601 date`);
    }
  }

  // Number validations
  if (fieldSchema.type === 'number' && typeof value === 'number') {
    if (fieldSchema.min !== undefined && value < fieldSchema.min) {
      errors.push(`${fieldName} must be at least ${fieldSchema.min}`);
    }

    if (fieldSchema.max !== undefined && value > fieldSchema.max) {
      errors.push(`${fieldName} must not exceed ${fieldSchema.max}`);
    }

    if (fieldSchema.integer && !Number.isInteger(value)) {
      errors.push(`${fieldName} must be an integer`);
    }
  }

  // Enum validation
  if (fieldSchema.enum && !fieldSchema.enum.includes(value)) {
    errors.push(`${fieldName} must be one of: ${fieldSchema.enum.join(', ')}`);
  }

  // Object validation (recursive)
  if (fieldSchema.type === 'object' && typeof value === 'object' && fieldSchema.properties) {
    for (const [propName, propSchema] of Object.entries(fieldSchema.properties)) {
      const propErrors = validateField(value[propName], propSchema, `${fieldName}.${propName}`);
      errors.push(...propErrors);
    }
  }

  return errors;
}

/**
 * Validate request body against schema
 */
function validateRequest(data, schemaName) {
  const schema = schemas[schemaName];
  if (!schema) {
    throw new Error(`Validation schema '${schemaName}' not found`);
  }

  const errors = [];
  const sanitized = {};

  for (const [fieldName, fieldSchema] of Object.entries(schema)) {
    const value = data[fieldName];
    
    // Validate field
    const fieldErrors = validateField(value, fieldSchema, fieldName);
    errors.push(...fieldErrors);

    // Sanitize if needed
    if (fieldSchema.sanitize && typeof value === 'string') {
      sanitized[fieldName] = sanitizeString(value);
    } else {
      sanitized[fieldName] = value;
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    sanitized: errors.length === 0 ? sanitized : null,
  };
}

/**
 * Express middleware for request validation
 */
function validateMiddleware(schemaName) {
  return (req, res, next) => {
    const { valid, errors, sanitized } = validateRequest(req.body, schemaName);

    if (!valid) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors,
      });
    }

    // Replace req.body with sanitized data
    req.body = { ...req.body, ...sanitized };
    next();
  };
}

/**
 * Validate Substrate SS58 address
 */
function isValidSubstrateAddress(address) {
  if (typeof address !== 'string') return false;
  
  // Basic SS58 format check (base58 encoded, 47-48 characters)
  const ss58Regex = /^[1-9A-HJ-NP-Za-km-z]{47,48}$/;
  
  return ss58Regex.test(address);
}

/**
 * Validate DOT amount
 */
function isValidDotAmount(amount) {
  if (typeof amount !== 'number') return false;
  if (isNaN(amount) || !isFinite(amount)) return false;
  if (amount <= 0) return false;
  if (amount > 10000000) return false; // Max 10M DOT
  
  return true;
}

/**
 * Validate campaign ID
 */
function isValidCampaignId(id) {
  if (typeof id !== 'number' && typeof id !== 'string') return false;
  
  const numId = typeof id === 'string' ? parseInt(id, 10) : id;
  
  return Number.isInteger(numId) && numId >= 0 && numId < 4294967296; // u32 max
}

/**
 * Rate limiting key generation
 */
function generateRateLimitKey(req) {
  // Use IP address + endpoint for rate limiting
  const ip = req.headers['x-forwarded-for']?.split(',')[0].trim() ||
             req.headers['x-real-ip'] ||
             req.connection.remoteAddress ||
             'unknown';
  
  return `${ip}:${req.path}`;
}

/**
 * Sanitize error messages for client
 */
function sanitizeError(error) {
  // Never expose internal implementation details
  const safeErrors = {
    'ECONNREFUSED': 'Service temporarily unavailable',
    'ETIMEDOUT': 'Request timeout',
    'ENOTFOUND': 'Service unavailable',
  };

  if (error.code && safeErrors[error.code]) {
    return safeErrors[error.code];
  }

  // Generic error message for production
  if (process.env.NODE_ENV === 'production') {
    return 'An error occurred while processing your request';
  }

  // More detailed for development
  return error.message || 'Unknown error';
}

module.exports = {
  validateRequest,
  validateMiddleware,
  sanitizeString,
  isValidSubstrateAddress,
  isValidDotAmount,
  isValidCampaignId,
  generateRateLimitKey,
  sanitizeError,
  schemas,
};

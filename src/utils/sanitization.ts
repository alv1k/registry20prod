// src/utils/sanitization.ts
/**
 * Sanitizes user input to prevent XSS attacks
 * @param input - The input string to sanitize
 * @returns Sanitized string
 */
export const sanitizeInput = (input: string): string => {
  if (typeof input !== 'string') {
    return '';
  }

  // Remove script tags and their content
  let sanitized = input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  // Remove event handlers (onclick, onload, etc.)
  sanitized = sanitized.replace(/on\w+="[^"]*"/gi, '');
  sanitized = sanitized.replace(/on\w+='[^']*'/gi, '');
  sanitized = sanitized.replace(/on\w+=[^\s>]+/gi, '');
  
  // Remove javascript: and data: URIs
  sanitized = sanitized.replace(/javascript:/gi, '');
  sanitized = sanitized.replace(/data:/gi, '');
  
  // Remove iframe tags
  sanitized = sanitized.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');
  
  // Remove object/embed tags
  sanitized = sanitized.replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '');
  sanitized = sanitized.replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '');
  
  // Remove meta tags
  sanitized = sanitized.replace(/<meta\b[^<]*(?:(?!<\/meta>)<[^<]*)*<\/meta>/gi, '');
  
  // Remove form tags
  sanitized = sanitized.replace(/<form\b[^<]*(?:(?!<\/form>)<[^<]*)*<\/form>/gi, '');
  
  // Remove input tags
  sanitized = sanitized.replace(/<input\b[^<]*(?:(?!<\/input>)<[^<]*)*<\/input>/gi, '');
  
  // Encode special HTML characters
  sanitized = sanitized
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
  
  return sanitized;
};

/**
 * Sanitizes rich text content while preserving allowed HTML tags
 * @param input - The input string to sanitize
 * @returns Sanitized string with allowed HTML tags
 */
export const sanitizeRichText = (input: string): string => {
  if (typeof input !== 'string') {
    return '';
  }

  // Allow only safe HTML tags
  let sanitized = input;
  
  // Remove dangerous tags
  const dangerousTags = [
    'script', 'iframe', 'object', 'embed', 'meta', 'link', 'style', 
    'form', 'input', 'button', 'select', 'textarea'
  ];
  
  dangerousTags.forEach(tag => {
    const regex = new RegExp(`<${tag}\\b[^<]*(?:(?!<\\/${tag}>)<[^<]*)*<\\/${tag}>`, 'gi');
    sanitized = sanitized.replace(regex, '');
    // Also remove self-closing tags
    sanitized = sanitized.replace(new RegExp(`<${tag}\\b[^>]*/?>`, 'gi'), '');
  });
  
  // Remove event handlers
  sanitized = sanitized.replace(/on\w+="[^"]*"/gi, '');
  sanitized = sanitized.replace(/on\w+='[^']*'/gi, '');
  sanitized = sanitized.replace(/on\w+=[^\s>]+/gi, '');
  
  // Remove javascript: and data: URIs
  sanitized = sanitized.replace(/javascript:/gi, '');
  sanitized = sanitized.replace(/data:/gi, '');
  
  return sanitized;
};

/**
 * Sanitizes a finance record before saving
 * @param record - The finance record to sanitize
 * @returns Sanitized finance record
 */
export const sanitizeFinanceRecord = (record: any): any => {
  if (!record || typeof record !== 'object') {
    return record;
  }

  const sanitizedRecord = { ...record };
  
  // Sanitize text fields
  if (sanitizedRecord.name) {
    sanitizedRecord.name = sanitizeInput(sanitizedRecord.name);
  }
  
  if (sanitizedRecord.classification) {
    sanitizedRecord.classification = sanitizeInput(sanitizedRecord.classification);
  }
  
  if (sanitizedRecord.comment) {
    sanitizedRecord.comment = sanitizeInput(sanitizedRecord.comment);
  }
  
  // Ensure numeric fields are numbers
  if (sanitizedRecord.price !== undefined) {
    sanitizedRecord.price = Number(sanitizedRecord.price);
  }
  
  if (sanitizedRecord.quantity !== undefined) {
    sanitizedRecord.quantity = Number(sanitizedRecord.quantity);
  }
  
  if (sanitizedRecord.total !== undefined) {
    sanitizedRecord.total = Number(sanitizedRecord.total);
  }
  
  // Ensure date is a string
  if (sanitizedRecord.date) {
    sanitizedRecord.date = String(sanitizedRecord.date);
  }
  
  return sanitizedRecord;
};

/**
 * Sanitizes a transport record before saving
 * @param record - The transport record to sanitize
 * @returns Sanitized transport record
 */
export const sanitizeTransportRecord = (record: any): any => {
  if (!record || typeof record !== 'object') {
    return record;
  }

  const sanitizedRecord = { ...record };
  
  // Sanitize text fields
  if (sanitizedRecord.shippingDate) {
    sanitizedRecord.shippingDate = sanitizeInput(sanitizedRecord.shippingDate);
  }
  
  if (sanitizedRecord.departureDate) {
    sanitizedRecord.departureDate = sanitizeInput(sanitizedRecord.departureDate);
  }
  
  if (sanitizedRecord.arrivalDate) {
    sanitizedRecord.arrivalDate = sanitizeInput(sanitizedRecord.arrivalDate);
  }
  
  if (sanitizedRecord.cargoName) {
    sanitizedRecord.cargoName = sanitizeInput(sanitizedRecord.cargoName);
  }
  
  if (sanitizedRecord.driver) {
    sanitizedRecord.driver = sanitizeInput(sanitizedRecord.driver);
  }
  
  if (sanitizedRecord.carNumber) {
    sanitizedRecord.carNumber = sanitizeInput(sanitizedRecord.carNumber);
  }
  
  if (sanitizedRecord.driverLicense) {
    sanitizedRecord.driverLicense = sanitizeInput(sanitizedRecord.driverLicense);
  }
  
  // Ensure numeric fields are numbers
  if (sanitizedRecord.shippingWeight !== undefined) {
    sanitizedRecord.shippingWeight = Number(sanitizedRecord.shippingWeight);
  }
  
  if (sanitizedRecord.deliveryWeight !== undefined) {
    sanitizedRecord.deliveryWeight = Number(sanitizedRecord.deliveryWeight);
  }
  
  return sanitizedRecord;
};

/**
 * Sanitizes a correspondent record before saving
 * @param record - The correspondent record to sanitize
 * @returns Sanitized correspondent record
 */
export const sanitizeCorrespondentRecord = (record: any): any => {
  if (!record || typeof record !== 'object') {
    return record;
  }

  const sanitizedRecord = { ...record };
  
  // Sanitize text fields
  if (sanitizedRecord.date) {
    sanitizedRecord.date = sanitizeInput(sanitizedRecord.date);
  }
  
  if (sanitizedRecord.incomingNumber) {
    sanitizedRecord.incomingNumber = sanitizeInput(sanitizedRecord.incomingNumber);
  }
  
  if (sanitizedRecord.outgoingNumber) {
    sanitizedRecord.outgoingNumber = sanitizeInput(sanitizedRecord.outgoingNumber);
  }
  
  if (sanitizedRecord.subject) {
    sanitizedRecord.subject = sanitizeInput(sanitizedRecord.subject);
  }
  
  if (sanitizedRecord.from) {
    sanitizedRecord.from = sanitizeInput(sanitizedRecord.from);
  }
  
  if (sanitizedRecord.to) {
    sanitizedRecord.to = sanitizeInput(sanitizedRecord.to);
  }
  
  if (sanitizedRecord.signedBy) {
    sanitizedRecord.signedBy = sanitizeInput(sanitizedRecord.signedBy);
  }
  
  return sanitizedRecord;
};

/**
 * Sanitizes a category record before saving
 * @param record - The category record to sanitize
 * @returns Sanitized category record
 */
export const sanitizeCategoryRecord = (record: any): any => {
  if (!record || typeof record !== 'object') {
    return record;
  }

  const sanitizedRecord = { ...record };
  
  // Sanitize text fields
  if (sanitizedRecord.name) {
    sanitizedRecord.name = sanitizeInput(sanitizedRecord.name);
  }
  
  if (sanitizedRecord.description) {
    sanitizedRecord.description = sanitizeInput(sanitizedRecord.description);
  }
  
  if (sanitizedRecord.type) {
    sanitizedRecord.type = sanitizeInput(sanitizedRecord.type);
  }
  
  return sanitizedRecord;
};

/**
 * Deep sanitizes an object, recursively sanitizing all string properties
 * @param obj - The object to sanitize
 * @returns Sanitized object
 */
export const deepSanitize = (obj: any): any => {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => deepSanitize(item));
  }

  const sanitizedObj: any = {};
  
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = obj[key];
      
      if (typeof value === 'string') {
        sanitizedObj[key] = sanitizeInput(value);
      } else if (typeof value === 'object' && value !== null) {
        sanitizedObj[key] = deepSanitize(value);
      } else {
        sanitizedObj[key] = value;
      }
    }
  }
  
  return sanitizedObj;
}

/**
 * Sanitizes a vehicle record before saving
 * @param record - The vehicle record to sanitize
 * @returns Sanitized vehicle record
 */
export const sanitizeVehicleRecord = (record: any): any => {
  if (!record || typeof record !== 'object') {
    return record;
  }

  const sanitizedRecord = { ...record };
  
  // Sanitize text fields
  if (sanitizedRecord.name) {
    sanitizedRecord.name = sanitizeInput(sanitizedRecord.name);
  }
  
  if (sanitizedRecord.manufacturer) {
    sanitizedRecord.manufacturer = sanitizeInput(sanitizedRecord.manufacturer);
  }
  
  if (sanitizedRecord.model) {
    sanitizedRecord.model = sanitizeInput(sanitizedRecord.model);
  }
  
  if (sanitizedRecord.engineVolume) {
    sanitizedRecord.engineVolume = sanitizeInput(sanitizedRecord.engineVolume);
  }
  
  if (sanitizedRecord.engineNumber) {
    sanitizedRecord.engineNumber = sanitizeInput(sanitizedRecord.engineNumber);
  }
  
  if (sanitizedRecord.vin) {
    sanitizedRecord.vin = sanitizeInput(sanitizedRecord.vin);
  }
  
  if (sanitizedRecord.stsData) {
    sanitizedRecord.stsData = sanitizeInput(sanitizedRecord.stsData);
  }
  
  if (sanitizedRecord.ptsData) {
    sanitizedRecord.ptsData = sanitizeInput(sanitizedRecord.ptsData);
  }
  
  return sanitizedRecord;
};

/**
 * Sanitizes a maintenance record before saving
 * @param record - The maintenance record to sanitize
 * @returns Sanitized maintenance record
 */
export const sanitizeMaintenanceRecord = (record: any): any => {
  if (!record || typeof record !== 'object') {
    return record;
  }

  const sanitizedRecord = { ...record };
  
  // Sanitize text fields
  if (sanitizedRecord.vehicleId) {
    sanitizedRecord.vehicleId = sanitizeInput(sanitizedRecord.vehicleId);
  }
  
  if (sanitizedRecord.vehicleName) {
    sanitizedRecord.vehicleName = sanitizeInput(sanitizedRecord.vehicleName);
  }
  
  if (sanitizedRecord.date) {
    sanitizedRecord.date = sanitizeInput(sanitizedRecord.date);
  }
  
  if (sanitizedRecord.workType) {
    sanitizedRecord.workType = sanitizeInput(sanitizedRecord.workType);
  }
  
  if (sanitizedRecord.comment) {
    sanitizedRecord.comment = sanitizeInput(sanitizedRecord.comment);
  }
  
  if (sanitizedRecord.frequency) {
    sanitizedRecord.frequency = sanitizeInput(sanitizedRecord.frequency);
  }
  
  // Ensure numeric fields are numbers
  if (sanitizedRecord.cost !== undefined) {
    sanitizedRecord.cost = Number(sanitizedRecord.cost);
  }
  
  if (sanitizedRecord.mileage !== undefined) {
    sanitizedRecord.mileage = Number(sanitizedRecord.mileage);
  }
  
  return sanitizedRecord;
};
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

  const sanitizedRecord: any = {};

  // Sanitize text fields
  if (record.name !== undefined) {
    sanitizedRecord.name = sanitizeInput(record.name);
  }

  if (record.classification !== undefined) {
    sanitizedRecord.classification = sanitizeInput(record.classification);
  }

  if (record.comment !== undefined) {
    sanitizedRecord.comment = sanitizeInput(record.comment);
  }

  // Ensure numeric fields are numbers
  if (record.price !== undefined) {
    sanitizedRecord.price = Number(record.price);
  }

  if (record.quantity !== undefined) {
    sanitizedRecord.quantity = Number(record.quantity);
  }

  if (record.total !== undefined) {
    sanitizedRecord.total = Number(record.total);
  }

  // Ensure date is a string
  if (record.date !== undefined) {
    sanitizedRecord.date = String(record.date);
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

  const sanitizedRecord: any = {};

  // Sanitize text fields
  if (record.shippingDate !== undefined) {
    sanitizedRecord.shippingDate = sanitizeInput(record.shippingDate);
  }

  if (record.departureDate !== undefined) {
    sanitizedRecord.departureDate = sanitizeInput(record.departureDate);
  }

  if (record.arrivalDate !== undefined) {
    sanitizedRecord.arrivalDate = sanitizeInput(record.arrivalDate);
  }

  if (record.cargoName !== undefined) {
    sanitizedRecord.cargoName = sanitizeInput(record.cargoName);
  }

  if (record.driver !== undefined) {
    sanitizedRecord.driver = sanitizeInput(record.driver);
  }

  if (record.carNumber !== undefined) {
    sanitizedRecord.carNumber = sanitizeInput(record.carNumber);
  }

  if (record.driverLicense !== undefined) {
    sanitizedRecord.driverLicense = sanitizeInput(record.driverLicense);
  }

  // Ensure numeric fields are numbers
  if (record.shippingWeight !== undefined) {
    sanitizedRecord.shippingWeight = Number(record.shippingWeight);
  }

  if (record.deliveryWeight !== undefined) {
    sanitizedRecord.deliveryWeight = Number(record.deliveryWeight);
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

  const sanitizedRecord: any = {};

  // Sanitize text fields
  if (record.name !== undefined) {
    sanitizedRecord.name = sanitizeInput(record.name);
  }

  if (record.description !== undefined) {
    sanitizedRecord.description = sanitizeInput(record.description);
  }

  if (record.type !== undefined) {
    sanitizedRecord.type = sanitizeInput(record.type);
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
    return obj.map(item => deepSanitize(item)).filter(item => item !== undefined);
  }

  const sanitizedObj: any = {};

  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = obj[key];

      if (typeof value === 'string') {
        sanitizedObj[key] = sanitizeInput(value);
      } else if (typeof value === 'object' && value !== null) {
        sanitizedObj[key] = deepSanitize(value);
      } else if (value !== undefined) {
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

  const sanitizedRecord: any = {};

  // Sanitize text fields
  if (record.name !== undefined) {
    sanitizedRecord.name = sanitizeInput(record.name);
  }

  if (record.manufacturer !== undefined) {
    sanitizedRecord.manufacturer = sanitizeInput(record.manufacturer);
  }

  if (record.model !== undefined) {
    sanitizedRecord.model = sanitizeInput(record.model);
  }

  if (record.engineVolume !== undefined) {
    sanitizedRecord.engineVolume = sanitizeInput(record.engineVolume);
  }

  if (record.engineNumber !== undefined) {
    sanitizedRecord.engineNumber = sanitizeInput(record.engineNumber);
  }

  if (record.vin !== undefined) {
    sanitizedRecord.vin = sanitizeInput(record.vin);
  }

  if (record.stsData !== undefined) {
    sanitizedRecord.stsData = sanitizeInput(record.stsData);
  }

  if (record.ptsData !== undefined) {
    sanitizedRecord.ptsData = sanitizeInput(record.ptsData);
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

  const sanitizedRecord: any = {};

  // Sanitize text fields
  if (record.vehicleId !== undefined) {
    sanitizedRecord.vehicleId = sanitizeInput(record.vehicleId);
  }

  if (record.vehicleName !== undefined) {
    sanitizedRecord.vehicleName = sanitizeInput(record.vehicleName);
  }

  if (record.date !== undefined) {
    sanitizedRecord.date = sanitizeInput(record.date);
  }

  if (record.workType !== undefined) {
    sanitizedRecord.workType = sanitizeInput(record.workType);
  }

  if (record.comment !== undefined) {
    sanitizedRecord.comment = sanitizeInput(record.comment);
  }

  if (record.frequency !== undefined) {
    sanitizedRecord.frequency = sanitizeInput(record.frequency);
  }

  // Ensure numeric fields are numbers
  if (record.cost !== undefined) {
    sanitizedRecord.cost = Number(record.cost);
  }

  if (record.quantity !== undefined) {
    sanitizedRecord.quantity = Number(record.quantity);
  }

  if (record.mileage !== undefined) {
    sanitizedRecord.mileage = Number(record.mileage);
  }

  return sanitizedRecord;
};

/**
 * Sanitizes a period event before saving
 * @param event - The period event to sanitize
 * @returns Sanitized period event
 */
export const sanitizePeriodEvent = (event: any): any => {
  if (!event || typeof event !== 'object') {
    return event;
  }

  const sanitizedEvent: any = {};

  // Sanitize text fields
  if (event.title !== undefined) {
    sanitizedEvent.title = sanitizeInput(event.title);
  }

  if (event.date !== undefined) {
    sanitizedEvent.date = sanitizeInput(event.date);
  }

  if (event.description !== undefined) {
    sanitizedEvent.description = sanitizeInput(event.description);
  }

  if (event.category !== undefined) {
    sanitizedEvent.category = sanitizeInput(event.category);
  }

  return sanitizedEvent;
};

/**
 * Sanitizes a recipe record before saving
 * @param record - The recipe record to sanitize
 * @returns Sanitized recipe record
 */
export const sanitizeRecipeRecord = (record: any): any => {
  if (!record || typeof record !== 'object') {
    return record;
  }

  const sanitizedRecord: any = {};

  // Sanitize text fields
  if (record.title !== undefined) {
    sanitizedRecord.title = sanitizeInput(record.title);
  }

  if (record.category !== undefined) {
    sanitizedRecord.category = sanitizeInput(record.category);
  }

  if (record.ingredients !== undefined) {
    sanitizedRecord.ingredients = sanitizeRichText(record.ingredients);
  }

  if (record.instructions !== undefined) {
    sanitizedRecord.instructions = sanitizeRichText(record.instructions);
  }

  // Ensure numeric fields are numbers
  if (record.cookingTime !== undefined) {
    sanitizedRecord.cookingTime = Number(record.cookingTime);
  }

  if (record.servings !== undefined) {
    sanitizedRecord.servings = Number(record.servings);
  }

  // Handle tags array
  if (record.tags !== undefined && Array.isArray(record.tags)) {
    sanitizedRecord.tags = record.tags.map((tag: string) => sanitizeInput(tag));
  }

  if (record.date !== undefined) {
    sanitizedRecord.date = sanitizeInput(record.date);
  }

  return sanitizedRecord;
};
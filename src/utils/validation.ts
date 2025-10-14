/**
 * Validates if a date string has a valid format
 * @param dateString - The date string to validate
 * @returns boolean - Whether the date is valid
 */
export const isValidDate = (dateString: string): boolean => {
  if (!dateString) return false;
  
  // Check if date matches YYYY-MM-DD format
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateString)) return false;
  
  // Check if it's a valid date
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
};

/**
 * Validates if a string is a valid name (non-empty, reasonable length)
 * @param name - The name string to validate
 * @returns boolean - Whether the name is valid
 */
export const isValidName = (name: string): boolean => {
  return typeof name === 'string' && 
         name.trim().length > 0 && 
         name.trim().length <= 200;
};

/**
 * Validates if a number is a valid price
 * @param price - The price to validate
 * @returns boolean - Whether the price is valid
 */
export const isValidPrice = (price: number): boolean => {
  return typeof price === 'number' && 
         !isNaN(price) && 
         price >= 0 && 
         price <= 999999999.99; // Max 999,999,999.99
};

/**
 * Validates if a number is a valid quantity
 * @param quantity - The quantity to validate
 * @returns boolean - Whether the quantity is valid
 */
export const isValidQuantity = (quantity: number): boolean => {
  return typeof quantity === 'number' && 
         !isNaN(quantity) && 
         quantity >= 0 && 
         quantity <= 999999.999; // Max 999,999.999
};

/**
 * Validates if a string is a valid classification (category name)
 * @param classification - The classification string to validate
 * @returns boolean - Whether the classification is valid
 */
export const isValidClassification = (classification: string): boolean => {
  return typeof classification === 'string' && 
         classification.trim().length > 0 && 
         classification.trim().length <= 100;
};

/**
 * Validates if a string is a valid comment
 * @param comment - The comment string to validate
 * @returns boolean - Whether the comment is valid
 */
export const isValidComment = (comment: string): boolean => {
  return typeof comment === 'string' && 
         comment.length <= 1000; // Max 1000 characters
};

/**
 * Validates a complete finance record
 * @param record - The finance record to validate
 * @returns boolean - Whether the record is valid
 */
export const isValidFinanceRecord = (record: any): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!isValidDate(record.date)) {
    errors.push('Дата должна быть в формате YYYY-MM-DD и быть действительной датой');
  }

  if (!isValidName(record.name)) {
    errors.push('Название обязательно и не должно превышать 200 символов');
  }

  if (!isValidPrice(record.price)) {
    errors.push('Цена должна быть числом от 0 до 999,999,999.99');
  }

  if (!isValidQuantity(record.quantity)) {
    errors.push('Количество должно быть числом от 0 до 999,999.999');
  }

  if (!isValidClassification(record.classification)) {
    errors.push('Классификация обязательна и не должна превышать 100 символов');
  }

  if (!isValidComment(record.comment)) {
    errors.push('Комментарий не должен превышать 1000 символов');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validates if a string is a valid category name
 * @param name - The category name to validate
 * @returns boolean - Whether the name is valid
 */
export const isValidCategoryName = (name: string): boolean => {
  return typeof name === 'string' && 
         name.trim().length > 0 && 
         name.trim().length <= 100;
};

/**
 * Validates if a string is a valid category description
 * @param description - The category description to validate
 * @returns boolean - Whether the description is valid
 */
export const isValidCategoryDescription = (description: string): boolean => {
  return typeof description === 'string' && 
         description.length <= 500; // Max 500 characters
};

/**
 * Validates if a type is a valid category type
 * @param type - The category type to validate
 * @returns boolean - Whether the type is valid
 */
export const isValidCategoryType = (type: string): boolean => {
  return type === 'expense' || type === 'income';
};

/**
 * Validates a complete category record
 * @param category - The category to validate
 * @returns boolean - Whether the category is valid
 */
export const isValidCategory = (category: any): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!isValidCategoryName(category.name)) {
    errors.push('Название категории обязательно и не должно превышать 100 символов');
  }

  if (!isValidCategoryDescription(category.description)) {
    errors.push('Описание категории не должно превышать 500 символов');
  }

  if (!isValidCategoryType(category.type)) {
    errors.push('Тип категории должен быть либо "expense" (расход), либо "income" (доход)');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};
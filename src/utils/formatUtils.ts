/**
 * Formats a number as currency with two decimal places
 * @param value - The number to format
 * @returns Formatted currency string with two decimal places
 */
export const formatCurrency = (value: number | string): string => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(num)) {
    return '0.00';
  }
  
  return num.toFixed(2);
};

/**
 * Formats a number as currency with thousand separators and two decimal places
 * @param value - The number to format
 * @returns Formatted currency string with thousand separators and two decimal places
 */
export const formatCurrencyWithSeparators = (value: number | string): string => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(num)) {
    return '0.00';
  }
  
  // Format with 2 decimal places and thousand separators
  return new Intl.NumberFormat('ru-RU', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(num);
};

/**
 * Formats a date string to the format "DD.MM.YYг"
 * @param dateString - The date string to format
 * @returns Formatted date string in "DD.MM.YYг" format
 */
export const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  
  try {
    // If the date is already in format DD.MM.YYг, return as is
    if (dateString.includes('.')) {
      // Check if the format matches the pattern DD.MM.YYг
      const parts = dateString.split('.');
      if (parts.length === 3 && parts[2].endsWith('г')) {
        return dateString;
      }
    }
    
    // Parse date in format YYYY-MM-DD
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString; // If date is invalid, return original string
    
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString().slice(-2); // Take last 2 digits of year
    
    return `${day}.${month}.${year}г`;
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString; // Return original string in case of error
  }
};
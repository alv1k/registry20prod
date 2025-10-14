// firebase/functions/src/index.ts
import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';

admin.initializeApp();

// Function to validate finance data before writing
export const validateFinanceData = functions.firestore
  .document('finance/{financeId}')
  .onWrite(async (change, context) => {
    // Get the new document data
    const newData = change.after.exists ? change.after.data() : null;
    const oldData = change.before.exists ? change.before.data() : null;

    // If this is a deletion, we don't need to validate
    if (!newData) {
      return null;
    }

    // Validate required fields
    if (!newData.date || !newData.name || !newData.price || !newData.quantity || !newData.total || !newData.classification) {
      throw new functions.https.HttpsError('invalid-argument', 'Missing required fields');
    }

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(newData.date)) {
      throw new functions.https.HttpsError('invalid-argument', 'Invalid date format (expected YYYY-MM-DD)');
    }

    // Validate date is not in the future
    const recordDate = new Date(newData.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (recordDate > today) {
      throw new functions.https.HttpsError('invalid-argument', 'Date cannot be in the future');
    }

    // Validate name (non-empty, reasonable length)
    if (typeof newData.name !== 'string' || newData.name.trim().length === 0 || newData.name.trim().length > 200) {
      throw new functions.https.HttpsError('invalid-argument', 'Invalid name field');
    }

    // Validate price (number, positive, reasonable range)
    if (typeof newData.price !== 'number' || isNaN(newData.price) || newData.price < 0 || newData.price > 999999999.99) {
      throw new functions.https.HttpsError('invalid-argument', 'Invalid price value');
    }

    // Validate quantity (number, positive, reasonable range)
    if (typeof newData.quantity !== 'number' || isNaN(newData.quantity) || newData.quantity < 0 || newData.quantity > 999999.999) {
      throw new functions.https.HttpsError('invalid-argument', 'Invalid quantity value');
    }

    // Validate total (should be price * quantity)
    const expectedTotal = newData.price * newData.quantity;
    if (Math.abs(newData.total - expectedTotal) > 0.01) { // Allow small floating point differences
      throw new functions.https.HttpsError('invalid-argument', 'Total value does not match price * quantity');
    }

    // Validate classification (non-empty, reasonable length)
    if (typeof newData.classification !== 'string' || newData.classification.trim().length === 0 || newData.classification.trim().length > 100) {
      throw new functions.https.HttpsError('invalid-argument', 'Invalid classification field');
    }

    // Validate comment (if present, reasonable length)
    if (newData.comment && typeof newData.comment !== 'string') {
      throw new functions.https.HttpsError('invalid-argument', 'Comment must be a string');
    }
    if (newData.comment && newData.comment.length > 1000) {
      throw new functions.https.HttpsError('invalid-argument', 'Comment too long');
    }

    // If validation passes, return successfully
    return null;
  });

// Function to validate correspondent data before writing  
export const validateCorrespondentData = functions.firestore
  .document('correspondent/{correspondentId}')
  .onWrite(async (change, context) => {
    // Get the new document data
    const newData = change.after.exists ? change.after.data() : null;

    // If this is a deletion, we don't need to validate
    if (!newData) {
      return null;
    }

    // Validate required fields
    if (!newData.date || !newData.incomingNumber || !newData.subject || !newData.from || !newData.to) {
      throw new functions.https.HttpsError('invalid-argument', 'Missing required fields');
    }

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(newData.date)) {
      throw new functions.https.HttpsError('invalid-argument', 'Invalid date format (expected YYYY-MM-DD)');
    }

    // Validate date is not in the future
    const recordDate = new Date(newData.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (recordDate > today) {
      throw new functions.https.HttpsError('invalid-argument', 'Date cannot be in the future');
    }

    // Validate incoming number
    if (typeof newData.incomingNumber !== 'string' || newData.incomingNumber.trim().length === 0 || newData.incomingNumber.trim().length > 50) {
      throw new functions.https.HttpsError('invalid-argument', 'Invalid incoming number');
    }

    // Validate subject
    if (typeof newData.subject !== 'string' || newData.subject.trim().length === 0 || newData.subject.trim().length > 500) {
      throw new functions.https.HttpsError('invalid-argument', 'Invalid subject');
    }

    // Validate from field
    if (typeof newData.from !== 'string' || newData.from.trim().length === 0 || newData.from.trim().length > 200) {
      throw new functions.https.HttpsError('invalid-argument', 'Invalid "from" field');
    }

    // Validate to field
    if (typeof newData.to !== 'string' || newData.to.trim().length === 0 || newData.to.trim().length > 200) {
      throw new functions.https.HttpsError('invalid-argument', 'Invalid "to" field');
    }

    // Validate optional signedBy field
    if (newData.signedBy && typeof newData.signedBy !== 'string') {
      throw new functions.https.HttpsError('invalid-argument', 'signedBy must be a string');
    }

    return null;
  });

// Function to validate transport data before writing  
export const validateTransportData = functions.firestore
  .document('transport/{transportId}')
  .onWrite(async (change, context) => {
    // Get the new document data
    const newData = change.after.exists ? change.after.data() : null;

    // If this is a deletion, we don't need to validate
    if (!newData) {
      return null;
    }

    // Validate required fields
    if (!newData.shippingDate || !newData.cargoName || !newData.driver || !newData.carNumber || !newData.driverLicense) {
      throw new functions.https.HttpsError('invalid-argument', 'Missing required fields');
    }

    // Validate shipping date format (YYYY-MM-DD)
    const shippingDateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!shippingDateRegex.test(newData.shippingDate)) {
      throw new functions.https.HttpsError('invalid-argument', 'Invalid shipping date format (expected YYYY-MM-DD)');
    }

    // Validate shipping date is not in the future
    const recordDate = new Date(newData.shippingDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (recordDate > today) {
      throw new functions.https.HttpsError('invalid-argument', 'Shipping date cannot be in the future');
    }

    // Validate departure date if present
    if (newData.departureDate) {
      if (!shippingDateRegex.test(newData.departureDate)) {
        throw new functions.https.HttpsError('invalid-argument', 'Invalid departure date format (expected YYYY-MM-DD)');
      }
      
      // Validate departure date is not before shipping date
      const departureRecordDate = new Date(newData.departureDate);
      if (departureRecordDate < recordDate) {
        throw new functions.https.HttpsError('invalid-argument', 'Departure date cannot be before shipping date');
      }
    }

    // Validate arrival date if present
    if (newData.arrivalDate) {
      if (!shippingDateRegex.test(newData.arrivalDate)) {
        throw new functions.https.HttpsError('invalid-argument', 'Invalid arrival date format (expected YYYY-MM-DD)');
      }
      
      // Validate arrival date is not before departure date (if present) or shipping date
      const arrivalRecordDate = new Date(newData.arrivalDate);
      if (newData.departureDate) {
        const departureDate = new Date(newData.departureDate);
        if (arrivalRecordDate < departureDate) {
          throw new functions.https.HttpsError('invalid-argument', 'Arrival date cannot be before departure date');
        }
      } else if (arrivalRecordDate < recordDate) {
        throw new functions.https.HttpsError('invalid-argument', 'Arrival date cannot be before shipping date');
      }
    }

    // Validate cargo name
    if (typeof newData.cargoName !== 'string' || newData.cargoName.trim().length === 0 || newData.cargoName.trim().length > 200) {
      throw new functions.https.HttpsError('invalid-argument', 'Invalid cargo name');
    }

    // Validate driver
    if (typeof newData.driver !== 'string' || newData.driver.trim().length === 0 || newData.driver.trim().length > 100) {
      throw new functions.https.HttpsError('invalid-argument', 'Invalid driver name');
    }

    // Validate car number
    if (typeof newData.carNumber !== 'string' || newData.carNumber.trim().length === 0 || newData.carNumber.trim().length > 20) {
      throw new functions.https.HttpsError('invalid-argument', 'Invalid car number');
    }

    // Validate driver license
    if (typeof newData.driverLicense !== 'string' || newData.driverLicense.trim().length === 0 || newData.driverLicense.trim().length > 50) {
      throw new functions.https.HttpsError('invalid-argument', 'Invalid driver license number');
    }

    // Validate weights (if present)
    if (newData.shippingWeight !== undefined && (typeof newData.shippingWeight !== 'number' || newData.shippingWeight < 0)) {
      throw new functions.https.HttpsError('invalid-argument', 'Invalid shipping weight');
    }

    if (newData.deliveryWeight !== undefined && (typeof newData.deliveryWeight !== 'number' || newData.deliveryWeight < 0)) {
      throw new functions.https.HttpsError('invalid-argument', 'Invalid delivery weight');
    }

    return null;
  });

// Function to validate category data before writing  
export const validateCategoryData = functions.firestore
  .document('finance_categories/{categoryId}')
  .onWrite(async (change, context) => {
    // Get the new document data
    const newData = change.after.exists ? change.after.data() : null;

    // If this is a deletion, we don't need to validate
    if (!newData) {
      return null;
    }

    // Validate required fields
    if (!newData.name) {
      throw new functions.https.HttpsError('invalid-argument', 'Missing required name field');
    }

    // Validate name (non-empty, reasonable length)
    if (typeof newData.name !== 'string' || newData.name.trim().length === 0 || newData.name.trim().length > 100) {
      throw new functions.https.HttpsError('invalid-argument', 'Invalid name field');
    }

    // Validate optional description (if present, reasonable length)
    if (newData.description && typeof newData.description !== 'string') {
      throw new functions.https.HttpsError('invalid-argument', 'Description must be a string');
    }
    if (newData.description && newData.description.length > 500) {
      throw new functions.https.HttpsError('invalid-argument', 'Description too long');
    }

    // Validate type (must be either 'expense' or 'income')
    if (newData.type && newData.type !== 'expense' && newData.type !== 'income') {
      throw new functions.https.HttpsError('invalid-argument', 'Type must be either "expense" or "income"');
    }

    return null;
  });

// HTTP function to validate finance data before it's sent to Firestore
export const validateFinanceRecord = functions.https.onCall(async (data, context) => {
  try {
    // Validate required fields
    if (!data.date || !data.name || !data.price || !data.quantity || !data.total || !data.classification) {
      throw new functions.https.HttpsError('invalid-argument', 'Missing required fields');
    }

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(data.date)) {
      throw new functions.https.HttpsError('invalid-argument', 'Invalid date format (expected YYYY-MM-DD)');
    }

    // Validate date is not in the future
    const recordDate = new Date(data.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (recordDate > today) {
      throw new functions.https.HttpsError('invalid-argument', 'Date cannot be in the future');
    }

    // Validate name (non-empty, reasonable length)
    if (typeof data.name !== 'string' || data.name.trim().length === 0 || data.name.trim().length > 200) {
      throw new functions.https.HttpsError('invalid-argument', 'Invalid name field');
    }

    // Validate price (number, positive, reasonable range)
    if (typeof data.price !== 'number' || isNaN(data.price) || data.price < 0 || data.price > 999999999.99) {
      throw new functions.https.HttpsError('invalid-argument', 'Invalid price value');
    }

    // Validate quantity (number, positive, reasonable range)
    if (typeof data.quantity !== 'number' || isNaN(data.quantity) || data.quantity < 0 || data.quantity > 999999.999) {
      throw new functions.https.HttpsError('invalid-argument', 'Invalid quantity value');
    }

    // Validate total (should be price * quantity)
    const expectedTotal = data.price * data.quantity;
    if (Math.abs(data.total - expectedTotal) > 0.01) { // Allow small floating point differences
      throw new functions.https.HttpsError('invalid-argument', 'Total value does not match price * quantity');
    }

    // Validate classification (non-empty, reasonable length)
    if (typeof data.classification !== 'string' || data.classification.trim().length === 0 || data.classification.trim().length > 100) {
      throw new functions.https.HttpsError('invalid-argument', 'Invalid classification field');
    }

    // Validate comment (if present, reasonable length)
    if (data.comment && typeof data.comment !== 'string') {
      throw new functions.https.HttpsError('invalid-argument', 'Comment must be a string');
    }
    if (data.comment && data.comment.length > 1000) {
      throw new functions.https.HttpsError('invalid-argument', 'Comment too long');
    }

    // If validation passes, return success
    return { valid: true, message: 'Data validated successfully' };
  } catch (error) {
    console.error('Error in validateFinanceRecord:', error);
    throw error;
  }
});
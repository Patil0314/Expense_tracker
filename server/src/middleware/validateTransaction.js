const { ALLOWED_EXPENSE_CATEGORIES, ALLOWED_INCOME_CATEGORIES } = require('../models/Transaction');

/**
 * Middleware to validate incoming transaction payload before reaching controllers.
 * Ensures consistent 400 Bad Request responses with actionable error messages.
 */
const validateTransaction = (req, res, next) => {
  const { title, amount, type, category, date } = req.body;
  const errors = [];

  // Title validation
  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    errors.push('Title is required and cannot be empty');
  } else if (title.trim().length < 2) {
    errors.push('Title must be at least 2 characters long');
  } else if (title.trim().length > 100) {
    errors.push('Title cannot exceed 100 characters');
  }

  // Amount validation
  const parsedAmount = Number(amount);
  if (amount === undefined || amount === null || isNaN(parsedAmount)) {
    errors.push('Amount must be a valid number');
  } else if (parsedAmount <= 0) {
    errors.push('Amount must be greater than zero');
  }

  // Type validation
  const normalizedType = typeof type === 'string' ? type.trim().toLowerCase() : '';
  if (!normalizedType) {
    errors.push("Type is required ('income' or 'expense')");
  } else if (!['income', 'expense'].includes(normalizedType)) {
    errors.push("Type must be either 'income' or 'expense'");
  }

  // Category validation
  if (!category || typeof category !== 'string' || category.trim().length === 0) {
    errors.push('Category is required');
  } else {
    const trimmedCat = category.trim();
    if (normalizedType === 'income' && !ALLOWED_INCOME_CATEGORIES.includes(trimmedCat)) {
      errors.push(`Invalid category for income. Allowed: ${ALLOWED_INCOME_CATEGORIES.join(', ')}`);
    } else if (normalizedType === 'expense' && !ALLOWED_EXPENSE_CATEGORIES.includes(trimmedCat)) {
      errors.push(`Invalid category for expense. Allowed: ${ALLOWED_EXPENSE_CATEGORIES.join(', ')}`);
    }
  }

  // Date validation
  if (!date) {
    errors.push('Date is required');
  } else {
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      errors.push('Date must be a valid calendar date');
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: errors[0],
      errors
    });
  }

  // Attach sanitized fields to req.body
  req.body.title = title.trim();
  req.body.amount = parsedAmount;
  req.body.type = normalizedType;
  req.body.category = category.trim();
  req.body.date = new Date(date);

  next();
};

module.exports = validateTransaction;

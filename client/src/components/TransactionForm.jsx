import React, { useState } from 'react';
import { PlusCircle, Tag, Calendar, DollarSign, FileText, AlertCircle, ChevronDown } from 'lucide-react';

const EXPENSE_CATEGORIES = [
  'Food',
  'Transport',
  'Shopping',
  'Education',
  'Bills',
  'Entertainment',
  'Health',
  'Other'
];

const INCOME_CATEGORIES = [
  'Salary',
  'Freelance',
  'Bonus',
  'Other'
];

// Helper to get today's date in YYYY-MM-DD format
const getTodayString = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const TransactionForm = ({ onAddTransaction, isSubmitting }) => {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('expense');
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0]);
  const [date, setDate] = useState(getTodayString());
  const [errors, setErrors] = useState({});

  // When type changes, switch the category list default
  const handleTypeChange = (newType) => {
    setType(newType);
    if (newType === 'expense') {
      setCategory(EXPENSE_CATEGORIES[0]);
    } else {
      setCategory(INCOME_CATEGORIES[0]);
    }
    // Clear type error if any
    if (errors.type) {
      setErrors(prev => ({ ...prev, type: null }));
    }
  };

  /**
   * Client-side validation strictly matching the requirements.
   */
  const validate = () => {
    const errs = {};

    // Title validation
    if (!title || title.trim().length === 0) {
      errs.title = 'Title/description is required';
    } else if (title.trim().length < 2) {
      errs.title = 'Title must be at least 2 characters';
    } else if (title.trim().length > 100) {
      errs.title = 'Title cannot exceed 100 characters';
    }

    // Amount validation
    const parsedAmount = parseFloat(amount);
    if (!amount || isNaN(parsedAmount)) {
      errs.amount = 'Please enter a valid amount';
    } else if (parsedAmount <= 0) {
      errs.amount = 'Amount must be a positive number greater than 0';
    }

    // Type validation
    if (!['income', 'expense'].includes(type)) {
      errs.type = 'Select a valid transaction type';
    }

    // Category validation
    const validCategories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
    if (!category || !validCategories.includes(category)) {
      errs.category = `Please select a valid ${type} category`;
    }

    // Date validation
    if (!date) {
      errs.date = 'Date is required';
    } else {
      const parsedDate = new Date(date);
      if (isNaN(parsedDate.getTime())) {
        errs.date = 'Please select a valid date';
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    const payload = {
      title: title.trim(),
      amount: parseFloat(amount),
      type,
      category,
      date: new Date(date).toISOString()
    };

    const success = await onAddTransaction(payload);
    if (success) {
      // Reset form fields
      setTitle('');
      setAmount('');
      setDate(getTodayString());
      setErrors({});
      // Keep selected type & default category
    }
  };

  const currentCategories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  return (
    <div className="glass-card form-panel">
      <div className="panel-title-wrap">
        <div className="panel-icon-circle">
          <PlusCircle size={20} />
        </div>
        <div>
          <h2 className="panel-title">Add Transaction</h2>
          <p className="panel-subtitle">Record your income or expense entries</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="transaction-form" noValidate>
        {/* Type Selector (Income / Expense) */}
        <div className="form-field">
          <label className="field-label">
            <span>Transaction Type</span>
            <span className="field-required">*</span>
          </label>
          <div className="type-toggle-group">
            <button
              type="button"
              className={`type-toggle-btn ${type === 'expense' ? 'active expense' : ''}`}
              onClick={() => handleTypeChange('expense')}
            >
              <span>Expense</span>
            </button>
            <button
              type="button"
              className={`type-toggle-btn ${type === 'income' ? 'active income' : ''}`}
              onClick={() => handleTypeChange('income')}
            >
              <span>Income</span>
            </button>
          </div>
          {errors.type && (
            <span className="field-error-msg">
              <AlertCircle size={12} /> {errors.type}
            </span>
          )}
        </div>

        {/* Title Field */}
        <div className="form-field">
          <label htmlFor="tx-title" className="field-label">
            <span>Title / Description</span>
            <span className="field-required">*</span>
          </label>
          <div className="input-container">
            <span className="input-icon">
              <FileText size={16} />
            </span>
            <input
              id="tx-title"
              type="text"
              placeholder={type === 'income' ? 'e.g. Monthly Salary, Freelance project' : 'e.g. Grocery shopping, Electricity bill'}
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (errors.title) setErrors(prev => ({ ...prev, title: null }));
              }}
              className={`form-input ${errors.title ? 'has-error' : ''}`}
              maxLength={100}
            />
          </div>
          {errors.title && (
            <span className="field-error-msg">
              <AlertCircle size={12} /> {errors.title}
            </span>
          )}
        </div>

        {/* Amount Field */}
        <div className="form-field">
          <label htmlFor="tx-amount" className="field-label">
            <span>Amount (₹)</span>
            <span className="field-required">*</span>
          </label>
          <div className="input-container">
            <span className="input-icon">
              <DollarSign size={16} />
            </span>
            <input
              id="tx-amount"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                if (errors.amount) setErrors(prev => ({ ...prev, amount: null }));
              }}
              className={`form-input ${errors.amount ? 'has-error' : ''}`}
            />
          </div>
          {errors.amount && (
            <span className="field-error-msg">
              <AlertCircle size={12} /> {errors.amount}
            </span>
          )}
        </div>

        {/* Category Field */}
        <div className="form-field">
          <label htmlFor="tx-category" className="field-label">
            <span>Category</span>
            <span className="field-required">*</span>
          </label>
          <div className="input-container">
            <span className="input-icon">
              <Tag size={16} />
            </span>
            <select
              id="tx-category"
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                if (errors.category) setErrors(prev => ({ ...prev, category: null }));
              }}
              className={`form-select ${errors.category ? 'has-error' : ''}`}
            >
              {currentCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <ChevronDown size={16} className="select-arrow" />
          </div>
          {errors.category && (
            <span className="field-error-msg">
              <AlertCircle size={12} /> {errors.category}
            </span>
          )}
        </div>

        {/* Date Field */}
        <div className="form-field">
          <label htmlFor="tx-date" className="field-label">
            <span>Date</span>
            <span className="field-required">*</span>
          </label>
          <div className="input-container">
            <span className="input-icon">
              <Calendar size={16} />
            </span>
            <input
              id="tx-date"
              type="date"
              value={date}
              onChange={(e) => {
                setDate(e.target.value);
                if (errors.date) setErrors(prev => ({ ...prev, date: null }));
              }}
              className={`form-input ${errors.date ? 'has-error' : ''}`}
            />
          </div>
          {errors.date && (
            <span className="field-error-msg">
              <AlertCircle size={12} /> {errors.date}
            </span>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-submit"
          id="btn-add-transaction"
        >
          {isSubmitting ? (
            <>
              <span className="spinner" />
              <span>Saving Transaction...</span>
            </>
          ) : (
            <>
              <PlusCircle size={18} />
              <span>Add {type === 'income' ? 'Income' : 'Expense'}</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default TransactionForm;

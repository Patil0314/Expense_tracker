const mongoose = require('mongoose');

// Allowed categories mapped by transaction type
const ALLOWED_EXPENSE_CATEGORIES = [
  'Food',
  'Transport',
  'Shopping',
  'Education',
  'Bills',
  'Entertainment',
  'Health',
  'Other'
];

const ALLOWED_INCOME_CATEGORIES = [
  'Salary',
  'Freelance',
  'Bonus',
  'Other'
];

const transactionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Transaction title is required'],
      trim: true,
      minlength: [2, 'Title must be at least 2 characters long'],
      maxlength: [100, 'Title cannot exceed 100 characters']
    },
    amount: {
      type: Number,
      required: [true, 'Transaction amount is required'],
      min: [0.01, 'Amount must be greater than zero']
    },
    type: {
      type: String,
      required: [true, 'Transaction type is required'],
      enum: {
        values: ['income', 'expense'],
        message: "Type must be either 'income' or 'expense'"
      },
      lowercase: true,
      trim: true
    },
    category: {
      type: String,
      required: [true, 'Transaction category is required'],
      trim: true,
      validate: {
        validator: function (val) {
          if (this.type === 'income') {
            return ALLOWED_INCOME_CATEGORIES.includes(val);
          }
          if (this.type === 'expense') {
            return ALLOWED_EXPENSE_CATEGORIES.includes(val);
          }
          return false;
        },
        message: props => `Category '${props.value}' is not valid for this transaction type`
      }
    },
    date: {
      type: Date,
      required: [true, 'Transaction date is required'],
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

// Indexes for optimized querying and sorting
transactionSchema.index({ date: -1, createdAt: -1 });

module.exports = {
  Transaction: mongoose.model('Transaction', transactionSchema),
  ALLOWED_EXPENSE_CATEGORIES,
  ALLOWED_INCOME_CATEGORIES
};

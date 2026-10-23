const mongoose = require('mongoose');
const { Transaction } = require('../models/Transaction');

/**
 * @desc   Get all transactions (newest first)
 * @route  GET /api/transactions
 * @access Public
 */
const getTransactions = async (req, res, next) => {
  try {
    const { type, category, search } = req.query;
    const filter = {};

    if (type && ['income', 'expense'].includes(type.toLowerCase())) {
      filter.type = type.toLowerCase();
    }

    if (category) {
      filter.category = category;
    }

    if (search) {
      filter.title = { $regex: search.trim(), $options: 'i' };
    }

    // Sort by transaction date descending, then createdAt descending
    const transactions = await Transaction.find(filter).sort({ date: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: transactions.length,
      data: transactions
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Get a single transaction by ID
 * @route  GET /api/transactions/:id
 * @access Public
 */
const getTransactionById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: `Invalid transaction ID format: '${id}'`
      });
    }

    const transaction = await Transaction.findById(id);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    res.status(200).json({
      success: true,
      data: transaction
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Create a new transaction
 * @route  POST /api/transactions
 * @access Public
 */
const createTransaction = async (req, res, next) => {
  try {
    const { title, amount, type, category, date } = req.body;

    const newTransaction = await Transaction.create({
      title,
      amount,
      type,
      category,
      date: date || new Date()
    });

    res.status(201).json({
      success: true,
      message: 'Transaction created successfully',
      data: newTransaction
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Delete a transaction by ID
 * @route  DELETE /api/transactions/:id
 * @access Public
 */
const deleteTransaction = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: `Invalid transaction ID format: '${id}'`
      });
    }

    const deleted = await Transaction.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Transaction deleted successfully',
      data: deleted
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Get aggregated financial summary (Total Income, Total Expenses, Net Savings)
 * @route  GET /api/transactions/summary
 * @access Public
 */
const getSummary = async (req, res, next) => {
  try {
    const result = await Transaction.aggregate([
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    let totalIncome = 0;
    let totalExpenses = 0;
    let incomeCount = 0;
    let expenseCount = 0;

    result.forEach(group => {
      if (group._id === 'income') {
        totalIncome = group.total;
        incomeCount = group.count;
      } else if (group._id === 'expense') {
        totalExpenses = group.total;
        expenseCount = group.count;
      }
    });

    const netSavings = totalIncome - totalExpenses;

    res.status(200).json({
      success: true,
      data: {
        totalIncome: Number(totalIncome.toFixed(2)),
        totalExpenses: Number(totalExpenses.toFixed(2)),
        netSavings: Number(netSavings.toFixed(2)),
        transactionCount: incomeCount + expenseCount,
        incomeCount,
        expenseCount
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTransactions,
  getTransactionById,
  createTransaction,
  deleteTransaction,
  getSummary
};

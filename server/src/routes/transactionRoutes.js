const express = require('express');
const router = express.Router();
const {
  getTransactions,
  getTransactionById,
  createTransaction,
  deleteTransaction,
  getSummary
} = require('../controllers/transactionController');
const validateTransaction = require('../middleware/validateTransaction');

// Routes
router.route('/')
  .get(getTransactions)
  .post(validateTransaction, createTransaction);

router.route('/summary')
  .get(getSummary);

router.route('/:id')
  .get(getTransactionById)
  .delete(deleteTransaction);

module.exports = router;

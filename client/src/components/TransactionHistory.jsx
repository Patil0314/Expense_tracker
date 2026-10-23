import React, { useState, useMemo } from 'react';
import { 
  Trash2, 
  Search, 
  Filter, 
  Calendar, 
  ShoppingBag, 
  Utensils, 
  Car, 
  GraduationCap, 
  Receipt, 
  Film, 
  HeartPulse, 
  Briefcase, 
  Award, 
  DollarSign, 
  MoreHorizontal,
  Inbox
} from 'lucide-react';

/**
 * Returns an appropriate icon for each category
 */
const getCategoryIcon = (category) => {
  switch (category) {
    case 'Food': return <Utensils size={18} />;
    case 'Transport': return <Car size={18} />;
    case 'Shopping': return <ShoppingBag size={18} />;
    case 'Education': return <GraduationCap size={18} />;
    case 'Bills': return <Receipt size={18} />;
    case 'Entertainment': return <Film size={18} />;
    case 'Health': return <HeartPulse size={18} />;
    case 'Salary': return <Briefcase size={18} />;
    case 'Freelance': return <DollarSign size={18} />;
    case 'Bonus': return <Award size={18} />;
    default: return <MoreHorizontal size={18} />;
  }
};

/**
 * Formats a date string into readable format (e.g., Oct 23, 2026)
 */
const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

/**
 * Formats amount in INR
 */
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2
  }).format(amount);
};

const TransactionHistory = ({ transactions = [], onDeleteTransaction, isLoading, deletingId }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Compute unique categories present in current transactions
  const uniqueCategories = useMemo(() => {
    const set = new Set();
    transactions.forEach(t => {
      if (t.category) set.add(t.category);
    });
    return Array.from(set).sort();
  }, [transactions]);

  // Filter & Search
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const matchesSearch = searchTerm.trim() === '' || 
        t.title.toLowerCase().includes(searchTerm.toLowerCase().trim());
      
      const matchesType = typeFilter === 'all' || t.type === typeFilter;
      const matchesCategory = categoryFilter === 'all' || t.category === categoryFilter;

      return matchesSearch && matchesType && matchesCategory;
    });
  }, [transactions, searchTerm, typeFilter, categoryFilter]);

  return (
    <div className="glass-card history-panel">
      <div className="history-header">
        <div className="history-title-group">
          <h2 className="panel-title" style={{ margin: 0 }}>Transaction History</h2>
          <span className="tx-count-pill">
            {filteredTransactions.length} of {transactions.length}
          </span>
        </div>

        {/* Filter Controls */}
        <div className="filter-bar">
          <div className="search-box">
            <Search size={15} className="search-icon" />
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Search transactions"
            />
          </div>

          <select
            className="filter-select"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            aria-label="Filter by type"
          >
            <option value="all">All Types</option>
            <option value="income">Income Only</option>
            <option value="expense">Expenses Only</option>
          </select>

          {uniqueCategories.length > 0 && (
            <select
              className="filter-select"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              aria-label="Filter by category"
            >
              <option value="all">All Categories</option>
              {uniqueCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Loading Skeleton State */}
      {isLoading ? (
        <div className="transactions-list">
          <div className="skeleton-row" />
          <div className="skeleton-row" />
          <div className="skeleton-row" />
        </div>
      ) : filteredTransactions.length === 0 ? (
        /* Empty State */
        <div className="empty-state">
          <div className="empty-icon-circle">
            <Inbox size={32} />
          </div>
          <h3 className="empty-title">
            {transactions.length === 0 ? 'No transactions yet' : 'No matching transactions'}
          </h3>
          <p className="empty-desc">
            {transactions.length === 0
              ? 'No transactions yet. Add your first transaction.'
              : 'Try adjusting your search query or filters to find what you are looking for.'}
          </p>
        </div>
      ) : (
        /* Transaction List */
        <div className="transactions-list" role="list">
          {filteredTransactions.map((tx) => {
            const isIncome = tx.type === 'income';
            const isDeleting = deletingId === tx._id;

            return (
              <div key={tx._id} className="transaction-card" role="listitem">
                <div className="tx-left">
                  <div className={`tx-category-icon-box ${isIncome ? 'income' : 'expense'}`}>
                    {getCategoryIcon(tx.category)}
                  </div>
                  <div className="tx-details">
                    <span className="tx-title" title={tx.title}>
                      {tx.title}
                    </span>
                    <div className="tx-meta">
                      <span className="tx-category-badge">{tx.category}</span>
                      <span className={`tx-type-pill ${isIncome ? 'income' : 'expense'}`}>
                        {isIncome ? '+ Income' : '- Expense'}
                      </span>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                        <Calendar size={12} />
                        {formatDate(tx.date)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="tx-right">
                  <span className={`tx-amount ${isIncome ? 'income' : 'expense'}`}>
                    {isIncome ? `+${formatCurrency(tx.amount)}` : `-${formatCurrency(tx.amount)}`}
                  </span>

                  <button
                    className="btn-delete"
                    onClick={() => onDeleteTransaction(tx._id, tx.title)}
                    disabled={isDeleting}
                    title={`Delete "${tx.title}"`}
                    aria-label={`Delete transaction ${tx.title}`}
                  >
                    {isDeleting ? (
                      <span className="spinner" style={{ width: '14px', height: '14px' }} />
                    ) : (
                      <Trash2 size={16} />
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TransactionHistory;

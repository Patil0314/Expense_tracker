import React from 'react';
import { TrendingUp, TrendingDown, PiggyBank, ArrowUpRight, ArrowDownRight } from 'lucide-react';

/**
 * Formats a numeric value into standard Indian/International currency format.
 */
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2
  }).format(amount);
};

const DashboardCards = ({ income = 0, expenses = 0, savings = 0, transactionCount = 0 }) => {
  const isSavingsPositive = savings >= 0;

  return (
    <section className="dashboard-grid" aria-label="Financial Summary Cards">
      {/* Total Income Card */}
      <div className="glass-card stat-card income">
        <div className="stat-card-header">
          <span className="stat-card-label">Total Income</span>
          <div className="stat-card-icon">
            <TrendingUp size={22} />
          </div>
        </div>
        <div>
          <div className="stat-card-value">{formatCurrency(income)}</div>
          <div className="stat-card-footer">
            <ArrowUpRight size={14} color="var(--income-light)" />
            <span>Sum of all earnings & deposits</span>
          </div>
        </div>
      </div>

      {/* Total Expenses Card */}
      <div className="glass-card stat-card expense">
        <div className="stat-card-header">
          <span className="stat-card-label">Total Expenses</span>
          <div className="stat-card-icon">
            <TrendingDown size={22} />
          </div>
        </div>
        <div>
          <div className="stat-card-value">{formatCurrency(expenses)}</div>
          <div className="stat-card-footer">
            <ArrowDownRight size={14} color="var(--expense-light)" />
            <span>Sum of all outgoing expenditures</span>
          </div>
        </div>
      </div>

      {/* Net Savings Card */}
      <div className="glass-card stat-card savings">
        <div className="stat-card-header">
          <span className="stat-card-label">Net Savings</span>
          <div className="stat-card-icon">
            <PiggyBank size={22} />
          </div>
        </div>
        <div>
          <div className={`stat-card-value ${isSavingsPositive ? 'positive' : 'negative'}`}>
            {formatCurrency(savings)}
          </div>
          <div className="stat-card-footer">
            <span>{isSavingsPositive ? '✓ Positive balance' : '⚠ Deficit spending'}</span>
            <span style={{ margin: '0 4px' }}>•</span>
            <span>{transactionCount} total {transactionCount === 1 ? 'record' : 'records'}</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DashboardCards;

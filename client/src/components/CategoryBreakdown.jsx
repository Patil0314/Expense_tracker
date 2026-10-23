import React, { useMemo } from 'react';
import { PieChart } from 'lucide-react';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
};

const CategoryBreakdown = ({ transactions = [] }) => {
  const breakdown = useMemo(() => {
    const expenseTx = transactions.filter(t => t.type === 'expense');
    const totalExpenses = expenseTx.reduce((sum, t) => sum + t.amount, 0);

    if (totalExpenses === 0) return [];

    const map = {};
    expenseTx.forEach(t => {
      map[t.category] = (map[t.category] || 0) + t.amount;
    });

    return Object.entries(map)
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: ((amount / totalExpenses) * 100).toFixed(1)
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [transactions]);

  if (breakdown.length === 0) {
    return null;
  }

  return (
    <div className="glass-card category-breakdown-card">
      <div className="breakdown-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <PieChart size={18} color="var(--primary-light)" />
          <h3 className="breakdown-title">Expense Breakdown by Category</h3>
        </div>
        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          {breakdown.length} active {breakdown.length === 1 ? 'category' : 'categories'}
        </span>
      </div>

      <div className="breakdown-list">
        {breakdown.map((item) => (
          <div key={item.category} className="breakdown-item">
            <div className="breakdown-labels">
              <span>{item.category}</span>
              <span style={{ color: 'var(--text-muted)' }}>
                {formatCurrency(item.amount)} ({item.percentage}%)
              </span>
            </div>
            <div className="breakdown-bar-bg">
              <div
                className="breakdown-bar-fill"
                style={{ width: `${item.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryBreakdown;

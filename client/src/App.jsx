import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Navbar from './components/Navbar';
import DashboardCards from './components/DashboardCards';
import TransactionForm from './components/TransactionForm';
import TransactionHistory from './components/TransactionHistory';
import CategoryBreakdown from './components/CategoryBreakdown';
import Toast from './components/Toast';
import api from './services/api';
import './App.css';

export function App() {
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [toasts, setToasts] = useState([]);

  // Toast notification helper
  const showToast = useCallback((message, type = 'info') => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);

    // Auto dismiss after 4 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Fetch all transactions from MongoDB backend
  const loadTransactions = useCallback(async (isSilent = false) => {
    if (!isSilent) setIsLoading(true);
    try {
      const res = await api.getTransactions();
      if (res && res.success) {
        setTransactions(res.data || []);
        setIsConnected(true);
      }
    } catch (err) {
      console.error('Failed to load transactions:', err);
      setIsConnected(false);
      showToast(err.message || 'Failed to fetch transactions from server', 'error');
    } finally {
      if (!isSilent) setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [showToast]);

  // Initial load on mount
  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  // Periodic heartbeat / health check
  useEffect(() => {
    const checkConnection = async () => {
      try {
        await api.checkHealth();
        setIsConnected(true);
      } catch {
        setIsConnected(false);
      }
    };

    const interval = setInterval(checkConnection, 15000);
    return () => clearInterval(interval);
  }, []);

  // Calculate Dashboard Totals strictly from persisted MongoDB data
  const { totalIncome, totalExpenses, netSavings } = useMemo(() => {
    let income = 0;
    let expenses = 0;

    transactions.forEach(t => {
      const amt = Number(t.amount) || 0;
      if (t.type === 'income') {
        income += amt;
      } else if (t.type === 'expense') {
        expenses += amt;
      }
    });

    return {
      totalIncome: Number(income.toFixed(2)),
      totalExpenses: Number(expenses.toFixed(2)),
      netSavings: Number((income - expenses).toFixed(2))
    };
  }, [transactions]);

  // Add Transaction Handler
  const handleAddTransaction = async (formData) => {
    setIsSubmitting(true);
    try {
      const res = await api.createTransaction(formData);
      if (res && res.success) {
        // Prepend newly created transaction
        setTransactions(prev => [res.data, ...prev]);
        showToast(
          `Added ${formData.type === 'income' ? 'income' : 'expense'}: "${formData.title}"`,
          'success'
        );
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error adding transaction:', err);
      showToast(err.message || 'Failed to save transaction', 'error');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Transaction Handler
  const handleDeleteTransaction = async (id, title) => {
    setDeletingId(id);
    try {
      const res = await api.deleteTransaction(id);
      if (res && res.success) {
        // Immediately remove from state to trigger instant recalculation of totals
        setTransactions(prev => prev.filter(t => t._id !== id));
        showToast(`Deleted transaction "${title}"`, 'success');
      }
    } catch (err) {
      console.error('Error deleting transaction:', err);
      showToast(err.message || 'Failed to delete transaction', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  // Manual Refresh Handler
  const handleRefresh = () => {
    setIsRefreshing(true);
    loadTransactions(true);
  };

  return (
    <div className="app-container">
      {/* Toast Notifications */}
      <Toast toasts={toasts} onDismiss={dismissToast} />

      {/* Navigation & Connection Bar */}
      <Navbar
        isConnected={isConnected}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
      />

      {/* 3 Metric Cards: Total Income, Total Expenses, Net Savings */}
      <DashboardCards
        income={totalIncome}
        expenses={totalExpenses}
        savings={netSavings}
        transactionCount={transactions.length}
      />

      {/* Main Two-Column Layout */}
      <main className="main-layout">
        {/* Left Column: Form & Category Breakdown */}
        <section aria-label="Transaction Entry">
          <TransactionForm
            onAddTransaction={handleAddTransaction}
            isSubmitting={isSubmitting}
          />
          <CategoryBreakdown transactions={transactions} />
        </section>

        {/* Right Column: Transaction History */}
        <section aria-label="Transaction History Section">
          <TransactionHistory
            transactions={transactions}
            onDeleteTransaction={handleDeleteTransaction}
            isLoading={isLoading}
            deletingId={deletingId}
          />
        </section>
      </main>
    </div>
  );
}

export default App;

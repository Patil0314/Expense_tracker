/**
 * API Service for interacting with the backend REST endpoints.
 * Handles request dispatching, JSON serialization, and error normalization.
 */

const BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '') + '/api';

/**
 * Helper to execute fetch requests with consistent error parsing.
 */
async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers
    }
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const errorMessage = data?.message || (data?.errors && data.errors.join(', ')) || `HTTP ${response.status}: Request failed`;
      const error = new Error(errorMessage);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (err) {
    // Distinguish network/connection failure vs backend response errors
    if (!err.status) {
      err.message = 'Unable to connect to the backend server. Please verify the server is running on port 5000.';
    }
    throw err;
  }
}

export const api = {
  /**
   * Fetch all transactions with optional query filters (type, category, search)
   */
  async getTransactions(params = {}) {
    const query = new URLSearchParams();
    if (params.type && params.type !== 'all') query.append('type', params.type);
    if (params.category && params.category !== 'all') query.append('category', params.category);
    if (params.search) query.append('search', params.search);

    const queryString = query.toString() ? `?${query.toString()}` : '';
    return request(`/transactions${queryString}`);
  },

  /**
   * Fetch a single transaction by ID
   */
  async getTransactionById(id) {
    return request(`/transactions/${id}`);
  },

  /**
   * Create a new transaction
   */
  async createTransaction(transactionData) {
    return request('/transactions', {
      method: 'POST',
      body: JSON.stringify(transactionData)
    });
  },

  /**
   * Delete a transaction by ID
   */
  async deleteTransaction(id) {
    return request(`/transactions/${id}`, {
      method: 'DELETE'
    });
  },

  /**
   * Fetch aggregated summary totals (total income, total expenses, net savings)
   */
  async getSummary() {
    return request('/transactions/summary');
  },

  /**
   * Backend health check
   */
  async checkHealth() {
    return request('/health');
  }
};

export default api;

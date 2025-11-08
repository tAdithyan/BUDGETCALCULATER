const API_BASE_URL = 'https://budgetcalculater-backend.onrender.com/api';

// Helper function to handle API requests
const apiRequest = async (endpoint, options = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'An error occurred' }));
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

// Expense API calls
export const expenseAPI = {
  // Get all expenses (optionally filtered by month)
  getAll: async (month = null) => {
    const endpoint = month ? `/expenses?month=${month}` : '/expenses';
    return apiRequest(endpoint);
  },

  // Get expense by ID
  getById: async (id) => {
    return apiRequest(`/expenses/${id}`);
  },

  // Create new expense
  create: async (expenseData) => {
    return apiRequest('/expenses', {
      method: 'POST',
      body: JSON.stringify(expenseData),
    });
  },

  // Update expense
  update: async (id, expenseData) => {
    return apiRequest(`/expenses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(expenseData),
    });
  },

  // Delete expense
  delete: async (id) => {
    return apiRequest(`/expenses/${id}`, {
      method: 'DELETE',
    });
  },

  // Get expenses by month
  getByMonth: async (month) => {
    return apiRequest(`/expenses/month/${month}`);
  },
};

// Salary API calls
export const salaryAPI = {
  // Get all salaries
  getAll: async () => {
    return apiRequest('/salaries');
  },

  // Get salary by month
  getByMonth: async (month) => {
    try {
      return await apiRequest(`/salaries/${month}`);
    } catch (error) {
      // If salary doesn't exist, return 0
      return { month, amount: 0 };
    }
  },

  // Create or update salary
  createOrUpdate: async (month, amount) => {
    return apiRequest('/salaries', {
      method: 'POST',
      body: JSON.stringify({ month, amount }),
    });
  },

  // Update salary
  update: async (month, amount) => {
    return apiRequest(`/salaries/${month}`, {
      method: 'PUT',
      body: JSON.stringify({ amount }),
    });
  },

  // Delete salary
  delete: async (month) => {
    return apiRequest(`/salaries/${month}`, {
      method: 'DELETE',
    });
  },
};

// Predefined Expense API calls
export const predefinedExpenseAPI = {
  // Get all predefined expenses
  getAll: async () => {
    return apiRequest('/predefined-expenses');
  },

  // getByMonth: async (month,predefinedExpenseIds = null) => {
  //   return apiRequest(`/predefined-expenses/${month}?predefinedExpenseIds=${predefinedExpenseIds}`);
  // },

  // Get predefined expense by ID
  getById: async (id) => {
    return apiRequest(`/predefined-expenses/${id}`);
  },

  // Create new predefined expense
  create: async (predefinedExpenseData) => {
    return apiRequest('/predefined-expenses', {
      method: 'POST',
      body: JSON.stringify(predefinedExpenseData),
    });
  },

  // Update predefined expense
  update: async (id, predefinedExpenseData) => {
    return apiRequest(`/predefined-expenses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(predefinedExpenseData),
    });
  },

  // Delete predefined expense
  delete: async (id) => {
    return apiRequest(`/predefined-expenses/${id}`, {
      method: 'DELETE',
    });
  },

  // Apply predefined expenses to a specific month
  applyToMonth: async (month, predefinedExpenseIds = null, options = null) => {
    return apiRequest(`/predefined-expenses/apply/${month}`, {
      method: 'POST',
      body: JSON.stringify({ predefinedExpenseIds, options }),
    });
  },

  // Apply predefined expenses to all months
  applyToAll: async (startMonth, endMonth = null, predefinedExpenseIds = null) => {
    return apiRequest('/predefined-expenses/apply/all', {
      method: 'POST',
      body: JSON.stringify({ startMonth, endMonth, predefinedExpenseIds }),
    });
  },
};

// Health check
export const healthCheck = async () => {
  return apiRequest('/health');
};

// Assign object to a variable before default export to satisfy import/no-anonymous-default-export
const api = {
  expenseAPI,
  salaryAPI,
  predefinedExpenseAPI,
  healthCheck,
};

export default api;


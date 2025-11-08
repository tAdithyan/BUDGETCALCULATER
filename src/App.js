import React, { useState, useEffect } from 'react';
import './App.css';
import ExpenseForm from './components/ExpenseForm';
import ExpenseList from './components/ExpenseList';
import MonthlyCharts from './components/MonthlyCharts';
import MonthlySummary from './components/MonthlySummary';
import PredefinedExpenses from './components/PredefinedExpenses';
import { expenseAPI, salaryAPI } from './services/api';

function App() {
  const [expenses, setExpenses] = useState([]);
  const [editingExpense, setEditingExpense] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7)
  );
  const [salaries, setSalaries] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load expenses and salaries from API on mount and when month changes
  useEffect(() => {
    loadData();
  }, [selectedMonth]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load expenses for the selected month
      const expensesData = await expenseAPI.getByMonth(selectedMonth);
      setExpenses(expensesData);

      // Load salary for the selected month
      const salaryData = await salaryAPI.getByMonth(selectedMonth);
      setSalaries((prev) => ({
        ...prev,
        [selectedMonth]: salaryData.amount || 0,
      }));
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load data. Please check if the backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  const addExpense = async (expense) => {
    try {
      setError(null);
      const expenseData = {
        ...expense,
        date: expense.date || new Date().toISOString().split('T')[0],
      };
      const newExpense = await expenseAPI.create(expenseData);
      
      // If the expense is for the current month, add it to the list
      const expenseMonth = newExpense.date.slice(0, 7);
      if (expenseMonth === selectedMonth) {
        setExpenses([...expenses, newExpense]);
      } else {
        // Reload data to ensure consistency
        await loadData();
      }
    } catch (err) {
      console.error('Error adding expense:', err);
      setError(err.message || 'Failed to add expense');
      throw err;
    }
  };

  const updateExpense = async (updatedExpense) => {
    try {
      setError(null);
      const updated = await expenseAPI.update(updatedExpense._id || updatedExpense.id, updatedExpense);
      
      // Update the expense in the list
      setExpenses(
        expenses.map((exp) =>
          (exp._id || exp.id) === (updated._id || updated.id) ? updated : exp
        )
      );
      setEditingExpense(null);
    } catch (err) {
      console.error('Error updating expense:', err);
      setError(err.message || 'Failed to update expense');
      throw err;
    }
  };

  const deleteExpense = async (id) => {
    try {
      setError(null);
      await expenseAPI.delete(id);
      setExpenses(expenses.filter((exp) => (exp._id || exp.id) !== id));
      if (editingExpense && (editingExpense._id || editingExpense.id) === id) {
        setEditingExpense(null);
      }
    } catch (err) {
      console.error('Error deleting expense:', err);
      setError(err.message || 'Failed to delete expense');
      throw err;
    }
  };

  const startEdit = (expense) => {
    setEditingExpense(expense);
  };

  const cancelEdit = () => {
    setEditingExpense(null);
  };

  const updateSalary = async (month, amount) => {
    try {
      setError(null);
      await salaryAPI.createOrUpdate(month, amount);
      setSalaries((prev) => ({
        ...prev,
        [month]: amount || 0,
      }));
    } catch (err) {
      console.error('Error updating salary:', err);
      setError(err.message || 'Failed to update salary');
      throw err;
    }
  };

  // Filter expenses by selected month (already filtered by API, but keeping for safety)
  const monthlyExpenses = expenses.filter((expense) => {
    const expenseMonth = expense.date.slice(0, 7);
    return expenseMonth === selectedMonth;
  });

  return (
    <div className="App">
      <header className="app-header">
        <h1>💰 Budget Tracker</h1>
        <p>Manage your expenses and track your budget monthly</p>
      </header>

      {error && (
        <div className="error-banner">
          <span>⚠️ {error}</span>
          <button onClick={() => setError(null)}>✕</button>
        </div>
      )}

      <div className="container">
        <div className="month-selector">
          <label htmlFor="month-select">Select Month: </label>
          <input
            type="month"
            id="month-select"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="month-input"
            disabled={loading}
          />
          {loading && <span className="loading-indicator">Loading...</span>}
        </div>

        <div className="main-content">
          <div className="left-panel">
            <PredefinedExpenses
              selectedMonth={selectedMonth}
              onExpenseAdded={loadData}
            />
            <ExpenseForm
              onAdd={addExpense}
              onUpdate={updateExpense}
              editingExpense={editingExpense}
              onCancel={cancelEdit}
              selectedMonth={selectedMonth}
            />
            <ExpenseList
              expenses={monthlyExpenses}
              onDelete={deleteExpense}
              onEdit={startEdit}
            />
          </div>

          <div className="right-panel">
            <MonthlySummary 
              expenses={monthlyExpenses} 
              selectedMonth={selectedMonth}
              salary={salaries[selectedMonth] || 0}
              onSalaryUpdate={updateSalary}
            />
            <MonthlyCharts expenses={monthlyExpenses} selectedMonth={selectedMonth} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;


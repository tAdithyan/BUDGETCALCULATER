import React, { useState, useEffect } from 'react';
import { predefinedExpenseAPI } from '../services/api';
import './PredefinedExpenses.css';

const PredefinedExpenses = ({ selectedMonth, onExpenseAdded }) => {
  const [predefinedExpenses, setPredefinedExpenses] = useState([]);

  console.log("predefinedExpenses",predefinedExpenses);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    category: 'Food',
    type: 'expense',
    dayOfMonth: 1,
    isActive: true,
    description: '',
  });
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    loadPredefinedExpenses();
  }, []);


  

  const loadPredefinedExpenses = async () => {
    try {
      setLoading(true);
      const data = await predefinedExpenseAPI.getAll();

      setPredefinedExpenses(data);
    } catch (error) {
      console.error('Error loading predefined expenses:', error);
      alert('Failed to load predefined expenses');
    } finally {
      setLoading(false);
    }
  };
  

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingExpense) {
        await predefinedExpenseAPI.update(editingExpense._id || editingExpense.id, formData);
      } else {
        await predefinedExpenseAPI.create({
          ...formData,
          amount: parseFloat(formData.amount),
        });
      }
      await loadPredefinedExpenses();
      resetForm();
    } catch (error) {
      alert(error.message || 'Failed to save predefined expense');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      amount: '',
      category: 'Food',
      type: 'expense',
      dayOfMonth: 1,
      isActive: true,
      description: '',
    });
    setEditingExpense(null);
    setShowForm(false);
  };

  const handleEdit = (expense) => {
    setEditingExpense(expense);
    setFormData({
      title: expense.title,
      amount: expense.amount,
      category: expense.category,
      type: expense.type,
      dayOfMonth: expense.dayOfMonth || 1,
      isActive: expense.isActive !== undefined ? expense.isActive : true,
      description: expense.description || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this predefined expense?')) {
      return;
    }
    try {
      await predefinedExpenseAPI.delete(id);
      await loadPredefinedExpenses();
    } catch (error) {
      alert(error.message || 'Failed to delete predefined expense');
    }
  };

  const handleApplyToMonth = async (month, expenseIds = null) => {
    try {
      setApplying(true);
      // Modified to pass an options object including isPredefined flag
      // Assuming your backend API supports passing additional options to mark applied expenses as predefined
      const options = { isPredefined: true }; // This flag will differentiate applied expenses from manual ones

      console.log("options",options);
      const result = await predefinedExpenseAPI.applyToMonth(month, expenseIds, options);
      alert(`Successfully applied ${result.created.length} expense(s) to ${month}`);
      if (onExpenseAdded) {
        onExpenseAdded();
      }
    } catch (error) {
      alert(error.message || 'Failed to apply predefined expenses');
    } finally {
      setApplying(false);
    }
  };

  const handleApplyToAll = async () => {
    const startMonth = selectedMonth;
    if (!window.confirm(`Apply all active predefined expenses to all months starting from ${startMonth}?`)) {
      return;
    }
    try {
      setApplying(true);
      // Modified to pass an options object including isPredefined flag
      const options = { isPredefined: true }; // This flag will differentiate applied expenses from manual ones
      const result = await predefinedExpenseAPI.applyToAll(startMonth, options);
      alert(`Successfully applied expenses to ${result.totalMonths} months. Created ${result.totalCreated} expenses.`);
      if (onExpenseAdded) {
        onExpenseAdded();
      }
    } catch (error) {
      alert(error.message || 'Failed to apply predefined expenses');
    } finally {
      setApplying(false);
    }
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const activeExpenses = predefinedExpenses.filter((exp) => exp.isActive);

  return (
    <div className="predefined-expenses-container">
      <div className="predefined-expenses-header">
        <h2>Predefined Expenses</h2>
        <div className="header-actions">
          <button
            onClick={() => setShowForm(!showForm)}
            className="btn btn-primary"
          >
            {showForm ? 'Cancel' : '+ Add Predefined'}
          </button>
          {activeExpenses.length > 0 && (
            <>
              <button
                onClick={() => handleApplyToMonth(selectedMonth)}
                className="btn btn-apply"
                disabled={applying}
              >
                {applying ? 'Applying...' : `Apply to ${selectedMonth}`}
              </button>
              <button
                onClick={handleApplyToAll}
                className="btn btn-apply-all"
                disabled={applying}
              >
                {applying ? 'Applying...' : 'Apply to All Months'}
              </button>
            </>
          )}
        </div>
      </div>

      {showForm && (
        <div className="predefined-form">
          <h3>{editingExpense ? 'Edit' : 'Add'} Predefined Expense</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  placeholder="e.g., Rent, Internet Bill"
                />
              </div>
              <div className="form-group">
                <label>Amount *</label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Type *</label>
                <select name="type" value={formData.type} onChange={handleChange} required>
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
              </div>
              <div className="form-group">
                <label>Category *</label>
                <select name="category" value={formData.category} onChange={handleChange} required>
                  <option value="Food">Food</option>
                  <option value="Transport">Transport</option>
                  <option value="Shopping">Shopping</option>
                  <option value="Bills">Bills</option>
                  <option value="Entertainment">Entertainment</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Education">Education</option>
                  <option value="Rent">Rent</option>
                  <option value="Loan">Loan</option>
                  <option value="RD">RD</option>
                  <option value="Emi -Arya">Emi -Arya</option>
                  <option value="Emi -Amma">Emi -Amma</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label>Day of Month</label>
                <input
                  type="number"
                  name="dayOfMonth"
                  value={formData.dayOfMonth}
                  onChange={handleChange}
                  min="1"
                  max="31"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="2"
                placeholder="Optional description"
              />
            </div>

            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                />
                Active (will be included when applying)
              </label>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                {editingExpense ? 'Update' : 'Create'}
              </button>
              <button type="button" onClick={resetForm} className="btn btn-secondary">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="loading">Loading predefined expenses...</div>
      ) : predefinedExpenses.length === 0 ? (
        <div className="empty-state">
          <p>No predefined expenses. Create one to apply it to multiple months!</p>
        </div>
      ) : (
        <div className="predefined-list">

          
          {predefinedExpenses.map((expense) => (
            <div
              key={expense._id || expense.id}
              className={`predefined-item ${!expense.isActive ? 'inactive' : ''}`}
              style={{ backgroundColor: expense.isApplied ? 'lightgreen' : 'white' }}
            >
              <div className="predefined-info">
                <div className="predefined-header">
                  <h4>{expense.title}</h4>
                  <span className={`amount ${expense.type}`}>
                    {expense.type === 'income' ? '+' : '-'}
                    {formatAmount(Math.abs(expense.amount))}
                  </span>
                </div>
                <div className="predefined-details">
                  <span className="category">{expense.category}</span>
                  <span className="day">Day {expense.dayOfMonth || 1}</span>
                  {!expense.isActive && <span className="inactive-badge">Inactive</span>}
                </div>
                {expense.description && (
                  <p className="description">{expense.description}</p>
                )}
              </div>
              <div className="predefined-actions">
                <button
                  onClick={() => handleApplyToMonth(selectedMonth, [expense._id || expense.id])}
                  className="btn-apply-item"
                  disabled={applying || !expense.isActive}
                  title="Apply to current month"
                >
                  Apply
                </button>
                <button
                  onClick={() => handleEdit(expense)}
                  className="btn-edit"
                  title="Edit"
                >
                  ✏️
                </button>
                <button
                  onClick={() => handleDelete(expense._id || expense.id)}
                  className="btn-delete"
                  title="Delete"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PredefinedExpenses;
import React from 'react';
import './ExpenseList.css';

const ExpenseList = ({ expenses, onDelete, onEdit }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (expenses.length === 0) {
    return (
      <div className="expense-list-container">
        <h2>Expenses</h2>
        <div className="empty-state">
          <p>No expenses for this month. Add one to get started!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="expense-list-container">
      <h2>Expenses ({expenses.length})</h2>
      <div className="expense-list">
        {expenses.map((expense) => {
          const expenseId = expense._id || expense.id;
          return (
            <div
              key={expenseId}
              className={`expense-item ${expense.type}`}
            >
              <div className="expense-info">
                <div className="expense-header">
                  <h3>{expense.title}</h3>
                  <span className={`amount ${expense.type}`}>
                    {expense.type === 'income' ? '+' : '-'}
                    {formatAmount(Math.abs(expense.amount))}
                  </span>
                </div>
                <div className="expense-details">
                  <span className="category">{expense.category}</span>
                  <span className="date">{formatDate(expense.date)}</span>
                </div>
              </div>
              <div className="expense-actions">
                <button
                  onClick={() => onEdit(expense)}
                  className="btn-edit"
                  title="Edit"
                >
                  ✏️
                </button>
                <button
                  onClick={() => onDelete(expenseId)}
                  className="btn-delete"
                  title="Delete"
                >
                  🗑️
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ExpenseList;


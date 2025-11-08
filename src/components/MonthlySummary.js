import React, { useMemo, useState, useEffect } from 'react';
import './MonthlySummary.css';

const MonthlySummary = ({ expenses, selectedMonth, salary, onSalaryUpdate }) => {
  const [salaryInput, setSalaryInput] = useState(salary || '');

  useEffect(() => {
    setSalaryInput(salary || '');
  }, [salary, selectedMonth]);

  const summary = useMemo(() => {
    const income = expenses
      .filter((exp) => exp.type === 'income')
      .reduce((sum, exp) => sum + exp.amount, 0);

    const expense = expenses
      .filter((exp) => exp.type === 'expense')
      .reduce((sum, exp) => sum + exp.amount, 0);

    const totalIncome = (salary || 0) + income;
    const balance = totalIncome - expense;

    return { income, expense, balance, totalIncome, salary: salary || 0 };
  }, [expenses, salary]);

  const handleSalaryChange = (e) => {
    const value = e.target.value;
    setSalaryInput(value);
  };

  const handleSalaryBlur = () => {
    const amount = parseFloat(salaryInput) || 0;
    onSalaryUpdate(selectedMonth, amount);
  };

  const handleSalaryKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.target.blur();
    }
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatMonth = (monthString) => {
    const [year, month] = monthString.split('-');
    const date = new Date(year, month - 1);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
  };

  return (
    <div className="monthly-summary-container">
      <div className="summary-header">
        <h2>Monthly Summary</h2>
        <p className="month-label">{formatMonth(selectedMonth)}</p>
      </div>
      
      <div className="salary-input-section">
        <div className="salary-label-wrapper">
          <span className="salary-icon">💵</span>
          <label htmlFor="salary-input">Monthly Salary</label>
        </div>
        <div className="salary-input-wrapper">
          <span className="currency-symbol">$</span>
          <input
            type="number"
            id="salary-input"
            className="salary-input"
            value={salaryInput}
            onChange={handleSalaryChange}
            onBlur={handleSalaryBlur}
            onKeyPress={handleSalaryKeyPress}
            placeholder="0.00"
            step="0.01"
            min="0"
          />
        </div>
      </div>

      <div className="summary-cards">
        <div className="summary-card salary">
          <div className="card-header">
            <div className="card-icon-wrapper salary-icon-bg">
              <span className="card-icon">💵</span>
            </div>
            <h3>Salary</h3>
          </div>
          <p className="amount">{formatAmount(summary.salary)}</p>
        </div>

        <div className="summary-card total-income">
          <div className="card-header">
            <div className="card-icon-wrapper income-icon-bg">
              <span className="card-icon">📊</span>
            </div>
            <h3>Total Income</h3>
          </div>
          <p className="amount">{formatAmount(summary.totalIncome)}</p>
        </div>

        <div className="summary-card expense">
          <div className="card-header">
            <div className="card-icon-wrapper expense-icon-bg">
              <span className="card-icon">💸</span>
            </div>
            <h3>Total Expenses</h3>
          </div>
          <p className="amount">{formatAmount(summary.expense)}</p>
        </div>

        <div className={`summary-card balance ${summary.balance >= 0 ? 'positive' : 'negative'}`}>
          <div className="card-header">
            <div className={`card-icon-wrapper ${summary.balance >= 0 ? 'balance-positive-bg' : 'balance-negative-bg'}`}>
              <span className="card-icon">{summary.balance >= 0 ? '✅' : '⚠️'}</span>
            </div>
            <h3>Balance</h3>
          </div>
          <p className="amount">{formatAmount(summary.balance)}</p>
        </div>
      </div>

      {summary.expense > 0 && (
        <div className="expense-breakdown">
          <div className="breakdown-header">
            <h3>Expense Breakdown by Category</h3>
            <span className="breakdown-count">{Object.keys(
              expenses
                .filter((exp) => exp.type === 'expense')
                .reduce((acc, exp) => {
                  acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
                  return acc;
                }, {})
            ).length} categories</span>
          </div>
          <div className="category-list">
            {Object.entries(
              expenses
                .filter((exp) => exp.type === 'expense')
                .reduce((acc, exp) => {
                  acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
                  return acc;
                }, {})
            )
              .sort((a, b) => b[1] - a[1])
              .map(([category, amount], index) => {
                const totalExpenses = summary.expense;
                const percentage = ((amount / totalExpenses) * 100).toFixed(1);
                return (
                  <div key={category} className="category-item">
                    <div className="category-info">
                      <span className="category-badge">{index + 1}</span>
                      <span className="category-name">{category}</span>
                    </div>
                    <div className="category-details">
                      <div className="category-percentage">{percentage}%</div>
                      <span className="category-amount">{formatAmount(amount)}</span>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
};

export default MonthlySummary;


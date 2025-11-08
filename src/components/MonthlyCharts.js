import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import './MonthlyCharts.css';

const MonthlyCharts = ({ expenses, selectedMonth }) => {
  const chartData = useMemo(() => {
    // Daily expense/income data
    const dailyData = expenses.reduce((acc, exp) => {
      const day = exp.date.split('-')[2];
      if (!acc[day]) {
        acc[day] = { day: parseInt(day), income: 0, expense: 0 };
      }
      if (exp.type === 'income') {
        acc[day].income += exp.amount;
      } else {
        acc[day].expense += exp.amount;
      }
      return acc;
    }, {});

    const dailyArray = Object.values(dailyData).sort((a, b) => a.day - b.day);

    // Category-wise pie chart data
    const categoryData = expenses
      .filter((exp) => exp.type === 'expense')
      .reduce((acc, exp) => {
        acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
        return acc;
      }, {});

    const pieData = Object.entries(categoryData).map(([name, value]) => ({
      name,
      value,
    }));

    return { dailyArray, pieData };
  }, [expenses]);

  const COLORS = [
    '#667eea',
    '#764ba2',
    '#f093fb',
    '#4facfe',
    '#00f2fe',
    '#43e97b',
    '#fa709a',
    '#fee140',
  ];

  const formatAmount = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(value);
  };

  if (expenses.length === 0) {
    return (
      <div className="monthly-charts-container">
        <h2>Monthly Charts</h2>
        <div className="empty-charts">
          <p>No data available for this month. Add expenses to see charts!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="monthly-charts-container">
      <h2>Monthly Charts</h2>
      <div className="charts-grid">
        {chartData.dailyArray.length > 0 && (
          <div className="chart-wrapper">
            <h3>Daily Income vs Expenses</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData.dailyArray}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" label={{ value: 'Day', position: 'insideBottom', offset: -5 }} />
                <YAxis label={{ value: 'Amount ($)', angle: -90, position: 'insideLeft' }} />
                <Tooltip formatter={formatAmount} />
                <Legend />
                <Bar dataKey="income" fill="#28a745" name="Income" />
                <Bar dataKey="expense" fill="#dc3545" name="Expense" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {chartData.pieData.length > 0 && (
          <div className="chart-wrapper">
            <h3>Expenses by Category</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData.pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={formatAmount} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};

export default MonthlyCharts;


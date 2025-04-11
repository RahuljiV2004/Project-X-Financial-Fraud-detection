import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { format } from 'date-fns';
import '../styles/CustomerDashboard.css';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const API_URL = 'http://localhost:5001/api';

const CustomerDashboard = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [totalBalance, setTotalBalance] = useState(0);
  const [recentTransactions, setRecentTransactions] = useState([]);

  useEffect(() => {
    if (user?.email) {
      fetchTransactions();
    } else {
      setLoading(false);
      setError('Please log in to view your dashboard');
    }
  }, [user?.email]);

  const fetchTransactions = async () => {
    try {
      const response = await fetch(`${API_URL}/transactions/history/${user.email}`, {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch transactions');
      }

      const data = await response.json();
      setTransactions(data);
      
      // Calculate total balance
      const balance = data.reduce((acc, curr) => {
        if (curr.transactionType === 'deposit') return acc + curr.amount;
        if (curr.transactionType === 'withdrawal') return acc - curr.amount;
        return acc;
      }, 0);
      setTotalBalance(balance);

      // Get recent transactions
      const recent = [...data]
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 5);
      setRecentTransactions(recent);
    } catch (err) {
      console.error('Error:', err);
      setError('Error fetching transaction data');
    } finally {
      setLoading(false);
    }
  };

  // Monthly Transaction Summary
  const monthlyData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Deposits',
        data: new Array(12).fill(0).map((_, month) => {
          return transactions
            .filter(t => 
              t.transactionType === 'deposit' && 
              new Date(t.timestamp).getMonth() === month
            )
            .reduce((sum, t) => sum + t.amount, 0);
        }),
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1
      },
      {
        label: 'Withdrawals',
        data: new Array(12).fill(0).map((_, month) => {
          return transactions
            .filter(t => 
              t.transactionType === 'withdrawal' && 
              new Date(t.timestamp).getMonth() === month
            )
            .reduce((sum, t) => sum + t.amount, 0);
        }),
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1
      }
    ]
  };

  // Transaction Type Distribution
  const transactionTypeData = {
    labels: ['Deposits', 'Withdrawals', 'Transfers'],
    datasets: [{
      data: [
        transactions.filter(t => t.transactionType === 'deposit').length,
        transactions.filter(t => t.transactionType === 'withdrawal').length,
        transactions.filter(t => t.transactionType === 'transfer').length
      ],
      backgroundColor: [
        'rgba(75, 192, 192, 0.8)',
        'rgba(255, 99, 132, 0.8)',
        'rgba(54, 162, 235, 0.8)'
      ],
      borderColor: [
        'rgba(75, 192, 192, 1)',
        'rgba(255, 99, 132, 1)',
        'rgba(54, 162, 235, 1)'
      ],
      borderWidth: 1
    }]
  };

  if (loading) return <div className="loading">Loading dashboard...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="customer-dashboard">
      <div className="dashboard-header">
        <h1>Welcome, {user?.name || 'Customer'}</h1>
        <div className="balance-card">
          <h2>Current Balance</h2>
          <p className="balance-amount">${totalBalance.toFixed(2)}</p>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="chart-container">
          <h2>Monthly Transaction Summary</h2>
          <Bar 
            data={monthlyData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'top',
                },
                title: {
                  display: true,
                  text: 'Monthly Deposits and Withdrawals'
                }
              },
              scales: {
                y: {
                  beginAtZero: true,
                  title: {
                    display: true,
                    text: 'Amount ($)'
                  }
                }
              }
            }}
          />
        </div>

        <div className="chart-container">
          <h2>Transaction Distribution</h2>
          <Doughnut 
            data={transactionTypeData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'bottom'
                }
              }
            }}
          />
        </div>

        <div className="recent-transactions">
          <h2>Recent Transactions</h2>
          <div className="transactions-list">
            {recentTransactions.map((transaction, index) => (
              <div key={index} className="transaction-item">
                <div className="transaction-type">
                  <span className={`type-badge ${transaction.transactionType}`}>
                    {transaction.transactionType}
                  </span>
                </div>
                <div className="transaction-amount">
                  ${transaction.amount.toFixed(2)}
                </div>
                <div className="transaction-date">
                  {format(new Date(transaction.timestamp), 'MMM dd, yyyy')}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard; 
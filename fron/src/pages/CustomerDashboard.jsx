import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import '../styles/customer.css';

const CustomerDashboard = () => {
  const { user, logout } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');

  useEffect(() => {
    // Simulate fetching transactions
    const fetchTransactions = async () => {
      try {
        // Mock data for demonstration
        const mockTransactions = [
          {
            id: 1,
            amount: 1500,
            type: 'UPI',
            status: 'Completed',
            timestamp: new Date().toISOString(),
            recipient: 'Merchant XYZ'
          },
          {
            id: 2,
            amount: 5000,
            type: 'Wallet',
            status: 'Pending',
            timestamp: new Date().toISOString(),
            recipient: 'Service ABC'
          }
        ];
        setTransactions(mockTransactions);
      } catch (error) {
        console.error('Error fetching transactions:', error);
        displayNotification('Error loading transactions');
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  const displayNotification = (message) => {
    setNotificationMessage(message);
    setShowNotification(true);
    setTimeout(() => {
      setShowNotification(false);
    }, 3000);
  };

  const handleLogout = () => {
    logout();
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="customer-dashboard">
      <header className="dashboard-header">
        <h1>Customer Dashboard</h1>
        <div className="user-info">
          <span>Welcome, {user.name}</span>
          <button onClick={handleLogout} className="btn btn-logout">
            Logout
          </button>
        </div>
      </header>

      <div className="dashboard-content">
        <div className="quick-actions">
          <Link to="/customer/transactions" className="action-card">
            <h3>Transaction History</h3>
            <p>View all your transactions</p>
          </Link>
          <Link to="/customer/settings" className="action-card">
            <h3>Settings</h3>
            <p>Manage your account settings</p>
          </Link>
        </div>

        <div className="recent-transactions">
          <h2>Recent Transactions</h2>
          <div className="transactions-list">
            {transactions.map(transaction => (
              <div key={transaction.id} className="transaction-card">
                <div className="transaction-info">
                  <h3>{transaction.recipient}</h3>
                  <p className="transaction-type">{transaction.type}</p>
                  <p className="transaction-amount">₹{transaction.amount}</p>
                </div>
                <div className="transaction-status">
                  <span className={`status-badge ${transaction.status.toLowerCase()}`}>
                    {transaction.status}
                  </span>
                  <p className="transaction-time">
                    {new Date(transaction.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showNotification && (
        <div className="notification">
          {notificationMessage}
        </div>
      )}
    </div>
  );
};

export default CustomerDashboard; 
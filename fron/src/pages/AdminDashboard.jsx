import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import '../styles/admin.css';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Simulate fetching transactions
    const fetchTransactions = async () => {
      try {
        // Mock data for demonstration
        const mockTransactions = [
          {
            id: 1,
            customerId: 'CUST001',
            amount: 1500,
            type: 'UPI',
            status: 'Suspicious',
            timestamp: new Date().toISOString(),
            location: 'Mumbai, India',
            deviceInfo: 'iPhone 12, iOS 15.4'
          },
          {
            id: 2,
            customerId: 'CUST002',
            amount: 5000,
            type: 'Wallet',
            status: 'Safe',
            timestamp: new Date().toISOString(),
            location: 'Delhi, India',
            deviceInfo: 'Samsung Galaxy S21, Android 12'
          }
        ];
        setTransactions(mockTransactions);
      } catch (error) {
        console.error('Error fetching transactions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  const handleTransactionClick = (transaction) => {
    setSelectedTransaction(transaction);
    setShowDetails(true);
  };

  const handleCloseDetails = () => {
    setShowDetails(false);
    setSelectedTransaction(null);
  };

  const handleLogout = () => {
    logout();
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="admin-dashboard">
      <header className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <div className="user-info">
          <span>Welcome, {user.name}</span>
          <button onClick={handleLogout} className="btn btn-logout">
            Logout
          </button>
        </div>
      </header>

      <div className="dashboard-content">
        <div className="stats-container">
          <div className="stat-card">
            <h3>Total Transactions</h3>
            <p className="stat-value">{transactions.length}</p>
          </div>
          <div className="stat-card">
            <h3>Suspicious Transactions</h3>
            <p className="stat-value warning">
              {transactions.filter(t => t.status === 'Suspicious').length}
            </p>
          </div>
          <div className="stat-card">
            <h3>Safe Transactions</h3>
            <p className="stat-value success">
              {transactions.filter(t => t.status === 'Safe').length}
            </p>
          </div>
        </div>

        <div className="transactions-table">
          <h2>Recent Transactions</h2>
          <table>
            <thead>
              <tr>
                <th>Customer ID</th>
                <th>Amount</th>
                <th>Type</th>
                <th>Status</th>
                <th>Timestamp</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map(transaction => (
                <tr key={transaction.id} className={transaction.status.toLowerCase()}>
                  <td>{transaction.customerId}</td>
                  <td>₹{transaction.amount}</td>
                  <td>{transaction.type}</td>
                  <td>
                    <span className={`status-badge ${transaction.status.toLowerCase()}`}>
                      {transaction.status}
                    </span>
                  </td>
                  <td>{new Date(transaction.timestamp).toLocaleString()}</td>
                  <td>
                    <button
                      onClick={() => handleTransactionClick(transaction)}
                      className="btn btn-view"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showDetails && selectedTransaction && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Transaction Details</h2>
            <div className="transaction-details">
              <p><strong>Customer ID:</strong> {selectedTransaction.customerId}</p>
              <p><strong>Amount:</strong> ₹{selectedTransaction.amount}</p>
              <p><strong>Type:</strong> {selectedTransaction.type}</p>
              <p><strong>Status:</strong> {selectedTransaction.status}</p>
              <p><strong>Location:</strong> {selectedTransaction.location}</p>
              <p><strong>Device Info:</strong> {selectedTransaction.deviceInfo}</p>
              <p><strong>Timestamp:</strong> {new Date(selectedTransaction.timestamp).toLocaleString()}</p>
            </div>
            <div className="modal-actions">
              <button onClick={handleCloseDetails} className="btn btn-close">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard; 
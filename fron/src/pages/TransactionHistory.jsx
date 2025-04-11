import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import NewTransactionForm from '../components/NewTransactionForm';
import '../styles/TransactionHistory.css';

const API_URL = 'http://localhost:5001/api';

const TransactionHistory = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showNewTransactionForm, setShowNewTransactionForm] = useState(false);
  const [sortField, setSortField] = useState('timestamp');
  const [sortOrder, setSortOrder] = useState('desc');

  const fetchTransactions = async () => {
    try {
      setError('');
      const response = await fetch(`${API_URL}/transactions/history/${user.email}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to fetch transactions');
      }

      const data = await response.json();
      setTransactions(data);
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setError(err.message || 'Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.email) {
      fetchTransactions();
    }
  }, [user?.email]);

  const handleSort = (field) => {
    if (field === sortField) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const sortedTransactions = [...transactions].sort((a, b) => {
    let comparison = 0;
    switch (sortField) {
      case 'amount':
        comparison = a.amount - b.amount;
        break;
      case 'timestamp':
        comparison = new Date(a.timestamp) - new Date(b.timestamp);
        break;
      default:
        comparison = String(a[sortField]).localeCompare(String(b[sortField]));
    }
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const handleTransactionComplete = (newTransaction) => {
    setTransactions(prev => [newTransaction, ...prev]);
    fetchTransactions(); // Refresh the list after new transaction
  };

  if (loading) return <div className="loading">Loading transactions...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="transaction-history">
      <div className="transaction-header">
        <h1>Transaction History</h1>
        <div className="transaction-controls">
          <div className="sort-buttons">
            <button
              onClick={() => handleSort('timestamp')}
              className={sortField === 'timestamp' ? 'active' : ''}
            >
              Date {sortField === 'timestamp' && (sortOrder === 'asc' ? '↑' : '↓')}
            </button>
            <button
              onClick={() => handleSort('amount')}
              className={sortField === 'amount' ? 'active' : ''}
            >
              Amount {sortField === 'amount' && (sortOrder === 'asc' ? '↑' : '↓')}
            </button>
            <button
              onClick={() => handleSort('transactionType')}
              className={sortField === 'transactionType' ? 'active' : ''}
            >
              Type {sortField === 'transactionType' && (sortOrder === 'asc' ? '↑' : '↓')}
            </button>
          </div>
          <button
            className="new-transaction-btn"
            onClick={() => setShowNewTransactionForm(true)}
          >
            New Transaction
          </button>
        </div>
      </div>

      {showNewTransactionForm && (
        <NewTransactionForm
          onClose={() => setShowNewTransactionForm(false)}
          onTransactionComplete={(newTransaction) => {
            handleTransactionComplete(newTransaction);
            setShowNewTransactionForm(false);
          }}
        />
      )}

      <div className="transactions-list">
        {sortedTransactions.length === 0 ? (
          <div className="no-transactions">No transactions found</div>
        ) : (
          sortedTransactions.map((transaction) => (
            <div key={transaction._id} className="transaction-item">
              <div className="transaction-info">
                <div className="transaction-type">
                  <span className={`type-badge ${transaction.transactionType}`}>
                    {transaction.transactionType}
                  </span>
                </div>
                <div className="transaction-details">
                  <div className="transaction-primary">
                    <span className="amount">
                      {transaction.amount.toLocaleString('en-US', {
                        style: 'currency',
                        currency: 'INR'
                      })}
                    </span>
                    <span className="date">
                      {new Date(transaction.timestamp).toLocaleDateString('en-US', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  <div className="transaction-secondary">
                    <span className="participant">
                      {transaction.senderEmail === user.email
                        ? `To: ${transaction.receiverEmail}`
                        : `From: ${transaction.senderEmail}`}
                    </span>
                    <span className="payment-method">{transaction.paymentMethod}</span>
                  </div>
                  {transaction.description && (
                    <div className="transaction-description">
                      {transaction.description}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TransactionHistory; 
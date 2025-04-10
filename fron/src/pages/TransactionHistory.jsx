import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import '../styles/transactions.css';

const TransactionHistory = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    type: 'all',
    status: 'all'
  });
  const [sortConfig, setSortConfig] = useState({
    key: 'timestamp',
    direction: 'desc'
  });

  // Simulate fetching transactions
  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      try {
        // Simulated API call with mock data
        const mockTransactions = [
          {
            id: '1',
            amount: 1500.00,
            type: 'transfer',
            status: 'completed',
            timestamp: '2024-03-15T10:30:00',
            recipient: 'John Doe',
            reference: 'INV-2024-001'
          },
          {
            id: '2',
            amount: 750.50,
            type: 'payment',
            status: 'pending',
            timestamp: '2024-03-14T15:45:00',
            recipient: 'Tech Store Ltd',
            reference: 'POS-2024-123'
          },
          {
            id: '3',
            amount: 2000.00,
            type: 'withdrawal',
            status: 'failed',
            timestamp: '2024-03-13T09:15:00',
            recipient: 'ATM-NYC-123',
            reference: 'WD-2024-789'
          },
          {
            id: '4',
            amount: 3000.00,
            type: 'deposit',
            status: 'completed',
            timestamp: '2024-03-12T14:20:00',
            recipient: 'Self',
            reference: 'DEP-2024-456'
          }
        ];

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        setTransactions(mockTransactions);
      } catch (error) {
        console.error('Error fetching transactions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const filteredAndSortedTransactions = React.useMemo(() => {
    let result = [...transactions];

    // Apply filters
    if (filters.type !== 'all') {
      result = result.filter(t => t.type === filters.type);
    }
    if (filters.status !== 'all') {
      result = result.filter(t => t.status === filters.status);
    }

    // Apply sorting
    result.sort((a, b) => {
      if (sortConfig.key === 'amount') {
        return sortConfig.direction === 'asc' 
          ? a.amount - b.amount 
          : b.amount - a.amount;
      }
      if (sortConfig.key === 'timestamp') {
        return sortConfig.direction === 'asc'
          ? new Date(a.timestamp) - new Date(b.timestamp)
          : new Date(b.timestamp) - new Date(a.timestamp);
      }
      return 0;
    });

    return result;
  }, [transactions, filters, sortConfig]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="transaction-history">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading transactions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="transaction-history">
      <h1>Transaction History</h1>
      
      <div className="filters">
        <div className="filter-group">
          <label htmlFor="type">Transaction Type:</label>
          <select
            id="type"
            name="type"
            value={filters.type}
            onChange={handleFilterChange}
          >
            <option value="all">All Types</option>
            <option value="transfer">Transfer</option>
            <option value="payment">Payment</option>
            <option value="withdrawal">Withdrawal</option>
            <option value="deposit">Deposit</option>
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="status">Status:</label>
          <select
            id="status"
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
          >
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </div>

      <div className="transactions-table-container">
        <table className="transactions-table">
          <thead>
            <tr>
              <th>Reference</th>
              <th onClick={() => handleSort('timestamp')} className="sortable">
                Date & Time
                {sortConfig.key === 'timestamp' && (
                  <span className={`sort-arrow ${sortConfig.direction}`}>
                    {sortConfig.direction === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </th>
              <th>Type</th>
              <th>Recipient</th>
              <th onClick={() => handleSort('amount')} className="sortable">
                Amount
                {sortConfig.key === 'amount' && (
                  <span className={`sort-arrow ${sortConfig.direction}`}>
                    {sortConfig.direction === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedTransactions.map(transaction => (
              <tr key={transaction.id}>
                <td>{transaction.reference}</td>
                <td>{formatDate(transaction.timestamp)}</td>
                <td className="type-cell">{transaction.type}</td>
                <td>{transaction.recipient}</td>
                <td className="amount-cell">{formatAmount(transaction.amount)}</td>
                <td>
                  <span className={`status-badge ${transaction.status}`}>
                    {transaction.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TransactionHistory; 
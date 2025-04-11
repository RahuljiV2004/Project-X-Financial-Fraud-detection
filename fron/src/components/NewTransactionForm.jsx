import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import '../styles/TransactionForm.css';

const API_URL = 'http://localhost:5001/api';

const NewTransactionForm = ({ onClose, onTransactionComplete }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    receiverEmail: '',
    amount: '',
    description: '',
    transactionType: 'transfer', // transfer, deposit, withdrawal
    paymentMethod: 'upi' // upi, card, netbanking
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/transactions/new`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          senderEmail: user.email,
          receiverEmail: formData.receiverEmail,
          amount: parseFloat(formData.amount),
          description: formData.description,
          transactionType: formData.transactionType,
          paymentMethod: formData.paymentMethod,
          timestamp: new Date().toISOString()
        }),
        credentials: 'include'
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create transaction');
      }

      onTransactionComplete(data);
      onClose();
    } catch (err) {
      console.error('Transaction error:', err);
      setError(err.message || 'Failed to create transaction');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="transaction-form-overlay">
      <div className="transaction-form-container">
        <h2>New Transaction</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="receiverEmail">Receiver's Email</label>
            <input
              type="email"
              id="receiverEmail"
              name="receiverEmail"
              value={formData.receiverEmail}
              onChange={handleChange}
              required
              placeholder="Enter receiver's email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="amount">Amount</label>
            <input
              type="number"
              id="amount"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
              placeholder="Enter amount"
            />
          </div>

          <div className="form-group">
            <label htmlFor="transactionType">Transaction Type</label>
            <select
              id="transactionType"
              name="transactionType"
              value={formData.transactionType}
              onChange={handleChange}
              required
            >
              <option value="transfer">Transfer</option>
              <option value="deposit">Deposit</option>
              <option value="withdrawal">Withdrawal</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="paymentMethod">Payment Method</label>
            <select
              id="paymentMethod"
              name="paymentMethod"
              value={formData.paymentMethod}
              onChange={handleChange}
              required
            >
              <option value="upi">UPI</option>
              <option value="card">Card</option>
              <option value="netbanking">Net Banking</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter transaction description"
              rows="3"
            />
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Processing...' : 'Submit Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewTransactionForm; 
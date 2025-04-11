import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';
import { format, subDays, parseISO, startOfDay, endOfDay } from 'date-fns';
import '../styles/CustomerDashboard.css';

const API_URL = 'http://localhost:5001/api';

const CustomerDashboard = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeRange, setTimeRange] = useState('month'); // week, month, year

  const fetchTransactions = async () => {
    try {
      if (!user?.email) {
        setError('User email not available');
        setLoading(false);
        return;
      }
      
      const res = await fetch(`${API_URL}/transactions/history/${user.email}`);
      if (!res.ok) throw new Error('Failed to fetch transactions');
      const data = await res.json();
      setTransactions(data);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Error fetching transactions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.email) fetchTransactions();
    else setLoading(false);
  }, [user?.email]);

  // Prepare data for type chart
  const prepareChartData = () => {
    const totals = {
      transfer: 0,
      deposit: 0,
      withdrawal: 0
    };

    transactions.forEach(txn => {
      if (totals[txn.transactionType] !== undefined) {
        totals[txn.transactionType] += txn.amount;
      }
    });

    return [
      { name: 'Transfer', amount: totals.transfer },
      { name: 'Deposit', amount: totals.deposit },
      { name: 'Withdrawal', amount: totals.withdrawal }
    ];
  };

  // Prepare time-based transaction data
  const prepareTimeChartData = () => {
    // Determine date range based on selected timeRange
    let days;
    switch(timeRange) {
      case 'week':
        days = 7;
        break;
      case 'year':
        days = 365;
        break;
      case 'month':
      default:
        days = 30;
    }

    // Create an array of the last 'days' days
    const dateArray = Array.from({ length: days }, (_, i) => {
      const date = subDays(new Date(), days - i - 1);
      return {
        date,
        dateStr: format(date, 'yyyy-MM-dd'),
        deposit: 0,
        withdrawal: 0,
        transfer: 0,
        formattedDate: format(date, timeRange === 'year' ? 'MMM' : 'dd MMM')
      };
    });

    // Create a lookup object for faster access
    const dateLookup = {};
    dateArray.forEach(d => {
      dateLookup[d.dateStr] = d;
    });

    // Fill in the transaction amounts for each day
    transactions.forEach(txn => {
      const txnDate = startOfDay(parseISO(txn.timestamp));
      const dateStr = format(txnDate, 'yyyy-MM-dd');
      
      // Only include transactions within our date range
      if (dateLookup[dateStr]) {
        dateLookup[dateStr][txn.transactionType] += txn.amount;
      }
    });

    // For year view, aggregate by month
    if (timeRange === 'year') {
      const monthlyData = {};
      dateArray.forEach(d => {
        const month = format(d.date, 'MMM');
        if (!monthlyData[month]) {
          monthlyData[month] = {
            formattedDate: month,
            deposit: 0,
            withdrawal: 0,
            transfer: 0
          };
        }
        monthlyData[month].deposit += d.deposit;
        monthlyData[month].withdrawal += d.withdrawal;
        monthlyData[month].transfer += d.transfer;
      });
      return Object.values(monthlyData);
    }

    return dateArray;
  };

  // Calculate total balance
  const calculateBalance = () => {
    return transactions.reduce((acc, curr) => {
      if (curr.senderEmail === user.email) {
        return acc - curr.amount;
      } else if (curr.receiverEmail === user.email) {
        return acc + curr.amount;
      }
      return acc;
    }, 0);
  };

  // Get recent transactions
  const getRecentTransactions = () => {
    return [...transactions]
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 5);
  };

  if (loading) return <div className="loading">Loading dashboard...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (transactions.length === 0) return <div className="no-data">No transactions found</div>;

  const chartData = prepareChartData();
  const timeChartData = prepareTimeChartData();
  const balance = calculateBalance();
  const recentTransactions = getRecentTransactions();

  return (
    <div className="dashboard-container">
      <h2>Customer Dashboard</h2>
      
      <div className="balance-card">
        <h3>Current Balance</h3>
        <p className="balance-amount">${balance.toFixed(2)}</p>
      </div>
      
      <div className="dashboard-grid">
        <div className="chart-section">
          <h3>Transaction Summary</h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                <Legend />
                <Bar dataKey="amount" name="Amount" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="chart-section">
          <div className="chart-header">
            <h3>Transactions Over Time</h3>
            <div className="time-range-selector">
            <button
  style={{
    padding: '8px 16px',
    marginRight: '8px',
    borderRadius: '6px',
    border: '1px solid #ccc',
    backgroundColor: timeRange === 'week' ? '#007bff' : '#f8f9fa',
    color: timeRange === 'week' ? '#fff' : '#333',
    cursor: 'pointer',
  }}
  onClick={() => setTimeRange('week')}
>
  Week
</button>

<button
  style={{
    padding: '8px 16px',
    marginRight: '8px',
    borderRadius: '6px',
    border: '1px solid #ccc',
    backgroundColor: timeRange === 'month' ? '#007bff' : '#f8f9fa',
    color: timeRange === 'month' ? '#fff' : '#333',
    cursor: 'pointer',
  }}
  onClick={() => setTimeRange('month')}
>
  Month
</button>

<button
  style={{
    padding: '8px 16px',
    borderRadius: '6px',
    border: '1px solid #ccc',
    backgroundColor: timeRange === 'year' ? '#007bff' : '#f8f9fa',
    color: timeRange === 'year' ? '#fff' : '#333',
    cursor: 'pointer',
  }}
  onClick={() => setTimeRange('year')}
>
  Year
</button>

            </div>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={timeChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="formattedDate" />
                <YAxis />
                <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="deposit" 
                  name="Deposits" 
                  stackId="1" 
                  stroke="#00b894" 
                  fill="#00b894" 
                  fillOpacity={0.6} 
                />
                <Area 
                  type="monotone" 
                  dataKey="withdrawal" 
                  name="Withdrawals" 
                  stackId="1" 
                  stroke="#e17055" 
                  fill="#e17055" 
                  fillOpacity={0.6} 
                />
                <Area 
                  type="monotone" 
                  dataKey="transfer" 
                  name="Transfers" 
                  stackId="1" 
                  stroke="#6c5ce7" 
                  fill="#6c5ce7" 
                  fillOpacity={0.6} 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      <div className="recent-transactions">
        <h3>Recent Transactions</h3>
        {recentTransactions.map((txn, index) => (
          <div key={index} className="transaction-item">
            <div className="transaction-info">
              <span className={`type-badge ${txn.transactionType}`}>
                {txn.transactionType}
              </span>
              <span className="transaction-date">
                {format(new Date(txn.timestamp), 'MMM dd, yyyy')}
              </span>
            </div>
            <div className="transaction-amount">
              ${txn.amount.toFixed(2)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CustomerDashboard;
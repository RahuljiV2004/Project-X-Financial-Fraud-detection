import React, { useState, useEffect } from 'react';
import '../styles/dashboard.css';

const FraudDetectionDashboard = ({ modelType }) => {
  const [metrics, setMetrics] = useState({
    totalTransactions: 0,
    fraudulentTransactions: 0,
    alertLevel: 'low',
    accuracy: 0
  });

  const [recentAlerts, setRecentAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching dashboard data
    const fetchDashboardData = async () => {
      try {
        // In a real application, this would be an API call
        // Simulating API response with mock data
        const mockMetrics = {
          totalTransactions: Math.floor(Math.random() * 1000),
          fraudulentTransactions: Math.floor(Math.random() * 50),
          alertLevel: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
          accuracy: (85 + Math.random() * 10).toFixed(2)
        };

        const mockAlerts = Array(5).fill(null).map((_, index) => ({
          id: index + 1,
          timestamp: new Date(Date.now() - Math.random() * 86400000).toISOString(),
          type: ['suspicious_pattern', 'unusual_amount', 'location_mismatch'][Math.floor(Math.random() * 3)],
          severity: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
          description: `Potential fraud detected in ${modelType} transaction`
        }));

        setMetrics(mockMetrics);
        setRecentAlerts(mockAlerts);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [modelType]);

  const getAlertLevelColor = (level) => {
    const colors = {
      low: '#10B981',
      medium: '#F59E0B',
      high: '#EF4444'
    };
    return colors[level] || colors.low;
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner" />
        <p>Loading dashboard data...</p>
      </div>
    );
  }

  return (
    <div className="fraud-dashboard">
      <div className="dashboard-header">
        <h1>{modelType} Fraud Detection</h1>
        <div className="alert-level" style={{ backgroundColor: getAlertLevelColor(metrics.alertLevel) }}>
          {metrics.alertLevel.toUpperCase()} ALERT LEVEL
        </div>
      </div>

      <div className="metrics-grid">
        <div className="metric-card">
          <h3>Total Transactions</h3>
          <p className="metric-value">{metrics.totalTransactions.toLocaleString()}</p>
        </div>
        <div className="metric-card">
          <h3>Fraudulent Transactions</h3>
          <p className="metric-value">{metrics.fraudulentTransactions.toLocaleString()}</p>
        </div>
        <div className="metric-card">
          <h3>Fraud Rate</h3>
          <p className="metric-value">
            {((metrics.fraudulentTransactions / metrics.totalTransactions) * 100).toFixed(2)}%
          </p>
        </div>
        <div className="metric-card">
          <h3>Model Accuracy</h3>
          <p className="metric-value">{metrics.accuracy}%</p>
        </div>
      </div>

      <div className="recent-alerts">
        <h2>Recent Alerts</h2>
        <div className="alerts-list">
          {recentAlerts.map(alert => (
            <div key={alert.id} className={`alert-item ${alert.severity}`}>
              <div className="alert-header">
                <span className="alert-type">{alert.type.replace('_', ' ').toUpperCase()}</span>
                <span className="alert-time">
                  {new Date(alert.timestamp).toLocaleString()}
                </span>
              </div>
              <p className="alert-description">{alert.description}</p>
              <div className="alert-severity">
                Severity: <span className={`severity-badge ${alert.severity}`}>
                  {alert.severity.toUpperCase()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="action-buttons">
        <button className="btn btn-primary">View Detailed Report</button>
        <button className="btn btn-secondary">Configure Alerts</button>
      </div>
    </div>
  );
};

export default FraudDetectionDashboard; 
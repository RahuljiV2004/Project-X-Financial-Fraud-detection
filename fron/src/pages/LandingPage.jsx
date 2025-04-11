import React from 'react';
import { Link } from 'react-router-dom';
import ChatBot from '../components/ChatBot';
import '../styles/landing.css';

const LandingPage = () => {
  return (
    <div className="landing-page">
      <header className="landing-header">
        <h1>Fraud Detection System</h1>
        <p>Secure and efficient transaction monitoring</p>
      </header>

      <main className="landing-content">
        <div className="features">
          <div className="feature-card">
            <h2>Real-time Monitoring</h2>
            <p>Track and analyze transactions in real-time</p>
          </div>
          <div className="feature-card">
            <h2>Advanced Analytics</h2>
            <p>Get detailed insights into transaction patterns</p>
          </div>
          <div className="feature-card">
            <h2>Secure Access</h2>
            <p>Role-based access control for enhanced security</p>
          </div>
        </div>

        <div className="cta-section">
          <h2>Get Started</h2>
          <p>Choose your role to continue</p>
          <div className="cta-buttons">
            <Link to="/login" className="btn btn-primary">
              Admin Login
            </Link>
            <Link to="/login" className="btn btn-secondary">
              Customer Login
            </Link>
          </div>
        </div>
      </main>

      <footer className="landing-footer">
        <p>&copy; 2024 Fraud Detection System. All rights reserved.</p>
      </footer>

      <ChatBot />
    </div>
  );
};

export default LandingPage;
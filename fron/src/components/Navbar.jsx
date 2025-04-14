import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [showFeatures, setShowFeatures] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const features = [
    { id: 'card', name: 'Risk Scoring', path: 'https://riskscore-jtrbvtvpmmvvburecvvnuu.streamlit.app/' },
    { id: 'upi', name: 'Fraud Detection', path: 'https://transactionanalysis-e7e4cex9qeg6rvchcrrqtd.streamlit.app/' },
    { id: 'mobile', name: 'Money Laundering', path: 'https://moneylaundering-dwqgmrw4b7mwxaznp9g7mp.streamlit.app/' },
    { id: 'account', name: 'UPI Fraud Detection', path: '/dashboard/account' }
  ];

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <span className="brand-text">FraudET</span>
        </Link>

        {user ? (
          <div className="navbar-links">
            <div className="feature-dropdown">
              <button 
                className="feature-btn"
                onClick={() => setShowFeatures(!showFeatures)}
              >
                Features
                <span className={`arrow ${showFeatures ? 'up' : 'down'}`} />
              </button>
              {showFeatures && (
                <div className="feature-menu">
                  {features.map(feature => (
                    <Link
                      key={feature.id}
                      to={feature.path}
                      className="feature-item"
                      onClick={() => setShowFeatures(false)}
                    >
                      {feature.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
            
            <Link 
              to={user.role === 'admin' ? '/admin/transactions' : '/dashboard/transactions'} 
              className={`nav-link ${location.pathname.includes('/transactions') ? 'active' : ''}`}
            >
              Transactions
            </Link>
            
            <Link 
              to={user.role === 'admin' ? '/admin/settings' : '/dashboard/settings'}
              className={`nav-link ${location.pathname.includes('/settings') ? 'active' : ''}`}
            >
              Settings
            </Link>
            
            <button onClick={handleLogout} className="logout-btn">
              Logout
            </button>
          </div>
        ) : (
          <div className="navbar-links">
            <Link to="/login" className={`nav-link ${location.pathname === '/login' ? 'active' : ''}`}>
              Login
            </Link>
            <Link to="/register" className={`nav-link ${location.pathname === '/register' ? 'active' : ''}`}>
              Register
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar; 
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import '../styles/settings.css';

const Settings = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState({
    notifications: true,
    emailAlerts: true,
    twoFactorAuth: false,
    language: 'english',
    theme: 'dark'
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [message, setMessage] = useState({ text: '', type: '' });

  const handleSettingChange = (setting) => {
    setSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  const handleSelectChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveSettings = () => {
    // Simulate saving settings
    setTimeout(() => {
      setMessage({ text: 'Settings saved successfully!', type: 'success' });
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    }, 500);
  };

  const handleChangePassword = (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage({ text: 'New passwords do not match!', type: 'error' });
      return;
    }
    // Simulate password change
    setTimeout(() => {
      setMessage({ text: 'Password changed successfully!', type: 'success' });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    }, 500);
  };

  return (
    <div className="settings-page">
      <h1>Settings</h1>
      
      <section className="settings-section">
        <h2>Account Settings</h2>
        <div className="settings-grid">
          <div className="setting-item">
            <div className="setting-info">
              <h3>Email</h3>
              <p>{user?.email}</p>
            </div>
            <button className="btn-secondary">Verify Email</button>
          </div>
          <div className="setting-item">
            <div className="setting-info">
              <h3>Account Type</h3>
              <p>{user?.role}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="settings-section">
        <h2>Preferences</h2>
        <div className="settings-grid">
          <div className="setting-item">
            <div className="setting-info">
              <h3>Push Notifications</h3>
              <p>Receive push notifications for important updates</p>
            </div>
            <label className="switch">
              <input
                type="checkbox"
                checked={settings.notifications}
                onChange={() => handleSettingChange('notifications')}
              />
              <span className="slider"></span>
            </label>
          </div>
          <div className="setting-item">
            <div className="setting-info">
              <h3>Email Alerts</h3>
              <p>Receive email notifications for account activity</p>
            </div>
            <label className="switch">
              <input
                type="checkbox"
                checked={settings.emailAlerts}
                onChange={() => handleSettingChange('emailAlerts')}
              />
              <span className="slider"></span>
            </label>
          </div>
          <div className="setting-item">
            <div className="setting-info">
              <h3>Two-Factor Authentication</h3>
              <p>Add an extra layer of security to your account</p>
            </div>
            <label className="switch">
              <input
                type="checkbox"
                checked={settings.twoFactorAuth}
                onChange={() => handleSettingChange('twoFactorAuth')}
              />
              <span className="slider"></span>
            </label>
          </div>
        </div>
        <div className="settings-actions">
          <button className="btn-primary" onClick={handleSaveSettings}>
            Save Changes
          </button>
        </div>
      </section>

      <section className="settings-section">
        <h2>Security</h2>
        <form className="password-form" onSubmit={handleChangePassword}>
          <div className="form-group">
            <label>Current Password</label>
            <input
              type="password"
              name="currentPassword"
              value={passwordForm.currentPassword}
              onChange={handlePasswordChange}
              required
            />
          </div>
          <div className="form-group">
            <label>New Password</label>
            <input
              type="password"
              name="newPassword"
              value={passwordForm.newPassword}
              onChange={handlePasswordChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Confirm New Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={passwordForm.confirmPassword}
              onChange={handlePasswordChange}
              required
            />
          </div>
          <button type="submit" className="btn-primary">
            Change Password
          </button>
        </form>
      </section>

      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}
    </div>
  );
};

export default Settings; 
import React, { useState } from 'react';
import {
  User,
  Lock,
  Bell,
  Monitor,
  ChevronRight,
  Save,
  Shield,
  Mail,
  Smartphone,
  Eye,
  Type,
  Moon,
  Sun,
  Layout
} from 'lucide-react';
import './Settings.css';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [toggles, setToggles] = useState({
    twoFactor: false,
    emailNewPatient: true,
    emailAlerts: true,
    emailWeekly: false,
    pushMention: true,
    pushAnalysis: true,
    highContrast: false
  });
  const [density, setDensity] = useState('standard');

  const handleToggle = (key) => {
    setToggles(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const tabs = [
    { id: 'profile', icon: <User size={18} />, label: 'My Profile' },
    { id: 'security', icon: <Lock size={18} />, label: 'Security & Login' },
    { id: 'notifications', icon: <Bell size={18} />, label: 'Notifications' },
    { id: 'accessibility', icon: <Monitor size={18} />, label: 'Display & Accessibility' }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="tab-content">
            <div className="content-header">
              <h2>Public Profile</h2>
              <p>This information will be displayed to other staff members.</p>
            </div>

            <div className="profile-content-body">
              <div className="profile-avatar-column">
                <div className="avatar-placeholder"></div>
              </div>

              <div className="profile-form-column">
                <div className="settings-form-grid">
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input type="text" className="form-input" defaultValue="Dr. Sarah Smith" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Role / Title</label>
                    <input type="text" className="form-input" defaultValue="Lead Wound Specialist" />
                  </div>
                  <div className="form-group full-width">
                    <label className="form-label">Bio</label>
                    <textarea className="form-textarea" placeholder=""></textarea>
                  </div>
                </div>
              </div>
            </div>

            <div className="save-changes-footer">
              <button className="save-btn">Save Changes</button>
            </div>
          </div>
        );

      case 'security':
        return (
          <div className="tab-content">
            <div className="content-header security-flex-header">
              <div className="security-icon-box">
                <Shield size={24} />
              </div>
              <div className="header-text">
                <h2>Password & Authentication</h2>
                <p>Manage your login credentials and security level.</p>
              </div>
            </div>

            <div className="settings-form-grid">
              <div className="form-group full-width">
                <label className="form-label">Current Password</label>
                <input type="password" title="current password" placeholder="••••••••" className="form-input" />
              </div>
              <div className="form-group">
                <label className="form-label">New Password</label>
                <input type="password" title="new password" placeholder="••••••••" className="form-input" />
              </div>
              <div className="form-group">
                <label className="form-label">Confirm Password</label>
                <input type="password" title="confirm password" placeholder="••••••••" className="form-input" />
              </div>
            </div>

            <button className="update-password-btn">Update Password</button>

            <div className="security-divider"></div>

            <div className="setting-item-row two-fa-section">
              <div className="setting-info">
                <span className="setting-title">Two-Factor Authentication</span>
                <span className="setting-subtitle">Secure your account with 2FA.</span>
              </div>
              <div
                className={`toggle-switch ${toggles.twoFactor ? 'active' : ''}`}
                onClick={() => handleToggle('twoFactor')}
              >
                <div className="toggle-knob"></div>
              </div>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="tab-content">
            <div className="content-header">
              <h2>Notification Preferences</h2>
              <p>Choose how and when you want to be notified.</p>
            </div>

            <div className="notification-section">
              <div className="section-subtitle-row">
                <Mail size={16} className="section-subtitle-icon" />
                <span className="section-subtitle-text">EMAIL NOTIFICATIONS</span>
              </div>

              <div className="setting-item-row">
                <div className="setting-info">
                  <span className="setting-title">New patient assigned to me</span>
                </div>
                <div
                  className={`toggle-switch ${toggles.emailNewPatient ? 'active' : ''}`}
                  onClick={() => handleToggle('emailNewPatient')}
                >
                  <div className="toggle-knob"></div>
                </div>
              </div>

              <div className="setting-item-row">
                <div className="setting-info">
                  <span className="setting-title">Critical wound deterioration alerts</span>
                </div>
                <div
                  className={`toggle-switch ${toggles.emailAlerts ? 'active' : ''}`}
                  onClick={() => handleToggle('emailAlerts')}
                >
                  <div className="toggle-knob"></div>
                </div>
              </div>

              <div className="setting-item-row">
                <div className="setting-info">
                  <span className="setting-title">Weekly department summaries</span>
                </div>
                <div
                  className={`toggle-switch ${toggles.emailWeekly ? 'active' : ''}`}
                  onClick={() => handleToggle('emailWeekly')}
                >
                  <div className="toggle-knob"></div>
                </div>
              </div>
            </div>

            <div className="notification-divider"></div>

            <div className="notification-section push">
              <div className="section-subtitle-row">
                <Smartphone size={16} className="section-subtitle-icon" />
                <span className="section-subtitle-text">PUSH NOTIFICATIONS</span>
              </div>

              <div className="setting-item-row">
                <div className="setting-info">
                  <span className="setting-title">Mentioned in clinical notes</span>
                </div>
                <div
                  className={`toggle-switch ${toggles.pushMention ? 'active' : ''}`}
                  onClick={() => handleToggle('pushMention')}
                >
                  <div className="toggle-knob"></div>
                </div>
              </div>

              <div className="setting-item-row">
                <div className="setting-info">
                  <span className="setting-title">AI analysis completed</span>
                </div>
                <div
                  className={`toggle-switch ${toggles.pushAnalysis ? 'active' : ''}`}
                  onClick={() => handleToggle('pushAnalysis')}
                >
                  <div className="toggle-knob"></div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'accessibility':
        return (
          <div className="tab-content">
            <div className="content-header">
              <h2>Display & Accessibility</h2>
              <p>Customize the interface to your visual needs.</p>
            </div>

            <div className="accessibility-section">
              <span className="form-label">Interface Density</span>
              <div className="density-options">
                <div
                  className={`density-card ${density === 'standard' ? 'active' : ''}`}
                  onClick={() => setDensity('standard')}
                >
                  <div className="density-name">Standard</div>
                  <div className="density-desc">Default spacing</div>
                </div>
                <div
                  className={`density-card ${density === 'compact' ? 'active' : ''}`}
                  onClick={() => setDensity('compact')}
                >
                  <div className="density-name">Compact</div>
                  <div className="density-desc">More data on screen</div>
                </div>
                <div
                  className={`density-card ${density === 'comfortable' ? 'active' : ''}`}
                  onClick={() => setDensity('comfortable')}
                >
                  <div className="density-name">Comfortable</div>
                  <div className="density-desc">Larger touch targets</div>
                </div>
              </div>
            </div>

            <div className="accessibility-section" style={{ marginTop: '32px' }}>
              <span className="form-label">Theme</span>
              <div className="theme-options">
                <div className="theme-option active">Light Mode</div>
                <div className="theme-option disabled">Dark Mode (Coming Soon)</div>
                <div className="theme-option">System Sync</div>
              </div>
            </div>

            <div className="setting-item-row" style={{ marginTop: '32px', paddingTop: '32px', borderTop: '1px solid #F1F5F9' }}>
              <div className="setting-info">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="setting-title">High Contrast Mode</span>
                </div>
                <span className="setting-subtitle">Increases visibility of borders and text.</span>
              </div>
              <div
                className={`toggle-switch ${toggles.highContrast ? 'active' : ''}`}
                onClick={() => handleToggle('highContrast')}
              >
                <div className="toggle-knob"></div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="settings-container">
      <div className="settings-header">
        <h1>Settings</h1>
        <p>Manage your account preferences and application settings.</p>
      </div>

      <div className="settings-layout">
        <div className="settings-tabs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <div className="tab-btn-left">
                {tab.icon}
                <span>{tab.label}</span>
              </div>
              <ChevronRight size={14} style={{ opacity: activeTab === tab.id ? 1 : 0 }} />
            </button>
          ))}
        </div>

        <div className="settings-content-card">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default Settings;

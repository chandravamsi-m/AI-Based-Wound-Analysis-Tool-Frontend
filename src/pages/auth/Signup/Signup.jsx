import React, { useState } from 'react';
import { User, Mail, Lock, Phone, MapPin, Calendar, Activity, ChevronRight, ChevronLeft, CheckCircle, Eye, EyeOff } from 'lucide-react';
import apiClient from '../../../services/apiClient';
import logo from '../../../assets/logo.svg';
import './Signup.css';

function Signup({ onBack }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError(null);
  };

  const validateForm = () => {
    if (!formData.name.trim()) return "Full name is required.";
    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) return "Please enter a valid email address.";
    if (formData.password.length < 8) return "Password must be at least 8 characters long.";
    if (formData.password !== formData.confirmPassword) return "Passwords do not match.";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await apiClient.post('/auth/signup/', {
        name: formData.name,
        email: formData.email,
        password: formData.password
      });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="signup-container">
        <div className="signup-card success-card">
          <div className="success-icon-wrapper">
            <CheckCircle size={64} color="#10b981" />
          </div>
          <h2>Account Created!</h2>
          <p>Your account has been created successfully.</p>
          <p className="success-hint">Please sign in to complete your clinical profile and request a specialist.</p>
          <button className="btn-primary full-width" onClick={onBack}>
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="signup-container">
      <div className="signup-header">
        <img src={logo} alt="Logo" className="signup-logo" />
        <div className="signup-brand">
          <h1 className="signup-brand-title">Wound Care Portal</h1>
          <p className="signup-brand-subtitle">Patient Registration</p>
        </div>
      </div>

      <div className="signup-card">
        <div className="signup-banner">
          <Activity size={24} color="#2563eb" />
          <span>Patient Registration</span>
        </div>

        <h2 className="signup-title">Create Your Account</h2>
        <p className="signup-subtitle">
          Join our clinical network to receive personalized wound care and monitoring.
        </p>

        {error && <div className="signup-error-msg">{error}</div>}

        <form onSubmit={handleSubmit} className="signup-form">
          <div className="form-section">
            <div className="form-group">
              <label htmlFor="name"><User size={16} /> Full Name</label>
              <input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. John Doe"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email"><Mail size={16} /> Email Address</label>
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="name@example.com"
                required
              />
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="password"><Lock size={16} /> Password</label>
                <div className="password-input-wrapper">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="confirmPassword"><Lock size={16} /> Confirm</label>
                <div className="password-input-wrapper">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="signup-footer">
            <button type="submit" className="btn-primary full-width" disabled={loading}>
              {loading ? (
                <>
                  <div className="spinner"></div> Creating Account...
                </>
              ) : (
                <>
                  Get Started <ChevronRight size={18} />
                </>
              )}
            </button>
          </div>
        </form>

        <div className="signup-auth-link">
          Already have an account? <a href="#" onClick={(e) => { e.preventDefault(); onBack(); }}>Sign In</a>
        </div>
      </div>
    </div>
  );
}

export default Signup;

import { useState, useEffect } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import './Login.css';
import logo from '../../../assets/logo.svg';
import lockIcon from '../../../assets/lock-icon.svg';
import authService from '../../../services/authService';

function Login({ onLoginSuccess }) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Load saved email if Remember Me was checked previously
  useEffect(() => {
    const savedEmail = localStorage.getItem('rememberedEmail');
    if (savedEmail) {
      setFormData(prev => ({
        ...prev,
        email: savedEmail,
        rememberMe: true
      }));
    }
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Use authService for JWT-based login
      const user = await authService.login(
        formData.email,
        formData.password,
        formData.rememberMe
      );

      // Call success callback
      onLoginSuccess(user);
    } catch (err) {
      setError(err.message || 'Unable to connect to server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-screen">
      <div className="login-header">
        <img src={logo} alt="Logo" className="login-logo" />
        <div className="login-brand">
          <h1 className="login-brand-title">Wound Assessment Tool</h1>
          <p className="login-brand-subtitle">Hospital - Grade Diagnostics</p>
        </div>
      </div>

      <div className="login-card">
        <div className="login-icon-wrapper">
          <img src={lockIcon} alt="Lock" className="login-icon" />
        </div>

        <h2 className="login-title">Welcome Back</h2>
        <p className="login-subtitle">Please Sign In To Access Secure Patient Records</p>

        {error && (
          <div className="login-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="login-form-group">
            <label className="login-label">Email Or Hospital ID</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="login-input"
              required
              autoFocus
            />
          </div>

          <div className="login-form-group">
            <label className="login-label">Password</label>
            <div className="login-password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="login-input"
                required
              />
              <button
                type="button"
                className="login-password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="login-options">
            <label className="login-remember">
              <input
                type="checkbox"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
              />
              <span>Remember Me</span>
            </label>
            <a href="#" className="login-forgot">Forgot Password?</a>
          </div>

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;

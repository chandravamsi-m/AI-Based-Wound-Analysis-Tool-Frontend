import React, { useState, useEffect } from 'react';
import { User, Phone, MapPin, Calendar, Activity, ChevronRight, ChevronLeft, CheckCircle, Stethoscope, LogOut } from 'lucide-react';
import apiClient from '../../../services/apiClient';
import logo from '../../../assets/logo.svg';
import './PatientOnboarding.css';

function PatientOnboarding({ onComplete, onSignOut }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    age: '',
    gender: '',
    date_of_birth: '',
    contact_number: '',
    address: '',
    problem_description: '',
    specialty_requested: ''
  });

  const specialists = [
    { id: 'cardiologist', name: 'Cardiologist', icon: <Activity size={20} /> },
    { id: 'neurologist', name: 'Neurologist', icon: <Activity size={20} /> },
    { id: 'dermatologist', name: 'Dermatologist', icon: <Stethoscope size={20} /> },
    { id: 'orthopedic', name: 'Orthopedic Surgeon', icon: <Stethoscope size={20} /> },
    { id: 'wound_care', name: 'Wound Care Specialist', icon: <Activity size={20} /> },
    { id: 'general', name: 'General Physician', icon: <User size={20} /> }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError(null);
  };

  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => prev - 1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await apiClient.post('/auth/onboarding/', formData);
      onComplete();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="onboarding-container">
      <div className="onboarding-header">
        <div className="onboarding-header-left">
          <img src={logo} alt="Logo" className="onboarding-logo" />
          <div className="onboarding-brand">
            <h1 className="onboarding-brand-title">Complete Your Profile</h1>
            <p className="onboarding-brand-subtitle">Let's personalize your care experience</p>
          </div>
        </div>
        <button className="btn-signout-onboarding" onClick={onSignOut}>
          <LogOut size={18} /> Sign Out
        </button>
      </div>

      <div className="onboarding-card">
        <div className="onboarding-progress">
          <div className="progress-text">Step {step} of 3: {step === 1 ? 'Personal Details' : (step === 2 ? 'Clinical Context' : 'Specialist Selection')}</div>
          <div className="progress-bar-container">
            <div className="progress-bar" style={{ width: `${(step / 3) * 100}%` }}></div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="onboarding-form">
          {step === 1 && (
            <div className="ob-content fade-in">
              <div className="ob-section-header">
                <div className="ob-icon-circle"><User size={24} color="#2563eb" /></div>
                <div>
                  <h2>Personal Details</h2>
                  <p>Basic information to help us identify you correctly.</p>
                </div>
              </div>

              <div className="ob-section-body">
                <div className="ob-grid">
                  <div className="ob-group">
                    <label>Age</label>
                    <input type="number" name="age" value={formData.age} onChange={handleChange} placeholder="e.g. 35" required />
                  </div>
                  <div className="ob-group">
                    <label>Gender</label>
                    <select name="gender" value={formData.gender} onChange={handleChange} required>
                      <option value="">Select gender...</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
                <div className="ob-group">
                  <label><Calendar size={16} /> Date of Birth</label>
                  <input type="date" name="date_of_birth" value={formData.date_of_birth} onChange={handleChange} required />
                </div>
                <div className="ob-group">
                  <label><Phone size={16} /> Contact Number</label>
                  <input name="contact_number" value={formData.contact_number} onChange={handleChange} placeholder="+1 (555) 000-0000" required />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="ob-content fade-in">
              <div className="ob-section-header">
                <div className="ob-icon-circle"><MapPin size={24} color="#2563eb" /></div>
                <div>
                  <h2>Clinical Context</h2>
                  <p>Tell us about your health concerns and location.</p>
                </div>
              </div>

              <div className="ob-section-body">
                <div className="ob-group">
                  <label>Residential Address</label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Provide your full temporary or permanent address..."
                    rows="2"
                    required
                  ></textarea>
                </div>
                <div className="ob-group">
                  <label><Activity size={16} /> What brings you here today?</label>
                  <textarea
                    name="problem_description"
                    value={formData.problem_description}
                    onChange={handleChange}
                    placeholder="Describe your symptoms, known conditions, or reason for seeking care..."
                    rows="4"
                    required
                  ></textarea>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="ob-content fade-in">
              <div className="ob-section-header">
                <div className="ob-icon-circle"><Stethoscope size={24} color="#2563eb" /></div>
                <div>
                  <h2>Select Specialist</h2>
                  <p>Choose the type of expertise you require for your care.</p>
                </div>
              </div>

              <div className="ob-section-body">
                <div className="specialist-grid">
                  {specialists.map(s => (
                    <div
                      key={s.id}
                      className={`specialist-option ${formData.specialty_requested === s.name ? 'selected' : ''}`}
                      onClick={() => setFormData(prev => ({ ...prev, specialty_requested: s.name }))}
                    >
                      <div className="s-icon">{s.icon}</div>
                      <div className="s-label">{s.name}</div>
                      {formData.specialty_requested === s.name && (
                        <div className="s-selected-indicator">
                          <CheckCircle size={14} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {error && <div className="ob-error-banner">{error}</div>}

          <div className="ob-footer">
            {step > 1 && (
              <button type="button" className="btn-secondary" onClick={prevStep}>
                <ChevronLeft size={18} /> Previous
              </button>
            )}
            <div style={{ flex: 1 }}></div>
            {step < 3 ? (
              <button type="button" className="btn-primary" onClick={nextStep}>
                Continue <ChevronRight size={18} />
              </button>
            ) : (
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? (
                  <>
                    <div className="spinner"></div> Finalizing Profile...
                  </>
                ) : (
                  <>
                    Complete & Enter Portal <CheckCircle size={18} />
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

export default PatientOnboarding;

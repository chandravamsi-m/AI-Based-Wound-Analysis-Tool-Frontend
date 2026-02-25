import { useState, useEffect, useRef } from 'react';
import { Save, User, Building2, Users, Search, ChevronRight, Home, Check } from 'lucide-react';
import apiClient from '../../../services/apiClient';
import './AddPatient.css';

function AddPatient({ onBack, onSuccess }) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    age: '',
    gender: 'Male',
    admissionDate: new Date().toISOString().split('T')[0],
    ward: '',
    bed: '',
    physicianId: '',
    physicianName: '',
    diagnosis: '',
    status: 'Stable'
  });

  const [allPhysicians, setAllPhysicians] = useState([]);
  const [filteredPhysicians, setFilteredPhysicians] = useState([]);
  const [showPhysicianDropdown, setShowPhysicianDropdown] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const dropdownRef = useRef(null);

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState(null);

  // Fetch doctors on mount
  useEffect(() => {
    const fetchPhysicians = async () => {
      try {
        // Optimized: Fetch only Doctors via backend filtering + limit
        const response = await apiClient.get('/users/', {
          params: { role: 'Doctor', limit: 50 }
        });
        setAllPhysicians(response.data);
        setFilteredPhysicians(response.data); // Pre-fill filtered list

        // Auto-assign if current user is a Doctor
        const storedUser = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user') || '{}');
        if (storedUser.role === 'Doctor' && storedUser.id) {
          setFormData(prev => ({
            ...prev,
            physicianId: storedUser.id,
            physicianName: storedUser.name
          }));
        }
      } catch (err) {
        console.error("Failed to fetch physicians", err);
      }
    };
    fetchPhysicians();
  }, []);

  // Handle clicks outside dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowPhysicianDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const validateForm = () => {
    let newErrors = {};
    if (!formData.firstName) newErrors.firstName = "First Name is required.";
    if (!formData.lastName) newErrors.lastName = "Last Name is required.";
    if (!formData.age) newErrors.age = "Age is required.";
    if (!formData.admissionDate) newErrors.admissionDate = "Admission Date is required.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === 'physicianName') {
      const filtered = allPhysicians.filter(p =>
        p.name.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredPhysicians(filtered);
      setShowPhysicianDropdown(true);

      // If they clear the name, clear the ID too
      if (!value) {
        setFormData(prev => ({ ...prev, physicianId: '', physicianName: '' }));
      }
    }

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleSelectPhysician = (physician) => {
    setFormData(prev => ({
      ...prev,
      physicianId: physician.id,
      physicianName: physician.name
    }));
    setShowPhysicianDropdown(false);
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setServerError(null);

    const submissionData = {
      name: `${formData.firstName} ${formData.lastName}`,
      age: parseInt(formData.age),
      gender: formData.gender,
      admission_date: formData.admissionDate,
      ward: formData.ward,
      bed: formData.bed,
      assigned_physician: formData.physicianId || null,
      diagnosis: formData.diagnosis,
      status: formData.status
    };

    try {
      await apiClient.post('/clinical/patients/', submissionData);
      if (onSuccess) onSuccess();
      if (onBack) onBack();
    } catch (err) {
      console.error(err);
      if (err.response?.data) {
        setErrors(err.response.data);
        setServerError('Please fix the errors below.');
      } else {
        setServerError('Failed to save patient record. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-patient-page-wrapper">
      {/* <div className="breadcrumb-nav">
        <span className="breadcrumb-item" onClick={onBack}>
          <Home size={14} />
          Home
        </span>
        <ChevronRight size={14} className="separator" />
        <span className="breadcrumb-item" onClick={onBack}>Patients</span>
        <ChevronRight size={14} className="separator" />
        <span className="breadcrumb-item active">Add New Patient</span>
      </div> */}

      <header className="page-header-premium">
        <h1>Add New Patient</h1>
        <p>Enter patient demographics and initial admission details for the wound care unit.</p>
      </header>

      <div className="patient-intake-card-premium">
        <form onSubmit={handleSubmit} className="premium-intake-form">
          {serverError && <div className="form-error-banner">{serverError}</div>}

          {/* Section 1: Demographics */}
          <div className="form-section-premium">
            <div className="section-title-row">
              <User size={18} className="section-icon-blue" />
              <h3>PATIENT DEMOGRAPHICS</h3>
            </div>

            <div className="premium-form-grid">
              <div className={`premium-field-group ${errors.firstName ? 'has-error' : ''}`}>
                <label>First Name <span className="required-star">*</span></label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="e.g. John"
                />
                {errors.firstName && <span className="field-error-msg">{errors.firstName}</span>}
              </div>

              <div className={`premium-field-group ${errors.lastName ? 'has-error' : ''}`}>
                <label>Last Name <span className="required-star">*</span></label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="e.g. Doe"
                />
                {errors.lastName && <span className="field-error-msg">{errors.lastName}</span>}
              </div>

              <div className={`premium-field-group ${errors.age ? 'has-error' : ''}`}>
                <label>Age <span className="required-star">*</span></label>
                <div className={`iconed-input-field ${focusedField === 'age' ? 'is-focused' : ''}`}>
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('age')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="e.g. 45"
                  />
                  <Users size={16} className="inner-field-icon" />
                </div>
                {errors.age && <span className="field-error-msg">{errors.age}</span>}
              </div>

              <div className={`premium-field-group ${errors.gender ? 'has-error' : ''}`}>
                <label>Gender <span className="required-star">*</span></label>
                <select name="gender" value={formData.gender} onChange={handleChange}>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
                {errors.gender && <span className="field-error-msg">{errors.gender}</span>}
              </div>
            </div>
          </div>

          <div className="section-divider-line"></div>

          {/* Section 2: Admission Details */}
          <div className="form-section-premium">
            <div className="section-title-row">
              <Building2 size={18} className="section-icon-blue" />
              <h3>ADMISSION DETAILS</h3>
            </div>

            <div className="premium-form-grid">
              <div className={`premium-field-group ${errors.admissionDate ? 'has-error' : ''}`}>
                <label>Admission Date <span className="required-star">*</span></label>
                <input
                  type="date"
                  name="admissionDate"
                  value={formData.admissionDate}
                  onChange={handleChange}
                />
                {errors.admissionDate && <span className="field-error-msg">{errors.admissionDate}</span>}
              </div>

              <div className={`premium-field-group ${errors.ward ? 'has-error' : ''}`}>
                <label>Ward / Department</label>
                <select name="ward" value={formData.ward} onChange={handleChange}>
                  <option value="">Select ward...</option>
                  <option value="General Ward">General Ward</option>
                  <option value="ICU">ICU</option>
                  <option value="Orthopedic">Orthopedic</option>
                  <option value="Surgical">Surgical</option>
                  <option value="Emergency">Emergency</option>
                </select>
                {errors.ward && <span className="field-error-msg">{errors.ward}</span>}
              </div>

              <div className={`premium-field-group ${errors.bed ? 'has-error' : ''}`}>
                <label>Room / Bed #</label>
                <input
                  type="text"
                  name="bed"
                  value={formData.bed}
                  onChange={handleChange}
                  placeholder="e.g. 204-B"
                />
                {errors.bed && <span className="field-error-msg">{errors.bed}</span>}
              </div>

              <div className={`premium-field-group relative-pos ${focusedField === 'physicianName' ? 'is-focused' : ''}`} ref={dropdownRef}>
                <label>Assigning Physician</label>
                <div className={`iconed-input-field ${focusedField === 'physicianName' ? 'is-focused' : ''}`}>
                  <input
                    type="text"
                    name="physicianName"
                    value={formData.physicianName}
                    onChange={handleChange}
                    onFocus={() => {
                      setShowPhysicianDropdown(true);
                      setFocusedField('physicianName');
                    }}
                    onBlur={() => setFocusedField(null)}
                    placeholder="Search physician..."
                    autoComplete="off"
                  />
                  <Search size={16} className="inner-field-icon" />
                </div>
                {showPhysicianDropdown && (formData.physicianName || allPhysicians.length > 0) && (
                  <div className="physician-search-results">
                    {filteredPhysicians.length > 0 ? (
                      filteredPhysicians.map(p => (
                        <div
                          key={p.id}
                          className="physician-result-item"
                          onClick={() => handleSelectPhysician(p)}
                        >
                          <div className="physician-info">
                            <span className="physician-name">{p.name}</span>
                            <span className="physician-role">Medical Specialist</span>
                          </div>
                          {formData.physicianId === p.id && <Check size={14} className="select-check" />}
                        </div>
                      ))
                    ) : (
                      <div className="no-results">No doctors found</div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className={`premium-field-group full-width-field ${errors.diagnosis ? 'has-error' : ''}`}>
              <label>Primary Diagnosis / Clinical Context</label>
              <textarea
                name="diagnosis"
                value={formData.diagnosis}
                onChange={handleChange}
                rows="3"
                placeholder="Enter initial diagnosis or reason for wound care referral..."
              ></textarea>
              {errors.diagnosis && <span className="field-error-msg">{errors.diagnosis}</span>}
            </div>
          </div>

          <div className="form-footer-sticky">
            <div className="footer-actions">
              <button type="button" className="btn-cancel-bordered" onClick={() => onBack && onBack()}>Cancel</button>
              <button type="submit" className="btn-save-filled" disabled={loading}>
                <Save size={18} />
                <span>{loading ? 'Saving Patient...' : 'Save Patient'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddPatient;

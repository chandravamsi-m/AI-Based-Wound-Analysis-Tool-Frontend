import React, { useState, useEffect } from 'react';
import { X, Activity, Heart, Wind, Droplets, Calendar, User, Clipboard, History, Camera, AlertCircle, Loader2, FileText } from 'lucide-react';
import apiClient from '../../../../services/apiClient';
import './PatientDetailsModal.css';

function PatientDetailsModal({ patient: initialPatient, onClose }) {
  const [patient, setPatient] = useState(initialPatient);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview'); // overview, assessments, care-team, reports
  const [availableNurses, setAvailableNurses] = useState([]);
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    if (initialPatient?.id) {
      fetchFullPatientDetails();
    }
  }, [initialPatient?.id]);

  const fetchFullPatientDetails = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/clinical/patients/${initialPatient.id}/`);
      setPatient(response.data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch full patient details:', err);
      setError('Could not load complete clinical history.');
    } finally {
      setLoading(false);
    }
  };

  const fetchNurses = async () => {
    try {
      const response = await apiClient.get('/clinical/patients/available_nurses/');
      setAvailableNurses(response.data);
    } catch (err) {
      console.error('Failed to fetch nurses:', err);
    }
  };

  const handleAssignNurse = async (nurseId) => {
    try {
      setAssigning(true);
      await apiClient.post(`/clinical/patients/${patient.id}/assign_nurse/`, { nurse_id: nurseId });
      // Refresh patient details to show updated assignment
      await fetchFullPatientDetails();
    } catch (err) {
      console.error('Assignment failed:', err);
      alert('Failed to assign nurse. Please try again.');
    } finally {
      setAssigning(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'care-team') {
      fetchNurses();
    }
  }, [activeTab]);

  if (!initialPatient) return null;

  const renderTabContent = () => {
    if (loading) {
      return (
        <div className="loading-vitals-container">
          <Loader2 className="animate-spin" size={32} color="#2f65ac" />
          <p>Fetching full clinical history...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="error-vitals-container">
          <AlertCircle size={32} color="#ef4444" />
          <p>{error}</p>
          <button onClick={fetchFullPatientDetails} className="btn-retry">Retry Fetch</button>
        </div>
      );
    }

    switch (activeTab) {
      case 'overview':
        return (
          <>
            {/* Patient Overview Section */}
            <div className="details-section">
              <div className="section-header-row">
                <h3 className="section-title">
                  <User size={16} />
                  PATIENT PROFILE
                </h3>
                <div className="clinical-badge-secondary">ACTIVE CARE</div>
              </div>
              <div className="info-grid-premium">
                <div className="info-item-premium">
                  <span className="info-label-premium">AGE</span>
                  <span className="info-value-premium">{patient.age || 'N/A'} Years</span>
                </div>
                <div className="info-item-premium">
                  <span className="info-label-premium">GENDER</span>
                  <span className="info-value-premium">{patient.gender || 'N/A'}</span>
                </div>
                <div className="info-item-premium">
                  <span className="info-label-premium">BED NUMBER</span>
                  <span className="info-value-premium">{patient.bed || 'Unassigned'}</span>
                </div>
                <div className="info-item-premium">
                  <span className="info-label-premium">ADMISSION DATE</span>
                  <span className="info-value-premium">{patient.admission_date ? new Date(patient.admission_date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : 'New Admission'}</span>
                </div>
              </div>
            </div>

            <div className="details-section">
              <h3 className="section-title">
                <Clipboard size={16} />
                CLINICAL CONTEXT
              </h3>
              <div className="clinical-diagnosis-card">
                <div className="diagnosis-icon-wrapper">
                  <FileText size={18} />
                </div>
                <div className="diagnosis-content">
                  <span className="diagnosis-label">PRIMARY DIAGNOSIS</span>
                  <p className="diagnosis-text">{patient.diagnosis || 'No primary diagnosis recorded.'}</p>
                </div>
              </div>
            </div>

            {/* Vitals History Section */}
            <div className="details-section">
              <h3 className="section-title">
                <History size={16} />
                Clinical History (Vitals)
              </h3>

              {(!patient.clinical_history || patient.clinical_history.length === 0) ? (
                <div className="empty-history">
                  <p>No vital sign records found for this patient.</p>
                </div>
              ) : (
                <div className="vitals-history-table-wrapper">
                  <table className="vitals-history-table">
                    <thead>
                      <tr>
                        <th>Date & Time</th>
                        <th>Heart Rate</th>
                        <th>SpO2</th>
                        <th>Resp Rate</th>
                        <th>Recorded By</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...patient.clinical_history].map((record) => (
                        <tr key={record.id}>
                          <td className="record-time">
                            {new Date(record.recorded_at).toLocaleString([], {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </td>
                          <td>
                            <div className="record-metric val-hr">
                              <Heart size={12} />
                              {record.heart_rate || '--'} <small>BPM</small>
                            </div>
                          </td>
                          <td>
                            <div className="record-metric val-spo2">
                              <Droplets size={12} />
                              {record.oxygen_saturation || '--'}<small>%</small>
                            </div>
                          </td>
                          <td>
                            <div className="record-metric val-rr">
                              <Wind size={12} />
                              {record.respiratory_rate || '--'} <small>BPM</small>
                            </div>
                          </td>
                          <td className="record-nurse">
                            {record.nurse_name || 'Staff'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        );

      case 'assessments':
        return (
          <div className="details-section">
            <h3 className="section-title">
              <Camera size={16} />
              Wound Analysis History
            </h3>

            {(!patient.wounds || patient.wounds.length === 0 || !patient.wounds.some(w => w.assessments?.length)) ? (
              <div className="empty-history">
                <p>No wound assessment records found for this patient.</p>
              </div>
            ) : (
              <div className="wound-gallery">
                {patient.wounds.map(wound => wound.assessments?.length > 0 && (
                  <div key={wound.id} className="wound-location-group">
                    <h4 className="location-heading">Location: {wound.location}</h4>
                    <div className="assessment-grid">
                      {[...wound.assessments].map(assessment => (
                        <div key={assessment.id} className="assessment-mini-card">
                          <div className="assessment-img-wrapper">
                            <img src={assessment.image} alt="Wound" />
                            <div className="stage-overlay">{assessment.stage}</div>
                          </div>
                          <div className="assessment-info">
                            <div className="assessment-date">
                              <Calendar size={12} />
                              {new Date(assessment.created_at).toLocaleDateString()}
                            </div>
                            <div className="assessment-metrics">
                              <span>{assessment.width}×{assessment.depth} cm</span>
                              {assessment.is_escalated && <AlertCircle size={14} color="#ef4444" />}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 'care-team':
        return (
          <div className="details-section">
            <h3 className="section-title">
              <Activity size={16} />
              Care Team Management
            </h3>

            <div className="assignment-dashboard">
              <div className="current-assignments">
                <div className="assignment-track">
                  <div className="staff-node">
                    <div className="staff-icon doctor">DR</div>
                    <div className="staff-details">
                      <span className="staff-label">PRIMARY PHYSICIAN</span>
                      <span className="staff-name">{patient.assigned_physician_name || 'Unassigned'}</span>
                    </div>
                  </div>
                  <div className="staff-node">
                    <div className={`staff-icon ${patient.assigned_nurse_id ? 'nurse' : 'empty'}`}>
                      {patient.assigned_nurse_id ? 'NS' : '+'}
                    </div>
                    <div className="staff-details">
                      <span className="staff-label">ASSIGNED NURSE</span>
                      <span className="staff-name">{patient.assigned_nurse_name || (patient.assigned_nurse_id ? 'Loading...' : 'Not Assigned')}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="nurse-selector-box">
                <h4 className="box-subtitle">ASSIGN NURSE TO CASE</h4>
                <div className="nurse-list-modal">
                  {availableNurses.length === 0 ? (
                    <p className="no-nurses">Loading clinical staff...</p>
                  ) : (
                    availableNurses.map(nurse => (
                      <div key={nurse.id} className={`nurse-choice-card ${patient.assigned_nurse_id === nurse.id ? 'active' : ''}`}>
                        <div className="nurse-choice-info">
                          <span className="nurse-choice-name">{nurse.name}</span>
                          <span className="nurse-choice-email">{nurse.email}</span>
                        </div>
                        <button
                          className={`btn-assign-small ${patient.assigned_nurse_id === nurse.id ? 'success' : ''}`}
                          disabled={assigning || patient.assigned_nurse_id === nurse.id}
                          onClick={() => handleAssignNurse(nurse.id)}
                        >
                          {patient.assigned_nurse_id === nurse.id ? 'ASSIGNED' : (assigning ? '...' : 'ASSIGN')}
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      case 'reports':
        return (
          <div className="details-section">
            <h3 className="section-title">
              <FileText size={16} />
              Clinical Summaries
            </h3>
            <div className="reports-coming-soon">
              <div className="report-placeholder-card">
                <FileText size={48} color="#94a3b8" />
                <h4>Automated Reporting Engine</h4>
                <p>Generating clinical summaries from AI assessments and longitudinal vitals.</p>
                <div className="badge-beta">PHASE 56 READY</div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container clinical-portal-modal">
        <div className="clinical-portal-sidebar">
          <div className="sidebar-brand">
            <Activity size={20} />
            <span>CLINICAL PORTAL</span>
          </div>
          <nav className="portal-nav">
            <button className={`nav-tab ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
              <User size={18} />
              Overview
            </button>
            <button className={`nav-tab ${activeTab === 'assessments' ? 'active' : ''}`} onClick={() => setActiveTab('assessments')}>
              <Camera size={18} />
              Assessments
            </button>
            <button className={`nav-tab ${activeTab === 'care-team' ? 'active' : ''}`} onClick={() => setActiveTab('care-team')}>
              <Activity size={18} />
              Care Team
            </button>
            <button className={`nav-tab ${activeTab === 'reports' ? 'active' : ''}`} onClick={() => setActiveTab('reports')}>
              <FileText size={18} />
              Reports
            </button>
          </nav>
          <div className="sidebar-footer">
            <button className="btn-portal-close" onClick={onClose}>
              Close Chart
            </button>
          </div>
        </div>

        <div className="clinical-portal-main">
          <div className="portal-main-header">
            <div className="patient-header-pill">
              <div className="patient-pill-avatar">
                {initialPatient.name?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
              </div>
              <div className="patient-pill-info">
                <h4>{initialPatient.name}</h4>
                <span>{initialPatient.mrn} • {initialPatient.ward || 'General'}</span>
              </div>
            </div>
            <button className="btn-close-minimal" onClick={onClose}>
              <X size={20} />
            </button>
          </div>

          <div className="portal-scroll-area">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
}

export default PatientDetailsModal;

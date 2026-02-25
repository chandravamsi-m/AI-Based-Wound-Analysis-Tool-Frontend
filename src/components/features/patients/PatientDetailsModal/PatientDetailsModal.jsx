import React, { useState, useEffect } from 'react';
import { X, Activity, Heart, Wind, Droplets, Calendar, User, Clipboard, History, Camera, AlertCircle, Loader2, FileText } from 'lucide-react';
import apiClient from '../../../../services/apiClient';
import './PatientDetailsModal.css';

function PatientDetailsModal({ patient: initialPatient, onClose }) {
  const [patient, setPatient] = useState(initialPatient);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  if (!initialPatient) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container patient-details-modal">
        <div className="modal-header patient-details-header">
          <div className="header-patient-info">
            <div className="patient-avatar-large">
              {initialPatient.name?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
            </div>
            <div>
              <h2 className="modal-title">{initialPatient.name}</h2>
              <p className="patient-meta-subtitle">MRN: {initialPatient.mrn} • Ward: {initialPatient.ward || 'General'}</p>
            </div>
          </div>
          <button className="btn-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-form details-content">
          {loading ? (
            <div className="loading-vitals-container">
              <Loader2 className="animate-spin" size={32} color="#2f65ac" />
              <p>Fetching full clinical history...</p>
            </div>
          ) : error ? (
            <div className="error-vitals-container">
              <AlertCircle size={32} color="#ef4444" />
              <p>{error}</p>
              <button onClick={fetchFullPatientDetails} className="btn-retry">Retry Fetch</button>
            </div>
          ) : (
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

              {/* Wound History Section */}
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
            </>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose}>Close Chart</button>
          {/* <button className="btn-save" onClick={() => window.print()} disabled={loading}>
            <Clipboard size={16} />
            Download Report
          </button> */}
        </div>
      </div>
    </div>
  );
}

export default PatientDetailsModal;

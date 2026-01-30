import React from 'react';
import { X, Activity, Heart, Wind, Droplets, Calendar, User, Clipboard, History, Camera, AlertCircle } from 'lucide-react';
import './PatientDetailsModal.css';

function PatientDetailsModal({ patient, onClose }) {
  if (!patient) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container patient-details-modal">
        <div className="modal-header patient-details-header">
          <div className="header-patient-info">
            <div className="patient-avatar-large">
              {patient.name?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
            </div>
            <div>
              <h2 className="modal-title">{patient.name}</h2>
              <p className="patient-meta-subtitle">MRN: {patient.mrn} • Ward: {patient.ward || 'General'}</p>
            </div>
          </div>
          <button className="btn-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-form details-content">
          {/* Patient Overview Section */}
          <div className="details-section">
            <h3 className="section-title">
              <User size={16} />
              Patient Profile
            </h3>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Age</span>
                <span className="info-value">{patient.age || 'N/A'} Years</span>
              </div>
              <div className="info-item">
                <span className="info-label">Gender</span>
                <span className="info-value">{patient.gender || 'N/A'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Bed Number</span>
                <span className="info-value">{patient.bed || 'TBD'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Admission Date</span>
                <span className="info-value">{new Date(patient.admission_date).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          <div className="details-section">
            <h3 className="section-title">
              <Clipboard size={16} />
              Clinical Context
            </h3>
            <div className="clinical-notes-card">
              <span className="info-label">Diagnosis</span>
              <p className="clinical-text">{patient.diagnosis || 'No primary diagnosis recorded.'}</p>
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
                    {[...patient.clinical_history].reverse().map((record) => (
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
                      {[...wound.assessments].reverse().map(assessment => (
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
        </div>

        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose}>Close Chart</button>
          <button className="btn-save" onClick={() => window.print()}>
            <Clipboard size={16} />
            Download Report
          </button>
        </div>
      </div>
    </div>
  );
}

export default PatientDetailsModal;

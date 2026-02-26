import React, { useState, useEffect } from 'react';
import {
  ChevronRight,
  Activity,
  User,
  Calendar,
  Home,
  MessageSquare,
  Edit,
  Plus,
  Phone,
  Mail,
  AlertCircle,
  FileText,
  Clock,
  Heart,
  Thermometer,
  Droplets,
  Bell,
  CheckCircle2,
  MoreVertical,
  ArrowUp,
  FileEdit,
  History,
  Image as ImageIcon,
  MapPin
} from 'lucide-react';
import apiClient from '../../../../services/apiClient';
import './PatientProfile.css';
import VitalsModal from '../../assessments/VitalsModal/VitalsModal';
import WoundUploadModal from '../../assessments/WoundUploadModal/WoundUploadModal';

const PatientProfile = ({ patient: initialPatient, onBack }) => {
  const [patient, setPatient] = useState(initialPatient || {});
  const [loading, setLoading] = useState(false);
  const [showVitalsModal, setShowVitalsModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);

  useEffect(() => {
    if (initialPatient?.id) {
      fetchPatientDetails();
    }
  }, [initialPatient?.id]);

  const fetchPatientDetails = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/clinical/patients/${initialPatient.id}/`);
      setPatient(response.data);
    } catch (err) {
      console.error("Failed to fetch full patient profile", err);
    } finally {
      setLoading(false);
    }
  };

  // Unified Care Timeline: Merge assessments and clinical history
  const unifiedTimeline = [
    ...(patient.wounds || []).flatMap(w => (w.assessments || []).map(a => ({
      ...a,
      type: 'assessment',
      title: `${w.wound_type || 'Wound'} Assessment`,
      description: `AI scan of ${w.location || 'site'}: Stage ${a.stage || 'N/A'}. ${a.reduction_rate ? `Reduction of ${a.reduction_rate}% detected.` : 'Initial baseline recorded.'} Tissue: ${a.ml_analysis_result?.tissue_composition?.granulation || '--'}% Granulation.`,
      icon: <Activity size={16} />,
      time: a.created_at,
      actions: ['Images', 'AI Report']
    }))),
    ...(patient.clinical_history || []).map(h => ({
      ...h,
      type: 'vitals',
      title: 'Vitals Recorded',
      description: `BP: ${h.blood_pressure_systolic || '--'}/${h.blood_pressure_diastolic || '--'} mmHg, HR: ${h.heart_rate || '--'} bpm, Temp: ${h.temperature || '--'}°C. Recorded by ${h.nurse_name || 'Staff'}.`,
      icon: <History size={16} />,
      time: h.recorded_at
    }))
  ].sort((a, b) => new Date(b.time || 0) - new Date(a.time || 0));

  // Get latest vitals for the dashboard cards
  const latestVitals = patient.clinical_history?.[0] || {};

  // Get absolute latest note from any source (Vitals or Assessments)
  const allEvents = [
    ...(patient.clinical_history || []).map(h => ({ time: h.recorded_at, notes: h.nurse_notes, author: h.nurse_name })),
    ...(patient.wounds || []).flatMap(w => (w.assessments || []).map(a => ({ time: a.created_at, notes: a.notes, author: a.nurse_name })))
  ].sort((a, b) => new Date(b.time) - new Date(a.time));

  const latestNote = allEvents[0] || {};

  if (loading && !patient.id) {
    return <div className="loading-state">Loading patient profile...</div>;
  }

  return (
    <div className="patient-profile-pro-wrapper">
      {/* Breadcrumb Navigation */}
      <nav className="pro-breadcrumb-nav">
        <span className="breadcrumb-item-link" onClick={onBack}>Patients</span>
        <ChevronRight size={12} />
        <span className="breadcrumb-item-active">{patient.name || 'James Wilson'}</span>
      </nav>

      <div className="patient-profile-pro-container">
        {/* Header Section */}
        <header className="pro-header">
          <div className="pro-header-main">
            <div className="pro-avatar">
              <div className="status-dot-pro"></div>
            </div>
            <div className="pro-patient-info">
              <div className="pro-patient-name-row">
                <h1 className="pro-patient-name">{patient.name || 'James Wilson'}</h1>
              </div>
              <div className="pro-patient-meta-row">
                <div className="meta-item-pro">
                  <Activity size={14} />
                  <span>MRN: <strong>{patient.mrn || 'MRN-2024'}</strong></span>
                </div>
                <div className="meta-item-pro">
                  <Calendar size={14} />
                  <span>{patient.date_of_birth || '1954-03-12'}</span>
                </div>
                <div className="meta-item-pro">
                  <Home size={14} />
                  <span>Bed: {patient.bed || '402-A'}</span>
                </div>
              </div>
              <div className="pro-badge-row">
                <span className="pro-badge type">{patient.diabetes_type || 'No Diabetes Record'}</span>
                <span className="pro-badge allergy">Allergy: {patient.allergies || 'None'}</span>
                <span className="pro-badge blood">Blood: {patient.blood_group || '--'}</span>
              </div>
            </div>
          </div>

          <div className="pro-header-actions">
            <button className="pro-btn-secondary" onClick={() => setShowVitalsModal(true)}>
              <Activity size={16} /> Record Vitals
            </button>
            <button className="pro-btn-primary" onClick={() => setShowUploadModal(true)}>
              <Plus size={16} /> New Assessment
            </button>
          </div>
        </header>

        <div className="pro-dashboard-grid">
          {/* Left Column: Vitals & Team */}
          <div className="pro-col">
            <section className="pro-section">
              <div className="section-header">
                <h3 className="section-title">Latest Vitals</h3>
                <span className="section-subtitle">
                  {latestVitals.recorded_at ? new Date(latestVitals.recorded_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'No Data'}
                </span>
              </div>
              <div className="vitals-grid">
                <div className="vital-card">
                  <label>BP</label>
                  <div className="vital-value-row">
                    <span className="val-main">{latestVitals.blood_pressure_systolic || '--'}/{latestVitals.blood_pressure_diastolic || '--'}</span>
                  </div>
                  <div className="vital-trend-pro stable">
                    <div className="dot"></div> Normal
                  </div>
                </div>
                <div className="vital-card">
                  <label>HR</label>
                  <div className="vital-value-row">
                    <span className="val-main">{latestVitals.heart_rate || '--'}</span>
                    <span className="val-unit">bpm</span>
                  </div>
                  <div className="vital-trend-pro stable">
                    <div className="dot"></div> Normal
                  </div>
                </div>
                <div className="vital-card">
                  <label>TEMP</label>
                  <div className="vital-value-row">
                    <span className="val-main">{latestVitals.temperature || '--'}</span>
                    <span className="val-unit">°C</span>
                  </div>
                  <div className="vital-trend-pro stable">
                    <div className="dot"></div> Normal
                  </div>
                </div>
                <div className="vital-card">
                  <label>SPO2</label>
                  <div className="vital-value-row">
                    <span className="val-main">{latestVitals.oxygen_saturation || '--'}</span>
                    <span className="val-unit">%</span>
                  </div>
                  <div className="vital-trend-pro stable">
                    <div className="dot"></div> Normal
                  </div>
                </div>
              </div>
            </section>

            <section className="pro-section">
              <h3 className="section-title">Care Team</h3>
              <div className="team-list">
                <div className="team-member">
                  <div className="member-avatar-pro doctor">
                    {patient.assigned_physician_name?.split(' ').map(n => n[0]).join('') || 'DR'}
                  </div>
                  <div className="member-info">
                    <div className="member-name">{patient.assigned_physician_name || 'Unassigned'}</div>
                    <div className="member-role">Primary Physician</div>
                  </div>
                </div>
                <div className="team-member">
                  <div className="member-avatar-pro nurse">
                    {patient.assigned_nurse_name?.split(' ').map(n => n[0]).join('') || 'NS'}
                  </div>
                  <div className="member-info">
                    <div className="member-name">{patient.assigned_nurse_name || 'Not Assigned'}</div>
                    <div className="member-role">Wound Specialist</div>
                  </div>
                </div>
              </div>
              <button className="pro-link-btn">VIEW FULL TEAM</button>
            </section>

            <section className="pro-section">
              <h3 className="section-title">Contact Information</h3>
              <div className="contact-details">
                <div className="contact-item">
                  <Phone size={14} className="icon-blue" />
                  <div className="contact-info-block">
                    <span className="contact-value">{patient.contact_number || 'No contact number'}</span>
                    <span className="contact-label">Mobile</span>
                  </div>
                </div>
                <div className="contact-item">
                  <MapPin size={14} className="icon-blue" />
                  <div className="contact-info-block">
                    <span className="contact-value">{patient.address || 'Address not recorded'}</span>
                    <span className="contact-label">Primary Residence</span>
                  </div>
                </div>
                <div className="contact-item">
                  <User size={14} className="icon-blue" />
                  <div className="contact-info-block">
                    <span className="contact-value">{patient.emergency_contact_name || 'No Emergency Contact'}</span>
                    <span className="contact-label">Emergency • {patient.emergency_contact_number || '--'}</span>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Middle Column: Active Wounds & Timeline */}
          <div className="pro-col-main">
            <div className="section-header-pro">
              <h2 className="title-large">Active Wounds</h2>
              <div className="header-links">
                <span className="link-text">View Body Map</span>
                <div className="active-alerts-label">
                  <AlertCircle size={14} />
                  <span>Active Alerts</span>
                </div>
              </div>
            </div>

            <div className="wounds-stack">
              {(patient.wounds || []).length > 0 ? (patient.wounds || []).map((wound, idx) => {
                const latest = wound.assessments?.[0] || {};
                return (
                  <div className="wound-pro-card-horizontal" key={wound.id || idx}>
                    <div className="wound-visual">
                      {latest.image ? (
                        <img src={latest.image} alt={wound.location} />
                      ) : (
                        <div className="image-placeholder">No Image</div>
                      )}
                    </div>
                    <div className="wound-data">
                      <div className="wound-type-header">
                        <div className="type-meta">
                          <span className="pill-stage">Stage {latest.stage || 'N/A'}</span>
                          <span className="text-id">#{wound.id?.substring(0, 5) || 'W-001'}</span>
                        </div>
                        <div className="reduction-badge">
                          <span className="percentage">{latest.reduction_rate ? `${latest.reduction_rate}%` : '--'}</span>
                          <span className="label">REDUCTION</span>
                        </div>
                      </div>
                      <h3 className="wound-title">{wound.wound_type || 'Wound'}</h3>
                      <div className="metrics-grid">
                        <div className="metric-item">
                          <label>Size (Area)</label>
                          <span>{latest.length || '0'} x {latest.width || '0'} cm</span>
                        </div>
                        <div className="metric-item">
                          <label>Exudate</label>
                          <span>{latest.exudate_amount || 'None'}</span>
                        </div>
                        <div className="metric-item">
                          <label>Tissue Type</label>
                          <span>{latest.ml_analysis_result?.tissue_composition?.granulation ? `Granulation (${latest.ml_analysis_result.tissue_composition.granulation}%)` : 'Not Analyzed'}</span>
                        </div>
                        <div className="metric-item">
                          <label>Last Assessment</label>
                          <span>{latest.created_at ? new Date(latest.created_at).toLocaleDateString() : 'Never'}</span>
                        </div>
                      </div>
                      <div className="wound-footer">
                        <div className="ai-confidence">
                          <Activity size={14} />
                          <span>AI Confidence: {latest.confidence_score ? `${(latest.confidence_score * 100).toFixed(0)}%` : '--'}</span>
                        </div>
                        <button className="btn-analyze">Analyze <ChevronRight size={14} /></button>
                      </div>
                    </div>
                  </div>
                );
              }) : (
                <div className="wounds-empty">No active wounds recorded.</div>
              )}
            </div>

            <h2 className="title-large spacing-top">Care Timeline</h2>
            <div className="care-timeline-refined">
              {unifiedTimeline.length > 0 ? unifiedTimeline.map((item, idx) => (
                <div className="timeline-item" key={idx}>
                  <div className="node-connector">
                    <div className="node-dot"></div>
                    {idx !== unifiedTimeline.length - 1 && <div className="node-line"></div>}
                  </div>
                  <div className="node-content">
                    <span className="node-time">{item.time ? new Date(item.time).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'N/A'}</span>
                    <h4 className="node-title">{item.title}</h4>
                    <p className="node-desc">{item.description}</p>
                    {item.actions && (
                      <div className="node-actions">
                        {item.actions.map(act => (
                          <button className="btn-node-action" key={act}>
                            {act.includes('Image') ? <ImageIcon size={12} /> : <FileText size={12} />}
                            <span>{act}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )) : (
                <div className="timeline-empty">No clinical events recorded.</div>
              )}
              <button className="btn-view-all">View Full History</button>
            </div>
          </div>

          {/* Right Column: Alerts, Tasks, Notes */}
          <div className="pro-col-right">
            <section className="pro-section-alt">
              <div className="section-header-compact">
                <AlertCircle size={16} className="text-danger" />
                <h3 className="title-compact">Active Alerts</h3>
              </div>
              <div className="alerts-stack-refined">
                {(patient.alerts || []).length > 0 ? (patient.alerts || []).map((alert, idx) => (
                  <div className={`alert-card ${alert.severity?.toLowerCase() === 'critical' ? 'critical' : 'warning'}`} key={alert.id || idx}>
                    <span className="alert-type">{alert.severity?.toUpperCase() || 'HIGH PRIORITY'}</span>
                    <h4 className="alert-title">{alert.alert_type || 'Sepsis Risk Detected'}</h4>
                    <p className="alert-desc">{alert.description || 'Vitals trend analysis indicates early signs of infection. WBC elevated.'}</p>
                    {alert.severity?.toLowerCase() === 'critical' && <span className="alert-action">View Protocols</span>}
                  </div>
                )) : (
                  <div className="alert-card info">
                    <h4 className="alert-title">System Nominal</h4>
                    <p className="alert-desc">No active clinical alerts.</p>
                  </div>
                )}
              </div>
            </section>

            <section className="pro-section-alt">
              <div className="section-header-compact">
                <h3 className="title-compact">Pending Tasks</h3>
                <span className="task-count">3</span>
              </div>
              <div className="tasks-stack">
                {(patient.tasks || []).length > 0 ? (patient.tasks || []).map((task, idx) => (
                  <div className="task-row" key={task.id || idx}>
                    <div className="task-checkbox"></div>
                    <div className="task-details">
                      <span className="task-name">{task.title}</span>
                      <span className="task-due">Due: {task.due_time || 'Today'}</span>
                    </div>
                  </div>
                )) : (
                  <div className="task-empty">No pending tasks.</div>
                )}
                <button className="btn-add-task">+ Add Task</button>
              </div>
            </section>

            <div className="latest-note-sticky">
              <div className="note-label">
                Latest Note
                <span className="note-author">{latestNote.author || 'Staff'}</span>
              </div>
              <p className="note-text">
                {latestNote.notes || "No clinical notes recorded for this patient. Please perform a vitals check or assessment."}
              </p>
            </div>
          </div>
        </div>
      </div>

      {showVitalsModal && (
        <VitalsModal
          preSelectedPatientId={patient.id}
          onClose={() => setShowVitalsModal(false)}
          onSuccess={() => {
            fetchPatientDetails();
            setShowVitalsModal(false);
          }}
        />
      )}

      {showUploadModal && (
        <WoundUploadModal
          preSelectedPatientId={patient.id}
          onClose={() => setShowUploadModal(false)}
          onSuccess={() => {
            fetchPatientDetails();
            setShowUploadModal(false);
          }}
        />
      )}
    </div>
  );
};

export default PatientProfile;

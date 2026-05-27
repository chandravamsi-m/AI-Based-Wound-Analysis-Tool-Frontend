import React, { useState, useEffect } from 'react';
import { User, Activity, Calendar, Clipboard, ShieldCheck, HeartPulse, Clock, MessageCircle } from 'lucide-react';
import apiClient from '../../services/apiClient';
import './PatientPortal.css';

function PatientPortal() {
  const [patientData, setPatientData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPatientProfile = async () => {
      try {
        // In a real app, we'd have a /patients/me/ endpoint
        // For now, we'll try to get the profile from the user role context
        const user = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user'));
        if (user && user.role === 'Patient') {
          // Fetch profile linked to this user
          const res = await apiClient.get(`/patients/?user_id=${user.id}`);
          if (res.data && res.data.length > 0) {
            setPatientData(res.data[0]);
          }
        }
      } catch (err) {
        console.error('Error fetching patient profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPatientProfile();
  }, []);

  if (loading) return <div className="portal-loading">Gathering your clinical data...</div>;

  const isPending = !patientData?.assigned_physician;

  return (
    <div className="patient-portal">
      <header className="portal-header">
        <div className="welcome-section">
          <h1>Welcome back, {patientData?.name || 'Patient'}</h1>
          <p>Your healing journey is our priority. Here's your current status.</p>
        </div>
        <div className="status-badge-large">
          <HeartPulse size={20} />
          <span>Status: {patientData?.status || 'Processing'}</span>
        </div>
      </header>

      <div className="portal-grid">
        <div className="portal-card main-status">
          <h2>Case Overview</h2>
          {isPending ? (
            <div className="pending-state">
              <Clock size={48} color="#f59e0b" />
              <h3>Profile Awaiting Triage</h3>
              <p>Our clinical administrators are currently reviewing your case to assign the most suitable specialist for your condition.</p>
              <div className="next-steps">
                <strong>Next Steps:</strong>
                <ul>
                  <li>Medical review of your problem description.</li>
                  <li>Primary physician assignment.</li>
                  <li>Initial consultation scheduling.</li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="assigned-state">
              <ShieldCheck size={48} color="#10b981" />
              <h3>Clinical Care Active</h3>
              <p>Your case is being managed by our specialist team. You can view your care team and treatment history below.</p>
            </div>
          )}
        </div>

        <div className="portal-card care-team">
          <h2>Your Care Team</h2>
          <div className="team-list">
            <div className="team-member">
              <div className="member-icon doc">
                <User size={24} />
              </div>
              <div className="member-info">
                <span className="member-role">Primary Physician</span>
                <span className="member-name">{patientData?.assigned_physician_name || 'Awaiting Assignment'}</span>
              </div>
            </div>
            <div className="team-member">
              <div className="member-icon nurse">
                <User size={24} />
              </div>
              <div className="member-info">
                <span className="member-role">Assigned Nurse</span>
                <span className="member-name">{patientData?.assigned_nurse_name || 'Not yet assigned'}</span>
              </div>
            </div>
          </div>
          <button className="contact-team-btn" disabled={isPending}>
            <MessageCircle size={18} />
            Clear Communication Channel
          </button>
        </div>

        <div className="portal-card upcoming">
          <h2>Quick Links</h2>
          <div className="quick-links-grid">
            <div className="q-link">
              <Activity size={20} />
              <span>My Assessments</span>
            </div>
            <div className="q-link">
              <Calendar size={20} />
              <span>Appointments</span>
            </div>
            <div className="q-link">
              <Clipboard size={20} />
              <span>Medical History</span>
            </div>
            <div className="q-link dark">
              <ShieldCheck size={20} />
              <span>Privacy Settings</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PatientPortal;

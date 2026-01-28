import React from 'react';
import './DoctorDashboard.css';

const DoctorDashboard = () => {
  return (
    <div className="doctor-dashboard">
      <div className="dashboard-placeholder">
        <div className="placeholder-icon">🩺</div>
        <h1>Doctor Dashboard</h1>
        <p>Welcome to the Doctor Dashboard</p>
        <p className="coming-soon">This dashboard is under development and will be available soon.</p>
        <div className="features-list">
          <h3>Upcoming Features:</h3>
          <ul>
            <li>Patient Records Management</li>
            <li>Wound Analysis Reports</li>
            <li>Clinical Alerts & Notifications</li>
            <li>Treatment History</li>
            <li>Medical Documentation</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;

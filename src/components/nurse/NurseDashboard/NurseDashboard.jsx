import React from 'react';
import './NurseDashboard.css';

const NurseDashboard = () => {
  return (
    <div className="nurse-dashboard">
      <div className="dashboard-placeholder">
        <div className="placeholder-icon">👩‍⚕️</div>
        <h1>Nurse Dashboard</h1>
        <p>Welcome to the Nurse Dashboard</p>
        <p className="coming-soon">This dashboard is under development and will be available soon.</p>
        <div className="features-list">
          <h3>Upcoming Features:</h3>
          <ul>
            <li>Patient Care Records</li>
            <li>Wound Care Monitoring</li>
            <li>Treatment Schedules</li>
            <li>Clinical Notes</li>
            <li>Alert Notifications</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default NurseDashboard;

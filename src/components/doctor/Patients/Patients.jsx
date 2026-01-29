import React from 'react';
import { Users, Search, Filter, Plus, MoreHorizontal, User } from 'lucide-react';
import './Patients.css';

const Patients = () => {
  return (
    <div className="placeholder-container">
      <header className="placeholder-header">
        <div className="header-left">
          <span className="breadcrumb">DOCTOR PORTAL / PATIENTS</span>
          <h1>Patient Directory</h1>
          <p>Manage and monitor your assigned patients.</p>
        </div>
        <div className="header-actions">
          <button className="btn-primary">
            <Plus size={18} />
            <span>Add New Patient</span>
          </button>
        </div>
      </header>

      <div className="placeholder-content">
        <div className="content-card">
          <div className="card-mock-header">
            <div className="search-box-mock">
              <Search size={18} />
              <span>Search patients by name, ID or ward...</span>
            </div>
            <div className="filter-actions-mock">
              <button className="btn-outline-mock"><Filter size={16} /> Filter</button>
              <button className="btn-outline-mock">Export</button>
            </div>
          </div>

          <div className="mock-table">
            <div className="mock-table-row header">
              <span>PATIENT NAME</span>
              <span>ID</span>
              <span>WARD / ROOM</span>
              <span>LATEST SCAN</span>
              <span>STATUS</span>
              <span></span>
            </div>
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="mock-table-row">
                <div className="patient-name-mock">
                  <div className="avatar-small-mock">
                    <User size={14} />
                  </div>
                  <span>Patient #{i}00{i}</span>
                </div>
                <span className="id-mock">#WND-00{i}</span>
                <span>Ward B, Room 30{i}</span>
                <span>2 hours ago</span>
                <span className="status-tag-mock active">Stable</span>
                <MoreHorizontal size={18} className="more-btn-mock" />
              </div>
            ))}
          </div>

          <div className="coming-soon-overlay">
            <div className="overlay-content">
              <Users size={48} className="overlay-icon" />
              <h2>Patients Module Under Maintenance</h2>
              <p>We're currently syncing real-time patient records. This module will be live shortly.</p>
              <div className="progress-bar-minimal">
                <div className="progress-fill" style={{ width: '65%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Patients;

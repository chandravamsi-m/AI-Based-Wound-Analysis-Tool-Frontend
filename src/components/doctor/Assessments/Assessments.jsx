import React from 'react';
import { Activity, Search, Filter, Plus, Calendar, Clock, ChevronRight } from 'lucide-react';
import './Assessments.css';

const Assessments = () => {
  return (
    <div className="placeholder-container">
      <header className="placeholder-header">
        <div className="header-left">
          <span className="breadcrumb">DOCTOR PORTAL / ASSESSMENTS</span>
          <h1>Clinical Assessments</h1>
          <p>Review and perform AI-assisted wound evaluations.</p>
        </div>
        <div className="header-actions">
          <button className="btn-primary">
            <Plus size={18} />
            <span>New Assessment</span>
          </button>
        </div>
      </header>

      <div className="placeholder-content">
        <div className="content-card">
          <div className="card-mock-header">
            <div className="mock-tabs">
              <span className="mock-tab active">Pending Review</span>
              <span className="mock-tab">Completed</span>
              <span className="mock-tab">Scheduled</span>
            </div>
            <div className="filter-actions-mock">
              <button className="btn-outline-mock"><Calendar size={16} /> Date Range</button>
            </div>
          </div>

          <div className="mock-list">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="mock-assessment-item">
                <div className="item-main">
                  <div className="wound-type-icon-mock">
                    <Activity size={20} />
                  </div>
                  <div className="item-details">
                    <div className="item-top">
                      <h4>Wound Assessment #ASS-492{i}</h4>
                      <span className="risk-tag high">Action Required</span>
                    </div>
                    <p>Patient: Sarah Jenkins • ID: #WND-021{i}</p>
                    <div className="item-meta">
                      <span className="meta-info"><Clock size={12} /> Pending for 4h</span>
                      <span className="meta-info">• Ward A, Room 102</span>
                    </div>
                  </div>
                </div>
                <button className="mock-btn-next">
                  <ChevronRight size={20} />
                </button>
              </div>
            ))}
          </div>

          <div className="coming-soon-overlay">
            <div className="overlay-content">
              <Activity size={48} className="overlay-icon" />
              <h2>Assessments Engine Initializing</h2>
              <p>We're calibrating the AI diagnostic models for your department. Real-time assessments will be available shortly.</p>
              <div className="loading-dots">
                <span></span><span></span><span></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Assessments;

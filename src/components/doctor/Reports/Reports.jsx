import React from 'react';
import { FileText, Search, Download, Filter, FileBarChart, Calendar, ChevronRight, File } from 'lucide-react';
import './Reports.css';

const Reports = () => {
  return (
    <div className="placeholder-container">
      <header className="placeholder-header">
        <div className="header-left">
          <span className="breadcrumb">DOCTOR PORTAL / REPORTS</span>
          <h1>Clinical Reports</h1>
          <p>Generate and download comprehensive wound progress summaries.</p>
        </div>
        <div className="header-actions">
          <button className="btn-primary">
            <Download size={18} />
            <span>Export Analytics</span>
          </button>
        </div>
      </header>

      <div className="placeholder-content">
        <div className="content-card">
          <div className="card-mock-header">
            <div className="mock-tabs">
              <span className="mock-tab active">Recent Reports</span>
              <span className="mock-tab">Scheduled</span>
              <span className="mock-tab">Templates</span>
            </div>
            <div className="filter-actions-mock">
              <button className="btn-outline-mock"><Filter size={16} /> All Types</button>
            </div>
          </div>

          <div className="mock-grid">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="mock-report-card">
                <div className="report-icon-box">
                  <FileText size={24} />
                </div>
                <div className="report-info">
                  <h4>Progress_Report_W{i}.pdf</h4>
                  <p>Generated: Oct {10 + i}, 2023</p>
                  <span className="file-size-mock">2.4 MB</span>
                </div>
                <button className="mock-download-btn">
                  <Download size={16} />
                </button>
              </div>
            ))}
          </div>

          <div className="coming-soon-overlay">
            <div className="overlay-content">
              <FileBarChart size={48} className="overlay-icon" />
              <h2>Reporting Service Generating</h2>
              <p>We're constructing the PDF generation engine and aggregate data views. Your reporting suite will be ready shortly.</p>
              <div className="shimmer-loader-minimal"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;

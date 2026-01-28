import React, { useState, useEffect } from 'react';
import {
  Bell,
  Search,
  Filter,
  Calendar,
  MoreHorizontal,
  CheckCircle2,
  XCircle,
  Eye,
  Clock,
  Activity,
  AlertTriangle,
  ArrowUpRight
} from 'lucide-react';
import './Alerts.css';
import apiClient from '../../../services/apiClient';

const Alerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState('All Severities');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const fetchData = async () => {
    try {
      const [alertsRes, statsRes] = await Promise.all([
        apiClient.get('/clinical/alerts/'),
        apiClient.get('/clinical/alert-stats/')
      ]);
      setAlerts(alertsRes.data);
      setStats(statsRes.data);
    } catch (error) {
      console.error("Error fetching alerts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleDismiss = async (id) => {
    try {
      await apiClient.post(`/clinical/alerts/${id}/dismiss/`);
      setAlerts(alerts.filter(a => a.id !== id));
    } catch (error) {
      console.error("Error dismissing alert:", error);
    }
  };

  const filteredAlerts = alerts.filter(alert => {
    const matchesSearch =
      alert.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.alert_type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSeverity = severityFilter === 'All Severities' || alert.severity === severityFilter;
    return matchesSearch && matchesSeverity;
  });

  const paginatedAlerts = filteredAlerts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(filteredAlerts.length / itemsPerPage);

  const handlePrevPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  if (loading) return <div className="alerts-container-loading">Syncing Clinical Alerts...</div>;

  return (
    <div className="alerts-screen">
      <div className="alerts-header">
        <div className="header-text">
          <h1>Alerts Overview</h1>
          <p>Review and manage clinical priority alerts and system notifications.</p>
        </div>
        <div className="header-actions">
          <button className="new-assessment-btn"><span>+ New Assessment</span></button>
        </div>
      </div>

      <div className="alerts-summary-grid">
        <div className="summary-card">
          <div className="summary-icon active-alerts">
            <Activity size={24} />
          </div>
          <div className="summary-content">
            <span className="summary-label">TOTAL ACTIVE ALERTS</span>
            <div className="summary-value-row">
              <span className="summary-value">{stats?.total_active || 0}</span>
              <span className="trend negative">
                <ArrowUpRight size={14} />
                {stats?.trend || '8% from yesterday'}
              </span>
            </div>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon response-time">
            <Clock size={24} />
          </div>
          <div className="summary-content">
            <span className="summary-label">AVG RESPONSE TIME</span>
            <div className="summary-value-row">
              <span className="summary-value">{stats?.avg_response_time || '0m'}</span>
              <span className="trend stable">5m since last shift</span>
            </div>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon resolved">
            <CheckCircle2 size={24} />
          </div>
          <div className="summary-content">
            <span className="summary-label">CRITICAL RESOLVED</span>
            <div className="summary-value-row">
              <span className="summary-value">{stats?.critical_resolved || 0}</span>
              <span className="trend positive">Last 24 hours</span>
            </div>
          </div>
        </div>
      </div>

      <div className="alerts-main-card">
        <div className="card-filters">
          <div className="search-box">
            <Search size={20} />
            <input
              type="text"
              placeholder="Search by patient, MRN, or alert type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="filter-group">
            <button className="date-filter-btn">
              <Calendar size={18} />
              <span>Oct 20, 2023 - Oct 27, 2023</span>
            </button>
            <div className="severity-filter">
              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
              >
                <option>All Severities</option>
                <option>Critical</option>
                <option>Warning</option>
                <option>Info</option>
              </select>
            </div>
          </div>
        </div>

        <div className="alerts-table-wrapper">
          <table className="alerts-table">
            <thead>
              <tr>
                <th>PRIORITY</th>
                <th>ALERT TYPE</th>
                <th>PATIENT / SOURCE</th>
                <th>TIMESTAMP</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {paginatedAlerts.map(alert => (
                <tr key={alert.id}>
                  <td>
                    <div className="priority-cell">
                      <span className={`priority-dot ${alert.severity.toLowerCase()}`}></span>
                      <span className={`priority-text ${alert.severity.toLowerCase()}`}>{alert.severity}</span>
                    </div>
                  </td>
                  <td>
                    <div className="alert-type-cell">
                      <div className="type-title">{alert.alert_type}</div>
                      <div className="type-desc">{alert.description}</div>
                    </div>
                  </td>
                  <td>
                    <div className="patient-cell">
                      <div className="patient-name">{alert.patient_name}</div>
                      <div className="patient-mrn">{alert.patient_mrn}</div>
                    </div>
                  </td>
                  <td className="time-cell">
                    {new Date(alert.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    <br />
                    <span>{new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </td>
                  <td>
                    <div className="action-cell">
                      <button className="action-link view">View</button>
                      <button
                        className="action-link dismiss"
                        onClick={() => handleDismiss(alert.id)}
                      >
                        Dismiss
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="alerts-mobile-list">
          {paginatedAlerts.map(alert => (
            <div key={alert.id} className={`alert-mobile-card severity-${alert.severity.toLowerCase()}`}>
              <div className="card-indicator"></div>
              <div className="card-main">
                <div className="card-top">
                  <div className="priority-badge">
                    <span className={`dot ${alert.severity.toLowerCase()}`}></span>
                    {alert.severity}
                  </div>
                  <div className="time-badge">
                    {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
                <div className="card-content">
                  <div className="type-row">
                    <div className="type-title">{alert.alert_type}</div>
                  </div>
                  <div className="type-desc">{alert.description}</div>
                  <div className="patient-strip">
                    <span className="name">{alert.patient_name}</span>
                    <span className="divider">•</span>
                    <span className="mrn">{alert.patient_mrn}</span>
                  </div>
                </div>
                <div className="card-footer">
                  <button className="mobile-action view">View</button>
                  <button
                    className="mobile-action dismiss"
                    onClick={() => handleDismiss(alert.id)}
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="alerts-footer">
          <div className="footer-notice">
            SYSTEM GOVERNANCE: CHANGES IMPACT BILLING & AUDIT LOGS
          </div>
          <div className="alerts-pagination">
            <button
              className="pagination-btn"
              onClick={handlePrevPage}
              disabled={currentPage === 1}
            >
              Prev
            </button>
            <button
              className="pagination-btn"
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Alerts;

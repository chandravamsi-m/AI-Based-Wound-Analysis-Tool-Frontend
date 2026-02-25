import React, { useState, useEffect } from 'react';
import { Search, Download, Calendar, Filter, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import './SystemLogs.css';
import apiClient from '../../../services/apiClient';

const SeverityBadge = ({ severity }) => {
  const styles = {
    Info: { bg: '#EFF6FF', color: '#3B82F6', text: 'INFO' },
    Warning: { bg: '#FFF7ED', color: '#F97316', text: 'WARNING' },
    Success: { bg: '#F0FDF4', color: '#22C55E', text: 'SUCCESS' },
    Error: { bg: '#FEF2F2', color: '#EF4444', text: 'ERROR' }
  };
  const style = styles[severity] || styles.Info;
  return (
    <span className="severity-badge" style={{
      backgroundColor: style.bg,
      color: style.color
    }}>
      {style.text}
    </span>
  );
};

const UserAvatar = ({ name }) => {
  const getInitials = (fullName) => {
    if (!fullName || fullName === 'System') return 'SY';
    const parts = fullName.split(' ').filter(p => p.length > 0);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return fullName.substring(0, 2).toUpperCase();
  };

  const initials = getInitials(name);

  return (
    <div className="user-avatar-wrapper">
      <div className="user-avatar-neutral">
        {initials}
      </div>
      <span className="user-name">{name || 'System'}</span>
    </div>
  );
};

const SystemLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState('All Severities');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalLogs, setTotalLogs] = useState(0);
  const itemsPerPage = 10; // Increased for better view

  useEffect(() => {
    // Debounce search to protect Firestore quota
    const timer = setTimeout(() => {
      fetchLogs();
    }, searchTerm ? 500 : 0); // Only debounce if user is typing

    return () => {
      clearTimeout(timer);
    };
  }, [searchTerm, severityFilter, startDate, endDate]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (severityFilter !== 'All Severities') params.append('severity', severityFilter);
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);

      const response = await apiClient.get(`/logs/?${params.toString()}`);
      setLogs(response.data);
      setTotalLogs(response.data.length);
      // Reset to page 1 if search/filter changes
      if (currentPage > 1 && response.data.length <= (currentPage - 1) * itemsPerPage) {
        setCurrentPage(1);
      }
    } catch (error) {
      console.error("Error fetching logs:", error);
    } finally {
      setLoading(false);
    }
  };

  const paginatedLogs = logs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(totalLogs / itemsPerPage);
  const startEntry = (currentPage - 1) * itemsPerPage + 1;
  const endEntry = Math.min(currentPage * itemsPerPage, totalLogs);

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}\n${hours}:${minutes} UTC`;
  };

  return (
    <div className="system-logs-container">
      <div className="logs-header">
        <div>
          <h1>System Audit Logs</h1>
          <p>Monitor system-wide actions, security events, and administrative changes.</p>
        </div>
        {/* <button className="export-logs-btn">
          <Download size={18} />
          <span>Export Logs</span>
        </button> */}
      </div>

      <div className="logs-content-card">
        <div className="logs-filters">
          <div className="search-box">
            <Search size={20} />
            <input
              type="text"
              placeholder="Search by user, IP, or action..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="filter-group">
            <div className="date-range-filter">
              <Calendar size={18} className="calendar-icon" />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="date-input"
                placeholder="Start Date"
              />
              <span className="date-separator">-</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="date-input"
                placeholder="End Date"
              />
              {(startDate || endDate) && (
                <button className="clear-dates-btn" onClick={() => { setStartDate(''); setEndDate(''); }}>×</button>
              )}
            </div>

            <div className="severity-filter">
              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
              >
                <option>All Severities</option>
                <option>Info</option>
                <option>Warning</option>
                <option>Success</option>
                <option>Error</option>
              </select>
            </div>
          </div>
        </div>

        <div className="logs-table-container">
          {loading ? (
            <div className="loading-state">Loading logs...</div>
          ) : (
            <>
              <table className="logs-table">
                <thead>
                  <tr>
                    <th>TIMESTAMP</th>
                    <th>USER</th>
                    <th>IP ADDRESS</th>
                    <th>ACTION</th>
                    <th>SEVERITY</th>
                    <th>DETAILS</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedLogs.map((log) => (
                    <tr key={log.id}>
                      <td className="timestamp-cell">
                        <div className="timestamp-wrapper">
                          {formatTimestamp(log.timestamp).split('\n').map((line, i) => (
                            <div key={i}>{line}</div>
                          ))}
                        </div>
                      </td>
                      <td>
                        <UserAvatar name={log.user_name} />
                      </td>
                      <td className="ip-cell">{log.ip_address || 'Internal'}</td>
                      <td className="action-cell">{log.action}</td>
                      <td>
                        <SeverityBadge severity={log.severity} />
                      </td>
                      <td className="details-cell">
                        <button className="details-btn">
                          <Eye size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="logs-mobile-list">
                {paginatedLogs.map((log) => (
                  <div key={log.id} className="log-mobile-card">
                    <div className="log-card-header">
                      <div className="log-card-user-info">
                        <UserAvatar name={log.user_name} />
                        <span className="log-mobile-ip">{log.ip_address || 'Internal'}</span>
                      </div>
                      <div className="log-card-header-right">
                        <SeverityBadge severity={log.severity} />
                        <button className="log-mobile-action-btn" title="View Details">
                          <Eye size={16} />
                        </button>
                      </div>
                    </div>
                    <div className="log-card-body">
                      <div className="log-mobile-action">{log.action}</div>
                      <div className="log-mobile-time">
                        {new Date(log.timestamp).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="logs-footer">
          <div className="logs-footer-notice">
            SYSTEM GOVERNANCE: CHANGES IMPACT BILLING & AUDIT LOGS
          </div>
          <div className="logs-pagination">
            <div className="pagination-info">
              Showing {totalLogs === 0 ? 0 : startEntry}-{endEntry} of {totalLogs}
            </div>
            <div className="pagination-controls">
              <button
                className="logs-pagination-btn"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                Prev
              </button>
              <button
                className="logs-pagination-btn"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemLogs;

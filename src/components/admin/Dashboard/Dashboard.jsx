import React, { useState, useEffect } from 'react';
import { Users, Activity, Shield, HardDrive, FileText, Download, TrendingUp, MoreHorizontal, AlertTriangle, HeartPulse } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import apiClient from '../../../services/apiClient';
import './Dashboard.css';

const SeverityTag = ({ severity }) => {
  const styles = {
    Info: { bg: '#EFF6FF', color: '#3B82F6' },
    Warning: { bg: '#FFF7ED', color: '#F97316' },
    Success: { bg: '#F0FDF4', color: '#22C55E' },
    Error: { bg: '#FEF2F2', color: '#EF4444' }
  };
  const style = styles[severity] || styles.Info;
  return (
    <span style={{
      padding: '4px 12px',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: '600',
      backgroundColor: style.bg,
      color: style.color
    }}>
      {severity}
    </span>
  );
};

const Dashboard = ({ onViewChange, summary: initialSummary }) => {
  const [summary, setSummary] = useState(initialSummary);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(!initialSummary);

  // Sync with prop summary
  useEffect(() => {
    if (initialSummary) {
      setSummary(initialSummary);
      setLoading(false);
    }
  }, [initialSummary]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const logsRes = await apiClient.get('/logs/');
        setLogs(logsRes.data.slice(0, 5));
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000); // Poll every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const storageData = [
    { name: 'Used', value: summary?.storage_stats?.used_percentage || 75, color: '#2D62A8' },
    { name: 'Free', value: 100 - (summary?.storage_stats?.used_percentage || 75), color: '#F1F5F9' }
  ];

  if (loading) return <div className="dashboard-container">Loading Dashboard...</div>;

  return (
    <div className="dashboard-container">
      <div className="dashboard-header-row">
        <div>
          <h1>System Administration</h1>
          <p>Manage users, monitor system health, and oversee clinical data storage.</p>
        </div>
        <button className="export-report-btn">
          <Download size={18} />
          <span>Export Report</span>
        </button>
      </div>

      <div className="dashboard-metrics-grid">
        <div className="metric-card-styled">
          <div className="metric-icon-box users">
            <Users size={24} color="#3B82F6" />
          </div>
          <div className="metric-content">
            <span className="metric-label">Active Users</span>
            <div className="metric-value-row">
              <span className="metric-value">{summary?.active_users?.toLocaleString() || '1,245'}</span>
            </div>
            <div className="metric-trend positive">
              <TrendingUp size={14} />
              <span>{summary?.user_trend || '+5% stable'}</span>
            </div>
          </div>
        </div>

        <div className="metric-card-styled">
          <div className="metric-icon-box uptime">
            <Activity size={24} color="#22C55E" />
          </div>
          <div className="metric-content">
            <span className="metric-label">System Uptime</span>
            <div className="metric-value-row">
              <span className="metric-value">{summary?.system_uptime || '99.98%'}</span>
            </div>
            <div className="metric-trend operational">
              <HeartPulse size={14} />
              <span>Operational</span>
            </div>
          </div>
        </div>

        <div className="metric-card-styled">
          <div className="metric-icon-box alerts">
            <Shield size={24} color="#EF4444" />
          </div>
          <div className="metric-content">
            <span className="metric-label">Security Alerts</span>
            <div className="metric-value-row">
              <span className="metric-value">{summary?.security_alerts || '0'}</span>
            </div>
            <div className={`metric-trend ${summary?.security_status === 'Healthy' ? 'operational' : 'critical'}`}>
              <AlertTriangle size={14} />
              <span>{summary?.security_status || 'Action Required'}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-main-grid">
        <div className="dashboard-section logs-section">
          <div className="section-header">
            <div className="section-title">
              <FileText size={20} />
              <span>System Logs</span>
            </div>
            <button className="view-all-btn" onClick={() => onViewChange && onViewChange('logs')}>View All</button>
          </div>
          <div className="logs-table-wrapper">
            <table className="dashboard-logs-table">
              <thead>
                <tr>
                  <th>TIMESTAMP</th>
                  <th>USER</th>
                  <th>ACTION</th>
                  <th>SEVERITY</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td className="time-cell">{new Date(log.timestamp).toLocaleString()}</td>
                    <td className="user-cell">{log.user_name}</td>
                    <td className="action-cell">{log.action}</td>
                    <td><SeverityTag severity={log.severity} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="dashboard-logs-mobile">
            {logs.map((log) => (
              <div key={log.id} className="log-mobile-card">
                <div className="log-card-header">
                  <span className="log-user">{log.user_name}</span>
                  <SeverityTag severity={log.severity} />
                </div>
                <div className="log-card-body">
                  <div className="log-action">{log.action}</div>
                  <div className="log-time">{new Date(log.timestamp).toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="dashboard-section storage-section">
          <div className="section-header">
            <div className="section-title">
              <HardDrive size={20} />
              <span>Storage Status</span>
            </div>
            <button className="more-btn"><MoreHorizontal size={20} /></button>
          </div>
          <div className="storage-card-content">
            <div className="recharts-wrapper-styled">
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={storageData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={90}
                    paddingAngle={0}
                    dataKey="value"
                    stroke="none"
                    startAngle={90}
                    endAngle={-270}
                  >
                    {storageData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="chart-center-label">
                <span className="pct">{summary?.storage_stats?.used_percentage || 75}%</span>
                <span className="lbl">USED</span>
              </div>
            </div>
            <div className="storage-details">
              <div className="storage-item">
                <div className="dot patient"></div>
                <span className="label">Patient Records</span>
                <span className="value">{summary?.storage_stats?.patient_records_size || '0 GB'}</span>
              </div>
              <div className="storage-item">
                <div className="dot imaging"></div>
                <span className="label">Imaging Data</span>
                <span className="value">{summary?.storage_stats?.imaging_data_size || '0 TB'}</span>
              </div>
              <div className="storage-item">
                <div className="dot free"></div>
                <span className="label">Free Space</span>
                <span className="value">{summary?.storage_stats?.free_space || '0 GB'}</span>
              </div>
            </div>
            <button className="manage-capacity-btn" onClick={() => onViewChange('storage')}>Manage Capacity</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

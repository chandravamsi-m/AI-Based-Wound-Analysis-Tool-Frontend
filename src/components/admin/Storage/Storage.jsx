import React from 'react';
import {
  Database,
  HardDrive,
  CloudDownload,
  ShieldCheck,
  TrendingUp,
  FileText,
  Image as ImageIcon,
  History,
  Activity,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Download,
  Terminal
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import './Storage.css';
import apiClient from '../../../services/apiClient';

const Storage = () => {
  const [storageData, setStorageData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  const fetchStorageData = async () => {
    try {
      const response = await apiClient.get('/storage/summary/');
      setStorageData(response.data);
    } catch (error) {
      console.error("Error fetching storage data:", error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchStorageData();
    const interval = setInterval(fetchStorageData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div className="storage-management-container">Loading Storage Stats...</div>;
  if (!storageData) return <div className="storage-management-container">Error loading data</div>;

  const totalCapacityPie = [
    { name: 'Used', value: storageData.used_percentage, color: '#2D62A8' },
    { name: 'Free', value: 100 - storageData.used_percentage, color: '#F1F5F9' }
  ];

  const getIcon = (category) => {
    if (category.includes('Clinical')) return <FileText size={20} className="category-icon clinical" />;
    if (category.includes('Imaging')) return <ImageIcon size={20} className="category-icon imaging" />;
    if (category.includes('Logs')) return <Terminal size={20} className="category-icon logs" />;
    return <History size={20} className="category-icon backups" />;
  };

  return (
    <div className="storage-management-container">
      {/* Header */}
      <div className="storage-header">
        <div>
          <h1>Storage Management</h1>
          <p>Monitor system capacity and manage clinical data storage policies.</p>
        </div>
        <div className="header-actions">
          <button className="export-usage-btn">
            <Download size={18} />
            <span>Export Usage Report</span>
          </button>
          <button className="manage-backups-btn">
            <CloudDownload size={18} />
            <span>Manage Backups</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="storage-metrics-grid">
        {/* Total Capacity Card */}
        <div className="storage-metric-card capacity-card">
          <div className="card-header-styled">
            <Activity size={20} color="#2D62A8" />
            <span>Total Capacity</span>
          </div>
          <div className="capacity-content">
            <div className="capacity-info">
              <div className="capacity-value">{storageData.used_capacity} <span>TB / {storageData.total_capacity} TB</span></div>
              <div className="status-indicator">
                <TrendingUp size={16} />
                <span>Healthy Status</span>
              </div>
            </div>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={120}>
                <PieChart>
                  <Pie
                    data={totalCapacityPie}
                    cx="50%"
                    cy="50%"
                    innerRadius={35}
                    outerRadius={50}
                    paddingAngle={0}
                    dataKey="value"
                    stroke="none"
                    startAngle={90}
                    endAngle={-270}
                  >
                    {totalCapacityPie.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="chart-overlay">
                <span className="overlay-pct">{storageData.used_percentage}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Database Usage Card */}
        <div className="storage-metric-card usage-card">
          <div className="card-header-styled">
            <Database size={20} color="#10B981" />
            <span>Database Usage</span>
          </div>
          <div className="usage-body">
            <div className="usage-value">{storageData.database_usage_gb} <span>GB</span></div>
            <div className="progress-bar-container">
              <div className="progress-bar db" style={{ width: `${storageData.database_percentage}%` }}></div>
            </div>
            <div className="usage-footer">
              <span>Structured Patient Data</span>
              <span>{storageData.database_percentage}% of total</span>
            </div>
          </div>
        </div>

        {/* File Storage Card */}
        <div className="storage-metric-card usage-card">
          <div className="card-header-styled">
            <HardDrive size={20} color="#F59E0B" />
            <span>File Storage</span>
          </div>
          <div className="usage-body">
            <div className="usage-value">{storageData.file_storage_gb.toLocaleString()} <span>GB</span></div>
            <div className="progress-bar-container">
              <div className="progress-bar files" style={{ width: `${storageData.file_storage_percentage}%` }}></div>
            </div>
            <div className="usage-footer">
              <span>Wound Images & Scan Docs</span>
              <span>{storageData.file_storage_percentage}% of total</span>
            </div>
          </div>
        </div>
      </div>

      {/* Breakdown Table Card */}
      <div className="breakdown-card">
        <div className="breakdown-header">
          <h2>Storage Breakdown</h2>
          <button className="view-details-btn">View All Details</button>
        </div>

        <div className="breakdown-table-wrapper">
          <table className="breakdown-table">
            <thead>
              <tr>
                <th>DATA CATEGORY</th>
                <th>TOTAL SIZE</th>
                <th>GROWTH (MOM)</th>
                <th>LAST BACKUP</th>
                <th>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {storageData.breakdown.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div className="category-cell">
                      <div className={`icon-wrapper ${item.statusType}`}>
                        {getIcon(item.category)}
                      </div>
                      <div className="category-info">
                        <div className="category-name">{item.category}</div>
                        <div className="category-desc">{item.description}</div>
                      </div>
                    </div>
                  </td>
                  <td className="size-cell">{item.size}</td>
                  <td className="growth-cell">{item.growth}</td>
                  <td className="backup-cell">{item.lastBackup}</td>
                  <td>
                    <span className={`status-badge ${item.statusType}`}>
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="breakdown-mobile-list">
          {storageData.breakdown.map((item) => (
            <div key={item.id} className="breakdown-mobile-card">
              <div className="mobile-card-header">
                <div className="mobile-category-info">
                  <div className={`mobile-icon-wrapper ${item.statusType}`}>
                    {getIcon(item.category)}
                  </div>
                  <div>
                    <div className="mobile-category-name">{item.category}</div>
                    <div className="mobile-category-size">{item.size}</div>
                  </div>
                </div>
                <span className={`status-badge ${item.statusType}`}>
                  {item.status}
                </span>
              </div>
              <div className="mobile-card-body">
                <div className="mobile-info-row">
                  <span className="info-label">Growth (MoM):</span>
                  <span className="info-value growth">{item.growth}</span>
                </div>
                <div className="mobile-info-row">
                  <span className="info-label">Last Backup:</span>
                  <span className="info-value">{item.lastBackup}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="breakdown-footer">
          <div className="governance-notice">
            SYSTEM GOVERNANCE: AUTOMATED BACKUPS OCCURRING EVERY 24 HOURS.
          </div>
        </div>
      </div>
    </div>
  );
};

export default Storage;

import { Clock, Plus, Upload, Activity, AlertCircle, CheckCircle2, FileText, Camera } from 'lucide-react';
import { useState, useEffect } from 'react';
import apiClient from '../../../services/apiClient';
import './NurseDashboard.css';
import ShiftTaskList from '../../../components/features/wound-care/ShiftTaskList/ShiftTaskList';
import MyPatientsList from '../../../components/features/patients/MyPatientsList/MyPatientsList';
import StaffNotice from '../../../components/features/patients/StaffNotice/StaffNotice';
import WoundUploadModal from '../../../components/features/assessments/WoundUploadModal/WoundUploadModal';
import VitalsModal from '../../../components/features/assessments/VitalsModal/VitalsModal';

function NurseDashboard({ searchQuery = '', onNavigate }) {
  const [dashStats, setDashStats] = useState({
    active_patients: 0,
    doc_due: 0,
    scans: 0,
    completed: 0
  });
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showVitalsModal, setShowVitalsModal] = useState(false);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await apiClient.get('/clinical/nurse/dashboard-stats/');
      setDashStats(response.data);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    }
  };

  const stats = [
    {
      title: 'Active Patients',
      value: dashStats.active_patients,
      subtitle: 'Assigned Wound Care',
      icon: Activity,
      iconBg: '#f0f9ff',
      iconColor: '#2f65ac'
    },
    {
      title: 'Documentation',
      value: dashStats.doc_due,
      subtitle: 'Pending Tasks',
      icon: FileText,
      iconBg: '#fff7ed',
      iconColor: '#f97316'
    },
    {
      title: 'Wound Scans',
      value: dashStats.scans,
      subtitle: 'Performed Today',
      icon: Camera,
      iconBg: '#fef2f2',
      iconColor: '#ef4444'
    },
    {
      title: 'Completed',
      value: dashStats.completed,
      subtitle: 'Tasks Today',
      icon: CheckCircle2,
      iconBg: '#f0fdf4',
      iconColor: '#22c55e'
    }
  ];

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="dashboard-header-left">
          <h1 className="dashboard-title">Nurse Dashboard</h1>
          <div className="dashboard-subtitle">
            <span className="badge-nursing">ACTIVE SHIFT</span>
            <Clock size={18} />
            <span>Evening (14:00 - 22:00)</span>
            <span className="separator">•</span>
            <span>Hyderabad Global Hospital</span>
          </div>
        </div>
        <div className="dashboard-header-actions">
          <button className="btn-shift-log" onClick={() => alert('Shift log export is coming soon.')}>
            <FileText size={18} />
            <span>View Shift Log</span>
          </button>
          <button className="btn-patient-intake" onClick={() => onNavigate('add-patient')}>
            <Plus size={18} />
            <span>New Patient Intake</span>
          </button>
        </div>
      </div>

      <div className="dashboard-stats">
        {stats.map((stat, index) => (
          <div key={index} className="stat-card">
            <div className="stat-card-top">
              <div className="stat-card-icon" style={{ background: stat.iconBg }}>
                <stat.icon size={24} style={{ color: stat.iconColor }} />
              </div>
              <div className="stat-card-main">
                <p className="stat-card-label">{stat.title}</p>
                <p className="stat-card-value">{stat.value}</p>
              </div>
            </div>
            <div className="stat-card-footer">
              <p className="stat-card-subtitle">{stat.subtitle}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-actions">
        <button className="action-card-primary" onClick={() => setShowUploadModal(true)}>
          <div className="action-icon-wrapper">
            <Camera size={32} />
          </div>
          <div>
            <h3 className="action-title">Upload Wound Detail</h3>
            <p className="action-description">Sync clinical photos with AI analysis</p>
          </div>
        </button>
        <button className="action-card-secondary" onClick={() => setShowVitalsModal(true)}>
          <div className="action-icon-wrapper">
            <Activity size={28} />
          </div>
          <div>
            <h3 className="action-title">Record Vitals</h3>
            <p className="action-description">Log temperature, BP, and heart rate</p>
          </div>
        </button>
      </div>

      <div className="dashboard-content">
        <div className="dashboard-left">
          <div className="section-card">
            <h3 className="section-title">TASKS & RESPONSIBILITIES</h3>
            <ShiftTaskList />
          </div>
        </div>
        <div className="dashboard-right">
          <div className="section-card" style={{ marginBottom: '24px' }}>
            <h3 className="section-title">PATIENTS</h3>
            <MyPatientsList searchQuery={searchQuery} onNavigate={onNavigate} />
          </div>
          <StaffNotice />
        </div>
      </div>


      {showUploadModal && (
        <WoundUploadModal
          onClose={() => setShowUploadModal(false)}
          onSuccess={fetchDashboardStats}
        />
      )}

      {showVitalsModal && (
        <VitalsModal
          onClose={() => setShowVitalsModal(false)}
          onSuccess={() => {
            fetchDashboardStats();
            alert('Vitals recorded successfully!');
          }}
        />
      )}
    </div>
  );
}

export default NurseDashboard;

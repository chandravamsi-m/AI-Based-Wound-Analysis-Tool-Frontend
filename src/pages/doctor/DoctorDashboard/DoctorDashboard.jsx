import React, { useState, useEffect } from 'react';
import {
  Users,
  Activity,
  Clock,
  ArrowUp,
  ArrowDown,
  AlertCircle,
  FileText,
  Plus,
  Download,
  Calendar,
  ChevronRight,
  Check,
  ClipboardList
} from 'lucide-react';
import {
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid
} from 'recharts';
import apiClient from '../../../services/apiClient';
import TaskAssignmentModal from '../../../components/features/assessments/TaskAssignmentModal/TaskAssignmentModal';
import WoundUploadModal from '../../../components/features/assessments/WoundUploadModal/WoundUploadModal';
import DoctorCalendarModal from '../../../components/features/assessments/DoctorCalendarModal/DoctorCalendarModal';
import './DoctorDashboard.css';

const StatCard = ({ icon: Icon, label, value, trend, color, subtext }) => {
  const isPositive = trend.startsWith('+');
  const isNegative = trend.startsWith('-');
  const trendColor = isPositive ? '#10B981' : (isNegative ? '#EF4444' : '#64748B');
  const trendBg = isPositive ? '#F0FDF4' : (isNegative ? '#FEF2F2' : '#F8FAFC');

  return (
    <div className="doc-stat-card">
      <div className="stat-card-header">
        <div className="stat-icon-wrapper" style={{ backgroundColor: `${color}15`, color: color }}>
          <Icon size={24} strokeWidth={2} />
        </div>
        <div className="stat-trend-tag" style={{ color: trendColor, backgroundColor: trendBg }}>
          {isPositive ? <ArrowUp size={12} style={{ marginRight: 4 }} /> : (isNegative ? <ArrowDown size={12} style={{ marginRight: 4 }} /> : null)}
          {trend}
        </div>
      </div>
      <div className="stat-card-body">
        <h3 className="stat-value">{value}</h3>
        <p className="stat-label">{label}</p>
        <p className="stat-subtext">{subtext}</p>
      </div>
    </div>
  );
};

const DoctorDashboard = () => {
  const [summary, setSummary] = useState(null);
  const [schedule, setSchedule] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showCalendarModal, setShowCalendarModal] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [summaryRes, scheduleRes, statsRes] = await Promise.all([
        apiClient.get('/clinical/doctor/summary/'),
        apiClient.get('/clinical/doctor/schedule/'),
        apiClient.get('/clinical/doctor/stats/')
      ]);
      setSummary(summaryRes.data);
      setSchedule(scheduleRes.data);
      setStats(statsRes.data);
    } catch (error) {
      console.error("Error fetching doctor dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="doctor-dashboard-loading">
      <div className="loader-spinner"></div>
      <span>Synchronizing clinical data...</span>
    </div>
  );

  // Take last 6 weeks of trend
  const areaData = stats?.healing_trend.map((val, i) => ({
    name: `Week ${i + 1}`,
    value: val
  })) || [];

  return (
    <div className="doctor-dashboard-wrapper">
      <header className="dashboard-header-premium">
        <div className="header-left">
          <span className="current-date-header">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).toUpperCase()}</span>
          <h1>{summary?.greeting || 'Good Morning, Dr. Bennett'}</h1>
          <div className="header-status">
            <div className="check-circle-wrapper">
              <Check size={12} strokeWidth={3} />
            </div>
            <p>{summary?.status_message || 'You have 5 scheduled assessments and 3 pending reviews today.'}</p>
          </div>
        </div>
        <div className="header-actions-premium">
          <button className="btn-report-bordered" onClick={() => setShowTaskModal(true)}>
            <ClipboardList size={18} />
            <span>Assign Task</span>
          </button>
          <button className="btn-new-assessment-filled" onClick={() => setShowUploadModal(true)}>
            <Activity size={18} />
            <span>New Assessment</span>
          </button>
        </div>
      </header>

      <div className="header-divider"></div>

      <div className="stats-row-premium">
        <StatCard
          icon={Users}
          label="Active Patients"
          value={summary?.active_patients || "3"}
          trend="+12%"
          color="#3b82f6"
          subtext="Total across all units"
        />
        <StatCard
          icon={AlertCircle}
          label="Critical Cases"
          value={summary?.critical_cases || "1"}
          trend="-2"
          color="#ef4444"
          subtext="Requires daily monitoring"
        />
        <StatCard
          icon={ClipboardList}
          label="Pending Tasks"
          value={stats?.pending_tasks || "0"}
          trend="Team Total"
          color="#10b981"
          subtext="Direct and delegated"
        />
        <StatCard
          icon={Clock}
          label="Avg. Assessment Time"
          value={summary?.avg_assessment_time || "4.2m"}
          trend="-30s"
          color="#8b5cf6"
          subtext="AI-assisted speed"
        />
      </div>

      <div className="dashboard-main-content">
        <div className="main-left-column">
          <section className="dashboard-card schedule-card-wide">
            <div className="card-header-modern">
              <div className="header-title">
                <Calendar size={20} />
                <h3>Clinical Worklist</h3>
              </div>
              <button className="view-calendar-link" onClick={() => setShowCalendarModal(true)}>View Calendar</button>
            </div>
            <div className="schedule-list-premium">
              {schedule.map(task => (
                <div key={task.id} className="schedule-row">
                  <div className="task-left-group">
                    <div className="task-time-badge-circular">{task.time}</div>
                    <span className={`task-owner-badge ${task.assignment_type?.toLowerCase()}`}>
                      {task.assignment_type === 'DIRECT' ? 'My Task' : 'Delegated'}
                    </span>
                  </div>
                  <div className="task-info-right">
                    <h4>{task.title.includes('Assessment') ? task.title : `Assessment: ${task.title}`}</h4>
                    <p>{task.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="dashboard-card chart-card-wide">
            <div className="card-header-simple">
              <h3>Healing Efficiency Trend</h3>
              <p>Average healing score improvement over last 6 weeks</p>
            </div>
            <div className="chart-container-premium">
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={areaData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2D62A8" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="#2D62A8" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                    domain={[0, 100]}
                    ticks={[0, 25, 50, 75, 100]}
                  />
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                    cursor={{ stroke: '#2D62A8', strokeWidth: 1 }}
                  />
                  <Area type="monotone" dataKey="value" stroke="#2D62A8" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </section>
        </div>

        <div className="main-right-column">
          <section className="dashboard-card priority-side-card">
            <div className="priority-card-header-red">
              <div className="title-box">
                <AlertCircle size={20} color="#ef4444" />
                <h3>Priority Attention</h3>
              </div>
              <span className="active-count-tag">3 Active</span>
            </div>
            <div className="priority-content-list">
              {stats?.priority_cases.map(item => (
                <div key={item.id} className="priority-item-premium">
                  <div className="item-header">
                    <h4>{item.patient_name}</h4>
                    <span className="high-risk-badge">HIGH RISK</span>
                  </div>
                  <p>{item.description}</p>
                  <div className="item-footer">
                    <button className="review-link-btn-premium">
                      Review Case <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="dashboard-card distribution-side-card">
            <div className="card-header-simple">
              <h3>Wound Types Distribution</h3>
            </div>
            <div className="distribution-progress-list">
              {stats?.distribution.map(item => (
                <div key={item.category} className="dist-progress-item">
                  <div className="dist-info-row">
                    <span className="dist-category">{item.category}</span>
                    <span className="dist-pct">{item.percentage}%</span>
                  </div>
                  <div className="dist-progress-track">
                    <div
                      className="dist-progress-bar"
                      style={{
                        width: `${item.percentage}%`,
                        backgroundColor: item.category.includes('Venous') ? '#3b82f6' : (item.category.includes('Pressure') ? '#10b981' : '#f59e0b')
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="dist-footer">
              <button className="view-analytics-full-btn-modern">View Full Analytics</button>
            </div>
          </section>
        </div>
      </div>

      {showTaskModal && (
        <TaskAssignmentModal
          onClose={() => setShowTaskModal(false)}
          onSuccess={() => {
            fetchDashboardData();
            alert('Task assigned successfully to the nursing team.');
          }}
        />
      )}

      {showUploadModal && (
        <WoundUploadModal
          onClose={() => setShowUploadModal(false)}
          onSuccess={fetchDashboardData}
        />
      )}

      {showCalendarModal && (
        <DoctorCalendarModal
          onClose={() => setShowCalendarModal(false)}
          tasks={schedule}
        />
      )}
    </div>
  );
};

export default DoctorDashboard;

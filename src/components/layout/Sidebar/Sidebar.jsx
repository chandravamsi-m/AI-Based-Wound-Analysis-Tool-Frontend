import { LayoutDashboard, Users, FileText, Activity, HardDrive, Settings, Bell, LogOut } from 'lucide-react';
import './Sidebar.css';

function Sidebar({ onSignOut, user, isMobileOpen, onClose, currentView, onViewChange, summary }) {
  const menuItems = [
    {
      id: user?.role === 'Admin' ? 'dashboard' : (user?.role === 'Doctor' ? 'doctor-dashboard' : 'nurse-dashboard'),
      icon: LayoutDashboard,
      label: 'Dashboard'
    },
    ...(user?.role === 'Admin' ? [
      { id: 'users', icon: Users, label: 'User Management' },
      { id: 'logs', icon: FileText, label: 'System Logs' },
      { id: 'storage', icon: HardDrive, label: 'Storage' },
    ] : []),
    ...(user?.role === 'Doctor' ? [
      { id: 'patients', icon: Users, label: 'Patients' },
      { id: 'assessments', icon: Activity, label: 'Assessments' },
      { id: 'reports', icon: FileText, label: 'Reports' },
    ] : []),
    ...(user?.role === 'Nurse' ? [
      { id: 'patients', icon: Users, label: 'My Patients' },
      { id: 'assessments', icon: Activity, label: 'Assessments' },
    ] : []),
  ];

  const handleItemClick = (viewId) => {
    onViewChange(viewId);
    if (isMobileOpen) {
      onClose();
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && <div className="sidebar-overlay" onClick={onClose}></div>}

      <aside className={`sidebar ${isMobileOpen ? 'sidebar-mobile-open' : ''}`}>

        <div className="sidebar-header">
          <div className="sidebar-brand">
            <div className="brand-icon">
              <span className="brand-plus">+</span>
            </div>
            <div className="brand-text">
              <div className="brand-name">MediWound AI</div>
              <div className="brand-subtitle">
                {user?.role === 'Admin' ? 'HOSPITAL ADMIN' : 'CLINICIAN PORTAL'}
              </div>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <button
              key={item.id}
              className={`sidebar-item ${currentView === item.id ? 'sidebar-item-active' : ''}`}
              onClick={() => handleItemClick(item.id)}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-middle">
          <button
            className={`sidebar-item sidebar-alerts ${currentView === 'alerts' ? 'sidebar-item-active' : ''}`}
            onClick={() => handleItemClick('alerts')}
          >
            <Bell size={20} />
            <span>Alerts</span>
            {summary?.security_alerts > 0 && <span className="sidebar-badge">{summary.security_alerts}</span>}
          </button>
        </div>

        <div className="sidebar-footer">
          <button
            className={`sidebar-item ${currentView === 'settings' ? 'sidebar-item-active' : ''}`}
            onClick={() => handleItemClick('settings')}
          >
            <Settings size={20} />
            <span>Settings</span>
          </button>
          <button className="sidebar-item" onClick={onSignOut}>
            <LogOut size={20} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;

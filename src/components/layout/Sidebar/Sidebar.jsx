import { LayoutDashboard, Users, FileText, HardDrive, Settings, Bell, LogOut } from 'lucide-react';
import './Sidebar.css';

function Sidebar({ onSignOut, user, isMobileOpen, onClose, currentView, onViewChange }) {
  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'users', icon: Users, label: 'User Management' },
    { id: 'logs', icon: FileText, label: 'System Logs' },
    { id: 'storage', icon: HardDrive, label: 'Storage' },
    // { id: 'settings', icon: Settings, label: 'Settings' },
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
          <button className="sidebar-item sidebar-alerts">
            <Bell size={20} />
            <span>Alerts</span>
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

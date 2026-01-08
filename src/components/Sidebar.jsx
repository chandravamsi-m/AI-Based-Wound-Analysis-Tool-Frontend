import { LayoutDashboard, Users, FileText, HardDrive, Settings, Bell, LogOut } from 'lucide-react';
import './Sidebar.css';

function Sidebar({ onSignOut, user }) {
  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', active: false },
    { icon: Users, label: 'Role Management', active: false },
    { icon: FileText, label: 'System Logs', active: false },
    { icon: HardDrive, label: 'Storage', active: false },
    { icon: Settings, label: 'Settings', active: true },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-brand">
          <div className="brand-icon">
            <span className="brand-plus">+</span>
          </div>
          <div className="brand-text">
            <div className="brand-name">MediWound AI</div>
            <div className="brand-subtitle">{user?.role?.toUpperCase() || 'GUEST'}</div>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item, index) => (
          <button
            key={index}
            className={`sidebar-item ${item.active ? 'sidebar-item-active' : ''}`}
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
          {/* <span className="sidebar-badge">2</span> */}
        </button>
      </div>

      <div className="sidebar-footer">
        <button className="sidebar-item">
          <Settings size={20} />
          <span>Settings</span>
        </button>
        <button className="sidebar-item" onClick={onSignOut}>
          <LogOut size={20} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;

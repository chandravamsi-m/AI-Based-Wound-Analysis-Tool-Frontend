import { Search, HelpCircle, Bell, User, Menu } from 'lucide-react';
import './Navbar.css';

function Navbar({ user, onMenuToggle }) {
  return (
    <nav className="navbar">
      <button className="navbar-menu-btn" onClick={onMenuToggle} aria-label="Toggle menu">
        <Menu size={24} />
      </button>

      <div className="navbar-title">Dashboard Overview</div>

      <div className="navbar-center">
        <div className="navbar-search">
          <Search size={16} className="navbar-search-icon" />
          <input
            type="text"
            placeholder="Search MRN or Name..."
            className="navbar-search-input"
          />
        </div>
      </div>

      <div className="navbar-right">
        <button className="navbar-icon-btn" title="Help">
          <HelpCircle size={20} />
        </button>
        <button className="navbar-icon-btn navbar-notification" title="Notifications">
          <Bell size={20} />
          <span className="sidebar-badge-dot"></span>
        </button>
        <div className="navbar-user">
          <div className="navbar-user-info">
            <div className="navbar-user-name">{user?.name || 'Guest User'}</div>
            <div className="navbar-user-role">
              {user?.role === 'Nurse' ? 'Nursing Staff' : (user?.role || 'Guest')}
            </div>
          </div>
          <div className="navbar-user-avatar">
            <User size={20} />
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;

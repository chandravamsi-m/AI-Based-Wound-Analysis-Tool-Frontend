import { useState, useEffect } from 'react'
import Navbar from './components/layout/Navbar/Navbar'
import Sidebar from './components/layout/Sidebar/Sidebar'
import UserManagement from './components/admin/UserManagement/UserManagement'
import SplashScreen from './components/auth/SplashScreen/SplashScreen'
import IntroScreens from './components/auth/IntroScreens/IntroScreens'
import Login from './components/auth/Login/Login'
import Dashboard from './components/admin/Dashboard/Dashboard'
import DoctorDashboard from './components/doctor/DoctorDashboard/DoctorDashboard'
import Patients from './components/doctor/Patients/Patients'
import Assessments from './components/doctor/Assessments/Assessments'
import Reports from './components/doctor/Reports/Reports'
import NurseDashboard from './components/nurse/NurseDashboard/NurseDashboard'
import SystemLogs from './components/admin/SystemLogs/SystemLogs'
import Storage from './components/admin/Storage/Storage'
import Settings from './components/admin/Settings/Settings'
import Alerts from './components/admin/Alerts/Alerts'
import apiClient from './services/apiClient'
import authService from './services/authService'
import './App.css'

function App() {
  const [view, setView] = useState('splash') // 'splash', 'intro', 'login', 'app'
  const [activeSubView, setActiveSubView] = useState('dashboard')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [summary, setSummary] = useState(null)

  // Check for existing authentication on mount
  useEffect(() => {
    // Check both localStorage and sessionStorage
    const storage = localStorage.getItem('isAuthenticated') === 'true' ? localStorage : sessionStorage;
    const authStatus = storage.getItem('isAuthenticated');
    const userData = storage.getItem('user');

    if (authStatus === 'true' && userData) {
      setIsAuthenticated(true);
      setCurrentUser(JSON.parse(userData));
      setView('app');
    }
  }, [])

  // Shared Data Fetching for Dashboard and Sidebar Badge
  useEffect(() => {
    if (isAuthenticated && view === 'app') {
      const fetchSummary = async () => {
        try {
          const response = await apiClient.get('/dashboard/summary/');
          setSummary(response.data);
        } catch (error) {
          console.error("Error fetching summary:", error);
        }
      };

      fetchSummary();
      const interval = setInterval(fetchSummary, 30000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, view]);

  useEffect(() => {
    if (view === 'splash') {
      const timer = setTimeout(() => {
        setView('intro')
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [view])

  const handleLoginSuccess = (user) => {
    setIsAuthenticated(true)
    setCurrentUser(user)
    setView('app')

    // Set initial view based on user role
    if (user.role === 'Admin') {
      setActiveSubView('dashboard')
    } else if (user.role === 'Doctor') {
      setActiveSubView('doctor-dashboard')
    } else if (user.role === 'Nurse') {
      setActiveSubView('nurse-dashboard')
    }
  }

  const handleLogout = async () => {
    await authService.logout();
    setIsAuthenticated(false)
    setCurrentUser(null)
    setView('login')
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  const renderSubView = () => {
    switch (activeSubView) {
      case 'dashboard':
        if (currentUser?.role === 'Admin') {
          return <Dashboard onViewChange={setActiveSubView} summary={summary} />;
        }
        // Fall through or handle other roles if 'dashboard' is a generic entry point
        // For now, assuming 'dashboard' is specifically for Admin.
        // If a Doctor or Nurse somehow lands on 'dashboard', they won't see anything here.
        // This might need further refinement based on UX.
        return null; // Or a default message/component
      case 'doctor-dashboard':
        return <DoctorDashboard />;
      case 'patients':
        return <Patients />;
      case 'assessments':
        return <Assessments />;
      case 'reports':
        return <Reports />;
      case 'nurse-dashboard':
        return <NurseDashboard />;
      case 'users':
        return <UserManagement />;
      case 'logs':
        return <SystemLogs />;
      case 'storage':
        return <Storage />;
      case 'settings':
        return <Settings />;
      case 'alerts':
        return <Alerts />;
      default:
        // This default case might need to be more robust, e.g., redirect to a role-specific default
        if (currentUser?.role === 'Admin') {
          return <Dashboard onViewChange={setActiveSubView} summary={summary} />;
        } else if (currentUser?.role === 'Doctor') {
          return <DoctorDashboard />;
        } else if (currentUser?.role === 'Nurse') {
          return <NurseDashboard />;
        }
        return null; // Or a generic "Access Denied" component
    }
  };

  if (view === 'splash') {
    return <SplashScreen />
  }

  if (view === 'intro') {
    return <IntroScreens onFinished={() => setView('login')} />
  }

  if (view === 'login' || !isAuthenticated) {
    return <Login onLoginSuccess={handleLoginSuccess} />
  }

  return (
    <div className="app">
      <Navbar user={currentUser} onMenuToggle={toggleMobileMenu} />
      <Sidebar
        onSignOut={handleLogout}
        user={currentUser}
        isMobileOpen={isMobileMenuOpen}
        onClose={closeMobileMenu}
        currentView={activeSubView}
        onViewChange={setActiveSubView}
        summary={summary}
      />
      <main className="main-content">
        {renderSubView()}
      </main>
    </div>
  )
}

export default App

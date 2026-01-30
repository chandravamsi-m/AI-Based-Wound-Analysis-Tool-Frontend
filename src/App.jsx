import { useState, useEffect } from 'react'
import Navbar from './components/layout/Navbar/Navbar'
import Sidebar from './components/layout/Sidebar/Sidebar'
import UserManagement from './pages/admin/UserManagement/UserManagement'
import SplashScreen from './pages/auth/SplashScreen/SplashScreen'
import IntroScreens from './pages/auth/IntroScreens/IntroScreens'
import Login from './pages/auth/Login/Login'
import Dashboard from './pages/admin/Dashboard/Dashboard'
import DoctorDashboard from './pages/doctor/DoctorDashboard/DoctorDashboard'
import Patients from './pages/common/Patients/PatientsList'
import AddPatient from './pages/common/Patients/AddPatient'
import Assessments from './pages/common/Assessments/AssessmentHistory'
import Reports from './pages/doctor/Reports/Reports'
import NurseDashboard from './pages/nurse/NurseDashboard/NurseDashboard'
import SystemLogs from './pages/admin/SystemLogs/SystemLogs'
import Storage from './pages/admin/Storage/Storage'
import Settings from './pages/admin/Settings/Settings'
import Alerts from './pages/admin/Alerts/Alerts'
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
    const savedSubView = storage.getItem('activeSubView');

    if (authStatus === 'true' && userData) {
      const user = JSON.parse(userData);
      setIsAuthenticated(true);
      setCurrentUser(user);
      setView('app');

      if (savedSubView) {
        setActiveSubView(savedSubView);
      } else {
        // Set initial view based on user role if no saved view
        if (user.role === 'Admin') setActiveSubView('dashboard');
        else if (user.role === 'Doctor') setActiveSubView('doctor-dashboard');
        else if (user.role === 'Nurse') setActiveSubView('nurse-dashboard');
      }
    }
  }, [])

  // Persist activeSubView whenever it changes
  useEffect(() => {
    if (isAuthenticated && activeSubView) {
      const storage = localStorage.getItem('isAuthenticated') === 'true' ? localStorage : sessionStorage;
      storage.setItem('activeSubView', activeSubView);
    }
  }, [activeSubView, isAuthenticated]);

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

    // Explicitly store the initial role-based view
    const storage = localStorage.getItem('isAuthenticated') === 'true' ? localStorage : sessionStorage;
    storage.setItem('activeSubView', user.role === 'Admin' ? 'dashboard' : (user.role === 'Doctor' ? 'doctor-dashboard' : 'nurse-dashboard'));
  }

  const handleLogout = async () => {
    localStorage.removeItem('activeSubView');
    sessionStorage.removeItem('activeSubView');
    sessionStorage.removeItem('clinical_registry_acknowledged');
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
        return <Patients onAddPatient={() => setActiveSubView('add-patient')} />;
      case 'add-patient':
        return <AddPatient onBack={() => setActiveSubView('patients')} />;
      case 'assessments':
        return <Assessments />;
      case 'reports':
        return <Reports />;
      case 'nurse-dashboard':
        return <NurseDashboard onNavigate={setActiveSubView} />;
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

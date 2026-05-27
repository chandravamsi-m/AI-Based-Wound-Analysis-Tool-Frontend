import { useState, useEffect } from 'react'
import Navbar from './components/layout/Navbar/Navbar'
import Sidebar from './components/layout/Sidebar/Sidebar'
import UserManagement from './pages/admin/UserManagement/UserManagement'
import SplashScreen from './pages/auth/SplashScreen/SplashScreen'
import IntroScreens from './pages/auth/IntroScreens/IntroScreens'
import Login from './pages/auth/Login/Login'
import Signup from './pages/auth/Signup/Signup'
import Dashboard from './pages/admin/Dashboard/Dashboard'
import DoctorDashboard from './pages/doctor/DoctorDashboard/DoctorDashboard'
import Patients from './pages/common/Patients/PatientsList'
import AddPatient from './pages/common/Patients/AddPatient'
import Assessments from './pages/common/Assessments/AssessmentHistory'
import Reports from './pages/doctor/Reports/Reports'
import NurseDashboard from './pages/nurse/NurseDashboard/NurseDashboard'
import ClinicalPortal from './components/features/patients/PatientProfile/ClinicalPortal'
import PatientPortal from './pages/patient/PatientPortal'
import PatientOnboarding from './pages/patient/Onboarding/PatientOnboarding'
import SystemLogs from './pages/admin/SystemLogs/SystemLogs'
import Storage from './pages/admin/Storage/Storage'
import Settings from './pages/admin/Settings/Settings'
import Alerts from './pages/admin/Alerts/Alerts'
import apiClient from './services/apiClient'
import authService from './services/authService'
import './App.css'

function App() {
  const [view, setView] = useState('splash') // 'splash', 'intro', 'login', 'signup', 'app'
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
        else if (user.role === 'Patient') {
          if (user.is_profile_complete) setActiveSubView('patient-portal');
          else setActiveSubView('patient-onboarding');
        }
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

  // Shared Data Fetching — Admin summary stats for sidebar badges
  // Only Admins need this endpoint; Doctors and Nurses have their own dashboards
  const fetchSummary = async () => {
    if (!isAuthenticated || view !== 'app') return;
    if (currentUser?.role !== 'Admin') return; // Skip for non-Admin roles
    try {
      const response = await apiClient.get('/dashboard/summary/');
      setSummary(response.data);
    } catch (error) {
      console.error("Error fetching summary:", error);
    }
  };

  useEffect(() => {
    if (isAuthenticated && view === 'app' && currentUser?.role === 'Admin') {
      fetchSummary();
    }
  }, [isAuthenticated, view, currentUser]);

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
    } else if (user.role === 'Patient') {
      if (user.is_profile_complete) {
        setActiveSubView('patient-portal')
      } else {
        setActiveSubView('patient-onboarding')
      }
    }

    // Explicitly store the initial role-based view
    const storage = localStorage.getItem('isAuthenticated') === 'true' ? localStorage : sessionStorage;
    const initialView = user.role === 'Admin' ? 'dashboard' :
      (user.role === 'Doctor' ? 'doctor-dashboard' :
        (user.role === 'Patient' ? (user.is_profile_complete ? 'patient-portal' : 'patient-onboarding') : 'nurse-dashboard'));
    storage.setItem('activeSubView', initialView);
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
    // MANDATORY ONBOARDING: If patient has not completed profile, force onboarding view
    if (currentUser?.role === 'Patient' && !currentUser?.is_profile_complete) {
      return (
        <PatientOnboarding
          onComplete={() => {
            // Update local user state
            const updatedUser = { ...currentUser, is_profile_complete: true };
            setCurrentUser(updatedUser);

            // Persist to storage
            const storage = localStorage.getItem('isAuthenticated') === 'true' ? localStorage : sessionStorage;
            storage.setItem('user', JSON.stringify(updatedUser));

            // Now they can go to their portal
            setActiveSubView('patient-portal');
          }}
          onSignOut={handleLogout}
        />
      );
    }

    switch (activeSubView) {
      case 'dashboard':
        if (currentUser?.role === 'Admin') {
          return <Dashboard onViewChange={setActiveSubView} summary={summary} />;
        }
        return null;
      case 'doctor-dashboard':
        return <DoctorDashboard />;
      case 'patients':
        return <Patients onAddPatient={() => setActiveSubView('add-patient')} onNavigate={setActiveSubView} />;
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
        return <Alerts onAlertDismissed={fetchSummary} />;
      case 'clinical-portal':
        return <ClinicalPortal onBack={() => setActiveSubView('patients')} />;
      case 'patient-portal':
        return <PatientPortal />;
      case 'patient-onboarding':
        // This is now redundant but kept for safety if activeSubView is specifically set
        return <PatientOnboarding onComplete={() => {
          const updatedUser = { ...currentUser, is_profile_complete: true };
          setCurrentUser(updatedUser);
          const storage = localStorage.getItem('isAuthenticated') === 'true' ? localStorage : sessionStorage;
          storage.setItem('user', JSON.stringify(updatedUser));
          setActiveSubView('patient-portal');
        }} />;
      default:
        if (currentUser?.role === 'Admin') return <Dashboard onViewChange={setActiveSubView} summary={summary} />;
        if (currentUser?.role === 'Doctor') return <DoctorDashboard />;
        if (currentUser?.role === 'Nurse') return <NurseDashboard onNavigate={setActiveSubView} />;
        if (currentUser?.role === 'Patient') return <PatientPortal />;
        return null;
    }
  };

  if (view === 'splash') {
    return <SplashScreen />
  }

  if (view === 'intro') {
    return <IntroScreens onFinished={() => setView('login')} />
  }

  if (view === 'signup') {
    return <Signup onBack={() => setView('login')} />
  }

  if (view === 'login' || !isAuthenticated) {
    return <Login onLoginSuccess={handleLoginSuccess} onSignupProgress={() => setView('signup')} />
  }

  // Determine if we should show navigation (sidebar/navbar)
  const isPatientOnboarding = currentUser?.role === 'Patient' && !currentUser?.is_profile_complete;

  return (
    <div className="app">
      {!isPatientOnboarding && <Navbar user={currentUser} onMenuToggle={toggleMobileMenu} />}
      {!isPatientOnboarding && (
        <Sidebar
          onSignOut={handleLogout}
          user={currentUser}
          isMobileOpen={isMobileMenuOpen}
          onClose={closeMobileMenu}
          currentView={activeSubView}
          onViewChange={setActiveSubView}
          summary={summary}
        />
      )}
      <main className={isPatientOnboarding ? "main-content-onboarding" : "main-content"}>
        {renderSubView()}
      </main>
    </div>
  )
}

export default App

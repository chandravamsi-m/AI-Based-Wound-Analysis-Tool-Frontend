import { useState, useEffect } from 'react'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import UserManagement from './components/UserManagement'
import SplashScreen from './components/SplashScreen'
import IntroScreens from './components/IntroScreens'
import Login from './components/Login'
import './App.css'

function App() {
  const [view, setView] = useState('splash') // 'splash', 'intro', 'login', 'app'
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)

  // Check for existing authentication on mount
  useEffect(() => {
    const authStatus = localStorage.getItem('isAuthenticated')
    const userData = localStorage.getItem('user')

    if (authStatus === 'true' && userData) {
      setIsAuthenticated(true)
      setCurrentUser(JSON.parse(userData))
      setView('app')
    }
  }, [])

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
  }

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated')
    localStorage.removeItem('user')
    setIsAuthenticated(false)
    setCurrentUser(null)
    setView('login')
  }

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
      <Navbar user={currentUser} />
      <Sidebar onSignOut={handleLogout} user={currentUser} />
      <main className="main-content">
        <UserManagement />
      </main>
    </div>
  )
}

export default App

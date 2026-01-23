import { useState } from 'react'
import HomePage from './HomePage'
import AboutUs from './AboutUs'
import Login from './Login'
import Signup from './Signup'
import AdminDashboard from './AdminDashboard'
import Articles from './Articles'
import Podcast from './Podcast'
import LiveTV from './LiveTV'

function App() {
  const [currentPage, setCurrentPage] = useState('home')

  const handleNavigate = (page: string) => {
    setCurrentPage(page)
  }

  const handleLogin = () => {
    setCurrentPage('home')
  }

  const handleSignupComplete = () => {
    setCurrentPage('home')
  }

  return (
    <>
      {currentPage === 'home' && <HomePage onNavigate={handleNavigate} />}
      {currentPage === 'about' && <AboutUs onNavigate={handleNavigate} />}
      {currentPage === 'login' && <Login onNavigate={handleNavigate} onLogin={handleLogin} />}
      {currentPage === 'signup' && <Signup onNavigate={handleNavigate} onComplete={handleSignupComplete} />}
      {currentPage === 'admin' && <AdminDashboard onNavigate={handleNavigate} />}
      {currentPage === 'articles' && <Articles onNavigate={handleNavigate} />}
      {currentPage === 'podcast' && <Podcast onNavigate={handleNavigate} />}
      {currentPage === 'livetv' && <LiveTV onNavigate={handleNavigate} />}
    </>
  )
}

export default App

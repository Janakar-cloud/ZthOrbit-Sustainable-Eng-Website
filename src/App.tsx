import { useState } from 'react'
import HomePage from './pages/HomePage/HomePage'
import AboutUs from './pages/AboutUs/AboutUs'
import Login from './pages/Login/Login'
import Signup from './pages/Signup/Signup'
import AdminDashboard from './pages/AdminDashboard/AdminDashboard'
import Articles from './pages/Articles/Articles'
import Podcast from './pages/Podcast/Podcast'
import LiveTV from './pages/LiveTv/LiveTV'
import CaseStories from './pages/CaseStories/CaseStories'

function App() {
  const [currentPage, setCurrentPage] = useState('home')

  const handleNavigate = (page: string) => {
    setCurrentPage(page)
  }

  const handleLogin = () => {
    setCurrentPage('admin')
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
      {currentPage === 'casestories' && <CaseStories onNavigate={handleNavigate} />}
    </>
  )
}

export default App

import { useEffect, useCallback } from 'react'
import HomePage from './pages/HomePage/HomePage'
import AboutUs from './pages/AboutUs/AboutUs'
import Login from './pages/Login/Login'
import ForgotPassword from './pages/Login/ForgotPassword'
import ResetPassword from './pages/Login/ResetPassword'
import Signup from './pages/Signup/Signup'
import AdminDashboard from './pages/AdminDashboard/AdminDashboard'
import Articles from './pages/Articles/Articles'
import Podcast from './pages/Podcast/Podcast'
import LiveTV from './pages/LiveTv/LiveTV'
import { useAppContext } from './context/AppContext'

const PATH_TO_PAGE: Record<string, string> = {
  '/': 'home',
  '/about': 'about',
  '/login': 'login',
  '/signup': 'signup',
  '/admin': 'admin',
  '/articles': 'articles',
  '/podcast': 'podcast',
  '/livetv': 'videos',
  '/videos': 'videos',
  '/forgot-password': 'forgot-password',
  '/reset': 'reset',
  // '/casestories': 'casestories',
}

const PAGE_TO_PATH: Record<string, string> = Object.fromEntries(
  Object.entries(PATH_TO_PAGE).map(([k, v]) => [v, k])
)

function pageFromPath(pathname: string): string {
  return PATH_TO_PAGE[pathname] || 'home'
}

function App() {
  const { activePage, setActivePage, isAdmin, logout } = useAppContext()

  // Set initial page from URL on mount
  useEffect(() => {
    // If redirected here from dashboard logout, clear tokens and go home
    if (window.location.search.includes('loggedOut=1')) {
      logout();
      window.history.replaceState(null, '', '/');
      setActivePage('home');
      return;
    }
    const initial = pageFromPath(window.location.pathname)
    setActivePage(initial)
  }, [setActivePage, logout])

  // Listen for browser back/forward
  useEffect(() => {
    const onPopState = () => {
      setActivePage(pageFromPath(window.location.pathname))
    }
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [setActivePage])

  const handleNavigate = useCallback((page: string) => {
    const path = PAGE_TO_PATH[page] || '/'
    if (window.location.pathname !== path) {
      window.history.pushState(null, '', path)
    }
    setActivePage(page)
    window.scrollTo(0, 0)
  }, [setActivePage])

  // Redirect to login when the axios interceptor fires force-logout (expired/invalid token)
  useEffect(() => {
    const onForceLogout = () => handleNavigate('login')
    window.addEventListener('auth:force-logout', onForceLogout)
    return () => window.removeEventListener('auth:force-logout', onForceLogout)
  }, [handleNavigate])

  const handleLogin = () => {
    handleNavigate(isAdmin ? 'admin' : 'home')
  }

  const handleSignupComplete = () => {
    handleNavigate('home')
  }

  return (
    <>
      {activePage === 'home' && <HomePage onNavigate={handleNavigate} />}
      {activePage === 'about' && <AboutUs onNavigate={handleNavigate} />}
      {activePage === 'login' && <Login onNavigate={handleNavigate} onLogin={handleLogin} />}
      {activePage === 'signup' && <Signup onNavigate={handleNavigate} onComplete={handleSignupComplete} />}
      {activePage === 'admin' && (
        isAdmin
          ? <AdminDashboard onNavigate={handleNavigate} />
          : <Login onNavigate={handleNavigate} onLogin={handleLogin} />
      )}
      {activePage === 'articles' && <Articles onNavigate={handleNavigate} />}
      {activePage === 'podcast' && <Podcast onNavigate={handleNavigate} />}
      {activePage === 'videos' && <LiveTV onNavigate={handleNavigate} />}
      {activePage === 'forgot-password' && <ForgotPassword onNavigate={handleNavigate} />}
      {activePage === 'reset' && <ResetPassword onNavigate={handleNavigate} />}
    </>
  )
}

export default App

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'

interface AuthUser {
  id: string
  role: 'superadmin' | 'admin' | 'editor' | 'viewer'
  email: string
}

interface AppContextType {
  activePage: string
  setActivePage: (page: string) => void
  darkMode: boolean
  toggleDarkMode: () => void
  showProfileMenu: boolean
  toggleProfileMenu: () => void
  isAdmin: boolean
  isLoggedIn: boolean
  user: AuthUser | null
  loginWithTokens: (accessToken: string, refreshToken: string) => void
  logout: () => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

function decodeJwtPayload(token: string): AuthUser | null {
  try {
    const base64 = token.split('.')[1]
    if (!base64) return null
    const json = atob(base64.replace(/-/g, '+').replace(/_/g, '/'))
    const payload = JSON.parse(json)
    // Reject expired tokens
    if (payload.exp && payload.exp * 1000 < Date.now()) return null
    if (payload.id && payload.role && payload.email) {
      return { id: payload.id, role: payload.role, email: payload.email }
    }
    return null
  } catch {
    return null
  }
}

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [activePage, setActivePage] = useState('home')
  const [darkMode, setDarkMode] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [user, setUser] = useState<AuthUser | null>(null)

  // Restore auth state from localStorage on mount (rejects expired tokens)
  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      const decoded = decodeJwtPayload(token)
      if (decoded) {
        setUser(decoded)
      } else {
        // Token is expired or invalid — clear storage
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
      }
    }
  }, [])

  // Listen for force-logout dispatched by the axios interceptor on unrecoverable 401
  useEffect(() => {
    const onForceLogout = () => {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      setUser(null)
    }
    window.addEventListener('auth:force-logout', onForceLogout)
    return () => window.removeEventListener('auth:force-logout', onForceLogout)
  }, [])

  const loginWithTokens = useCallback((accessToken: string, refreshToken: string) => {
    localStorage.setItem('accessToken', accessToken)
    localStorage.setItem('refreshToken', refreshToken)
    const decoded = decodeJwtPayload(accessToken)
    setUser(decoded)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    setUser(null)
  }, [])

  const isLoggedIn = user !== null
  const isAdmin = user?.role === 'superadmin' || user?.role === 'admin' || user?.role === 'editor'

  return (
    <AppContext.Provider
      value={{
        activePage,
        setActivePage,
        darkMode,
        toggleDarkMode: () => setDarkMode(d => !d),
        showProfileMenu,
        toggleProfileMenu: () => setShowProfileMenu(p => !p),
        isAdmin,
        isLoggedIn,
        user,
        loginWithTokens,
        logout,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export const useAppContext = () => {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useAppContext must be used inside AppProvider')
  return ctx
}

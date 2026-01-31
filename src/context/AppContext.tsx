import { createContext, useContext, useState, ReactNode } from 'react'


interface AppContextType {
  activePage: string
  setActivePage: (page: string) => void
  darkMode: boolean
  toggleDarkMode: () => void
  showProfileMenu: boolean
  toggleProfileMenu: () => void
  isAdmin: boolean
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [activePage, setActivePage] = useState('home')
  const [darkMode, setDarkMode] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)

  return (
    <AppContext.Provider
      value={{
        activePage,
        setActivePage,
        darkMode,
        toggleDarkMode: () => setDarkMode(d => !d),
        showProfileMenu,
        toggleProfileMenu: () => setShowProfileMenu(p => !p),
        isAdmin: false,
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

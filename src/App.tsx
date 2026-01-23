import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import HomePage from './HomePage'
import AboutUs from './AboutUs'
import './App.css'

function App() {
  return (
    <Router>
      <div className="app">
        <nav className="navbar">
          <div className="nav-container">
            <Link to="/" className="nav-logo">
              <span className="logo-text">Green Generation TV</span>
            </Link>
            <ul className="nav-menu">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/articles">Articles</Link></li>
              <li><Link to="/case-stories">Case Stories</Link></li>
              <li><Link to="/podcast">Podcast</Link></li>
              <li><Link to="/livetv">Live TV</Link></li>
            </ul>
          </div>
        </nav>

        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutUs />} />
        </Routes>

        <footer className="footer">
          <div className="footer-content">
            <p>&copy; 2026 Green Generation TV - Sustainable Engineering Media</p>
          </div>
        </footer>
      </div>
    </Router>
  )
}

export default App

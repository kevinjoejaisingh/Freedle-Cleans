import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import './Header.css'
import logo from '../assets/images/logo.png'

function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const { user, isAdmin } = useAuth()

  return (
    <>
      <header className="header">
        <nav className="nav">
          <Link to="/" className="logo">
            <img src={logo} alt="Freedle Cleans Logo" className="logo-image" />
            <div className="logo-text">FREEDLE CLEANS</div>
          </Link>

          <button
            className="hamburger"
            onClick={() => setIsOpen(!isOpen)}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>

          <div className={`nav-menu ${isOpen ? 'active' : ''}`}>
            <Link to="/" onClick={() => setIsOpen(false)}>Home</Link>
            <Link to="/services" onClick={() => setIsOpen(false)}>Services</Link>
            <Link to="/reviews" onClick={() => setIsOpen(false)}>Reviews</Link>
            <Link to="/about" onClick={() => setIsOpen(false)}>About Us</Link>
            <Link
              to={user && isAdmin ? '/admin' : '/admin/login'}
              className="admin-link"
              onClick={() => setIsOpen(false)}
            >
              {user && isAdmin ? 'Admin Panel' : 'Admin'}
            </Link>
          </div>
        </nav>
      </header>

      {isOpen && <div className="overlay" onClick={() => setIsOpen(false)}></div>}
    </>
  )
}

export default Header
import { useState } from 'react'
import { Link } from 'react-router-dom'
import './Header.css'
import logo from '../assets/images/logo.png'

function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleBooking = () => {
    window.open('https://calendly.com/freedle-clean', '_blank')
  }

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen)
  }

  const closeMobileMenu = () => {
    setMobileMenuOpen(false)
  }

  return (
    <header className="header">
      <nav className="nav">
        <Link to="/" className="logo" onClick={closeMobileMenu}>
          <img src={logo} alt="Freedle Cleans Logo" className="logo-image" />
          <div className="logo-text">FREEDLE CLEANS</div>
        </Link>

        {/* Hamburger Menu Button */}
        <button 
          className={`hamburger ${mobileMenuOpen ? 'open' : ''}`}
          onClick={toggleMobileMenu}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        {/* Navigation Links */}
        <ul className={`nav-links ${mobileMenuOpen ? 'mobile-open' : ''}`}>
          <li><Link to="/" onClick={closeMobileMenu}>Home</Link></li>
          <li><Link to="/services" onClick={closeMobileMenu}>Services</Link></li>
          <li><Link to="/reviews" onClick={closeMobileMenu}>Reviews</Link></li>
          <li><Link to="/about" onClick={closeMobileMenu}>About Us</Link></li>
          <li className="mobile-book-btn">
            <button className="book-btn" onClick={() => { handleBooking(); closeMobileMenu(); }}>
              Book Now
            </button>
          </li>
        </ul>

        {/* Desktop Book Button */}
        <button className="book-btn desktop-only" onClick={handleBooking}>Book Now</button>
      </nav>
    </header>
  )
}

export default Header
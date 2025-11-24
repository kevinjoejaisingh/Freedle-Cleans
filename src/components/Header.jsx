import { Link } from 'react-router-dom'
import './Header.css'
import logo from '../assets/images/logo.png'

function Header() {
  const handleBooking = () => {
    window.open('https://calendly.com/freedle-clean', '_blank')
  }

  return (
    <header className="header">
      <nav className="nav">
        <Link to="/" className="logo">
          <img src={logo} alt="Freedle Cleans Logo" className="logo-image" />
          <div className="logo-text">FREEDLE CLEANS</div>
        </Link>
        <ul className="nav-links">
          <li><Link to="/">Home</Link></li>
          <li><Link to="/services">Services</Link></li>
          <li><Link to="/reviews">Reviews</Link></li>
          <li><Link to="/about">About Us</Link></li>
        </ul>
        <button className="book-btn" onClick={handleBooking}>Book Now</button>
      </nav>
    </header>
  )
}

export default Header
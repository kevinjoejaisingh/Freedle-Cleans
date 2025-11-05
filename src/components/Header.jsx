import { Link } from 'react-router-dom'
import './Header.css'
import logo from '../assets/images/logo.png'

function Header() {
  return (
    <header className="header">
      <nav className="nav">
        <Link to="/" className="logo">
          <img src={logo} alt="Logo" className="logo-image" />
          <div className="logo-text">LUXURY DETAILING</div>
        </Link>
        <ul className="nav-links">
          <li><Link to="/">Home</Link></li>
          <li><Link to="/services">Services</Link></li>
          <li><Link to="/reviews">Reviews</Link></li>
          <li><Link to="/about">About Us</Link></li>
        </ul>
        <button className="book-btn">Book Now</button>
      </nav>
    </header>
  )
}

export default Header
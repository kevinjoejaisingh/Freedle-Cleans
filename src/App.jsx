import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Home from './pages/Home'
import ServicesPage from './pages/ServicesPage'
import './App.css'

function App() {
  return (
    <Router>
      <div className="app">
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/reviews" element={<ComingSoon page="Reviews" />} />
          <Route path="/about" element={<ComingSoon page="About Us" />} />
        </Routes>
      </div>
    </Router>
  )
}

// Placeholder component for pages you haven't built yet
function ComingSoon({ page }) {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      gap: '1rem',
      paddingTop: '100px'
    }}>
      <h1 style={{ color: 'var(--gold)', fontSize: '3rem' }}>{page}</h1>
      <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1.2rem' }}>Coming Soon</p>
    </div>
  )
}

export default App
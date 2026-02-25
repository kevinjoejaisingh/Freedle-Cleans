import { useNavigate } from 'react-router-dom'
import Hero from '../components/Hero'
import './Home.css'

function Home() {
  const navigate = useNavigate()

  return (
    <div className="home">
      <Hero />
      <section className="home-cta">
        <h2>Ready to Get Started?</h2>
        <p>Book your detail today and experience the Freedle difference.</p>
        <button className="home-cta-btn" onClick={() => navigate('/services')}>Book Now</button>
      </section>
    </div>
  )
}

export default Home
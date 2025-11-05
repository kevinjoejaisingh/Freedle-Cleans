import './Hero.css'
import BeforeAfter from './BeforeAfter'

function Hero() {
  return (
    <section className="hero">
      <div className="hero-content">
        <h1>Precision Detailing<br/>for Luxury Vehicles</h1>
        <p>Where craftsmanship meets excellence</p>
      </div>
      <BeforeAfter />
      <div className="scroll-indicator">
        <div>↓</div>
      </div>
    </section>
  )
}

export default Hero
import './Hero.css'
import BeforeAfter from './BeforeAfter'
import detailImg1 from '../assets/images/_DSC2036.jpg'
import detailImg2 from '../assets/images/_DSC2336.jpg'

function Hero() {
  return (
    <section className="hero">
      <div className="hero-content">
        <h1>Precision Detailing<br/>for Luxury Vehicles</h1>
        <p>Where craftsmanship meets excellence</p>
      </div>
      <BeforeAfter />
      
      <div className="detail-gallery">
        <img src={detailImg1} alt="Detail work close-up" />
        <img src={detailImg2} alt="Detail work close-up" />
      </div>

      <div className="scroll-indicator">
        <div>↓</div>
      </div>
    </section>
  )
}

export default Hero
import { useNavigate } from 'react-router-dom'
import './Hero.css'
import BeforeAfter from './BeforeAfter'
import { useFirestoreData } from '../hooks/useFirestoreData'
import { getSiteConfig } from '../firebase/services'
import detailImg1 from '../assets/images/_DSC2036.jpg'
import detailImg2 from '../assets/images/_DSC2336.jpg'

const defaultHomeConfig = {
  heroHeading: 'Precision Detailing\nfor Luxury Vehicles',
  heroSubheading: 'Where craftsmanship meets excellence',
  galleryImages: [
    { id: 'default_1', url: detailImg1, alt: 'Detail work close-up' },
    { id: 'default_2', url: detailImg2, alt: 'Detail work close-up' }
  ],
  beforeAfter: null
}

function Hero() {
  const navigate = useNavigate()
  const { data } = useFirestoreData(
    () => getSiteConfig('home'),
    defaultHomeConfig
  )

  const config = data || defaultHomeConfig
  const galleryImages = config.galleryImages?.length > 0 ? config.galleryImages : defaultHomeConfig.galleryImages
  const heading = config.heroHeading || defaultHomeConfig.heroHeading
  const subheading = config.heroSubheading || defaultHomeConfig.heroSubheading

  return (
    <section className="hero">
      <div className="hero-content">
        <h1>{heading.split('\n').map((line, i) => (
          <span key={i}>{line}{i < heading.split('\n').length - 1 && <br/>}</span>
        ))}</h1>
        <p>{subheading}</p>
        <button className="hero-book-btn" onClick={() => navigate('/services')}>Book Now</button>
      </div>
      <BeforeAfter
        beforeImage={config.beforeAfter?.beforeImage}
        afterImage={config.beforeAfter?.afterImage}
      />

      <div className="detail-gallery">
        {galleryImages.map(img => (
          <img key={img.id} src={img.url} alt={img.alt || 'Detail work'} />
        ))}
      </div>

      <div className="scroll-indicator">
        <div>↓</div>
      </div>
    </section>
  )
}

export default Hero

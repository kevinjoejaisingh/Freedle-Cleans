import Services from '../components/Services'
import './ServicesPage.css'

function ServicesPage() {
  return (
    <div className="services-page">
      <div className="services-page-header">
        <h1>Our Services</h1>
        <p>Premium detailing packages tailored to your vehicle's needs</p>
      </div>
      <Services />
    </div>
  )
}

export default ServicesPage
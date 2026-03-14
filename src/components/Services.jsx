import { useState } from 'react'
import BookingModal from './BookingModal'
import './Services.css'
import exteriorImg from '../assets/images/_DSC8088.jpg'
import interiorImg from '../assets/images/_DSC0957.jpg'
import ceramicImg from '../assets/images/_DSC9834.jpg'

export const defaultServicesData = [
  {
    id: 1,
    title: "EXTERIOR DETAIL",
    price: "Starting at $149",
    priceValue: 149,
    tier: 1,
    icon: "🚿",
    image: exteriorImg,
    description: "Deep tire, rim, and fender wash with pre-wash, contact wash, and gloss sealant finish. Your vehicle's exterior will shine like new with our meticulous hand-washing process and premium products.",
    includes: [
      "Deep tire & rim cleaning",
      "Fender wash",
      "Pre-wash treatment",
      "Contact wash with premium soap",
      "Gloss sealant finish",
      "Exterior glass cleaning",
      "Tire shine application"
    ],
    time: "2-3 hours"
  },
  {
    id: 2,
    title: "INTERIOR DETAIL",
    price: "Starting at $199",
    priceValue: 199,
    tier: 2,
    icon: "✨",
    image: interiorImg,
    description: "Complete interior transformation including vacuuming, steam/spot treatment, thorough wipe-down of all surfaces, mats cleaned, door jambs, and streak-free glass. Leaves your car UV protected and smelling new.",
    includes: [
      "Full interior vacuum",
      "Steam & spot treatment",
      "All surfaces wiped down",
      "Floor mats cleaned",
      "Door jambs detailed",
      "Streak-free glass cleaning",
      "UV protection applied",
      "Fresh scent finish"
    ],
    time: "3-4 hours"
  },
  {
    id: 3,
    title: "CERAMIC COATING",
    price: "Starting at $899",
    priceValue: 899,
    tier: 3,
    icon: "💎",
    image: ceramicImg,
    description: "The ultimate protection for your vehicle. Full decontamination and gloss polish sealed with a professional-grade 3-4 year ceramic coating for unmatched shine and protection against the elements.",
    includes: [
      "Full exterior detail",
      "Paint decontamination",
      "Gloss polish",
      "Professional ceramic coating application",
      "3-4 year protection guarantee",
      "Hydrophobic finish",
      "UV & chemical resistance"
    ],
    time: "1-2 days"
  }
]

export const defaultAddonsData = [
  { 
    id: 1, 
    name: "Headlight Restoration", 
    price: 79, 
    description: "Restore cloudy, yellowed headlights to crystal clear for improved visibility and appearance."
  },
  { 
    id: 2, 
    name: "Clay Bar Treatment", 
    price: 99, 
    description: "Removes embedded contaminants from your paint that washing can't reach, leaving the surface ultra-smooth."
  },
  { 
    id: 3, 
    name: "Seat & Carpet Shampoo", 
    price: 49, 
    description: "Deep cleans fabric seats and carpets to lift dirt, spills, and odors for a fresh, renewed interior."
  },
  { 
    id: 4, 
    name: "Stain Removal", 
    price: 49, 
    description: "Targets tough interior or exterior stains using specialized cleaners to restore the surface."
  },
  { 
    id: 5, 
    name: "Trim Restoration", 
    price: 39, 
    description: "Revives faded plastic and rubber trim, bringing back a rich, dark finish."
  },
  { 
    id: 6, 
    name: "Leather Conditioner", 
    price: 45, 
    description: "Cleans and nourishes leather surfaces, restoring softness and preventing cracking."
  }
]

function Services({ servicesData: servicesDataProp, addonsData: addonsDataProp }) {
  const servicesData = servicesDataProp || defaultServicesData
  const addonsData = addonsDataProp || defaultAddonsData
  const [expandedService, setExpandedService] = useState(null)
  const [selectedService, setSelectedService] = useState(null)
  const [selectedAddons, setSelectedAddons] = useState([])
  const [showBookingModal, setShowBookingModal] = useState(false)

  const toggleService = (id) => {
    setExpandedService(expandedService === id ? null : id)
  }

  const selectService = (service) => {
  setSelectedService(service)
  setTimeout(() => {
    document.querySelector('.addons')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, 100)
  }

  const toggleAddon = (addon) => {
    setSelectedAddons(prev =>
      prev.find(a => a.id === addon.id)
        ? prev.filter(a => a.id !== addon.id)
        : [...prev, addon]
    )
  }

  const getServicePrice = (service) => {
    return parseInt(service.price.replace(/[^0-9]/g, '') || '0')
  }

  const calculateTotal = () => {
    const servicePrice = selectedService ? getServicePrice(selectedService) : 0
    const addonsPrice = selectedAddons.reduce((sum, addon) => sum + Number(addon.price), 0)
    return servicePrice + addonsPrice
  }

  const handleBooking = () => {
    setShowBookingModal(true)
  }
  return (
    <>
      <section className="services">
        {servicesData.map(service => (
          <div key={service.id} className="service-accordion">
            <div
              className="service-header"
              onClick={() => toggleService(service.id)}
            >
              <div className="service-header-left">
                <div className="service-icon">
                  {service.iconUrl
                    ? <img src={service.iconUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                    : service.icon}
                </div>
                <div className="service-title-price">
                  <div className="service-title">{service.title}</div>
                  <div className="service-price">{service.price}</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <div className="tier-indicator">
                  {[1, 2, 3].map(dot => (
                    <div
                      key={dot}
                      className={`tier-dot ${dot <= service.tier ? 'active' : ''}`}
                    />
                  ))}
                </div>
                <div className={`expand-icon ${expandedService === service.id ? 'expanded' : ''}`}>
                  ▼
                </div>
              </div>
            </div>

            <div className={`service-content ${expandedService === service.id ? 'expanded' : ''}`}>
              <img src={service.imageUrl || service.image} alt={service.title} className="service-image" />
              <p className="service-description">{service.description}</p>

              <div className="service-includes">
                <h4>What's Included:</h4>
                <ul>
                  {service.includes.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>

              <div className="service-time">⏱️ Estimated Time: {service.time}</div>

              <button
                className="select-service-btn"
                onClick={() => selectService(service)}
              >
                SELECT THIS SERVICE
              </button>
            </div>
          </div>
        ))}
      </section>

      <section className="addons">
        <h3>Enhance Your Detail</h3>
        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.6)', marginBottom: '2rem' }}>
          {selectedService ? `Add extra services to your ${selectedService.title}` : 'Select a service above to customize your detail'}
        </p>

        <div className="addon-grid">
          {addonsData.map(addon => (
            <div
              key={addon.id}
              className={`addon-card ${selectedAddons.find(a => a.id === addon.id) ? 'selected' : ''}`}
              onClick={() => toggleAddon(addon)}
            >
              <div className="addon-header">
                <div className="addon-checkbox"></div>
                <div className="addon-price">+${addon.price}</div>
              </div>
              <div className="addon-name">{addon.name}</div>
              <div className="addon-description">{addon.description}</div>
            </div>
          ))}
        </div>

        {selectedService && (
          <div className="total-section">
            <div className="total-row">
              <span>Selected Service:</span>
              <span>{selectedService.title}</span>
            </div>
            <div className="total-row">
              <span>Base Price:</span>
              <span>${getServicePrice(selectedService)}</span>
            </div>
            {selectedAddons.map(addon => (
              <div key={addon.id} className="total-row">
                <span>{addon.name}:</span>
                <span>+${addon.price}</span>
              </div>
            ))}
            <div className="total-row final">
              <span>Total Estimate:</span>
              <span>${calculateTotal()}</span>
            </div>
            <button className="checkout-btn" onClick={handleBooking}>
              BOOK NOW
            </button>
          </div>
        )}
      </section>

      <BookingModal
        isOpen={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        selectedService={selectedService}
        selectedAddons={selectedAddons}
        totalEstimate={calculateTotal()}
      />
    </>
  )
}

export default Services
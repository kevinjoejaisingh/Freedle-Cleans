import { useState } from 'react'
import './Services.css'

const servicesData = [
  {
    id: 1,
    title: "EXTERIOR WASH",
    price: "Starting at $149",
    tier: 1,
    icon: "🚿",
    image: "/src/assets/images/_DSC8088.jpg",  // ← Changed
    description: "Premium hand wash for your vehicle's exterior. We use pH-balanced soaps, microfiber mitts, and a meticulous two-bucket method to safely remove dirt and grime without scratching your paint.",
    includes: [
      "Hand wash with premium soap",
      "Wheel & tire cleaning",
      "Exterior glass cleaning",
      "Drying with microfiber towels",
      "Tire shine application"
    ],
    time: "1-2 hours"
  },
  {
    id: 2,
    title: "FULL INTERIOR & EXTERIOR",
    price: "Starting at $299",
    tier: 2,
    icon: "✨",
    image: "/src/assets/images/_DSC0957.jpg",  // ← Changed
    description: "Our comprehensive detailing service transforms your vehicle inside and out. Every surface is meticulously cleaned, conditioned, and protected.",
    includes: [
      "Everything in Exterior Wash",
      "Full interior vacuum",
      "Dashboard & console cleaning",
      "Leather conditioning",
      "Interior glass cleaning",
      "Door jamb cleaning"
    ],
    time: "3-4 hours"
  },
  {
    id: 3,
    title: "CERAMIC COATING",
    price: "Starting at $899",
    tier: 3,
    icon: "💎",
    image: "/src/assets/images/_DSC9834.jpg",  // ← Changed (Ferrari golden hour)
    description: "The ultimate protection for your vehicle. Our professional-grade ceramic coating creates a hydrophobic barrier that lasts years, not months.",
    includes: [
      "Everything in Full Detail",
      "Paint decontamination",
      "Single-stage paint correction",
      "Professional ceramic coating application",
      "3-5 year protection guarantee"
    ],
    time: "6-8 hours (multi-day process)"
  }
]


const addonsData = [
  { id: 1, name: "Add-on #1", price: 49, description: "Additional service option" },
  { id: 2, name: "Add-on #2", price: 79, description: "Additional service option" },
  { id: 3, name: "Add-on #3", price: 99, description: "Additional service option" },
  { id: 4, name: "Add-on #4", price: 129, description: "Additional service option" },
  { id: 5, name: "Add-on #5", price: 149, description: "Additional service option" }
]

function Services() {
  const [expandedService, setExpandedService] = useState(null)
  const [selectedService, setSelectedService] = useState(null)
  const [selectedAddons, setSelectedAddons] = useState([])

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

  const calculateTotal = () => {
    const servicePrice = selectedService ? parseInt(selectedService.price.match(/\d+/)[0]) : 0
    const addonsPrice = selectedAddons.reduce((sum, addon) => sum + addon.price, 0)
    return servicePrice + addonsPrice
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
                <div className="service-icon">{service.icon}</div>
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
              <img src={service.image} alt={service.title} className="service-image" />
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
              <span>{selectedService.price}</span>
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
            <button className="checkout-btn">
              CONTINUE TO BOOKING
            </button>
          </div>
        )}
      </section>
    </>
  )
}

export default Services
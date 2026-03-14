import { useState, useEffect } from 'react'
import emailjs from '@emailjs/browser'
import { getAvailableSlots, getTimeSlotDoc, addBooking, updateTimeSlot } from '../firebase/services'
import './BookingModal.css'

const EMAILJS_SERVICE_ID = 'service_freedle'
const EMAILJS_TEMPLATE_ID = 'template_booking'
const EMAILJS_PUBLIC_KEY = 'YOUR_PUBLIC_KEY'

function BookingModal({ isOpen, onClose, selectedService, selectedAddons, totalEstimate }) {
  const [step, setStep] = useState(1)
  const [slots, setSlots] = useState([])
  const [loadingSlots, setLoadingSlots] = useState(true)
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [customerInfo, setCustomerInfo] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    vehicleMake: '',
    vehicleModel: '',
    vehicleYear: '',
    address: ''
  })

  useEffect(() => {
    if (isOpen) {
      setStep(1)
      setSelectedSlot(null)
      setSubmitting(false)
      setCustomerInfo({
        customerName: '', customerPhone: '', customerEmail: '',
        vehicleMake: '', vehicleModel: '', vehicleYear: '', address: ''
      })
      loadSlots()
    }
  }, [isOpen])

  const loadSlots = async () => {
    setLoadingSlots(true)
    try {
      const data = await getAvailableSlots()
      setSlots(data)
    } catch (err) {
      console.error('Error loading available slots:', err)
    }
    setLoadingSlots(false)
  }

  if (!isOpen) return null

  const formatDate = (dateStr) => {
    const [y, m, d] = dateStr.split('-')
    return new Date(y, m - 1, d).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
  }

  const formatTime = (timeStr) => {
    const [h, m] = timeStr.split(':')
    const hour = parseInt(h)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const display = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour
    return `${display}:${m} ${ampm}`
  }

  const grouped = slots.reduce((acc, slot) => {
    if (!acc[slot.date]) acc[slot.date] = []
    acc[slot.date].push(slot)
    return acc
  }, {})
  const sortedDates = Object.keys(grouped).sort()

  const updateField = (field, value) => setCustomerInfo(prev => ({ ...prev, [field]: value }))

  const isStep2Valid = () => {
    const { customerName, customerPhone, customerEmail, vehicleMake, vehicleModel, vehicleYear, address } = customerInfo
    return customerName && customerPhone && customerEmail && vehicleMake && vehicleModel && vehicleYear && address
  }

  const handleConfirm = async () => {
    setSubmitting(true)
    try {
      // Re-check slot availability
      const freshSlot = await getTimeSlotDoc(selectedSlot.id)
      if (!freshSlot || freshSlot.status !== 'open') {
        alert('Sorry, this time slot was just booked by someone else. Please pick another slot.')
        setStep(1)
        await loadSlots()
        setSubmitting(false)
        return
      }

      const bookingData = {
        timeSlotId: selectedSlot.id,
        date: selectedSlot.date,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime || null,
        serviceName: selectedService.title,
        servicePrice: Number(selectedService.priceValue) || parseInt(selectedService.price.match(/\d+/)?.[0] || '0'),
        addons: selectedAddons.map(a => ({ name: a.name, price: a.price })),
        totalEstimate,
        ...customerInfo
      }

      const bookingRef = await addBooking(bookingData)
      await updateTimeSlot(selectedSlot.id, { status: 'booked', bookingId: bookingRef.id })

      // Send email notification to owner
      try {
        await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
          customer_name: customerInfo.customerName,
          customer_phone: customerInfo.customerPhone,
          customer_email: customerInfo.customerEmail,
          service_name: selectedService.title,
          date: formatDate(selectedSlot.date),
          time: `${formatTime(selectedSlot.startTime)}${selectedSlot.endTime ? ' – ' + formatTime(selectedSlot.endTime) : ''}`,
          vehicle: `${customerInfo.vehicleYear} ${customerInfo.vehicleMake} ${customerInfo.vehicleModel}`,
          address: customerInfo.address,
          addons: selectedAddons.length > 0 ? selectedAddons.map(a => `${a.name} (+$${a.price})`).join(', ') : 'None',
          total: `$${totalEstimate}`,
        }, EMAILJS_PUBLIC_KEY)
      } catch (emailErr) {
        console.warn('Email notification failed:', emailErr)
      }

      setStep(4) // done
    } catch (err) {
      console.error('Booking error:', err)
      alert('Something went wrong. Please try again.')
    }
    setSubmitting(false)
  }

  const stepTitles = { 1: 'Pick a Time', 2: 'Your Information', 3: 'Review & Confirm', 4: 'Confirmed!' }

  return (
    <div className="booking-overlay" onClick={onClose}>
      <div className="booking-modal" onClick={e => e.stopPropagation()}>
        <div className="booking-modal-header">
          <h2>{stepTitles[step]}</h2>
          <button className="booking-close-btn" onClick={onClose}>&times;</button>
        </div>

        <div className="booking-body">
          {step < 4 && (
            <div className="booking-steps">
              {[1, 2, 3].map(s => (
                <div key={s} className={`booking-step-dot ${s === step ? 'active' : s < step ? 'done' : ''}`} />
              ))}
            </div>
          )}

          {/* Step 1: Pick time slot */}
          {step === 1 && (
            <>
              {loadingSlots ? (
                <p style={{ color: 'rgba(255,255,255,0.5)', textAlign: 'center' }}>Loading available times...</p>
              ) : sortedDates.length === 0 ? (
                <p className="no-slots-msg">No available time slots right now. Please check back later.</p>
              ) : (
                sortedDates.map(date => (
                  <div key={date} className="booking-date-group">
                    <div className="booking-date-label">{formatDate(date)}</div>
                    <div className="booking-slots-grid">
                      {grouped[date]
                        .sort((a, b) => a.startTime.localeCompare(b.startTime))
                        .map(slot => (
                          <button
                            key={slot.id}
                            className={`booking-slot-btn ${selectedSlot?.id === slot.id ? 'selected' : ''}`}
                            onClick={() => setSelectedSlot(slot)}
                          >
                            {formatTime(slot.startTime)}{slot.endTime ? ` – ${formatTime(slot.endTime)}` : ''}
                          </button>
                        ))}
                    </div>
                  </div>
                ))
              )}
              <div className="booking-actions">
                <button
                  className="booking-btn-primary"
                  disabled={!selectedSlot}
                  onClick={() => setStep(2)}
                >
                  Continue
                </button>
              </div>
            </>
          )}

          {/* Step 2: Customer info */}
          {step === 2 && (
            <>
              <div className="booking-field">
                <label>Full Name</label>
                <input value={customerInfo.customerName} onChange={e => updateField('customerName', e.target.value)} />
              </div>
              <div className="booking-row">
                <div className="booking-field">
                  <label>Phone</label>
                  <input type="tel" value={customerInfo.customerPhone} onChange={e => updateField('customerPhone', e.target.value)} />
                </div>
                <div className="booking-field">
                  <label>Email</label>
                  <input type="email" value={customerInfo.customerEmail} onChange={e => updateField('customerEmail', e.target.value)} />
                </div>
              </div>
              <div className="booking-row">
                <div className="booking-field">
                  <label>Vehicle Make</label>
                  <input value={customerInfo.vehicleMake} onChange={e => updateField('vehicleMake', e.target.value)} placeholder="e.g. Toyota" />
                </div>
                <div className="booking-field">
                  <label>Vehicle Model</label>
                  <input value={customerInfo.vehicleModel} onChange={e => updateField('vehicleModel', e.target.value)} placeholder="e.g. Camry" />
                </div>
              </div>
              <div className="booking-field">
                <label>Vehicle Year</label>
                <input value={customerInfo.vehicleYear} onChange={e => updateField('vehicleYear', e.target.value)} placeholder="e.g. 2022" />
              </div>
              <div className="booking-field">
                <label>Service Address</label>
                <input value={customerInfo.address} onChange={e => updateField('address', e.target.value)} placeholder="Where should we come?" />
              </div>
              <div className="booking-actions">
                <button className="booking-btn-back" onClick={() => setStep(1)}>Back</button>
                <button className="booking-btn-primary" disabled={!isStep2Valid()} onClick={() => setStep(3)}>Continue</button>
              </div>
            </>
          )}

          {/* Step 3: Review & Confirm */}
          {step === 3 && (
            <>
              <div className="booking-summary">
                <div className="booking-summary-row">
                  <span className="label">Date & Time</span>
                  <span>{formatDate(selectedSlot.date)}, {formatTime(selectedSlot.startTime)}{selectedSlot.endTime ? ` – ${formatTime(selectedSlot.endTime)}` : ''}</span>
                </div>
                <hr className="booking-summary-divider" />
                <div className="booking-summary-row">
                  <span className="label">Name</span>
                  <span>{customerInfo.customerName}</span>
                </div>
                <div className="booking-summary-row">
                  <span className="label">Phone</span>
                  <span>{customerInfo.customerPhone}</span>
                </div>
                <div className="booking-summary-row">
                  <span className="label">Email</span>
                  <span>{customerInfo.customerEmail}</span>
                </div>
                <div className="booking-summary-row">
                  <span className="label">Vehicle</span>
                  <span>{customerInfo.vehicleYear} {customerInfo.vehicleMake} {customerInfo.vehicleModel}</span>
                </div>
                <div className="booking-summary-row">
                  <span className="label">Address</span>
                  <span>{customerInfo.address}</span>
                </div>
                <hr className="booking-summary-divider" />
                <div className="booking-summary-row">
                  <span className="label">Service</span>
                  <span>{selectedService.title}</span>
                </div>
                {selectedAddons.map(addon => (
                  <div key={addon.id} className="booking-summary-row">
                    <span className="label">{addon.name}</span>
                    <span>+${addon.price}</span>
                  </div>
                ))}
                <hr className="booking-summary-divider" />
                <div className="booking-summary-total">
                  <span>Total Estimate</span>
                  <span>${totalEstimate}</span>
                </div>
              </div>
              <div className="booking-actions">
                <button className="booking-btn-back" onClick={() => setStep(2)}>Back</button>
                <button className="booking-btn-primary" onClick={handleConfirm} disabled={submitting}>
                  {submitting ? 'Confirming...' : 'Confirm Booking'}
                </button>
              </div>
            </>
          )}

          {/* Step 4: Done */}
          {step === 4 && (
            <div className="booking-done">
              <div className="booking-done-check">✓</div>
              <h3>Booking Confirmed!</h3>
              <p>{formatDate(selectedSlot.date)}, {formatTime(selectedSlot.startTime)}{selectedSlot.endTime ? ` – ${formatTime(selectedSlot.endTime)}` : ''}</p>
              <p style={{ color: 'var(--gold)', marginTop: '0.5rem' }}>{selectedService.title}</p>
              <div className="booking-actions" style={{ justifyContent: 'center' }}>
                <button className="booking-btn-primary" onClick={onClose} style={{ maxWidth: '200px' }}>Done</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default BookingModal

import { useState, useEffect } from 'react'
import { getBookings, cancelBooking } from '../firebase/services'
import LoadingSpinner from '../components/LoadingSpinner'

function AdminBookings() {
  const [loading, setLoading] = useState(true)
  const [bookings, setBookings] = useState([])
  const [filter, setFilter] = useState('upcoming')
  const [message, setMessage] = useState(null)
  const [cancelling, setCancelling] = useState(null)

  useEffect(() => { loadBookings() }, [])

  const loadBookings = async () => {
    try {
      const data = await getBookings()
      setBookings(data)
    } catch (err) {
      console.error('Error loading bookings:', err)
    }
    setLoading(false)
  }

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type })
    setTimeout(() => setMessage(null), 3000)
  }

  const handleCancel = async (booking) => {
    if (!confirm(`Cancel booking for ${booking.customerName}?`)) return
    try {
      setCancelling(booking.id)
      await cancelBooking(booking.id, booking.timeSlotId)
      setBookings(prev => prev.map(b => b.id === booking.id ? { ...b, status: 'cancelled' } : b))
      showMessage('Booking cancelled and slot freed!')
    } catch (err) {
      showMessage('Failed to cancel booking', 'error')
    }
    setCancelling(null)
  }

  const formatDate = (dateStr) => {
    const [y, m, d] = dateStr.split('-')
    return new Date(y, m - 1, d).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
  }

  const formatTime = (timeStr) => {
    const [h, m] = timeStr.split(':')
    const hour = parseInt(h)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const display = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour
    return `${display}:${m} ${ampm}`
  }

  const today = new Date().toISOString().split('T')[0]

  const filtered = bookings.filter(b => {
    if (filter === 'upcoming') return b.status === 'confirmed' && b.date >= today
    if (filter === 'cancelled') return b.status === 'cancelled'
    return true
  })

  if (loading) return <LoadingSpinner />

  return (
    <div>
      {message && <div className={`admin-message ${message.type}`}>{message.text}</div>}

      <div className="admin-section">
        <h3>Bookings</h3>

        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
          {['upcoming', 'all', 'cancelled'].map(f => (
            <button
              key={f}
              className={`admin-btn ${filter === f ? 'admin-btn-primary' : 'admin-btn-outline'}`}
              onClick={() => setFilter(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {filtered.length === 0 && (
          <p style={{ color: 'rgba(255,255,255,0.5)' }}>No bookings found.</p>
        )}

        {filtered.map(booking => (
          <div key={booking.id} className="admin-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ flex: 1, minWidth: '250px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  <span style={{ color: 'var(--gold)', fontWeight: 600, fontSize: '1.1rem' }}>
                    {formatDate(booking.date)}, {formatTime(booking.startTime)}{booking.endTime ? ` – ${formatTime(booking.endTime)}` : ''}
                  </span>
                  <span style={{
                    padding: '0.2rem 0.6rem',
                    borderRadius: '12px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    background: booking.status === 'confirmed' ? 'rgba(76,175,80,0.15)' : 'rgba(255,68,68,0.15)',
                    color: booking.status === 'confirmed' ? '#4caf50' : '#ff4444',
                    border: `1px solid ${booking.status === 'confirmed' ? 'rgba(76,175,80,0.3)' : 'rgba(255,68,68,0.3)'}`
                  }}>
                    {booking.status}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem 2rem', color: 'rgba(255,255,255,0.8)', fontSize: '0.95rem' }}>
                  <div><strong style={{ color: 'rgba(255,255,255,0.5)' }}>Customer:</strong> {booking.customerName}</div>
                  <div><strong style={{ color: 'rgba(255,255,255,0.5)' }}>Phone:</strong> {booking.customerPhone}</div>
                  <div><strong style={{ color: 'rgba(255,255,255,0.5)' }}>Email:</strong> {booking.customerEmail}</div>
                  <div><strong style={{ color: 'rgba(255,255,255,0.5)' }}>Vehicle:</strong> {booking.vehicleYear} {booking.vehicleMake} {booking.vehicleModel}</div>
                  <div style={{ gridColumn: '1 / -1' }}><strong style={{ color: 'rgba(255,255,255,0.5)' }}>Address:</strong> {booking.address}</div>
                </div>

                <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(182,142,64,0.15)' }}>
                  <span style={{ color: 'var(--gold)', fontWeight: 600 }}>{booking.serviceName}</span>
                  <span style={{ color: 'rgba(255,255,255,0.5)', marginLeft: '0.5rem' }}>${booking.servicePrice}</span>
                  {booking.addons && booking.addons.length > 0 && (
                    <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                      + {booking.addons.map(a => a.name).join(', ')}
                    </div>
                  )}
                  <div style={{ color: 'var(--gold)', fontWeight: 600, marginTop: '0.5rem', fontSize: '1.1rem' }}>
                    Total: ${booking.totalEstimate}
                  </div>
                </div>
              </div>

              {booking.status === 'confirmed' && (
                <button
                  className="admin-btn admin-btn-danger"
                  onClick={() => handleCancel(booking)}
                  disabled={cancelling === booking.id}
                >
                  {cancelling === booking.id ? 'Cancelling...' : 'Cancel Booking'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default AdminBookings

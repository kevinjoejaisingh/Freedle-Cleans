import { useState, useEffect } from 'react'
import { getTimeSlots, addTimeSlot, addTimeSlotsBatch, deleteTimeSlot } from '../firebase/services'
import LoadingSpinner from '../components/LoadingSpinner'

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December']

function AdminSchedule() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState(null)
  const [slots, setSlots] = useState([])

  // Calendar state
  const now = new Date()
  const [viewYear, setViewYear] = useState(now.getFullYear())
  const [viewMonth, setViewMonth] = useState(now.getMonth())
  const [selectedDate, setSelectedDate] = useState(null)

  // New slot form
  const [newStartTime, setNewStartTime] = useState('10:00')
  const [newEndTime, setNewEndTime] = useState('18:00')
  const [repeat, setRepeat] = useState('none')
  const [repeatWeeks, setRepeatWeeks] = useState(4)

  useEffect(() => { loadSlots() }, [])

  const loadSlots = async () => {
    try {
      const data = await getTimeSlots()
      setSlots(data)
    } catch (err) {
      console.error('Error loading time slots:', err)
    }
    setLoading(false)
  }

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type })
    setTimeout(() => setMessage(null), 3000)
  }

  // --- Calendar helpers ---
  const toDateStr = (y, m, d) => `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
  const todayStr = toDateStr(now.getFullYear(), now.getMonth(), now.getDate())

  const getDaysInMonth = (y, m) => new Date(y, m + 1, 0).getDate()
  const getFirstDayOfWeek = (y, m) => new Date(y, m, 1).getDay()

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(viewYear - 1) }
    else setViewMonth(viewMonth - 1)
  }
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(viewYear + 1) }
    else setViewMonth(viewMonth + 1)
  }

  // Build set of dates that have slots for dot indicators
  const datesWithSlots = new Set(slots.map(s => s.date))
  const datesWithBookedSlots = new Set(slots.filter(s => s.status === 'booked').map(s => s.date))

  const calendarDays = () => {
    const daysInMonth = getDaysInMonth(viewYear, viewMonth)
    const firstDay = getFirstDayOfWeek(viewYear, viewMonth)
    const cells = []

    for (let i = 0; i < firstDay; i++) cells.push(null)
    for (let d = 1; d <= daysInMonth; d++) cells.push(d)
    return cells
  }

  const handleDayClick = (day) => {
    if (!day) return
    const dateStr = toDateStr(viewYear, viewMonth, day)
    if (dateStr < todayStr) return
    setSelectedDate(dateStr)
  }

  // --- Slot creation ---
  const addDays = (dateStr, days) => {
    const [y, m, d] = dateStr.split('-').map(Number)
    const dt = new Date(y, m - 1, d)
    dt.setDate(dt.getDate() + days)
    return toDateStr(dt.getFullYear(), dt.getMonth(), dt.getDate())
  }

  const getWeekdayName = (dateStr) => {
    const [y, m, d] = dateStr.split('-').map(Number)
    return new Date(y, m - 1, d).toLocaleDateString('en-US', { weekday: 'long' })
  }

  const handleAddSlot = async () => {
    if (!selectedDate || !newStartTime || !newEndTime) return
    if (newEndTime <= newStartTime) {
      showMessage('End time must be after start time', 'error')
      return
    }

    try {
      setSaving(true)

      if (repeat === 'weekly') {
        const groupId = `rpt_${Date.now()}`
        const slotsToCreate = []
        for (let w = 0; w < repeatWeeks; w++) {
          const date = addDays(selectedDate, w * 7)
          const exists = slots.some(s => s.date === date && s.startTime === newStartTime && s.endTime === newEndTime)
          if (!exists) {
            slotsToCreate.push({ date, startTime: newStartTime, endTime: newEndTime, repeatGroupId: groupId })
          }
        }
        if (slotsToCreate.length === 0) {
          showMessage('All those slots already exist', 'error')
          setSaving(false)
          return
        }
        const created = await addTimeSlotsBatch(slotsToCreate)
        setSlots(prev => [...prev, ...created])
        showMessage(`${created.length} weekly slots added!`)
      } else {
        const exists = slots.some(s => s.date === selectedDate && s.startTime === newStartTime && s.endTime === newEndTime)
        if (exists) {
          showMessage('This time slot already exists', 'error')
          setSaving(false)
          return
        }
        const docRef = await addTimeSlot({ date: selectedDate, startTime: newStartTime, endTime: newEndTime })
        setSlots(prev => [...prev, { id: docRef.id, date: selectedDate, startTime: newStartTime, endTime: newEndTime, status: 'open', bookingId: null }])
        showMessage('Time slot added!')
      }
      setRepeat('none')
    } catch (err) {
      showMessage('Failed to add time slot', 'error')
    }
    setSaving(false)
  }

  const handleDeleteSlot = async (slot) => {
    if (slot.status === 'booked') {
      showMessage('Cancel the booking first before deleting this slot', 'error')
      return
    }
    if (!confirm('Delete this time slot?')) return
    try {
      setSaving(true)
      await deleteTimeSlot(slot.id)
      setSlots(prev => prev.filter(s => s.id !== slot.id))
      showMessage('Time slot deleted!')
    } catch (err) {
      showMessage('Failed to delete time slot', 'error')
    }
    setSaving(false)
  }

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

  // Slots for selected date
  const selectedDateSlots = selectedDate
    ? slots.filter(s => s.date === selectedDate).sort((a, b) => a.startTime.localeCompare(b.startTime))
    : []

  if (loading) return <LoadingSpinner />

  return (
    <div>
      {message && <div className={`admin-message ${message.type}`}>{message.text}</div>}

      <div className="admin-section">
        <h3>Schedule</h3>

        {/* Calendar */}
        <div className="admin-card">
          <div className="sched-cal-header">
            <button className="sched-cal-nav" onClick={prevMonth}>&lsaquo;</button>
            <span className="sched-cal-title">{MONTHS[viewMonth]} {viewYear}</span>
            <button className="sched-cal-nav" onClick={nextMonth}>&rsaquo;</button>
          </div>

          <div className="sched-cal-weekdays">
            {WEEKDAYS.map(d => <div key={d} className="sched-cal-weekday">{d}</div>)}
          </div>

          <div className="sched-cal-grid">
            {calendarDays().map((day, i) => {
              if (!day) return <div key={`e${i}`} className="sched-cal-cell empty" />
              const dateStr = toDateStr(viewYear, viewMonth, day)
              const isPast = dateStr < todayStr
              const isSelected = dateStr === selectedDate
              const hasSlots = datesWithSlots.has(dateStr)
              const hasBooked = datesWithBookedSlots.has(dateStr)
              const isToday = dateStr === todayStr

              return (
                <div
                  key={day}
                  className={`sched-cal-cell${isPast ? ' past' : ''}${isSelected ? ' selected' : ''}${isToday ? ' today' : ''}`}
                  onClick={() => handleDayClick(day)}
                >
                  <span className="sched-cal-day">{day}</span>
                  {hasSlots && (
                    <div className="sched-cal-dots">
                      <span className={`sched-cal-dot${hasBooked ? ' booked' : ''}`} />
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', marginTop: '1rem', fontSize: '0.8rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'rgba(255,255,255,0.5)' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#4caf50', display: 'inline-block' }} /> Has open slots
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'rgba(255,255,255,0.5)' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--gold)', display: 'inline-block' }} /> Has bookings
            </span>
          </div>
        </div>

        {/* Selected date panel */}
        {selectedDate && (
          <div className="admin-card" style={{ marginTop: '1rem' }}>
            <div style={{ color: 'var(--gold)', fontWeight: 600, fontSize: '1.15rem', marginBottom: '1.25rem' }}>
              {formatDate(selectedDate)}
            </div>

            {/* Existing slots for this date */}
            {selectedDateSlots.length > 0 && (
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.75rem' }}>
                  Slots on this date
                </div>
                {selectedDateSlots.map(slot => (
                  <div key={slot.id} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '0.75rem 1rem', marginBottom: '0.5rem', borderRadius: '6px',
                    background: 'var(--black)', border: '1px solid rgba(182,142,64,0.15)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                      <span style={{ color: 'var(--white)', fontWeight: 500 }}>
                        {formatTime(slot.startTime)} – {slot.endTime ? formatTime(slot.endTime) : ''}
                      </span>
                      <span style={{
                        padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600,
                        background: slot.status === 'open' ? 'rgba(76,175,80,0.15)' : 'rgba(182,142,64,0.15)',
                        color: slot.status === 'open' ? '#4caf50' : 'var(--gold)',
                        border: `1px solid ${slot.status === 'open' ? 'rgba(76,175,80,0.3)' : 'rgba(182,142,64,0.3)'}`
                      }}>
                        {slot.status === 'open' ? 'Open' : 'Booked'}
                      </span>
                      {slot.repeatGroupId && (
                        <span style={{
                          padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 600,
                          background: 'rgba(100,149,237,0.15)', color: '#6495ed', border: '1px solid rgba(100,149,237,0.3)'
                        }}>
                          Repeating
                        </span>
                      )}
                    </div>
                    <button
                      className="admin-btn admin-btn-danger"
                      style={{ padding: '0.4rem 1rem', fontSize: '0.8rem' }}
                      onClick={() => handleDeleteSlot(slot)}
                      disabled={slot.status === 'booked'}
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add new slot */}
            <div style={{ borderTop: selectedDateSlots.length > 0 ? '1px solid rgba(182,142,64,0.15)' : 'none', paddingTop: selectedDateSlots.length > 0 ? '1.25rem' : 0 }}>
              <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.75rem' }}>
                Add a slot
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="admin-field" style={{ marginBottom: 0 }}>
                  <label>Start Time</label>
                  <input type="time" value={newStartTime} onChange={e => setNewStartTime(e.target.value)} />
                </div>
                <div className="admin-field" style={{ marginBottom: 0 }}>
                  <label>End Time</label>
                  <input type="time" value={newEndTime} onChange={e => setNewEndTime(e.target.value)} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', alignItems: 'end', marginTop: '1rem' }}>
                <div className="admin-field" style={{ marginBottom: 0, flex: 1 }}>
                  <label>Repeat</label>
                  <select value={repeat} onChange={e => setRepeat(e.target.value)}>
                    <option value="none">No repeat</option>
                    <option value="weekly">Every {getWeekdayName(selectedDate)}</option>
                  </select>
                </div>
                {repeat === 'weekly' && (
                  <div className="admin-field" style={{ marginBottom: 0, flex: 1 }}>
                    <label>For how many weeks?</label>
                    <select value={repeatWeeks} onChange={e => setRepeatWeeks(Number(e.target.value))}>
                      {[2, 4, 6, 8, 12].map(n => (
                        <option key={n} value={n}>{n} weeks</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div style={{ marginTop: '1rem' }}>
                <button
                  className="admin-btn admin-btn-primary"
                  onClick={handleAddSlot}
                  disabled={saving || !newStartTime || !newEndTime}
                >
                  {saving ? 'Adding...' : repeat === 'weekly' ? `Add for ${repeatWeeks} ${getWeekdayName(selectedDate)}s` : 'Add Slot'}
                </button>
              </div>
            </div>
          </div>
        )}

        {!selectedDate && (
          <p style={{ color: 'rgba(255,255,255,0.4)', textAlign: 'center', marginTop: '1rem' }}>
            Click a date on the calendar to view or add time slots.
          </p>
        )}
      </div>
    </div>
  )
}

export default AdminSchedule

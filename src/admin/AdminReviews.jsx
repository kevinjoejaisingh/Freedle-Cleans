import { useState, useEffect } from 'react'
import { getReviews, addReview, updateReview, deleteReview, uploadImage } from '../firebase/services'
import ImageUploader from '../components/ImageUploader'
import StarRating from '../components/StarRating'
import LoadingSpinner from '../components/LoadingSpinner'

const emptyReview = {
  customerName: '',
  rating: 5,
  text: '',
  carPhotoUrl: '',
  order: 0
}

function AdminReviews() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState(null)
  const [reviews, setReviews] = useState([])
  const [editingReview, setEditingReview] = useState(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const data = await getReviews()
      setReviews(data)
    } catch (err) {
      console.error('Error loading reviews:', err)
    }
    setLoading(false)
  }

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type })
    setTimeout(() => setMessage(null), 3000)
  }

  const handleSave = async (review) => {
    try {
      setSaving(true)
      const data = { ...review }
      delete data.id

      if (review.id) {
        await updateReview(review.id, data)
        setReviews(prev => prev.map(r => r.id === review.id ? { ...data, id: review.id } : r))
      } else {
        data.order = reviews.length
        const docRef = await addReview(data)
        setReviews(prev => [...prev, { ...data, id: docRef.id }])
      }
      setEditingReview(null)
      showMessage('Review saved!')
    } catch (err) {
      showMessage('Failed to save review', 'error')
    }
    setSaving(false)
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this review?')) return
    try {
      setSaving(true)
      await deleteReview(id)
      setReviews(prev => prev.filter(r => r.id !== id))
      showMessage('Review deleted!')
    } catch (err) {
      showMessage('Failed to delete review', 'error')
    }
    setSaving(false)
  }

  if (loading) return <LoadingSpinner />

  return (
    <div>
      {message && <div className={`admin-message ${message.type}`}>{message.text}</div>}

      <div className="admin-section">
        <h3>Customer Reviews</h3>

        {reviews.map(review => (
          <div key={review.id} className="admin-card">
            {editingReview === review.id ? (
              <ReviewForm
                initial={review}
                onSave={handleSave}
                onCancel={() => setEditingReview(null)}
                saving={saving}
              />
            ) : (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                    <span style={{ color: 'var(--gold)', fontWeight: 600 }}>{review.customerName}</span>
                    <StarRating rating={review.rating} />
                  </div>
                  <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>
                    {review.text.length > 100 ? review.text.slice(0, 100) + '...' : review.text}
                  </div>
                </div>
                <div className="admin-actions" style={{ marginTop: 0, flexShrink: 0 }}>
                  <button className="admin-btn admin-btn-outline" onClick={() => setEditingReview(review.id)}>Edit</button>
                  <button className="admin-btn admin-btn-danger" onClick={() => handleDelete(review.id)}>Delete</button>
                </div>
              </div>
            )}
          </div>
        ))}

        {editingReview === 'new' ? (
          <div className="admin-card">
            <ReviewForm
              initial={emptyReview}
              onSave={handleSave}
              onCancel={() => setEditingReview(null)}
              saving={saving}
            />
          </div>
        ) : (
          <button className="admin-btn admin-btn-outline" onClick={() => setEditingReview('new')} style={{ marginTop: '1rem' }}>
            + Add Review
          </button>
        )}
      </div>
    </div>
  )
}

function ReviewForm({ initial, onSave, onCancel, saving }) {
  const [form, setForm] = useState({ ...initial })

  const handlePhotoUpload = async (file) => {
    try {
      const url = await uploadImage(file, 'reviews')
      setForm(prev => ({ ...prev, carPhotoUrl: url }))
    } catch (err) {
      console.error('Failed to upload photo:', err)
    }
  }

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div className="admin-field">
          <label>Customer Name</label>
          <input value={form.customerName} onChange={e => setForm({ ...form, customerName: e.target.value })} />
        </div>
        <div className="admin-field">
          <label>Rating</label>
          <StarRating
            rating={form.rating}
            interactive
            onChange={(rating) => setForm({ ...form, rating })}
          />
        </div>
      </div>
      <div className="admin-field">
        <label>Review Text</label>
        <textarea
          value={form.text}
          onChange={e => setForm({ ...form, text: e.target.value })}
          rows={4}
        />
      </div>
      <div className="admin-field">
        <label>Car Photo (optional)</label>
        <ImageUploader
          currentUrl={form.carPhotoUrl || null}
          onUpload={handlePhotoUpload}
          onRemove={() => setForm({ ...form, carPhotoUrl: '' })}
          label="Upload Car Photo"
        />
      </div>
      <div className="admin-actions">
        <button className="admin-btn admin-btn-primary" onClick={() => onSave(form)} disabled={saving}>
          {saving ? 'Saving...' : 'Save'}
        </button>
        <button className="admin-btn admin-btn-outline" onClick={onCancel}>Cancel</button>
      </div>
    </div>
  )
}

export default AdminReviews

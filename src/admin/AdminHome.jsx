import { useState, useEffect } from 'react'
import { getSiteConfig, updateSiteConfig, uploadImage, deleteImage } from '../firebase/services'
import ImageUploader from '../components/ImageUploader'
import LoadingSpinner from '../components/LoadingSpinner'

function AdminHome() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState(null)
  const [heroHeading, setHeroHeading] = useState('Precision Detailing\nfor Luxury Vehicles')
  const [heroSubheading, setHeroSubheading] = useState('Where craftsmanship meets excellence')
  const [galleryImages, setGalleryImages] = useState([])
  const [beforeImage, setBeforeImage] = useState('')
  const [afterImage, setAfterImage] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const config = await getSiteConfig('home')
      if (config) {
        if (config.heroHeading) setHeroHeading(config.heroHeading)
        if (config.heroSubheading) setHeroSubheading(config.heroSubheading)
        if (config.galleryImages) setGalleryImages(config.galleryImages)
        if (config.beforeAfter) {
          setBeforeImage(config.beforeAfter.beforeImage || '')
          setAfterImage(config.beforeAfter.afterImage || '')
        }
      }
    } catch (err) {
      console.error('Error loading home config:', err)
    }
    setLoading(false)
  }

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type })
    setTimeout(() => setMessage(null), 3000)
  }

  const handleAddGalleryImage = async (file) => {
    try {
      setSaving(true)
      const url = await uploadImage(file, 'gallery')
      const newImage = { id: `img_${Date.now()}`, url, alt: 'Gallery image', order: galleryImages.length }
      const updated = [...galleryImages, newImage]
      setGalleryImages(updated)
      await updateSiteConfig('home', { galleryImages: updated })
      showMessage('Image added!')
    } catch (err) {
      showMessage('Failed to upload image', 'error')
    }
    setSaving(false)
  }

  const handleDeleteGalleryImage = async (image) => {
    try {
      setSaving(true)
      await deleteImage(image.url)
      const updated = galleryImages.filter(img => img.id !== image.id)
      setGalleryImages(updated)
      await updateSiteConfig('home', { galleryImages: updated })
      showMessage('Image removed!')
    } catch (err) {
      showMessage('Failed to remove image', 'error')
    }
    setSaving(false)
  }

  const handleBeforeAfterUpload = async (file, type) => {
    try {
      setSaving(true)
      const url = await uploadImage(file, 'beforeafter')
      const beforeAfter = {
        beforeImage: type === 'before' ? url : beforeImage,
        afterImage: type === 'after' ? url : afterImage
      }
      if (type === 'before') setBeforeImage(url)
      else setAfterImage(url)
      await updateSiteConfig('home', { beforeAfter })
      showMessage(`${type === 'before' ? 'Before' : 'After'} image updated!`)
    } catch (err) {
      showMessage('Failed to upload image', 'error')
    }
    setSaving(false)
  }

  const handleSaveText = async () => {
    try {
      setSaving(true)
      await updateSiteConfig('home', { heroHeading, heroSubheading })
      showMessage('Hero text saved!')
    } catch (err) {
      showMessage('Failed to save', 'error')
    }
    setSaving(false)
  }

  if (loading) return <LoadingSpinner />

  return (
    <div>
      {message && <div className={`admin-message ${message.type}`}>{message.text}</div>}

      <div className="admin-section">
        <h3>Hero Text</h3>
        <div className="admin-card">
          <div className="admin-field">
            <label>Heading</label>
            <textarea
              value={heroHeading}
              onChange={e => setHeroHeading(e.target.value)}
              rows={2}
            />
          </div>
          <div className="admin-field">
            <label>Subheading</label>
            <input
              value={heroSubheading}
              onChange={e => setHeroSubheading(e.target.value)}
            />
          </div>
          <div className="admin-actions">
            <button className="admin-btn admin-btn-primary" onClick={handleSaveText} disabled={saving}>
              {saving ? 'Saving...' : 'Save Text'}
            </button>
          </div>
        </div>
      </div>

      <div className="admin-section">
        <h3>Gallery Images</h3>
        <div className="admin-grid">
          {galleryImages.map(image => (
            <div key={image.id} className="admin-card">
              <ImageUploader
                currentUrl={image.url}
                onUpload={(file) => handleAddGalleryImage(file)}
                onRemove={() => handleDeleteGalleryImage(image)}
                label="Gallery Image"
              />
            </div>
          ))}
          <div className="admin-card">
            <ImageUploader
              currentUrl={null}
              onUpload={handleAddGalleryImage}
              label="Add New Image"
            />
          </div>
        </div>
      </div>

      <div className="admin-section">
        <h3>Before / After Images</h3>
        <div className="admin-grid">
          <div className="admin-card">
            <div className="admin-field">
              <label>Before Image</label>
            </div>
            <ImageUploader
              currentUrl={beforeImage || null}
              onUpload={(file) => handleBeforeAfterUpload(file, 'before')}
              label="Upload Before Image"
            />
          </div>
          <div className="admin-card">
            <div className="admin-field">
              <label>After Image</label>
            </div>
            <ImageUploader
              currentUrl={afterImage || null}
              onUpload={(file) => handleBeforeAfterUpload(file, 'after')}
              label="Upload After Image"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminHome

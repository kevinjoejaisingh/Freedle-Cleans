import { useState, useEffect } from 'react'
import { getServices, addService, updateService, deleteService, getAddons, addAddon, updateAddon, deleteAddon, uploadImage } from '../firebase/services'
import ImageUploader from '../components/ImageUploader'
import LoadingSpinner from '../components/LoadingSpinner'

const emptyService = {
  title: '',
  price: '',
  priceValue: 0,
  tier: 1,
  iconUrl: '',
  imageUrl: '',
  description: '',
  includes: [''],
  time: '',
  order: 0
}

const emptyAddon = {
  name: '',
  price: 0,
  description: '',
  order: 0
}

function AdminServices() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState(null)
  const [services, setServices] = useState([])
  const [addons, setAddons] = useState([])
  const [editingService, setEditingService] = useState(null)
  const [editingAddon, setEditingAddon] = useState(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [servicesData, addonsData] = await Promise.all([getServices(), getAddons()])
      setServices(servicesData)
      setAddons(addonsData)
    } catch (err) {
      console.error('Error loading services:', err)
    }
    setLoading(false)
  }

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type })
    setTimeout(() => setMessage(null), 3000)
  }

  // --- Service handlers ---
  const handleSaveService = async (service) => {
    try {
      setSaving(true)
      const data = { ...service }
      delete data.id
      data.includes = data.includes.filter(item => item.trim() !== '')
      data.priceValue = Number(data.priceValue) || 0

      if (service.id) {
        await updateService(service.id, data)
        setServices(prev => prev.map(s => s.id === service.id ? { ...data, id: service.id } : s))
      } else {
        data.order = services.length
        const docRef = await addService(data)
        setServices(prev => [...prev, { ...data, id: docRef.id }])
      }
      setEditingService(null)
      showMessage('Service saved!')
    } catch (err) {
      showMessage('Failed to save service', 'error')
    }
    setSaving(false)
  }

  const handleDeleteService = async (id) => {
    if (!confirm('Delete this service?')) return
    try {
      setSaving(true)
      await deleteService(id)
      setServices(prev => prev.filter(s => s.id !== id))
      showMessage('Service deleted!')
    } catch (err) {
      showMessage('Failed to delete service', 'error')
    }
    setSaving(false)
  }

  const handleServiceImageUpload = async (file, service, setService) => {
    try {
      const url = await uploadImage(file, 'services')
      setService({ ...service, imageUrl: url })
    } catch (err) {
      showMessage('Failed to upload image', 'error')
    }
  }

  const handleIconUpload = async (file, service, setService) => {
    try {
      const url = await uploadImage(file, 'service-icons', 200)
      setService({ ...service, iconUrl: url })
    } catch (err) {
      showMessage('Failed to upload icon', 'error')
    }
  }

  // --- Addon handlers ---
  const handleSaveAddon = async (addon) => {
    try {
      setSaving(true)
      const data = { ...addon }
      delete data.id
      data.price = Number(data.price)

      if (addon.id) {
        await updateAddon(addon.id, data)
        setAddons(prev => prev.map(a => a.id === addon.id ? { ...data, id: addon.id } : a))
      } else {
        data.order = addons.length
        const docRef = await addAddon(data)
        setAddons(prev => [...prev, { ...data, id: docRef.id }])
      }
      setEditingAddon(null)
      showMessage('Add-on saved!')
    } catch (err) {
      showMessage('Failed to save add-on', 'error')
    }
    setSaving(false)
  }

  const handleDeleteAddon = async (id) => {
    if (!confirm('Delete this add-on?')) return
    try {
      setSaving(true)
      await deleteAddon(id)
      setAddons(prev => prev.filter(a => a.id !== id))
      showMessage('Add-on deleted!')
    } catch (err) {
      showMessage('Failed to delete add-on', 'error')
    }
    setSaving(false)
  }

  if (loading) return <LoadingSpinner />

  return (
    <div>
      {message && <div className={`admin-message ${message.type}`}>{message.text}</div>}

      {/* Services Section */}
      <div className="admin-section">
        <h3>Services</h3>

        {services.map(service => (
          <div key={service.id} className="admin-card">
            {editingService === service.id ? (
              <ServiceForm
                initial={service}
                onSave={handleSaveService}
                onCancel={() => setEditingService(null)}
                onImageUpload={handleServiceImageUpload}
                onIconUpload={handleIconUpload}
                saving={saving}
              />
            ) : (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  {service.iconUrl ? (
                    <img src={service.iconUrl} alt="" style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }} />
                  ) : service.icon ? (
                    <span style={{ fontSize: '1.5rem' }}>{service.icon}</span>
                  ) : null}
                  <div>
                  <div style={{ color: 'var(--gold)', fontWeight: 600, fontSize: '1.1rem' }}>
                    {service.title}
                  </div>
                  <div style={{ color: 'rgba(255,255,255,0.6)', marginTop: '0.25rem' }}>
                    {service.price} &middot; {service.time}
                  </div>
                  </div>
                </div>
                <div className="admin-actions" style={{ marginTop: 0 }}>
                  <button className="admin-btn admin-btn-outline" onClick={() => setEditingService(service.id)}>Edit</button>
                  <button className="admin-btn admin-btn-danger" onClick={() => handleDeleteService(service.id)}>Delete</button>
                </div>
              </div>
            )}
          </div>
        ))}

        {editingService === 'new' ? (
          <div className="admin-card">
            <ServiceForm
              initial={emptyService}
              onSave={handleSaveService}
              onCancel={() => setEditingService(null)}
              onImageUpload={handleServiceImageUpload}
              onIconUpload={handleIconUpload}
              saving={saving}
            />
          </div>
        ) : (
          <button className="admin-btn admin-btn-outline" onClick={() => setEditingService('new')} style={{ marginTop: '1rem' }}>
            + Add Service
          </button>
        )}
      </div>

      {/* Add-ons Section */}
      <div className="admin-section">
        <h3>Add-ons</h3>

        {addons.map(addon => (
          <div key={addon.id} className="admin-card">
            {editingAddon === addon.id ? (
              <AddonForm
                initial={addon}
                onSave={handleSaveAddon}
                onCancel={() => setEditingAddon(null)}
                saving={saving}
              />
            ) : (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ color: 'var(--white)' }}>{addon.name}</span>
                  <span style={{ color: 'var(--gold)', marginLeft: '1rem' }}>${addon.price}</span>
                </div>
                <div className="admin-actions" style={{ marginTop: 0 }}>
                  <button className="admin-btn admin-btn-outline" onClick={() => setEditingAddon(addon.id)}>Edit</button>
                  <button className="admin-btn admin-btn-danger" onClick={() => handleDeleteAddon(addon.id)}>Delete</button>
                </div>
              </div>
            )}
          </div>
        ))}

        {editingAddon === 'new' ? (
          <div className="admin-card">
            <AddonForm
              initial={emptyAddon}
              onSave={handleSaveAddon}
              onCancel={() => setEditingAddon(null)}
              saving={saving}
            />
          </div>
        ) : (
          <button className="admin-btn admin-btn-outline" onClick={() => setEditingAddon('new')} style={{ marginTop: '1rem' }}>
            + Add Add-on
          </button>
        )}
      </div>
    </div>
  )
}

function ServiceForm({ initial, onSave, onCancel, onImageUpload, onIconUpload, saving }) {
  const [form, setForm] = useState({ ...initial })

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }))

  const updateInclude = (index, value) => {
    const updated = [...form.includes]
    updated[index] = value
    setForm(prev => ({ ...prev, includes: updated }))
  }

  const addInclude = () => setForm(prev => ({ ...prev, includes: [...prev.includes, ''] }))

  const removeInclude = (index) => {
    setForm(prev => ({ ...prev, includes: prev.includes.filter((_, i) => i !== index) }))
  }

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div className="admin-field">
          <label>Title</label>
          <input value={form.title} onChange={e => update('title', e.target.value)} />
        </div>
        <div className="admin-field">
          <label>Price Text</label>
          <input value={form.price} onChange={e => update('price', e.target.value)} placeholder="Starting at $149" />
        </div>
        <div className="admin-field">
          <label>Price Value ($)</label>
          <input type="number" value={form.priceValue} onChange={e => update('priceValue', Number(e.target.value))} />
        </div>
        <div className="admin-field">
          <label>Tier (1-3)</label>
          <input type="number" min="1" max="3" value={form.tier} onChange={e => update('tier', Number(e.target.value))} />
        </div>
        <div className="admin-field">
          <label>Icon Image</label>
          <ImageUploader
            currentUrl={form.iconUrl || null}
            onUpload={(file) => onIconUpload(file, form, setForm)}
            onRemove={() => setForm(prev => ({ ...prev, iconUrl: '' }))}
            label="Service Icon (small)"
          />
        </div>
        <div className="admin-field">
          <label>Duration</label>
          <input value={form.time} onChange={e => update('time', e.target.value)} placeholder="2-3 hours" />
        </div>
      </div>
      <div className="admin-field">
        <label>Description</label>
        <textarea value={form.description} onChange={e => update('description', e.target.value)} rows={3} />
      </div>
      <div className="admin-field">
        <label>Image</label>
        <ImageUploader
          currentUrl={form.imageUrl || null}
          onUpload={(file) => onImageUpload(file, form, setForm)}
          label="Service Image"
        />
      </div>
      <div className="admin-field">
        <label>What's Included</label>
        {form.includes.map((item, idx) => (
          <div key={idx} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <input
              value={item}
              onChange={e => updateInclude(idx, e.target.value)}
              style={{ flex: 1 }}
            />
            <button type="button" className="admin-btn admin-btn-danger" onClick={() => removeInclude(idx)} style={{ padding: '0.5rem 0.75rem' }}>
              &times;
            </button>
          </div>
        ))}
        <button type="button" className="admin-btn admin-btn-outline" onClick={addInclude} style={{ marginTop: '0.25rem' }}>
          + Add Item
        </button>
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

function AddonForm({ initial, onSave, onCancel, saving }) {
  const [form, setForm] = useState({ ...initial })

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div className="admin-field">
          <label>Name</label>
          <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
        </div>
        <div className="admin-field">
          <label>Price ($)</label>
          <input type="number" value={form.price} onChange={e => setForm({ ...form, price: Number(e.target.value) })} />
        </div>
      </div>
      <div className="admin-field">
        <label>Description</label>
        <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} />
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

export default AdminServices

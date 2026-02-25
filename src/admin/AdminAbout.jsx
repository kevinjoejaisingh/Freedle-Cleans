import { useState, useEffect } from 'react'
import { getSiteConfig, updateSiteConfig, uploadImage } from '../firebase/services'
import ImageUploader from '../components/ImageUploader'
import LoadingSpinner from '../components/LoadingSpinner'

const defaultAbout = {
  heading: 'About Freedle Cleans',
  subheading: 'Precision Auto Detailing',
  paragraphs: [''],
  missionStatement: '',
  values: [],
  teamMembers: []
}

function AdminAbout() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState(null)
  const [form, setForm] = useState({ ...defaultAbout })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const config = await getSiteConfig('about')
      if (config) {
        setForm({
          heading: config.heading || defaultAbout.heading,
          subheading: config.subheading || defaultAbout.subheading,
          paragraphs: config.paragraphs?.length ? config.paragraphs : [''],
          missionStatement: config.missionStatement || '',
          values: config.values || [],
          teamMembers: config.teamMembers || []
        })
      }
    } catch (err) {
      console.error('Error loading about config:', err)
    }
    setLoading(false)
  }

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type })
    setTimeout(() => setMessage(null), 3000)
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      const data = {
        ...form,
        paragraphs: form.paragraphs.filter(p => p.trim() !== '')
      }
      await updateSiteConfig('about', data)
      showMessage('About page saved!')
    } catch (err) {
      showMessage('Failed to save', 'error')
    }
    setSaving(false)
  }

  // Paragraph helpers
  const updateParagraph = (idx, value) => {
    const updated = [...form.paragraphs]
    updated[idx] = value
    setForm(prev => ({ ...prev, paragraphs: updated }))
  }
  const addParagraph = () => setForm(prev => ({ ...prev, paragraphs: [...prev.paragraphs, ''] }))
  const removeParagraph = (idx) => setForm(prev => ({ ...prev, paragraphs: prev.paragraphs.filter((_, i) => i !== idx) }))

  // Value helpers
  const updateValue = (idx, field, value) => {
    const updated = [...form.values]
    updated[idx] = { ...updated[idx], [field]: value }
    setForm(prev => ({ ...prev, values: updated }))
  }
  const addValue = () => setForm(prev => ({ ...prev, values: [...prev.values, { title: '', description: '' }] }))
  const removeValue = (idx) => setForm(prev => ({ ...prev, values: prev.values.filter((_, i) => i !== idx) }))

  // Team member helpers
  const updateMember = (idx, field, value) => {
    const updated = [...form.teamMembers]
    updated[idx] = { ...updated[idx], [field]: value }
    setForm(prev => ({ ...prev, teamMembers: updated }))
  }
  const addMember = () => setForm(prev => ({
    ...prev,
    teamMembers: [...prev.teamMembers, { name: '', role: '', bio: '', photoUrl: '' }]
  }))
  const removeMember = (idx) => setForm(prev => ({ ...prev, teamMembers: prev.teamMembers.filter((_, i) => i !== idx) }))

  const handleMemberPhoto = async (file, idx) => {
    try {
      const url = await uploadImage(file, 'about')
      updateMember(idx, 'photoUrl', url)
    } catch (err) {
      showMessage('Failed to upload photo', 'error')
    }
  }

  if (loading) return <LoadingSpinner />

  return (
    <div>
      {message && <div className={`admin-message ${message.type}`}>{message.text}</div>}

      <div className="admin-section">
        <h3>Page Header</h3>
        <div className="admin-card">
          <div className="admin-field">
            <label>Heading</label>
            <input value={form.heading} onChange={e => setForm({ ...form, heading: e.target.value })} />
          </div>
          <div className="admin-field">
            <label>Subheading</label>
            <input value={form.subheading} onChange={e => setForm({ ...form, subheading: e.target.value })} />
          </div>
        </div>
      </div>

      <div className="admin-section">
        <h3>About Paragraphs</h3>
        {form.paragraphs.map((p, idx) => (
          <div key={idx} className="admin-card">
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <textarea
                value={p}
                onChange={e => updateParagraph(idx, e.target.value)}
                rows={3}
                style={{
                  flex: 1, padding: '0.75rem', background: 'var(--black)',
                  border: '1px solid rgba(182,142,64,0.3)', color: 'var(--white)',
                  borderRadius: '4px', resize: 'vertical', fontSize: '0.95rem'
                }}
              />
              <button className="admin-btn admin-btn-danger" onClick={() => removeParagraph(idx)} style={{ alignSelf: 'flex-start' }}>
                &times;
              </button>
            </div>
          </div>
        ))}
        <button className="admin-btn admin-btn-outline" onClick={addParagraph}>+ Add Paragraph</button>
      </div>

      <div className="admin-section">
        <h3>Mission Statement</h3>
        <div className="admin-card">
          <div className="admin-field">
            <textarea
              value={form.missionStatement}
              onChange={e => setForm({ ...form, missionStatement: e.target.value })}
              rows={3}
              placeholder="Our mission is..."
            />
          </div>
        </div>
      </div>

      <div className="admin-section">
        <h3>Our Values</h3>
        {form.values.map((val, idx) => (
          <div key={idx} className="admin-card">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr auto', gap: '0.5rem', alignItems: 'start' }}>
              <div className="admin-field">
                <label>Title</label>
                <input value={val.title} onChange={e => updateValue(idx, 'title', e.target.value)} />
              </div>
              <div className="admin-field">
                <label>Description</label>
                <input value={val.description} onChange={e => updateValue(idx, 'description', e.target.value)} />
              </div>
              <button className="admin-btn admin-btn-danger" onClick={() => removeValue(idx)} style={{ marginTop: '1.6rem' }}>
                &times;
              </button>
            </div>
          </div>
        ))}
        <button className="admin-btn admin-btn-outline" onClick={addValue}>+ Add Value</button>
      </div>

      <div className="admin-section">
        <h3>Team Members</h3>
        {form.teamMembers.map((member, idx) => (
          <div key={idx} className="admin-card">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="admin-field">
                <label>Name</label>
                <input value={member.name} onChange={e => updateMember(idx, 'name', e.target.value)} />
              </div>
              <div className="admin-field">
                <label>Role</label>
                <input value={member.role} onChange={e => updateMember(idx, 'role', e.target.value)} />
              </div>
            </div>
            <div className="admin-field">
              <label>Bio</label>
              <textarea value={member.bio} onChange={e => updateMember(idx, 'bio', e.target.value)} rows={2} />
            </div>
            <div className="admin-field">
              <label>Photo</label>
              <ImageUploader
                currentUrl={member.photoUrl || null}
                onUpload={(file) => handleMemberPhoto(file, idx)}
                onRemove={() => updateMember(idx, 'photoUrl', '')}
                label="Upload Photo"
              />
            </div>
            <div className="admin-actions">
              <button className="admin-btn admin-btn-danger" onClick={() => removeMember(idx)}>Remove Member</button>
            </div>
          </div>
        ))}
        <button className="admin-btn admin-btn-outline" onClick={addMember}>+ Add Team Member</button>
      </div>

      <div style={{ marginTop: '2rem', paddingBottom: '2rem' }}>
        <button className="admin-btn admin-btn-primary" onClick={handleSave} disabled={saving} style={{ padding: '1rem 3rem', fontSize: '1rem' }}>
          {saving ? 'Saving...' : 'Save All Changes'}
        </button>
      </div>
    </div>
  )
}

export default AdminAbout

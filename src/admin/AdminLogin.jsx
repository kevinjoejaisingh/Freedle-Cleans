import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { isAdminUser } from '../firebase/services'
import './AdminLogin.css'

function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { user, isAdmin, loading, login } = useAuth()

  if (loading || submitting) return <div className="admin-loading">Loading...</div>
  if (user && isAdmin) return <Navigate to="/admin" replace />

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const cred = await login(email, password)
      const adminStatus = await isAdminUser(cred.user.uid)
      if (!adminStatus) {
        setError('This account is not authorized as an admin. Add the user UID to the adminUsers collection in Firestore.')
        setSubmitting(false)
        return
      }
      // onAuthStateChanged will pick up the change and redirect via Navigate above
    } catch {
      setError('Invalid email or password')
      setSubmitting(false)
    }
  }

  return (
    <div className="admin-login-page">
      <form className="admin-login-card" onSubmit={handleSubmit}>
        <h2>Admin Login</h2>
        {error && <div className="login-error">{error}</div>}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" disabled={submitting}>
          {submitting ? 'Signing In...' : 'Sign In'}
        </button>
      </form>
    </div>
  )
}

export default AdminLogin

import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import AdminHome from './AdminHome'
import AdminServices from './AdminServices'
import AdminSchedule from './AdminSchedule'
import AdminBookings from './AdminBookings'
import AdminReviews from './AdminReviews'
import AdminAbout from './AdminAbout'
import './AdminDashboard.css'

const tabs = [
  { id: 'home', label: 'Home Page' },
  { id: 'services', label: 'Services' },
  { id: 'schedule', label: 'Schedule' },
  { id: 'bookings', label: 'Bookings' },
  { id: 'reviews', label: 'Reviews' },
  { id: 'about', label: 'About Us' }
]

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('home')
  const { logout, user } = useAuth()

  return (
    <div className="admin-dashboard">
      <div className="admin-header-bar">
        <h2>Admin Panel</h2>
        <div className="admin-user-info">
          <span>{user?.email}</span>
          <button onClick={logout} className="logout-btn">Logout</button>
        </div>
      </div>

      <nav className="admin-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`admin-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <div className="admin-content">
        {activeTab === 'home' && <AdminHome />}
        {activeTab === 'services' && <AdminServices />}
        {activeTab === 'schedule' && <AdminSchedule />}
        {activeTab === 'bookings' && <AdminBookings />}
        {activeTab === 'reviews' && <AdminReviews />}
        {activeTab === 'about' && <AdminAbout />}
      </div>
    </div>
  )
}

export default AdminDashboard

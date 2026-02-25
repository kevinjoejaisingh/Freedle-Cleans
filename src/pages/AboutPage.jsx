import { useFirestoreData } from '../hooks/useFirestoreData'
import { getSiteConfig } from '../firebase/services'
import LoadingSpinner from '../components/LoadingSpinner'
import './AboutPage.css'

const defaultAbout = {
  heading: 'About Freedle Cleans',
  subheading: 'Precision Auto Detailing',
  paragraphs: [
    'At Freedle Cleans, we bring meticulous attention to detail and premium products to every vehicle we touch. Our passion for perfection drives us to deliver results that exceed expectations.'
  ],
  missionStatement: 'To provide the highest quality auto detailing services with unmatched attention to detail.',
  values: [],
  teamMembers: []
}

function AboutPage() {
  const { data, loading } = useFirestoreData(
    () => getSiteConfig('about'),
    defaultAbout
  )

  const about = data || defaultAbout

  if (loading) return <div className="about-page"><LoadingSpinner /></div>

  return (
    <div className="about-page">
      <div className="about-page-header">
        <h1>{about.heading}</h1>
        <p>{about.subheading}</p>
      </div>

      {about.paragraphs?.length > 0 && (
        <div className="about-content">
          {about.paragraphs.map((p, idx) => (
            <p key={idx}>{p}</p>
          ))}
        </div>
      )}

      {about.missionStatement && (
        <div className="about-mission">
          <h2>Our Mission</h2>
          <p>{about.missionStatement}</p>
        </div>
      )}

      {about.values?.length > 0 && (
        <div className="about-values">
          <h2>Our Values</h2>
          <div className="values-grid">
            {about.values.map((val, idx) => (
              <div key={idx} className="value-card">
                <h3>{val.title}</h3>
                <p>{val.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {about.teamMembers?.length > 0 && (
        <div className="about-team">
          <h2>Meet the Team</h2>
          <div className="team-grid">
            {about.teamMembers.map((member, idx) => (
              <div key={idx} className="team-card">
                {member.photoUrl ? (
                  <img src={member.photoUrl} alt={member.name} className="team-photo" />
                ) : (
                  <div className="team-photo-placeholder">
                    {member.name?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                )}
                <h3>{member.name}</h3>
                <div className="team-role">{member.role}</div>
                {member.bio && <p className="team-bio">{member.bio}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default AboutPage

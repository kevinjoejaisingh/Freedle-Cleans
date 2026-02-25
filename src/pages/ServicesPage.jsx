import Services, { defaultServicesData, defaultAddonsData } from '../components/Services'
import { useFirestoreData } from '../hooks/useFirestoreData'
import { getServices, getAddons } from '../firebase/services'
import LoadingSpinner from '../components/LoadingSpinner'
import './ServicesPage.css'

function ServicesPage() {
  const { data: services, loading: loadingServices } = useFirestoreData(getServices, defaultServicesData)
  const { data: addons, loading: loadingAddons } = useFirestoreData(getAddons, defaultAddonsData)

  const loading = loadingServices || loadingAddons

  return (
    <div className="services-page">
      <div className="services-page-header">
        <h1>Our Services</h1>
        <p>Premium detailing packages tailored to your vehicle's needs</p>
      </div>
      {loading ? <LoadingSpinner /> : <Services servicesData={services} addonsData={addons} />}
    </div>
  )
}
export default ServicesPage

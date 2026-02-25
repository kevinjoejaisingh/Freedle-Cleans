import { useFirestoreData } from '../hooks/useFirestoreData'
import { getReviews } from '../firebase/services'
import StarRating from '../components/StarRating'
import LoadingSpinner from '../components/LoadingSpinner'
import './ReviewsPage.css'

function ReviewsPage() {
  const { data: reviews, loading } = useFirestoreData(getReviews, [])

  return (
    <div className="reviews-page">
      <div className="reviews-page-header">
        <h1>Client Reviews</h1>
        <p>See what our clients say about their experience</p>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : reviews.length === 0 ? (
        <div className="reviews-empty">
          <p>Reviews coming soon! Check back for client testimonials.</p>
        </div>
      ) : (
        <div className="reviews-grid">
          {reviews.map(review => (
            <div key={review.id} className="review-card">
              <StarRating rating={review.rating} />
              <p className="review-text">"{review.text}"</p>
              <div className="review-customer">{review.customerName}</div>
              {review.carPhotoUrl && (
                <img
                  src={review.carPhotoUrl}
                  alt={`${review.customerName}'s vehicle`}
                  className="review-photo"
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default ReviewsPage

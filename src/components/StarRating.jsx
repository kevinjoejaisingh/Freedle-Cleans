function StarRating({ rating, interactive = false, onChange }) {
  return (
    <div style={{ display: 'flex', gap: '4px' }}>
      {[1, 2, 3, 4, 5].map(star => (
        <span
          key={star}
          onClick={() => interactive && onChange && onChange(star)}
          style={{
            fontSize: '1.4rem',
            cursor: interactive ? 'pointer' : 'default',
            color: star <= rating ? 'var(--gold)' : 'rgba(255,255,255,0.2)',
            transition: 'color 0.2s'
          }}
        >
          ★
        </span>
      ))}
    </div>
  )
}

export default StarRating

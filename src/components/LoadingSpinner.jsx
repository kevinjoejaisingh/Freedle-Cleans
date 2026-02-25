function LoadingSpinner() {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '4rem',
      color: 'var(--gold)'
    }}>
      <div style={{
        width: '40px',
        height: '40px',
        border: '3px solid rgba(182, 142, 64, 0.3)',
        borderTop: '3px solid var(--gold)',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite'
      }} />
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

export default LoadingSpinner

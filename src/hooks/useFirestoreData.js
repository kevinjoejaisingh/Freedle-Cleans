import { useState, useEffect } from 'react'

export function useFirestoreData(fetchFn, fallbackData) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const result = await fetchFn()
        if (!cancelled) {
          if (result && (Array.isArray(result) ? result.length > 0 : true)) {
            setData(result)
          } else {
            setData(fallbackData)
          }
        }
      } catch (err) {
        if (!cancelled) {
          console.error('Firestore load error:', err)
          setError(err)
          setData(fallbackData)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [])

  return { data, loading, error, setData }
}

import { useEffect, useState } from 'react'
import { Range } from '../components/Range/Range'
import { fetchNormalRange, NormalRangeResponse } from '../services/rangeApi'

export default function Exercise1() {
  const [data, setData] = useState<NormalRangeResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchNormalRange()
      .then(setData)
      .catch((err: Error) => setError(err.message || 'Failed to load data'))
  }, [])

  if (error) return <p>Error: {error}</p>
  if (!data) return <p>Loading...</p>

  return (
    <main style={{ padding: '40px' }}>
      <h1>Exercise 1 — Normal Range</h1>
      <Range mode="normal" min={data.min} max={data.max} />
    </main>
  )
}

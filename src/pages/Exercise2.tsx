import { useEffect, useState } from 'react'
import { Range } from '../components/Range/Range'
import { fetchFixedRange, FixedRangeResponse } from '../services/rangeApi'

export default function Exercise2() {
  const [data, setData] = useState<FixedRangeResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchFixedRange()
      .then(setData)
      .catch((err: Error) => setError(err.message || 'Failed to load data'))
  }, [])

  if (error) return <p>Error: {error}</p>
  if (!data) return <p>Loading...</p>

  return (
    <main style={{ padding: '40px' }}>
      <h1>Exercise 2 — Fixed Values Range</h1>
      <Range mode="fixed" values={data.rangeValues} />
    </main>
  )
}

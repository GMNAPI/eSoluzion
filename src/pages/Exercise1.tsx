import { useEffect, useState } from 'react'
import { Range } from '../components/Range/Range'
import { fetchNormalRange, NormalRangeResponse } from '../services/rangeApi'

export default function Exercise1() {
  const [data, setData] = useState<NormalRangeResponse | null>(null)

  useEffect(() => {
    fetchNormalRange().then(setData)
  }, [])

  if (!data) return <p>Loading...</p>

  return (
    <main style={{ padding: '40px' }}>
      <h1>Exercise 1 — Normal Range</h1>
      <Range mode="normal" min={data.min} max={data.max} />
    </main>
  )
}

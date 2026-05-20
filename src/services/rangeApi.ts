export interface NormalRangeResponse {
  min: number
  max: number
}

export interface FixedRangeResponse {
  rangeValues: number[]
}

export async function fetchNormalRange(): Promise<NormalRangeResponse> {
  const res = await fetch('/api/range')
  if (!res.ok) throw new Error(`Failed to fetch range: ${res.status}`)
  return res.json()
}

export async function fetchFixedRange(): Promise<FixedRangeResponse> {
  const res = await fetch('/api/range-fixed')
  if (!res.ok) throw new Error(`Failed to fetch fixed range: ${res.status}`)
  return res.json()
}

import { fetchNormalRange, fetchFixedRange } from './rangeApi'

describe('rangeApi', () => {
  it('fetchNormalRange returns min and max', async () => {
    const result = await fetchNormalRange()
    expect(result).toEqual({ min: 1, max: 100 })
  })

  it('fetchFixedRange returns rangeValues array', async () => {
    const result = await fetchFixedRange()
    expect(result).toEqual({ rangeValues: [1.99, 5.99, 10.99, 30.99, 50.99, 70.99] })
  })
})

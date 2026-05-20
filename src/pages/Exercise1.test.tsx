import { render, screen, waitFor } from '@testing-library/react'
import Exercise1 from './Exercise1'

describe('Exercise1', () => {
  it('shows loading state initially', () => {
    render(<Exercise1 />)
    expect(screen.getByText(/loading/i)).toBeInTheDocument()
  })

  it('renders Range after data loads', async () => {
    render(<Exercise1 />)
    await waitFor(() => {
      expect(screen.getAllByRole('slider')).toHaveLength(2)
    })
  })

  it('shows min value from API (1)', async () => {
    render(<Exercise1 />)
    await waitFor(() => {
      expect(screen.getByDisplayValue('1')).toBeInTheDocument()
    })
  })

  it('shows max value from API (100)', async () => {
    render(<Exercise1 />)
    await waitFor(() => {
      expect(screen.getByDisplayValue('100')).toBeInTheDocument()
    })
  })
})

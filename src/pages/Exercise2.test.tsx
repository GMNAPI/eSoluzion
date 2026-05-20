import { render, screen, waitFor } from '@testing-library/react'
import Exercise2 from './Exercise2'

describe('Exercise2', () => {
  it('shows loading state initially', () => {
    render(<Exercise2 />)
    expect(screen.getByText(/loading/i)).toBeInTheDocument()
  })

  it('renders Range after data loads', async () => {
    render(<Exercise2 />)
    await waitFor(() => {
      expect(screen.getAllByRole('slider')).toHaveLength(2)
    })
  })

  it('shows first fixed value label (1.99)', async () => {
    render(<Exercise2 />)
    await waitFor(() => {
      expect(screen.getByText(/1\.99/)).toBeInTheDocument()
    })
  })

  it('shows last fixed value label (70.99)', async () => {
    render(<Exercise2 />)
    await waitFor(() => {
      expect(screen.getByText(/70\.99/)).toBeInTheDocument()
    })
  })

  it('labels are not inputs (read-only)', async () => {
    render(<Exercise2 />)
    await waitFor(() => screen.getByText(/1\.99/))
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
  })
})

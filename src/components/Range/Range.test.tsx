import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { Range } from './Range'

// ─── helpers ─────────────────────────────────────────────────────────────────

function mockTrackRect(width = 200, left = 0) {
  const track = document.querySelector('[class*="trackOuter"]') as HTMLElement
  vi.spyOn(track, 'getBoundingClientRect').mockReturnValue({
    left,
    width,
    right: left + width,
    top: 0,
    bottom: 20,
    height: 20,
    x: left,
    y: 0,
    toJSON: () => ({}),
  })
  return track
}

describe('Range — normal mode', () => {
  it('renders min and max currency labels', () => {
    render(<Range mode="normal" min={1} max={100} />)
    expect(screen.getByDisplayValue('1')).toBeInTheDocument()
    expect(screen.getByDisplayValue('100')).toBeInTheDocument()
  })

  it('renders two bullet elements', () => {
    render(<Range mode="normal" min={1} max={100} />)
    expect(screen.getAllByRole('slider')).toHaveLength(2)
  })

  it('min label input accepts a new value and clamps to [min, maxVal]', async () => {
    render(<Range mode="normal" min={1} max={100} />)
    const minInput = screen.getByDisplayValue('1')
    await userEvent.clear(minInput)
    await userEvent.type(minInput, '50')
    fireEvent.blur(minInput)
    expect(screen.getByDisplayValue('50')).toBeInTheDocument()
  })

  it('clamps min label value to min bound', async () => {
    render(<Range mode="normal" min={1} max={100} />)
    const minInput = screen.getByDisplayValue('1')
    await userEvent.clear(minInput)
    await userEvent.type(minInput, '-5')
    fireEvent.blur(minInput)
    expect(screen.getByDisplayValue('1')).toBeInTheDocument()
  })

  it('clamps max label value to max bound', async () => {
    render(<Range mode="normal" min={1} max={100} />)
    const maxInput = screen.getByDisplayValue('100')
    await userEvent.clear(maxInput)
    await userEvent.type(maxInput, '999')
    fireEvent.blur(maxInput)
    expect(screen.getByDisplayValue('100')).toBeInTheDocument()
  })

  it('prevents min from exceeding current max bullet value', async () => {
    render(<Range mode="normal" min={1} max={100} />)
    const minInput = screen.getByDisplayValue('1')
    await userEvent.clear(minInput)
    await userEvent.type(minInput, '100')
    fireEvent.blur(minInput)
    // min can't equal or exceed max bullet (which started at 100)
    // should clamp to maxVal - 1 = 99
    expect(screen.getByDisplayValue('99')).toBeInTheDocument()
  })

  it('min bullet position reflects minVal as percentage', () => {
    render(<Range mode="normal" min={0} max={100} />)
    const [minBullet] = screen.getAllByRole('slider')
    // min=0 → left: 0%
    expect(minBullet).toHaveStyle({ left: '0%' })
  })
})

describe('Range — fixed mode', () => {
  const values = [1.99, 5.99, 10.99, 30.99, 50.99, 70.99]

  it('renders first and last values as read-only labels', () => {
    render(<Range mode="fixed" values={values} />)
    expect(screen.getByText(/1\.99/)).toBeInTheDocument()
    expect(screen.getByText(/70\.99/)).toBeInTheDocument()
  })

  it('labels are not inputs', () => {
    render(<Range mode="fixed" values={values} />)
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
  })

  it('renders two bullet elements', () => {
    render(<Range mode="fixed" values={values} />)
    expect(screen.getAllByRole('slider')).toHaveLength(2)
  })

  it('min bullet starts at first value position (0%)', () => {
    render(<Range mode="fixed" values={values} />)
    const [minBullet] = screen.getAllByRole('slider')
    expect(minBullet).toHaveStyle({ left: '0%' })
  })

  it('max bullet starts at last value position (100%)', () => {
    render(<Range mode="fixed" values={values} />)
    const [, maxBullet] = screen.getAllByRole('slider')
    expect(maxBullet).toHaveStyle({ left: '100%' })
  })

  it('min bullet aria-valuenow reflects first value', () => {
    render(<Range mode="fixed" values={values} />)
    const [minBullet] = screen.getAllByRole('slider')
    expect(minBullet).toHaveAttribute('aria-valuenow', '1.99')
  })
})

describe('Range — keyboard navigation', () => {
  it('ArrowRight increments min bullet by 1 in normal mode', () => {
    render(<Range mode="normal" min={1} max={100} />)
    const [minBullet] = screen.getAllByRole('slider')
    fireEvent.keyDown(minBullet, { key: 'ArrowRight' })
    expect(minBullet).toHaveAttribute('aria-valuenow', '2')
  })

  it('ArrowLeft does not move min bullet below min bound', () => {
    render(<Range mode="normal" min={1} max={100} />)
    const [minBullet] = screen.getAllByRole('slider')
    fireEvent.keyDown(minBullet, { key: 'ArrowLeft' })
    expect(minBullet).toHaveAttribute('aria-valuenow', '1')
  })

  it('ArrowLeft decrements max bullet by 1 in normal mode', () => {
    render(<Range mode="normal" min={1} max={100} />)
    const [, maxBullet] = screen.getAllByRole('slider')
    fireEvent.keyDown(maxBullet, { key: 'ArrowLeft' })
    expect(maxBullet).toHaveAttribute('aria-valuenow', '99')
  })

  it('bullets have tabIndex 0 in normal mode', () => {
    render(<Range mode="normal" min={1} max={100} />)
    screen.getAllByRole('slider').forEach(b => expect(b).toHaveAttribute('tabindex', '0'))
  })

  it('slider bullets have aria-orientation horizontal', () => {
    render(<Range mode="normal" min={1} max={100} />)
    screen
      .getAllByRole('slider')
      .forEach(b => expect(b).toHaveAttribute('aria-orientation', 'horizontal'))
  })

  it('ArrowRight moves min bullet to next fixed value index', () => {
    const vals = [1.99, 5.99, 10.99, 30.99, 50.99, 70.99]
    render(<Range mode="fixed" values={vals} />)
    const [minBullet] = screen.getAllByRole('slider')
    fireEvent.keyDown(minBullet, { key: 'ArrowRight' })
    expect(minBullet).toHaveAttribute('aria-valuenow', '5.99')
  })

  it('ArrowLeft moves max bullet to previous fixed value index', () => {
    const vals = [1.99, 5.99, 10.99, 30.99, 50.99, 70.99]
    render(<Range mode="fixed" values={vals} />)
    const [, maxBullet] = screen.getAllByRole('slider')
    fireEvent.keyDown(maxBullet, { key: 'ArrowLeft' })
    expect(maxBullet).toHaveAttribute('aria-valuenow', '50.99')
  })
})

describe('Range — integrated drag', () => {
  it('dragging min bullet rightward increases aria-valuenow in normal mode', () => {
    render(<Range mode="normal" min={1} max={100} />)
    const [minBullet] = screen.getAllByRole('slider')
    const track = mockTrackRect(200, 0)

    fireEvent.mouseDown(minBullet)
    // clientX=100 → 50% of 200px track → value ≈ 50
    fireEvent.mouseMove(document, { clientX: 100 })
    fireEvent.mouseUp(document)

    const val = Number(minBullet.getAttribute('aria-valuenow'))
    expect(val).toBeGreaterThan(1)

    vi.restoreAllMocks()
    void track
  })

  it('dragging in fixed mode snaps to a value from the array', async () => {
    const vals = [1.99, 5.99, 10.99, 30.99, 50.99, 70.99]
    render(<Range mode="fixed" values={vals} />)
    const [minBullet] = screen.getAllByRole('slider')
    const track = mockTrackRect(200, 0)

    fireEvent.mouseDown(minBullet)
    // clientX=80 → 40% of 200px → index≈2 → 10.99
    fireEvent.mouseMove(document, { clientX: 80 })
    fireEvent.mouseUp(document)

    const val = Number(minBullet.getAttribute('aria-valuenow'))
    expect(vals).toContain(val)

    vi.restoreAllMocks()
    void track
  })
})

describe('Range — a11y (jest-axe)', () => {
  it('normal mode has no accessibility violations', async () => {
    const { container } = render(<Range mode="normal" min={1} max={100} />)
    expect(await axe(container)).toHaveNoViolations()
  })

  it('fixed mode has no accessibility violations', async () => {
    const { container } = render(
      <Range mode="fixed" values={[1.99, 5.99, 10.99, 30.99, 50.99, 70.99]} />
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})

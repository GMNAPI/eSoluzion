import { renderHook, act } from '@testing-library/react'
import { useRangeDrag } from './useRangeDrag'

function makeTrackRef(left = 0, width = 200) {
  const div = document.createElement('div')
  vi.spyOn(div, 'getBoundingClientRect').mockReturnValue({
    left, width, top: 0, right: left + width,
    bottom: 0, height: 0, x: left, y: 0, toJSON: () => ({})
  } as DOMRect)
  return { current: div }
}

describe('useRangeDrag', () => {
  it('starts not dragging', () => {
    const trackRef = makeTrackRef()
    const { result } = renderHook(() =>
      useRangeDrag(trackRef, vi.fn())
    )
    expect(result.current.isDragging).toBe(false)
  })

  it('sets isDragging on mousedown', () => {
    const trackRef = makeTrackRef()
    const { result } = renderHook(() =>
      useRangeDrag(trackRef, vi.fn())
    )
    act(() => {
      result.current.onMouseDown({ preventDefault: vi.fn() } as unknown as React.MouseEvent)
    })
    expect(result.current.isDragging).toBe(true)
  })

  it('calls onDrag with correct 0-1 percent on mousemove', () => {
    const trackRef = makeTrackRef(100, 200) // track starts at x=100, width=200
    const onDrag = vi.fn()
    const { result } = renderHook(() => useRangeDrag(trackRef, onDrag))

    act(() => {
      result.current.onMouseDown({ preventDefault: vi.fn() } as unknown as React.MouseEvent)
    })
    act(() => {
      document.dispatchEvent(new MouseEvent('mousemove', { clientX: 200 }))
    })
    // clientX=200, left=100, width=200 => offset=100 => percent=0.5
    expect(onDrag).toHaveBeenCalledWith(0.5)
  })

  it('clamps onDrag to 0 when cursor is left of track', () => {
    const trackRef = makeTrackRef(100, 200)
    const onDrag = vi.fn()
    const { result } = renderHook(() => useRangeDrag(trackRef, onDrag))

    act(() => {
      result.current.onMouseDown({ preventDefault: vi.fn() } as unknown as React.MouseEvent)
    })
    act(() => {
      document.dispatchEvent(new MouseEvent('mousemove', { clientX: 50 }))
    })
    expect(onDrag).toHaveBeenCalledWith(0)
  })

  it('clamps onDrag to 1 when cursor is right of track', () => {
    const trackRef = makeTrackRef(100, 200)
    const onDrag = vi.fn()
    const { result } = renderHook(() => useRangeDrag(trackRef, onDrag))

    act(() => {
      result.current.onMouseDown({ preventDefault: vi.fn() } as unknown as React.MouseEvent)
    })
    act(() => {
      document.dispatchEvent(new MouseEvent('mousemove', { clientX: 400 }))
    })
    expect(onDrag).toHaveBeenCalledWith(1)
  })

  it('clears isDragging on mouseup', () => {
    const trackRef = makeTrackRef()
    const { result } = renderHook(() => useRangeDrag(trackRef, vi.fn()))

    act(() => {
      result.current.onMouseDown({ preventDefault: vi.fn() } as unknown as React.MouseEvent)
    })
    act(() => {
      document.dispatchEvent(new MouseEvent('mouseup'))
    })
    expect(result.current.isDragging).toBe(false)
  })

  it('does not call onDrag when not dragging', () => {
    const trackRef = makeTrackRef(100, 200)
    const onDrag = vi.fn()
    renderHook(() => useRangeDrag(trackRef, onDrag))

    act(() => {
      document.dispatchEvent(new MouseEvent('mousemove', { clientX: 150 }))
    })
    expect(onDrag).not.toHaveBeenCalled()
  })

  // ── Touch events ──────────────────────────────────────────────────────────

  it('sets isDragging on touchstart', () => {
    const trackRef = makeTrackRef()
    const { result } = renderHook(() => useRangeDrag(trackRef, vi.fn()))
    act(() => {
      result.current.onTouchStart({ preventDefault: vi.fn() } as unknown as React.TouchEvent)
    })
    expect(result.current.isDragging).toBe(true)
  })

  it('calls onDrag with correct 0-1 percent on touchmove', () => {
    const trackRef = makeTrackRef(100, 200)
    const onDrag = vi.fn()
    const { result } = renderHook(() => useRangeDrag(trackRef, onDrag))

    act(() => {
      result.current.onTouchStart({ preventDefault: vi.fn() } as unknown as React.TouchEvent)
    })
    act(() => {
      document.dispatchEvent(new TouchEvent('touchmove', {
        touches: [{ clientX: 200 } as Touch],
      }))
    })
    expect(onDrag).toHaveBeenCalledWith(0.5)
  })

  it('clamps onDrag to 0 when finger is left of track', () => {
    const trackRef = makeTrackRef(100, 200)
    const onDrag = vi.fn()
    const { result } = renderHook(() => useRangeDrag(trackRef, onDrag))

    act(() => {
      result.current.onTouchStart({ preventDefault: vi.fn() } as unknown as React.TouchEvent)
    })
    act(() => {
      document.dispatchEvent(new TouchEvent('touchmove', {
        touches: [{ clientX: 50 } as Touch],
      }))
    })
    expect(onDrag).toHaveBeenCalledWith(0)
  })

  it('clamps onDrag to 1 when finger is right of track', () => {
    const trackRef = makeTrackRef(100, 200)
    const onDrag = vi.fn()
    const { result } = renderHook(() => useRangeDrag(trackRef, onDrag))

    act(() => {
      result.current.onTouchStart({ preventDefault: vi.fn() } as unknown as React.TouchEvent)
    })
    act(() => {
      document.dispatchEvent(new TouchEvent('touchmove', {
        touches: [{ clientX: 400 } as Touch],
      }))
    })
    expect(onDrag).toHaveBeenCalledWith(1)
  })

  it('clears isDragging on touchend', () => {
    const trackRef = makeTrackRef()
    const { result } = renderHook(() => useRangeDrag(trackRef, vi.fn()))

    act(() => {
      result.current.onTouchStart({ preventDefault: vi.fn() } as unknown as React.TouchEvent)
    })
    act(() => {
      document.dispatchEvent(new TouchEvent('touchend'))
    })
    expect(result.current.isDragging).toBe(false)
  })

  it('does not call onDrag when not dragging (touch)', () => {
    const trackRef = makeTrackRef(100, 200)
    const onDrag = vi.fn()
    renderHook(() => useRangeDrag(trackRef, onDrag))

    act(() => {
      document.dispatchEvent(new TouchEvent('touchmove', {
        touches: [{ clientX: 150 } as Touch],
      }))
    })
    expect(onDrag).not.toHaveBeenCalled()
  })
})

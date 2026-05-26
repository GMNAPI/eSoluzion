import { useCallback, useEffect, useState } from 'react'

export function useRangeDrag(
  trackRef: React.RefObject<HTMLElement>,
  onDrag: (offsetPercent: number) => void
): {
  isDragging: boolean
  onMouseDown: (e: React.MouseEvent) => void
  onTouchStart: (e: React.TouchEvent) => void
} {
  const [isDragging, setIsDragging] = useState(false)

  const calcPercent = useCallback(
    (clientX: number) => {
      if (!trackRef.current) return
      const rect = trackRef.current.getBoundingClientRect()
      const raw = (clientX - rect.left) / rect.width
      onDrag(Math.max(0, Math.min(1, raw)))
    },
    [onDrag] // eslint-disable-line react-hooks/exhaustive-deps
  )

  const handleMouseMove = useCallback(
    (e: MouseEvent) => calcPercent(e.clientX),
    [calcPercent]
  )

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!e.touches.length) return
      calcPercent(e.touches[0].clientX)
    },
    [calcPercent]
  )

  // setIsDragging is stable across renders, so empty deps array is intentional and safe
  const handleMouseUp = useCallback(() => setIsDragging(false), [])
  const handleTouchEnd = useCallback(() => setIsDragging(false), [])

  useEffect(() => {
    if (!isDragging) return
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    document.addEventListener('touchmove', handleTouchMove)
    document.addEventListener('touchend', handleTouchEnd)
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.removeEventListener('touchmove', handleTouchMove)
      document.removeEventListener('touchend', handleTouchEnd)
    }
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd])

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  return { isDragging, onMouseDown, onTouchStart }
}

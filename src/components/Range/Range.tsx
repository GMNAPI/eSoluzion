import { useCallback, useRef, useState } from 'react'
import { useRangeDrag } from '../../hooks/useRangeDrag'
import styles from './Range.module.css'

interface NormalRangeProps {
  mode: 'normal'
  min: number
  max: number
}

interface FixedRangeProps {
  mode: 'fixed'
  values: number[]
}

type RangeProps = NormalRangeProps | FixedRangeProps

export function Range(props: RangeProps) {
  const trackRef = useRef<HTMLDivElement>(null)

  if (props.mode === 'normal') {
    return <NormalRange {...props} trackRef={trackRef} />
  }
  return <FixedRange {...props} trackRef={trackRef} />
}

// ─── Normal Mode ─────────────────────────────────────────────────────────────

interface NormalRangeInternalProps extends NormalRangeProps {
  trackRef: React.RefObject<HTMLDivElement>
}

function NormalRange({ min, max, trackRef }: NormalRangeInternalProps) {
  const [minVal, setMinVal] = useState(min)
  const [maxVal, setMaxVal] = useState(max)
  const [minInput, setMinInput] = useState(String(min))
  const [maxInput, setMaxInput] = useState(String(max))

  const toPercent = (v: number) => ((v - min) / (max - min)) * 100

  const handleMinDrag = useCallback(
    (pct: number) => {
      const raw = min + pct * (max - min)
      const clamped = Math.max(min, Math.min(raw, maxVal - 1))
      const rounded = Math.round(clamped)
      setMinVal(rounded)
      setMinInput(String(rounded))
    },
    [min, max, maxVal]
  )

  const handleMaxDrag = useCallback(
    (pct: number) => {
      const raw = min + pct * (max - min)
      const clamped = Math.max(minVal + 1, Math.min(raw, max))
      const rounded = Math.round(clamped)
      setMaxVal(rounded)
      setMaxInput(String(rounded))
    },
    [min, max, minVal]
  )

  const { isDragging: minDragging, onMouseDown: minMouseDown, onTouchStart: minTouchStart } = useRangeDrag(trackRef, handleMinDrag)
  const { isDragging: maxDragging, onMouseDown: maxMouseDown, onTouchStart: maxTouchStart } = useRangeDrag(trackRef, handleMaxDrag)

  function commitMin() {
    const parsed = parseFloat(minInput)
    if (isNaN(parsed)) { setMinInput(String(minVal)); return }
    const clamped = Math.max(min, Math.min(parsed, maxVal - 1))
    setMinVal(clamped)
    setMinInput(String(clamped))
  }

  function commitMax() {
    const parsed = parseFloat(maxInput)
    if (isNaN(parsed)) { setMaxInput(String(maxVal)); return }
    const clamped = Math.max(minVal + 1, Math.min(parsed, max))
    setMaxVal(clamped)
    setMaxInput(String(clamped))
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.label}>
        <input
          className={styles.labelInput}
          value={minInput}
          onChange={e => setMinInput(e.target.value)}
          onBlur={commitMin}
          onKeyDown={e => e.key === 'Enter' && commitMin()}
          aria-label="minimum value"
        />
        €
      </div>

      <div ref={trackRef} className={styles.trackOuter}>
        <div
          className={styles.trackFill}
          style={{ left: `${toPercent(minVal)}%`, right: `${100 - toPercent(maxVal)}%` }}
        />
        <div
          role="slider"
          aria-label="min bullet"
          aria-valuenow={minVal}
          aria-valuemin={min}
          aria-valuemax={max}
          className={`${styles.bullet} ${minDragging ? styles.bulletDragging : ''}`}
          style={{ left: `${toPercent(minVal)}%` }}
          onMouseDown={minMouseDown}
          onTouchStart={minTouchStart}
        />
        <div
          role="slider"
          aria-label="max bullet"
          aria-valuenow={maxVal}
          aria-valuemin={min}
          aria-valuemax={max}
          className={`${styles.bullet} ${maxDragging ? styles.bulletDragging : ''}`}
          style={{ left: `${toPercent(maxVal)}%` }}
          onMouseDown={maxMouseDown}
          onTouchStart={maxTouchStart}
        />
      </div>

      <div className={styles.label}>
        <input
          className={styles.labelInput}
          value={maxInput}
          onChange={e => setMaxInput(e.target.value)}
          onBlur={commitMax}
          onKeyDown={e => e.key === 'Enter' && commitMax()}
          aria-label="maximum value"
        />
        €
      </div>
    </div>
  )
}

// ─── Fixed Mode (stub — implemented in Task 5) ───────────────────────────────

interface FixedRangeInternalProps extends FixedRangeProps {
  trackRef: React.RefObject<HTMLDivElement>
}

function FixedRange({ values, trackRef }: FixedRangeInternalProps) {
  const [minIndex, setMinIndex] = useState(0)
  const [maxIndex, setMaxIndex] = useState(values.length - 1)

  const toPercent = (index: number) => (index / (values.length - 1)) * 100

  const snapIndex = useCallback(
    (pct: number) => Math.round(pct * (values.length - 1)),
    [values.length]
  )

  const handleMinDrag = useCallback(
    (pct: number) => {
      const idx = Math.max(0, Math.min(snapIndex(pct), maxIndex - 1))
      setMinIndex(idx)
    },
    [snapIndex, maxIndex]
  )

  const handleMaxDrag = useCallback(
    (pct: number) => {
      const idx = Math.max(minIndex + 1, Math.min(snapIndex(pct), values.length - 1))
      setMaxIndex(idx)
    },
    [snapIndex, minIndex, values.length]
  )

  const { isDragging: minDragging, onMouseDown: minMouseDown, onTouchStart: minTouchStart } = useRangeDrag(trackRef, handleMinDrag)
  const { isDragging: maxDragging, onMouseDown: maxMouseDown, onTouchStart: maxTouchStart } = useRangeDrag(trackRef, handleMaxDrag)

  return (
    <div className={styles.wrapper}>
      <span className={styles.labelText}>{values[minIndex].toFixed(2)}€</span>

      <div ref={trackRef} className={styles.trackOuter}>
        <div
          className={styles.trackFill}
          style={{
            left: `${toPercent(minIndex)}%`,
            right: `${100 - toPercent(maxIndex)}%`,
          }}
        />
        <div
          role="slider"
          aria-label="min bullet"
          aria-valuenow={values[minIndex]}
          aria-valuemin={values[0]}
          aria-valuemax={values[values.length - 1]}
          className={`${styles.bullet} ${minDragging ? styles.bulletDragging : ''}`}
          style={{ left: `${toPercent(minIndex)}%` }}
          onMouseDown={minMouseDown}
          onTouchStart={minTouchStart}
        />
        <div
          role="slider"
          aria-label="max bullet"
          aria-valuenow={values[maxIndex]}
          aria-valuemin={values[0]}
          aria-valuemax={values[values.length - 1]}
          className={`${styles.bullet} ${maxDragging ? styles.bulletDragging : ''}`}
          style={{ left: `${toPercent(maxIndex)}%` }}
          onMouseDown={maxMouseDown}
          onTouchStart={maxTouchStart}
        />
      </div>

      <span className={styles.labelText}>{values[maxIndex].toFixed(2)}€</span>
    </div>
  )
}

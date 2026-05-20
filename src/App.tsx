import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

const Exercise1 = lazy(() => import('./pages/Exercise1'))
const Exercise2 = lazy(() => import('./pages/Exercise2'))

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<p>Loading...</p>}>
        <Routes>
          <Route path="/" element={<Navigate to="/exercise1" replace />} />
          <Route path="/exercise1" element={<Exercise1 />} />
          <Route path="/exercise2" element={<Exercise2 />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

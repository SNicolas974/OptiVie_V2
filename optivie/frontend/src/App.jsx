import { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import BottomNav from './components/BottomNav'
import ScanPage from './pages/ScanPage'
import IngredientsPage from './pages/IngredientsPage'

function App() {
  const [analysisResult, setAnalysisResult] = useState(null)

  return (
    <div className="min-h-screen bg-primary-100 flex flex-col">
      {/* Main container - mobile-first, max-width on desktop */}
      <div className="flex-1 w-full max-w-[430px] mx-auto bg-primary-100 relative">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-primary-100/95 backdrop-blur-sm px-4 py-4 border-b border-primary-200">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🌿</span>
            <h1 className="text-xl font-bold text-primary-800">OptiVie</h1>
          </div>
          <p className="text-sm text-primary-600 mt-0.5">Nutrition anti-inflammatoire</p>
        </header>

        {/* Content area with padding for bottom nav */}
        <main className="flex-1 pb-24">
          <Routes>
            <Route 
              path="/" 
              element={
                <ScanPage 
                  analysisResult={analysisResult} 
                  setAnalysisResult={setAnalysisResult} 
                />
              } 
            />
            <Route 
              path="/ingredients" 
              element={<IngredientsPage analysisResult={analysisResult} />} 
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        {/* Bottom Navigation */}
        <BottomNav />
      </div>
    </div>
  )
}

export default App

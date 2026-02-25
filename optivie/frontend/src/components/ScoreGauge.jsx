import { useEffect, useState } from 'react'

function ScoreGauge({ score, size = 180 }) {
  const [animatedScore, setAnimatedScore] = useState(0)
  
  // Circle properties
  const strokeWidth = 12
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const center = size / 2

  // Animate score on mount/change
  useEffect(() => {
    const duration = 1000
    const steps = 60
    const increment = score / steps
    let current = 0
    
    const timer = setInterval(() => {
      current += increment
      if (current >= score) {
        setAnimatedScore(score)
        clearInterval(timer)
      } else {
        setAnimatedScore(Math.round(current))
      }
    }, duration / steps)

    return () => clearInterval(timer)
  }, [score])

  // Calculate stroke offset for animation
  const strokeDashoffset = circumference - (animatedScore / 100) * circumference

  // Determine color based on score
  const getColor = (score) => {
    if (score < 40) return { stroke: '#EF4444', bg: '#FEE2E2', text: '#DC2626' }
    if (score < 70) return { stroke: '#F59E0B', bg: '#FEF3C7', text: '#D97706' }
    return { stroke: '#22C55E', bg: '#DCFCE7', text: '#16A34A' }
  }

  const colors = getColor(animatedScore)

  // Get score label
  const getLabel = (score) => {
    if (score < 40) return 'Pro-inflammatoire'
    if (score < 70) return 'Modere'
    return 'Anti-inflammatoire'
  }

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          className="transform -rotate-90"
        >
          {/* Background circle */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            stroke={colors.bg}
            strokeWidth={strokeWidth}
            fill="none"
          />
          {/* Progress circle */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            stroke={colors.stroke}
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span 
            className="text-4xl font-bold transition-colors duration-300"
            style={{ color: colors.text }}
          >
            {animatedScore}
          </span>
          <span className="text-sm text-gray-500 font-medium">/100</span>
        </div>
      </div>
      {/* Label below */}
      <div 
        className="mt-3 px-4 py-1.5 rounded-full text-sm font-semibold"
        style={{ backgroundColor: colors.bg, color: colors.text }}
      >
        {getLabel(animatedScore)}
      </div>
    </div>
  )
}

export default ScoreGauge

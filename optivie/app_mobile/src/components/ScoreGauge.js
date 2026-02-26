import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import Svg, { Circle } from 'react-native-svg'
import { theme } from '../theme'

export default function ScoreGauge({ score, size = 180 }) {
  const [animatedScore, setAnimatedScore] = useState(0)

  const strokeWidth = 12
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const center = size / 2

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

  const strokeDashoffset = circumference - (animatedScore / 100) * circumference

  const getColor = (s) => {
    if (s < 40) return { stroke: '#EF4444', bg: '#FEE2E2', text: '#DC2626' }
    if (s < 70) return { stroke: '#F59E0B', bg: '#FEF3C7', text: '#D97706' }
    return { stroke: '#22C55E', bg: '#DCFCE7', text: '#16A34A' }
  }

  const getLabel = (s) => {
    if (s < 40) return 'Pro-inflammatoire'
    if (s < 70) return 'Modéré'
    return 'Anti-inflammatoire'
  }

  const colors = getColor(animatedScore)

  return (
    <View style={styles.container}>
      <View style={[styles.svgWrap, { width: size, height: size }]}>
        <Svg width={size} height={size} style={{ transform: [{ rotate: '-90deg' }] }}>
          <Circle
            cx={center}
            cy={center}
            r={radius}
            stroke={colors.bg}
            strokeWidth={strokeWidth}
            fill="none"
          />
          <Circle
            cx={center}
            cy={center}
            r={radius}
            stroke={colors.stroke}
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
          />
        </Svg>
        <View style={styles.centerContent}>
          <Text style={[styles.scoreText, { color: colors.text }]}>{animatedScore}</Text>
          <Text style={styles.scoreSuffix}>/100</Text>
        </View>
      </View>
      <View style={[styles.label, { backgroundColor: colors.bg }]}>
        <Text style={[styles.labelText, { color: colors.text }]}>
          {getLabel(animatedScore)}
        </Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  svgWrap: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerContent: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreText: {
    fontSize: 36,
    fontWeight: '700',
  },
  scoreSuffix: {
    fontSize: 14,
    color: theme.colors.gray[500],
    fontWeight: '500',
  },
  label: {
    marginTop: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.full,
  },
  labelText: {
    fontSize: 14,
    fontWeight: '600',
  },
})

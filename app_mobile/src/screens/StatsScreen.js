import React, { useState, useEffect, useCallback } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Dimensions
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { theme } from '../theme'
import { useAuth } from '../context/AuthContext'
import { API_BASE_URL } from '../config'

const { width } = Dimensions.get('window')

// Composant pour une carte de stat
const StatCard = ({ emoji, value, label, subLabel, color = theme.colors.primary[600] }) => (
  <View style={[styles.statCard, { borderLeftColor: color }]}>
    <Text style={styles.statEmoji}>{emoji}</Text>
    <Text style={[styles.statValue, { color }]}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
    {subLabel && <Text style={styles.statSubLabel}>{subLabel}</Text>}
  </View>
)

// Composant pour un conseil personnalisé
const TipCard = ({ tip }) => (
  <View style={styles.tipCard}>
    <Text style={styles.tipEmoji}>{tip.emoji}</Text>
    <View style={styles.tipContent}>
      <Text style={styles.tipTitle}>{tip.title}</Text>
      <Text style={styles.tipText}>{tip.text}</Text>
    </View>
  </View>
)

// Composant pour le graphique simplifié des 7 derniers jours
const WeekChart = ({ data }) => {
  const days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']
  const maxScore = 100

  // Créer un tableau des 7 derniers jours
  const last7Days = []
  for (let i = 6; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split('T')[0]
    const dayData = data.find(d => d.date === dateStr)
    last7Days.push({
      day: days[date.getDay()],
      date: dateStr,
      score: dayData ? dayData.score : 0,
      meals: dayData ? dayData.meals : 0
    })
  }

  return (
    <View style={styles.chartContainer}>
      <Text style={styles.chartTitle}>Score moyen des 7 derniers jours</Text>
      <View style={styles.chartBars}>
        {last7Days.map((day, index) => (
          <View key={index} style={styles.chartBarContainer}>
            <View style={styles.chartBarWrapper}>
              <View 
                style={[
                  styles.chartBar, 
                  { 
                    height: `${(day.score / maxScore) * 100}%`,
                    backgroundColor: day.score >= 70 
                      ? theme.colors.green[600] 
                      : day.score >= 50 
                        ? theme.colors.orange[600] 
                        : day.score > 0 
                          ? theme.colors.red[500]
                          : theme.colors.gray[400]
                  }
                ]} 
              />
            </View>
            <Text style={styles.chartBarLabel}>{day.day}</Text>
            {day.score > 0 && <Text style={styles.chartBarScore}>{day.score}</Text>}
          </View>
        ))}
      </View>
    </View>
  )
}

// Sélecteur de période
const PeriodSelector = ({ selected, onSelect }) => (
  <View style={styles.periodSelector}>
    {['week', 'month', 'year'].map(period => (
      <TouchableOpacity
        key={period}
        style={[styles.periodButton, selected === period && styles.periodButtonActive]}
        onPress={() => onSelect(period)}
      >
        <Text style={[styles.periodButtonText, selected === period && styles.periodButtonTextActive]}>
          {period === 'week' ? 'Semaine' : period === 'month' ? 'Mois' : 'Annee'}
        </Text>
      </TouchableOpacity>
    ))}
  </View>
)

export default function StatsScreen() {
  const { token } = useAuth()
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [period, setPeriod] = useState('week')
  const [dashboard, setDashboard] = useState(null)
  const [history, setHistory] = useState(null)

  const fetchDashboard = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/stats/dashboard`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (response.ok) {
        const data = await response.json()
        setDashboard(data)
      }
    } catch (error) {
      console.error('Error fetching dashboard:', error)
    }
  }, [token])

  const fetchHistory = useCallback(async (selectedPeriod) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/stats/history?period=${selectedPeriod}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (response.ok) {
        const data = await response.json()
        setHistory(data)
      }
    } catch (error) {
      console.error('Error fetching history:', error)
    }
  }, [token])

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      await Promise.all([fetchDashboard(), fetchHistory(period)])
      setLoading(false)
    }
    loadData()
  }, [fetchDashboard, fetchHistory, period])

  const onRefresh = async () => {
    setRefreshing(true)
    await Promise.all([fetchDashboard(), fetchHistory(period)])
    setRefreshing(false)
  }

  const handlePeriodChange = (newPeriod) => {
    setPeriod(newPeriod)
    fetchHistory(newPeriod)
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary[600]} />
        <Text style={styles.loadingText}>Chargement des statistiques...</Text>
      </View>
    )
  }

  const periodLabel = period === 'week' ? 'Cette semaine' : period === 'month' ? 'Ce mois' : 'Cette annee'

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary[600]} />
        }
      >
        {/* Header avec streak */}
        <View style={styles.header}>
          <View style={styles.streakBadge}>
            <Text style={styles.streakEmoji}>🔥</Text>
            <Text style={styles.streakValue}>{dashboard?.streaks?.current || 0}</Text>
            <Text style={styles.streakLabel}>jours de suite</Text>
          </View>
          <View style={styles.headerStats}>
            <View style={styles.headerStatItem}>
              <Text style={styles.headerStatValue}>{dashboard?.streaks?.totalScans || 0}</Text>
              <Text style={styles.headerStatLabel}>Scans total</Text>
            </View>
            <View style={styles.headerStatItem}>
              <Text style={styles.headerStatValue}>{dashboard?.streaks?.goodMealRate || 0}%</Text>
              <Text style={styles.headerStatLabel}>Bons repas</Text>
            </View>
          </View>
        </View>

        {/* Stats d'aujourd'hui */}
        {dashboard?.today && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Aujourd'hui</Text>
            <View style={styles.todayCard}>
              <View style={styles.todayMain}>
                <Text style={styles.todayScore}>{dashboard.today.avgScore}</Text>
                <Text style={styles.todayScoreLabel}>Score moyen</Text>
              </View>
              <View style={styles.todayDetails}>
                <Text style={styles.todayMeals}>{dashboard.today.mealsScanned} repas scanne{dashboard.today.mealsScanned > 1 ? 's' : ''}</Text>
                {dashboard.today.bestMeal && (
                  <Text style={styles.todayBest}>
                    Meilleur: {dashboard.today.bestMeal.name} ({dashboard.today.bestMeal.score})
                  </Text>
                )}
              </View>
            </View>
          </View>
        )}

        {/* Sélecteur de période */}
        <PeriodSelector selected={period} onSelect={handlePeriodChange} />

        {/* Stats de la période */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{periodLabel}</Text>
          <View style={styles.statsGrid}>
            <StatCard
              emoji="📊"
              value={history?.summary?.avgScore || 0}
              label="Score moyen"
              color={
                (history?.summary?.avgScore || 0) >= 70
                  ? theme.colors.green[600]
                  : (history?.summary?.avgScore || 0) >= 50
                    ? theme.colors.orange[600]
                    : theme.colors.red[500]
              }
            />
            <StatCard
              emoji="🍽️"
              value={history?.summary?.totalMeals || 0}
              label="Repas scannes"
              color={theme.colors.primary[600]}
            />
            <StatCard
              emoji="📅"
              value={history?.summary?.daysActive || 0}
              label="Jours actifs"
              color={theme.colors.primary[700]}
            />
            <StatCard
              emoji="🏆"
              value={dashboard?.streaks?.longest || 0}
              label="Record serie"
              color={theme.colors.orange[600]}
            />
          </View>
        </View>

        {/* Graphique des 7 derniers jours */}
        {dashboard?.history && dashboard.history.length > 0 && (
          <View style={styles.section}>
            <WeekChart data={dashboard.history} />
          </View>
        )}

        {/* Conseils personnalisés */}
        {dashboard?.tips && dashboard.tips.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Conseils pour vous</Text>
            {dashboard.tips.map((tip, index) => (
              <TipCard key={tip.id || index} tip={tip} />
            ))}
          </View>
        )}

        {/* Historique récent */}
        {history?.recentAnalyses && history.recentAnalyses.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Analyses recentes</Text>
            {history.recentAnalyses.slice(0, 5).map((analysis, index) => (
              <View key={analysis.id || index} style={styles.historyItem}>
                <View style={styles.historyInfo}>
                  <Text style={styles.historyPlat}>{analysis.plat}</Text>
                  <Text style={styles.historyDate}>
                    {new Date(analysis.date).toLocaleDateString('fr-FR')}
                  </Text>
                </View>
                <View style={[
                  styles.historyScore,
                  {
                    backgroundColor: analysis.score >= 70
                      ? theme.colors.green[100]
                      : analysis.score >= 50
                        ? theme.colors.orange[100]
                        : theme.colors.red[100]
                  }
                ]}>
                  <Text style={[
                    styles.historyScoreText,
                    {
                      color: analysis.score >= 70
                        ? theme.colors.green[800]
                        : analysis.score >= 50
                          ? theme.colors.orange[800]
                          : theme.colors.red[800]
                    }
                  ]}>
                    {analysis.score}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Message si pas de données */}
        {(!dashboard?.streaks?.totalScans || dashboard.streaks.totalScans === 0) && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>📸</Text>
            <Text style={styles.emptyTitle}>Commencez a scanner!</Text>
            <Text style={styles.emptyText}>
              Scannez vos repas pour voir apparaitre vos statistiques et recevoir des conseils personnalises.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.primary[100],
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.primary[100],
  },
  loadingText: {
    marginTop: theme.spacing.md,
    color: theme.colors.gray[600],
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
  },
  header: {
    backgroundColor: theme.colors.primary[800],
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl,
    marginBottom: theme.spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
  },
  streakBadge: {
    alignItems: 'center',
    marginRight: theme.spacing.xl,
  },
  streakEmoji: {
    fontSize: 40,
  },
  streakValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: theme.colors.white,
  },
  streakLabel: {
    fontSize: 12,
    color: theme.colors.primary[200],
  },
  headerStats: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  headerStatItem: {
    alignItems: 'center',
  },
  headerStatValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.white,
  },
  headerStatLabel: {
    fontSize: 12,
    color: theme.colors.primary[200],
  },
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.gray[800],
    marginBottom: theme.spacing.md,
  },
  todayCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
  },
  todayMain: {
    alignItems: 'center',
    marginRight: theme.spacing.xl,
    paddingRight: theme.spacing.xl,
    borderRightWidth: 1,
    borderRightColor: theme.colors.primary[200],
  },
  todayScore: {
    fontSize: 48,
    fontWeight: 'bold',
    color: theme.colors.primary[700],
  },
  todayScoreLabel: {
    fontSize: 12,
    color: theme.colors.gray[500],
  },
  todayDetails: {
    flex: 1,
  },
  todayMeals: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.gray[800],
    marginBottom: theme.spacing.xs,
  },
  todayBest: {
    fontSize: 14,
    color: theme.colors.green[600],
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xs,
    marginBottom: theme.spacing.lg,
  },
  periodButton: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
    borderRadius: theme.borderRadius.md,
  },
  periodButtonActive: {
    backgroundColor: theme.colors.primary[600],
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.gray[600],
  },
  periodButtonTextActive: {
    color: theme.colors.white,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
  },
  statCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    width: (width - theme.spacing.lg * 2 - theme.spacing.md) / 2,
    borderLeftWidth: 4,
  },
  statEmoji: {
    fontSize: 24,
    marginBottom: theme.spacing.sm,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    color: theme.colors.gray[600],
  },
  statSubLabel: {
    fontSize: 10,
    color: theme.colors.gray[400],
    marginTop: 2,
  },
  chartContainer: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
  },
  chartTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.gray[700],
    marginBottom: theme.spacing.lg,
  },
  chartBars: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 120,
  },
  chartBarContainer: {
    alignItems: 'center',
    flex: 1,
  },
  chartBarWrapper: {
    height: 80,
    width: 24,
    backgroundColor: theme.colors.primary[100],
    borderRadius: theme.borderRadius.sm,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  chartBar: {
    width: '100%',
    borderRadius: theme.borderRadius.sm,
  },
  chartBarLabel: {
    fontSize: 10,
    color: theme.colors.gray[500],
    marginTop: theme.spacing.xs,
  },
  chartBarScore: {
    fontSize: 10,
    fontWeight: '600',
    color: theme.colors.gray[700],
  },
  tipCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    flexDirection: 'row',
    marginBottom: theme.spacing.md,
  },
  tipEmoji: {
    fontSize: 32,
    marginRight: theme.spacing.md,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.gray[800],
    marginBottom: theme.spacing.xs,
  },
  tipText: {
    fontSize: 14,
    color: theme.colors.gray[600],
    lineHeight: 20,
  },
  historyItem: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  historyInfo: {
    flex: 1,
  },
  historyPlat: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.gray[800],
  },
  historyDate: {
    fontSize: 12,
    color: theme.colors.gray[500],
  },
  historyScore: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
  },
  historyScoreText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xxl,
  },
  emptyEmoji: {
    fontSize: 60,
    marginBottom: theme.spacing.lg,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.gray[800],
    marginBottom: theme.spacing.sm,
  },
  emptyText: {
    fontSize: 14,
    color: theme.colors.gray[600],
    textAlign: 'center',
    paddingHorizontal: theme.spacing.xl,
  },
})

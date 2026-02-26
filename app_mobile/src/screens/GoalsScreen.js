import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { theme } from '../theme'
import { useAuth } from '../context/AuthContext'

const HEALTH_GOALS = [
  {
    id: 'weight_loss',
    label: 'Perte de poids',
    emoji: '⚖️',
    description: 'Reduire la masse grasse et atteindre un poids sante'
  },
  {
    id: 'mental_health',
    label: 'Sante mentale',
    emoji: '🧠',
    description: 'Ameliorer humeur, reduire anxiete et depression'
  },
  {
    id: 'painful_periods',
    label: 'Regles douloureuses',
    emoji: '🩸',
    description: 'Reduire les douleurs menstruelles et SPM'
  },
  {
    id: 'joint_pain',
    label: 'Douleurs articulaires',
    emoji: '🦴',
    description: 'Soulager arthrite, arthrose et inflammations'
  },
  {
    id: 'digestive_health',
    label: 'Sante digestive',
    emoji: '🫃',
    description: 'Ameliorer digestion, reduire ballonnements'
  },
  {
    id: 'skin_health',
    label: 'Sante de la peau',
    emoji: '✨',
    description: 'Reduire acne, eczema, psoriasis'
  },
  {
    id: 'energy_boost',
    label: 'Boost energie',
    emoji: '⚡',
    description: 'Combattre la fatigue et augmenter vitalite'
  },
  {
    id: 'anti_aging',
    label: 'Anti-age',
    emoji: '🌸',
    description: 'Ralentir le vieillissement cellulaire'
  },
  {
    id: 'immune_boost',
    label: 'Renforcer immunite',
    emoji: '🛡️',
    description: 'Booster les defenses immunitaires'
  },
  {
    id: 'heart_health',
    label: 'Sante cardiaque',
    emoji: '❤️',
    description: 'Proteger le coeur et les vaisseaux'
  },
]

export default function GoalsScreen({ navigation, route }) {
  const { goals, updateGoals, fetchGoals } = useAuth()
  const [selectedGoals, setSelectedGoals] = useState([])
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)

  const isOnboarding = route?.params?.onboarding

  useEffect(() => {
    loadGoals()
  }, [])

  const loadGoals = async () => {
    const currentGoals = await fetchGoals()
    setSelectedGoals(currentGoals)
    setInitialLoading(false)
  }

  const toggleGoal = (goalId) => {
    setSelectedGoals(prev => {
      if (prev.includes(goalId)) {
        return prev.filter(id => id !== goalId)
      }
      return [...prev, goalId]
    })
  }

  const handleSave = async () => {
    if (selectedGoals.length === 0) {
      Alert.alert('Attention', 'Selectionnez au moins un objectif')
      return
    }

    setLoading(true)
    const result = await updateGoals(selectedGoals)
    setLoading(false)

    if (result.success) {
      if (isOnboarding) {
        // Navigation handled by App.js
      } else {
        Alert.alert('Succes', 'Vos objectifs ont ete mis a jour')
        navigation.goBack()
      }
    } else {
      Alert.alert('Erreur', result.error)
    }
  }

  if (initialLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary[600]} />
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>
            {isOnboarding ? 'Bienvenue !' : 'Mes objectifs'}
          </Text>
          <Text style={styles.subtitle}>
            {isOnboarding
              ? 'Selectionnez vos objectifs de sante pour personnaliser vos analyses'
              : 'Modifiez vos objectifs de sante'}
          </Text>
        </View>

        {/* Goals List */}
        <View style={styles.goalsList}>
          {HEALTH_GOALS.map((goal) => {
            const isSelected = selectedGoals.includes(goal.id)
            return (
              <TouchableOpacity
                key={goal.id}
                style={[styles.goalCard, isSelected && styles.goalCardSelected]}
                onPress={() => toggleGoal(goal.id)}
                activeOpacity={0.7}
              >
                <View style={styles.goalHeader}>
                  <Text style={styles.goalEmoji}>{goal.emoji}</Text>
                  <View style={styles.goalInfo}>
                    <Text style={[styles.goalLabel, isSelected && styles.goalLabelSelected]}>
                      {goal.label}
                    </Text>
                    <Text style={styles.goalDescription}>{goal.description}</Text>
                  </View>
                  <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                    {isSelected && <Text style={styles.checkmark}>✓</Text>}
                  </View>
                </View>
              </TouchableOpacity>
            )
          })}
        </View>
      </ScrollView>

      {/* Save Button */}
      <View style={styles.footer}>
        <Text style={styles.selectedCount}>
          {selectedGoals.length} objectif{selectedGoals.length > 1 ? 's' : ''} selectionne{selectedGoals.length > 1 ? 's' : ''}
        </Text>
        <TouchableOpacity
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={theme.colors.white} />
          ) : (
            <Text style={styles.saveButtonText}>
              {isOnboarding ? 'Commencer' : 'Enregistrer'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing.lg,
    paddingBottom: 100,
  },
  header: {
    marginBottom: theme.spacing.xl,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.primary[800],
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    fontSize: 14,
    color: theme.colors.gray[600],
    lineHeight: 20,
  },
  goalsList: {
    gap: theme.spacing.md,
  },
  goalCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    borderWidth: 2,
    borderColor: theme.colors.primary[200],
    marginBottom: theme.spacing.md,
  },
  goalCardSelected: {
    borderColor: theme.colors.primary[600],
    backgroundColor: theme.colors.primary[100],
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  goalEmoji: {
    fontSize: 32,
    marginRight: theme.spacing.md,
  },
  goalInfo: {
    flex: 1,
  },
  goalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.gray[800],
    marginBottom: 2,
  },
  goalLabelSelected: {
    color: theme.colors.primary[800],
  },
  goalDescription: {
    fontSize: 12,
    color: theme.colors.gray[500],
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 2,
    borderColor: theme.colors.primary[300],
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: theme.colors.primary[600],
    borderColor: theme.colors.primary[600],
  },
  checkmark: {
    color: theme.colors.white,
    fontSize: 14,
    fontWeight: 'bold',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: theme.colors.white,
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
    borderTopWidth: 1,
    borderTopColor: theme.colors.primary[200],
  },
  selectedCount: {
    textAlign: 'center',
    fontSize: 12,
    color: theme.colors.gray[500],
    marginBottom: theme.spacing.sm,
  },
  saveButton: {
    backgroundColor: theme.colors.primary[800],
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
})

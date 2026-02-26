import React, { useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  TextInput,
  Dimensions
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { theme } from '../theme'
import { useAuth } from '../context/AuthContext'

const { width } = Dimensions.get('window')

// Etape 1: Informations de base
const GENDERS = [
  { id: 'homme', label: 'Homme', emoji: '👨' },
  { id: 'femme', label: 'Femme', emoji: '👩' },
  { id: 'autre', label: 'Autre', emoji: '🧑' },
]

// Etape 2: Niveau d'activite
const ACTIVITY_LEVELS = [
  { id: 'sedentaire', label: 'Sedentaire', emoji: '🛋️', description: 'Peu ou pas d\'exercice' },
  { id: 'leger', label: 'Legerement actif', emoji: '🚶', description: '1-2 fois/semaine' },
  { id: 'modere', label: 'Moderement actif', emoji: '🏃', description: '3-4 fois/semaine' },
  { id: 'actif', label: 'Tres actif', emoji: '💪', description: '5+ fois/semaine' },
  { id: 'athlete', label: 'Athlete', emoji: '🏆', description: 'Entrainement intensif' },
]

// Etape 3: Objectifs de sante
const HEALTH_GOALS = [
  { id: 'weight_loss', label: 'Perte de poids', emoji: '⚖️' },
  { id: 'mental_health', label: 'Sante mentale', emoji: '🧠' },
  { id: 'painful_periods', label: 'Regles douloureuses', emoji: '🩸' },
  { id: 'joint_pain', label: 'Douleurs articulaires', emoji: '🦴' },
  { id: 'digestive_health', label: 'Sante digestive', emoji: '🫃' },
  { id: 'skin_health', label: 'Sante de la peau', emoji: '✨' },
  { id: 'energy_boost', label: 'Boost energie', emoji: '⚡' },
  { id: 'anti_aging', label: 'Anti-age', emoji: '🌸' },
  { id: 'immune_boost', label: 'Renforcer immunite', emoji: '🛡️' },
  { id: 'heart_health', label: 'Sante cardiaque', emoji: '❤️' },
]

// Etape 4: Restrictions alimentaires
const DIETARY_RESTRICTIONS = [
  { id: 'vegetarien', label: 'Vegetarien', emoji: '🥬' },
  { id: 'vegan', label: 'Vegan', emoji: '🌱' },
  { id: 'sans_gluten', label: 'Sans gluten', emoji: '🌾' },
  { id: 'sans_lactose', label: 'Sans lactose', emoji: '🥛' },
  { id: 'halal', label: 'Halal', emoji: '🍖' },
  { id: 'casher', label: 'Casher', emoji: '✡️' },
  { id: 'aucune', label: 'Aucune restriction', emoji: '✅' },
]

// Etape 5: Allergies courantes
const COMMON_ALLERGIES = [
  { id: 'arachides', label: 'Arachides', emoji: '🥜' },
  { id: 'fruits_a_coque', label: 'Fruits a coque', emoji: '🌰' },
  { id: 'crustaces', label: 'Crustaces', emoji: '🦐' },
  { id: 'oeufs', label: 'Oeufs', emoji: '🥚' },
  { id: 'poisson', label: 'Poisson', emoji: '🐟' },
  { id: 'soja', label: 'Soja', emoji: '🫘' },
  { id: 'sesame', label: 'Sesame', emoji: '🌿' },
  { id: 'aucune', label: 'Aucune allergie', emoji: '✅' },
]

const TOTAL_STEPS = 5

export default function OnboardingScreen({ onComplete }) {
  const { updateProfile, updateGoals } = useAuth()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  
  // Donnees du questionnaire
  const [profile, setProfile] = useState({
    age: '',
    gender: '',
    weight: '',
    height: '',
    activity_level: '',
    dietary_restrictions: [],
    allergies: [],
  })
  const [selectedGoals, setSelectedGoals] = useState([])

  const updateProfileField = (field, value) => {
    setProfile(prev => ({ ...prev, [field]: value }))
  }

  const toggleArrayField = (field, id) => {
    if (field === 'goals') {
      setSelectedGoals(prev => {
        if (prev.includes(id)) return prev.filter(i => i !== id)
        return [...prev, id]
      })
    } else {
      setProfile(prev => {
        const current = prev[field] || []
        // Si on selectionne "aucune", on vide le tableau
        if (id === 'aucune') {
          return { ...prev, [field]: ['aucune'] }
        }
        // Si autre chose, on enleve "aucune" si present
        const filtered = current.filter(i => i !== 'aucune')
        if (current.includes(id)) {
          return { ...prev, [field]: filtered.filter(i => i !== id) }
        }
        return { ...prev, [field]: [...filtered, id] }
      })
    }
  }

  const canProceed = () => {
    switch (step) {
      case 1:
        return profile.age && profile.gender && profile.weight && profile.height
      case 2:
        return profile.activity_level
      case 3:
        return selectedGoals.length > 0
      case 4:
        return profile.dietary_restrictions.length > 0
      case 5:
        return profile.allergies.length > 0
      default:
        return true
    }
  }

  const handleNext = async () => {
    if (step < TOTAL_STEPS) {
      setStep(step + 1)
    } else {
      // Derniere etape - sauvegarder tout
      setLoading(true)
      try {
        // Sauvegarder le profil
        const profileData = {
          ...profile,
          age: parseInt(profile.age),
          weight: parseFloat(profile.weight),
          height: parseFloat(profile.height),
          dietary_restrictions: profile.dietary_restrictions.filter(r => r !== 'aucune'),
          allergies: profile.allergies.filter(a => a !== 'aucune'),
        }
        
        const profileResult = await updateProfile(profileData)
        if (!profileResult.success) {
          throw new Error(profileResult.error)
        }

        // Sauvegarder les objectifs
        const goalsResult = await updateGoals(selectedGoals)
        if (!goalsResult.success) {
          throw new Error(goalsResult.error)
        }

        onComplete()
      } catch (error) {
        Alert.alert('Erreur', error.message || 'Impossible de sauvegarder vos informations')
      } finally {
        setLoading(false)
      }
    }
  }

  const handleBack = () => {
    if (step > 1) setStep(step - 1)
  }

  const renderProgressBar = () => (
    <View style={styles.progressContainer}>
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${(step / TOTAL_STEPS) * 100}%` }]} />
      </View>
      <Text style={styles.progressText}>Etape {step}/{TOTAL_STEPS}</Text>
    </View>
  )

  const renderStep1 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Parlons de vous</Text>
      <Text style={styles.stepSubtitle}>Ces informations nous aident a personnaliser vos recommandations</Text>

      {/* Genre */}
      <Text style={styles.fieldLabel}>Genre</Text>
      <View style={styles.optionsRow}>
        {GENDERS.map(g => (
          <TouchableOpacity
            key={g.id}
            style={[styles.optionButton, profile.gender === g.id && styles.optionButtonSelected]}
            onPress={() => updateProfileField('gender', g.id)}
          >
            <Text style={styles.optionEmoji}>{g.emoji}</Text>
            <Text style={[styles.optionLabel, profile.gender === g.id && styles.optionLabelSelected]}>
              {g.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Age */}
      <Text style={styles.fieldLabel}>Age</Text>
      <TextInput
        style={styles.input}
        placeholder="Votre age"
        placeholderTextColor={theme.colors.gray[400]}
        value={profile.age}
        onChangeText={(v) => updateProfileField('age', v.replace(/[^0-9]/g, ''))}
        keyboardType="numeric"
        maxLength={3}
      />

      {/* Poids et Taille */}
      <View style={styles.rowInputs}>
        <View style={styles.halfInput}>
          <Text style={styles.fieldLabel}>Poids (kg)</Text>
          <TextInput
            style={styles.input}
            placeholder="70"
            placeholderTextColor={theme.colors.gray[400]}
            value={profile.weight}
            onChangeText={(v) => updateProfileField('weight', v.replace(/[^0-9.]/g, ''))}
            keyboardType="decimal-pad"
            maxLength={5}
          />
        </View>
        <View style={styles.halfInput}>
          <Text style={styles.fieldLabel}>Taille (cm)</Text>
          <TextInput
            style={styles.input}
            placeholder="175"
            placeholderTextColor={theme.colors.gray[400]}
            value={profile.height}
            onChangeText={(v) => updateProfileField('height', v.replace(/[^0-9]/g, ''))}
            keyboardType="numeric"
            maxLength={3}
          />
        </View>
      </View>
    </View>
  )

  const renderStep2 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Votre activite physique</Text>
      <Text style={styles.stepSubtitle}>Quel est votre niveau d'activite habituel ?</Text>

      <View style={styles.cardList}>
        {ACTIVITY_LEVELS.map(level => (
          <TouchableOpacity
            key={level.id}
            style={[styles.card, profile.activity_level === level.id && styles.cardSelected]}
            onPress={() => updateProfileField('activity_level', level.id)}
          >
            <Text style={styles.cardEmoji}>{level.emoji}</Text>
            <View style={styles.cardInfo}>
              <Text style={[styles.cardLabel, profile.activity_level === level.id && styles.cardLabelSelected]}>
                {level.label}
              </Text>
              <Text style={styles.cardDescription}>{level.description}</Text>
            </View>
            <View style={[styles.radio, profile.activity_level === level.id && styles.radioSelected]}>
              {profile.activity_level === level.id && <View style={styles.radioDot} />}
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  )

  const renderStep3 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Vos objectifs sante</Text>
      <Text style={styles.stepSubtitle}>Selectionnez un ou plusieurs objectifs (l'IA adaptera ses conseils)</Text>

      <View style={styles.chipsContainer}>
        {HEALTH_GOALS.map(goal => (
          <TouchableOpacity
            key={goal.id}
            style={[styles.chip, selectedGoals.includes(goal.id) && styles.chipSelected]}
            onPress={() => toggleArrayField('goals', goal.id)}
          >
            <Text style={styles.chipEmoji}>{goal.emoji}</Text>
            <Text style={[styles.chipLabel, selectedGoals.includes(goal.id) && styles.chipLabelSelected]}>
              {goal.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.selectedCount}>
        {selectedGoals.length} objectif{selectedGoals.length > 1 ? 's' : ''} selectionne{selectedGoals.length > 1 ? 's' : ''}
      </Text>
    </View>
  )

  const renderStep4 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Restrictions alimentaires</Text>
      <Text style={styles.stepSubtitle}>Suivez-vous un regime particulier ?</Text>

      <View style={styles.chipsContainer}>
        {DIETARY_RESTRICTIONS.map(restriction => (
          <TouchableOpacity
            key={restriction.id}
            style={[styles.chip, profile.dietary_restrictions.includes(restriction.id) && styles.chipSelected]}
            onPress={() => toggleArrayField('dietary_restrictions', restriction.id)}
          >
            <Text style={styles.chipEmoji}>{restriction.emoji}</Text>
            <Text style={[styles.chipLabel, profile.dietary_restrictions.includes(restriction.id) && styles.chipLabelSelected]}>
              {restriction.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  )

  const renderStep5 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Allergies alimentaires</Text>
      <Text style={styles.stepSubtitle}>Avez-vous des allergies connues ?</Text>

      <View style={styles.chipsContainer}>
        {COMMON_ALLERGIES.map(allergy => (
          <TouchableOpacity
            key={allergy.id}
            style={[styles.chip, profile.allergies.includes(allergy.id) && styles.chipSelected]}
            onPress={() => toggleArrayField('allergies', allergy.id)}
          >
            <Text style={styles.chipEmoji}>{allergy.emoji}</Text>
            <Text style={[styles.chipLabel, profile.allergies.includes(allergy.id) && styles.chipLabelSelected]}>
              {allergy.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  )

  const renderCurrentStep = () => {
    switch (step) {
      case 1: return renderStep1()
      case 2: return renderStep2()
      case 3: return renderStep3()
      case 4: return renderStep4()
      case 5: return renderStep5()
      default: return null
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      {renderProgressBar()}
      
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {renderCurrentStep()}
      </ScrollView>

      {/* Navigation */}
      <View style={styles.footer}>
        <View style={styles.footerButtons}>
          {step > 1 && (
            <TouchableOpacity style={styles.backButton} onPress={handleBack}>
              <Text style={styles.backButtonText}>Retour</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity
            style={[
              styles.nextButton, 
              !canProceed() && styles.nextButtonDisabled,
              step === 1 && styles.nextButtonFull
            ]}
            onPress={handleNext}
            disabled={!canProceed() || loading}
          >
            {loading ? (
              <ActivityIndicator color={theme.colors.white} />
            ) : (
              <Text style={styles.nextButtonText}>
                {step === TOTAL_STEPS ? 'Terminer' : 'Continuer'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.primary[100],
  },
  progressContainer: {
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
  },
  progressBar: {
    height: 6,
    backgroundColor: theme.colors.primary[200],
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.primary[600],
    borderRadius: 3,
  },
  progressText: {
    marginTop: theme.spacing.sm,
    fontSize: 12,
    color: theme.colors.gray[500],
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing.xl,
    paddingBottom: 120,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: theme.colors.primary[800],
    marginBottom: theme.spacing.sm,
  },
  stepSubtitle: {
    fontSize: 14,
    color: theme.colors.gray[600],
    marginBottom: theme.spacing.xl,
    lineHeight: 20,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.gray[700],
    marginBottom: theme.spacing.sm,
    marginTop: theme.spacing.md,
  },
  input: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    fontSize: 16,
    color: theme.colors.gray[800],
    borderWidth: 2,
    borderColor: theme.colors.primary[200],
  },
  rowInputs: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  halfInput: {
    flex: 1,
  },
  optionsRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  optionButton: {
    flex: 1,
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.colors.primary[200],
  },
  optionButtonSelected: {
    borderColor: theme.colors.primary[600],
    backgroundColor: theme.colors.primary[100],
  },
  optionEmoji: {
    fontSize: 28,
    marginBottom: theme.spacing.sm,
  },
  optionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.gray[700],
  },
  optionLabelSelected: {
    color: theme.colors.primary[800],
  },
  cardList: {
    gap: theme.spacing.md,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    borderWidth: 2,
    borderColor: theme.colors.primary[200],
  },
  cardSelected: {
    borderColor: theme.colors.primary[600],
    backgroundColor: theme.colors.primary[100],
  },
  cardEmoji: {
    fontSize: 32,
    marginRight: theme.spacing.md,
  },
  cardInfo: {
    flex: 1,
  },
  cardLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.gray[800],
  },
  cardLabelSelected: {
    color: theme.colors.primary[800],
  },
  cardDescription: {
    fontSize: 12,
    color: theme.colors.gray[500],
    marginTop: 2,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: theme.colors.primary[300],
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioSelected: {
    borderColor: theme.colors.primary[600],
  },
  radioDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: theme.colors.primary[600],
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.full,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    borderWidth: 2,
    borderColor: theme.colors.primary[200],
  },
  chipSelected: {
    borderColor: theme.colors.primary[600],
    backgroundColor: theme.colors.primary[200],
  },
  chipEmoji: {
    fontSize: 18,
    marginRight: theme.spacing.sm,
  },
  chipLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.gray[700],
  },
  chipLabelSelected: {
    color: theme.colors.primary[800],
    fontWeight: '600',
  },
  selectedCount: {
    marginTop: theme.spacing.xl,
    textAlign: 'center',
    fontSize: 14,
    color: theme.colors.gray[500],
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
  footerButtons: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  backButton: {
    flex: 1,
    backgroundColor: theme.colors.primary[200],
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    alignItems: 'center',
  },
  backButtonText: {
    color: theme.colors.primary[800],
    fontSize: 16,
    fontWeight: '600',
  },
  nextButton: {
    flex: 2,
    backgroundColor: theme.colors.primary[800],
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    alignItems: 'center',
  },
  nextButtonFull: {
    flex: 1,
  },
  nextButtonDisabled: {
    opacity: 0.5,
  },
  nextButtonText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
})

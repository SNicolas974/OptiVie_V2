import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
  Modal
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { theme } from '../theme'
import { useAuth } from '../context/AuthContext'

// Options disponibles
const GENDERS = [
  { id: 'homme', label: 'Homme', emoji: '👨' },
  { id: 'femme', label: 'Femme', emoji: '👩' },
  { id: 'autre', label: 'Autre', emoji: '🧑' },
]

const ACTIVITY_LEVELS = [
  { id: 'sedentaire', label: 'Sedentaire', emoji: '🛋️' },
  { id: 'leger', label: 'Legerement actif', emoji: '🚶' },
  { id: 'modere', label: 'Moderement actif', emoji: '🏃' },
  { id: 'actif', label: 'Tres actif', emoji: '💪' },
  { id: 'athlete', label: 'Athlete', emoji: '🏆' },
]

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

const DIETARY_RESTRICTIONS = [
  { id: 'vegetarien', label: 'Vegetarien', emoji: '🥬' },
  { id: 'vegan', label: 'Vegan', emoji: '🌱' },
  { id: 'sans_gluten', label: 'Sans gluten', emoji: '🌾' },
  { id: 'sans_lactose', label: 'Sans lactose', emoji: '🥛' },
  { id: 'halal', label: 'Halal', emoji: '🍖' },
  { id: 'casher', label: 'Casher', emoji: '✡️' },
]

const COMMON_ALLERGIES = [
  { id: 'arachides', label: 'Arachides', emoji: '🥜' },
  { id: 'fruits_a_coque', label: 'Fruits a coque', emoji: '🌰' },
  { id: 'crustaces', label: 'Crustaces', emoji: '🦐' },
  { id: 'oeufs', label: 'Oeufs', emoji: '🥚' },
  { id: 'poisson', label: 'Poisson', emoji: '🐟' },
  { id: 'soja', label: 'Soja', emoji: '🫘' },
  { id: 'sesame', label: 'Sesame', emoji: '🌿' },
]

// Composant Section
const Section = ({ title, children, onEdit }) => (
  <View style={styles.section}>
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {onEdit && (
        <TouchableOpacity onPress={onEdit}>
          <Text style={styles.editButton}>Modifier</Text>
        </TouchableOpacity>
      )}
    </View>
    {children}
  </View>
)

// Composant pour afficher les chips sélectionnés
const ChipDisplay = ({ items, selectedIds, emptyText }) => {
  const selected = items.filter(item => selectedIds?.includes(item.id))
  
  if (selected.length === 0) {
    return <Text style={styles.emptyText}>{emptyText}</Text>
  }
  
  return (
    <View style={styles.chipsDisplay}>
      {selected.map(item => (
        <View key={item.id} style={styles.chipDisplay}>
          <Text style={styles.chipEmoji}>{item.emoji}</Text>
          <Text style={styles.chipLabel}>{item.label}</Text>
        </View>
      ))}
    </View>
  )
}

// Modal d'édition
const EditModal = ({ visible, onClose, title, children }) => (
  <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
    <SafeAreaView style={styles.modalContainer}>
      <View style={styles.modalHeader}>
        <Text style={styles.modalTitle}>{title}</Text>
        <TouchableOpacity onPress={onClose} style={styles.modalCloseButton}>
          <Text style={styles.modalCloseText}>Fermer</Text>
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.modalContent}>
        {children}
      </ScrollView>
    </SafeAreaView>
  </Modal>
)

export default function AccountScreen() {
  const { user, profile, goals, logout, updateProfile, updateGoals, fetchUserData } = useAuth()
  const [loading, setLoading] = useState(false)
  const [editModal, setEditModal] = useState(null) // 'profile', 'goals', 'restrictions', 'allergies'
  
  // États d'édition temporaires
  const [editProfile, setEditProfile] = useState({})
  const [editGoals, setEditGoals] = useState([])
  const [editRestrictions, setEditRestrictions] = useState([])
  const [editAllergies, setEditAllergies] = useState([])

  useEffect(() => {
    fetchUserData()
  }, [])

  // Initialiser les états d'édition quand on ouvre un modal
  const openEditModal = (type) => {
    switch (type) {
      case 'profile':
        setEditProfile({
          age: profile?.age?.toString() || '',
          gender: profile?.gender || '',
          weight: profile?.weight?.toString() || '',
          height: profile?.height?.toString() || '',
          activity_level: profile?.activity_level || ''
        })
        break
      case 'goals':
        setEditGoals([...goals])
        break
      case 'restrictions':
        setEditRestrictions(profile?.dietary_restrictions || [])
        break
      case 'allergies':
        setEditAllergies(profile?.allergies || [])
        break
    }
    setEditModal(type)
  }

  const handleSaveProfile = async () => {
    setLoading(true)
    try {
      const result = await updateProfile({
        age: editProfile.age ? parseInt(editProfile.age) : null,
        gender: editProfile.gender || null,
        weight: editProfile.weight ? parseFloat(editProfile.weight) : null,
        height: editProfile.height ? parseFloat(editProfile.height) : null,
        activity_level: editProfile.activity_level || null
      })
      if (result.success) {
        setEditModal(null)
        Alert.alert('Succes', 'Profil mis a jour')
      } else {
        Alert.alert('Erreur', result.error)
      }
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de sauvegarder')
    }
    setLoading(false)
  }

  const handleSaveGoals = async () => {
    setLoading(true)
    try {
      const result = await updateGoals(editGoals)
      if (result.success) {
        setEditModal(null)
        Alert.alert('Succes', 'Objectifs mis a jour')
      } else {
        Alert.alert('Erreur', result.error)
      }
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de sauvegarder')
    }
    setLoading(false)
  }

  const handleSaveRestrictions = async () => {
    setLoading(true)
    try {
      const result = await updateProfile({
        dietary_restrictions: editRestrictions
      })
      if (result.success) {
        setEditModal(null)
        Alert.alert('Succes', 'Restrictions mises a jour')
      } else {
        Alert.alert('Erreur', result.error)
      }
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de sauvegarder')
    }
    setLoading(false)
  }

  const handleSaveAllergies = async () => {
    setLoading(true)
    try {
      const result = await updateProfile({
        allergies: editAllergies
      })
      if (result.success) {
        setEditModal(null)
        Alert.alert('Succes', 'Allergies mises a jour')
      } else {
        Alert.alert('Erreur', result.error)
      }
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de sauvegarder')
    }
    setLoading(false)
  }

  const toggleGoal = (goalId) => {
    setEditGoals(prev => {
      if (prev.includes(goalId)) return prev.filter(id => id !== goalId)
      return [...prev, goalId]
    })
  }

  const toggleRestriction = (id) => {
    setEditRestrictions(prev => {
      if (prev.includes(id)) return prev.filter(i => i !== id)
      return [...prev, id]
    })
  }

  const toggleAllergy = (id) => {
    setEditAllergies(prev => {
      if (prev.includes(id)) return prev.filter(i => i !== id)
      return [...prev, id]
    })
  }

  const handleLogout = () => {
    Alert.alert(
      'Deconnexion',
      'Voulez-vous vraiment vous deconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Deconnecter', style: 'destructive', onPress: logout }
      ]
    )
  }

  const getActivityLabel = (id) => {
    const activity = ACTIVITY_LEVELS.find(a => a.id === id)
    return activity ? `${activity.emoji} ${activity.label}` : '-'
  }

  const getGenderLabel = (id) => {
    const gender = GENDERS.find(g => g.id === id)
    return gender ? `${gender.emoji} ${gender.label}` : '-'
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Header du compte */}
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.name?.charAt(0)?.toUpperCase() || '?'}
            </Text>
          </View>
          <Text style={styles.userName}>{user?.name || 'Utilisateur'}</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
        </View>

        {/* Informations personnelles */}
        <Section title="Informations personnelles" onEdit={() => openEditModal('profile')}>
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Age</Text>
              <Text style={styles.infoValue}>{profile?.age ? `${profile.age} ans` : '-'}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Genre</Text>
              <Text style={styles.infoValue}>{getGenderLabel(profile?.gender)}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Poids</Text>
              <Text style={styles.infoValue}>{profile?.weight ? `${profile.weight} kg` : '-'}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Taille</Text>
              <Text style={styles.infoValue}>{profile?.height ? `${profile.height} cm` : '-'}</Text>
            </View>
          </View>
          <View style={styles.infoFullWidth}>
            <Text style={styles.infoLabel}>Niveau d'activite</Text>
            <Text style={styles.infoValue}>{getActivityLabel(profile?.activity_level)}</Text>
          </View>
        </Section>

        {/* Objectifs de santé */}
        <Section title="Mes objectifs sante" onEdit={() => openEditModal('goals')}>
          <ChipDisplay 
            items={HEALTH_GOALS} 
            selectedIds={goals} 
            emptyText="Aucun objectif selectionne"
          />
        </Section>

        {/* Restrictions alimentaires */}
        <Section title="Restrictions alimentaires" onEdit={() => openEditModal('restrictions')}>
          <ChipDisplay 
            items={DIETARY_RESTRICTIONS} 
            selectedIds={profile?.dietary_restrictions} 
            emptyText="Aucune restriction"
          />
        </Section>

        {/* Allergies */}
        <Section title="Allergies" onEdit={() => openEditModal('allergies')}>
          <ChipDisplay 
            items={COMMON_ALLERGIES} 
            selectedIds={profile?.allergies} 
            emptyText="Aucune allergie"
          />
        </Section>

        {/* Bouton de déconnexion */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Se deconnecter</Text>
        </TouchableOpacity>

        <Text style={styles.version}>OptiVie v1.0.0</Text>
      </ScrollView>

      {/* Modal édition profil */}
      <EditModal 
        visible={editModal === 'profile'} 
        onClose={() => setEditModal(null)}
        title="Modifier mon profil"
      >
        <Text style={styles.fieldLabel}>Genre</Text>
        <View style={styles.optionsRow}>
          {GENDERS.map(g => (
            <TouchableOpacity
              key={g.id}
              style={[styles.optionButton, editProfile.gender === g.id && styles.optionButtonSelected]}
              onPress={() => setEditProfile(p => ({ ...p, gender: g.id }))}
            >
              <Text style={styles.optionEmoji}>{g.emoji}</Text>
              <Text style={[styles.optionLabel, editProfile.gender === g.id && styles.optionLabelSelected]}>
                {g.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.fieldLabel}>Age</Text>
        <TextInput
          style={styles.input}
          value={editProfile.age}
          onChangeText={(v) => setEditProfile(p => ({ ...p, age: v.replace(/[^0-9]/g, '') }))}
          keyboardType="numeric"
          placeholder="Votre age"
          placeholderTextColor={theme.colors.gray[400]}
        />

        <View style={styles.rowInputs}>
          <View style={styles.halfInput}>
            <Text style={styles.fieldLabel}>Poids (kg)</Text>
            <TextInput
              style={styles.input}
              value={editProfile.weight}
              onChangeText={(v) => setEditProfile(p => ({ ...p, weight: v.replace(/[^0-9.]/g, '') }))}
              keyboardType="decimal-pad"
              placeholder="70"
              placeholderTextColor={theme.colors.gray[400]}
            />
          </View>
          <View style={styles.halfInput}>
            <Text style={styles.fieldLabel}>Taille (cm)</Text>
            <TextInput
              style={styles.input}
              value={editProfile.height}
              onChangeText={(v) => setEditProfile(p => ({ ...p, height: v.replace(/[^0-9]/g, '') }))}
              keyboardType="numeric"
              placeholder="175"
              placeholderTextColor={theme.colors.gray[400]}
            />
          </View>
        </View>

        <Text style={styles.fieldLabel}>Niveau d'activite</Text>
        <View style={styles.activityList}>
          {ACTIVITY_LEVELS.map(level => (
            <TouchableOpacity
              key={level.id}
              style={[styles.activityItem, editProfile.activity_level === level.id && styles.activityItemSelected]}
              onPress={() => setEditProfile(p => ({ ...p, activity_level: level.id }))}
            >
              <Text style={styles.activityEmoji}>{level.emoji}</Text>
              <Text style={[styles.activityLabel, editProfile.activity_level === level.id && styles.activityLabelSelected]}>
                {level.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity 
          style={[styles.saveButton, loading && styles.saveButtonDisabled]} 
          onPress={handleSaveProfile}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={theme.colors.white} />
          ) : (
            <Text style={styles.saveButtonText}>Enregistrer</Text>
          )}
        </TouchableOpacity>
      </EditModal>

      {/* Modal édition objectifs */}
      <EditModal 
        visible={editModal === 'goals'} 
        onClose={() => setEditModal(null)}
        title="Mes objectifs sante"
      >
        <Text style={styles.modalSubtitle}>
          Selectionnez les objectifs qui vous correspondent pour personnaliser vos conseils nutritionnels.
        </Text>
        <View style={styles.chipsContainer}>
          {HEALTH_GOALS.map(goal => (
            <TouchableOpacity
              key={goal.id}
              style={[styles.chip, editGoals.includes(goal.id) && styles.chipSelected]}
              onPress={() => toggleGoal(goal.id)}
            >
              <Text style={styles.chipEmojiLarge}>{goal.emoji}</Text>
              <Text style={[styles.chipLabelLarge, editGoals.includes(goal.id) && styles.chipLabelSelected]}>
                {goal.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity 
          style={[styles.saveButton, loading && styles.saveButtonDisabled]} 
          onPress={handleSaveGoals}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={theme.colors.white} />
          ) : (
            <Text style={styles.saveButtonText}>Enregistrer ({editGoals.length} objectif{editGoals.length > 1 ? 's' : ''})</Text>
          )}
        </TouchableOpacity>
      </EditModal>

      {/* Modal édition restrictions */}
      <EditModal 
        visible={editModal === 'restrictions'} 
        onClose={() => setEditModal(null)}
        title="Restrictions alimentaires"
      >
        <Text style={styles.modalSubtitle}>
          Indiquez vos restrictions pour que l'IA en tienne compte dans ses analyses.
        </Text>
        <View style={styles.chipsContainer}>
          {DIETARY_RESTRICTIONS.map(item => (
            <TouchableOpacity
              key={item.id}
              style={[styles.chip, editRestrictions.includes(item.id) && styles.chipSelected]}
              onPress={() => toggleRestriction(item.id)}
            >
              <Text style={styles.chipEmojiLarge}>{item.emoji}</Text>
              <Text style={[styles.chipLabelLarge, editRestrictions.includes(item.id) && styles.chipLabelSelected]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity 
          style={[styles.saveButton, loading && styles.saveButtonDisabled]} 
          onPress={handleSaveRestrictions}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={theme.colors.white} />
          ) : (
            <Text style={styles.saveButtonText}>Enregistrer</Text>
          )}
        </TouchableOpacity>
      </EditModal>

      {/* Modal édition allergies */}
      <EditModal 
        visible={editModal === 'allergies'} 
        onClose={() => setEditModal(null)}
        title="Allergies alimentaires"
      >
        <Text style={styles.modalSubtitle}>
          Signalez vos allergies pour recevoir des alertes sur les ingredients a risque.
        </Text>
        <View style={styles.chipsContainer}>
          {COMMON_ALLERGIES.map(item => (
            <TouchableOpacity
              key={item.id}
              style={[styles.chip, editAllergies.includes(item.id) && styles.chipSelected]}
              onPress={() => toggleAllergy(item.id)}
            >
              <Text style={styles.chipEmojiLarge}>{item.emoji}</Text>
              <Text style={[styles.chipLabelLarge, editAllergies.includes(item.id) && styles.chipLabelSelected]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity 
          style={[styles.saveButton, loading && styles.saveButtonDisabled]} 
          onPress={handleSaveAllergies}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={theme.colors.white} />
          ) : (
            <Text style={styles.saveButtonText}>Enregistrer</Text>
          )}
        </TouchableOpacity>
      </EditModal>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.primary[100],
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
  },
  header: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
    marginBottom: theme.spacing.lg,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.primary[600],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: theme.colors.white,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.gray[800],
  },
  userEmail: {
    fontSize: 14,
    color: theme.colors.gray[500],
    marginTop: theme.spacing.xs,
  },
  section: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.gray[800],
  },
  editButton: {
    fontSize: 14,
    color: theme.colors.primary[600],
    fontWeight: '500',
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  infoItem: {
    width: '50%',
    marginBottom: theme.spacing.md,
  },
  infoFullWidth: {
    marginTop: theme.spacing.sm,
  },
  infoLabel: {
    fontSize: 12,
    color: theme.colors.gray[500],
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    color: theme.colors.gray[800],
    fontWeight: '500',
  },
  chipsDisplay: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  chipDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary[100],
    borderRadius: theme.borderRadius.full,
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
  },
  chipEmoji: {
    fontSize: 16,
    marginRight: theme.spacing.xs,
  },
  chipLabel: {
    fontSize: 14,
    color: theme.colors.primary[800],
  },
  emptyText: {
    fontSize: 14,
    color: theme.colors.gray[400],
    fontStyle: 'italic',
  },
  logoutButton: {
    backgroundColor: theme.colors.red[50],
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    alignItems: 'center',
    marginTop: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.red[200],
  },
  logoutButtonText: {
    color: theme.colors.red[600],
    fontSize: 16,
    fontWeight: '600',
  },
  version: {
    textAlign: 'center',
    color: theme.colors.gray[400],
    fontSize: 12,
    marginTop: theme.spacing.xl,
  },
  
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: theme.colors.primary[100],
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.primary[200],
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.gray[800],
  },
  modalCloseButton: {
    padding: theme.spacing.sm,
  },
  modalCloseText: {
    color: theme.colors.primary[600],
    fontSize: 16,
  },
  modalContent: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  modalSubtitle: {
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
    marginTop: theme.spacing.lg,
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
    padding: theme.spacing.md,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.colors.primary[200],
  },
  optionButtonSelected: {
    borderColor: theme.colors.primary[600],
    backgroundColor: theme.colors.primary[100],
  },
  optionEmoji: {
    fontSize: 24,
    marginBottom: theme.spacing.xs,
  },
  optionLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: theme.colors.gray[700],
  },
  optionLabelSelected: {
    color: theme.colors.primary[800],
  },
  activityList: {
    gap: theme.spacing.sm,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    borderWidth: 2,
    borderColor: theme.colors.primary[200],
  },
  activityItemSelected: {
    borderColor: theme.colors.primary[600],
    backgroundColor: theme.colors.primary[100],
  },
  activityEmoji: {
    fontSize: 24,
    marginRight: theme.spacing.md,
  },
  activityLabel: {
    fontSize: 16,
    color: theme.colors.gray[700],
  },
  activityLabelSelected: {
    color: theme.colors.primary[800],
    fontWeight: '600',
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
  chipEmojiLarge: {
    fontSize: 20,
    marginRight: theme.spacing.sm,
  },
  chipLabelLarge: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.gray[700],
  },
  chipLabelSelected: {
    color: theme.colors.primary[800],
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: theme.colors.primary[800],
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    alignItems: 'center',
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.xxl,
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

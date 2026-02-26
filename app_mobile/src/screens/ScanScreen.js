import React, { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import { manipulateAsync as manipulateImageAsync, SaveFormat } from 'expo-image-manipulator'
import { useAnalysis } from '../context/AnalysisContext'
import { useAuth } from '../context/AuthContext'
import { API_BASE_URL } from '../config'
import ScoreGauge from '../components/ScoreGauge'
import IngredientCard from '../components/IngredientCard'
import { CameraIcon, AnalyzeIcon, PlusIcon, CloseIcon, AlertIcon } from '../components/Icons'
import { theme } from '../theme'

export default function ScanScreen() {
  const { analysisResult, setAnalysisResult } = useAnalysis()
  const { token } = useAuth()
  const [platInput, setPlatInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [recalculating, setRecalculating] = useState(false)
  const [error, setError] = useState(null)
  const [imageUri, setImageUri] = useState(null)
  const [imageBase64, setImageBase64] = useState(null)
  const [newIngredient, setNewIngredient] = useState('')

  const analyzePlat = async (platName, image = null) => {
    setLoading(true)
    setError(null)
    setAnalysisResult(null)

    try {
      const body = image
        ? { image: image.base64, mimeType: image.mimeType }
        : { plat: platName }

      const headers = { 'Content-Type': 'application/json' }
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const response = await fetch(`${API_BASE_URL}/api/analyze`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Erreur lors de l'analyse")
      }

      const data = await response.json()
      setAnalysisResult(data)
    } catch (err) {
      setError(err.message || 'Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  const recalculateScore = async (ingredients) => {
    setRecalculating(true)
    setError(null)

    try {
      const ingredientNames = ingredients.map((i) => i.nom).join(', ')
      const headers = { 'Content-Type': 'application/json' }
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const response = await fetch(`${API_BASE_URL}/api/recalculate`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          plat: analysisResult.plat,
          ingredients: ingredientNames,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Erreur lors du recalcul')
      }

      const data = await response.json()
      setAnalysisResult(data)
    } catch (err) {
      setError(err.message || 'Une erreur est survenue')
    } finally {
      setRecalculating(false)
    }
  }

  const handleRemoveIngredient = (indexToRemove) => {
    if (!analysisResult) return

    const updatedIngredients = analysisResult.ingredients.filter((_, index) => index !== indexToRemove)

    if (updatedIngredients.length === 0) {
      setError('Vous devez garder au moins un ingrédient')
      return
    }

    recalculateScore(updatedIngredients)
  }

  const handleAddIngredient = () => {
    if (!newIngredient.trim() || !analysisResult) return

    const ingredientNames = [
      ...analysisResult.ingredients.map((i) => i.nom),
      newIngredient.trim(),
    ]

    setNewIngredient('')
    setRecalculating(true)
    setError(null)

    const headers = { 'Content-Type': 'application/json' }
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    fetch(`${API_BASE_URL}/api/recalculate`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        plat: analysisResult.plat,
        ingredients: ingredientNames.join(', '),
      }),
    })
      .then((response) => {
        if (!response.ok) {
          return response.json().then((data) => {
            throw new Error(data.message || 'Erreur lors du recalcul')
          })
        }
        return response.json()
      })
      .then((data) => setAnalysisResult(data))
      .catch((err) => setError(err.message || 'Une erreur est survenue'))
      .finally(() => setRecalculating(false))
  }

  const handleSubmit = () => {
    if (imageBase64) {
      analyzePlat(null, imageBase64)
    } else if (platInput.trim()) {
      analyzePlat(platInput.trim())
    }
  }

  const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

  const pickImage = async (useCamera = false) => {
    const { status } = useCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync()

    if (status !== 'granted') {
      setError('Permission requise pour accéder aux images.')
      return
    }

    const result = useCamera
      ? await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          base64: true,
          quality: 0.8,
        })
      : await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          base64: true,
          quality: 0.8,
        })

    if (result.canceled) return

    const asset = result.assets[0]
    setError(null)

    try {
      let base64
      let mimeType = 'image/jpeg'

      // Convertir toute image (HEIC iPhone, etc.) en JPEG pour l'API
      const manipulated = await manipulateImageAsync(
        asset.uri,
        [],
        { format: SaveFormat.JPEG, compress: 0.8, base64: true }
      )

      if (manipulated.base64) {
        base64 = manipulated.base64
      } else if (asset.base64 && ALLOWED_MIME.includes(asset.mimeType || '')) {
        base64 = asset.base64
        mimeType = asset.mimeType || 'image/jpeg'
      } else {
        setError("Impossible de préparer l'image pour l'analyse.")
        return
      }

      const sizeBytes = (base64.length * 3) / 4
      if (sizeBytes > 5 * 1024 * 1024) {
        setError('Image trop volumineuse. Maximum 5 Mo.')
        return
      }

      setImageUri(asset.uri)
      setImageBase64({ base64, mimeType })
      setPlatInput('')
    } catch (err) {
      setError("Format d'image non supporté ou erreur de conversion. Utilisez JPG, PNG, WebP ou GIF.")
    }
  }

  const showImageOptions = () => {
    Alert.alert('Choisir une image', '', [
      { text: 'Appareil photo', onPress: () => pickImage(true) },
      { text: 'Galerie', onPress: () => pickImage(false) },
      { text: 'Annuler', style: 'cancel' },
    ])
  }

  const clearImage = () => {
    setImageUri(null)
    setImageBase64(null)
  }

  const canSubmit = (platInput.trim() || imageBase64) && !loading

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Bloc saisie */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Analysez votre plat</Text>

          {imageUri ? (
            <View style={styles.imageWrap}>
              <Image source={{ uri: imageUri }} style={styles.preview} resizeMode="cover" />
              <TouchableOpacity style={styles.removeImage} onPress={clearImage} activeOpacity={0.8}>
                <CloseIcon color="#fff" size={18} />
              </TouchableOpacity>
              <View style={styles.imageLabel}>
                <Text style={styles.imageLabelText}>Image prête pour l'analyse</Text>
              </View>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.uploadZone}
              onPress={showImageOptions}
              disabled={loading}
              activeOpacity={0.7}
            >
              <CameraIcon color={theme.colors.primary[500]} size={40} />
              <Text style={styles.uploadTitle}>Appuyez pour ajouter une photo</Text>
              <Text style={styles.uploadHint}>JPG, PNG, WebP ou GIF (max 5 Mo)</Text>
            </TouchableOpacity>
          )}

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>ou décrivez votre plat</Text>
            <View style={styles.dividerLine} />
          </View>

          <TextInput
            style={styles.input}
            value={platInput}
            onChangeText={(text) => {
              setPlatInput(text)
              if (text) clearImage()
            }}
            placeholder="Ex: Curry poulet avec riz..."
            placeholderTextColor={theme.colors.gray[400]}
            editable={!loading && !imageBase64}
          />

          <TouchableOpacity
            style={[styles.btnPrimary, !canSubmit && styles.btnDisabled]}
            onPress={handleSubmit}
            disabled={!canSubmit}
            activeOpacity={0.8}
          >
            {loading ? (
              <>
                <ActivityIndicator size="small" color="#fff" />
                <Text style={styles.btnText}>Analyse en cours...</Text>
              </>
            ) : (
              <>
                <AnalyzeIcon color="#fff" size={20} />
                <Text style={styles.btnText}>
                  {imageBase64 ? "Analyser la photo" : 'Analyser'}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {error ? (
          <View style={styles.errorBox}>
            <AlertIcon color={theme.colors.red[600]} size={20} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {/* Résultats */}
        {analysisResult && !loading ? (
          <View style={styles.results}>
            <View style={styles.card}>
              <Text style={styles.scoreTitle}>Score pour "{analysisResult.plat}"</Text>
              <ScoreGauge score={analysisResult.score_global} />
              {recalculating ? (
                <View style={styles.recalcRow}>
                  <ActivityIndicator size="small" color={theme.colors.primary[600]} />
                  <Text style={styles.recalcText}>Recalcul en cours...</Text>
                </View>
              ) : null}
              {analysisResult.conseil_general ? (
                <View style={styles.adviceBox}>
                  <Text style={styles.adviceText}>{analysisResult.conseil_general}</Text>
                </View>
              ) : null}
            </View>

            {analysisResult.ingredients?.length > 0 ? (
              <View style={styles.card}>
                <Text style={styles.ingredientsTitle}>
                  Ingrédients ({analysisResult.ingredients.length})
                </Text>

                <View style={styles.addRow}>
                  <TextInput
                    style={styles.addInput}
                    value={newIngredient}
                    onChangeText={setNewIngredient}
                    placeholder="Ajouter un ingrédient..."
                    placeholderTextColor={theme.colors.gray[400]}
                    editable={!recalculating}
                  />
                  <TouchableOpacity
                    style={[
                      styles.addBtn,
                      (!newIngredient.trim() || recalculating) && styles.addBtnDisabled,
                    ]}
                    onPress={handleAddIngredient}
                    disabled={!newIngredient.trim() || recalculating}
                    activeOpacity={0.8}
                  >
                    <PlusIcon color="#fff" size={16} />
                    <Text style={styles.addBtnText}>Ajouter</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.ingredientsWrap}>
                  {analysisResult.ingredients.map((ingredient, index) => (
                    <View key={index} style={styles.ingredientRow}>
                      <IngredientCard ingredient={ingredient} />
                      <TouchableOpacity
                        style={styles.removeIngredient}
                        onPress={() => handleRemoveIngredient(index)}
                        disabled={recalculating}
                        activeOpacity={0.8}
                      >
                        <CloseIcon color="#fff" size={12} />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>

                <Text style={styles.hint}>
                  Appuyez sur ✕ pour supprimer un ingrédient, ou ajoutez-en un ci-dessus.
                </Text>
              </View>
            ) : null}
          </View>
        ) : null}

        {/* Empty state */}
        {!analysisResult && !loading && !error ? (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>📸</Text>
            <Text style={styles.emptyText}>
              Prenez en photo votre plat ou décrivez-le pour découvrir son score
              anti-inflammatoire
            </Text>
          </View>
        ) : null}
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.primary[100],
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing.lg,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl,
    marginBottom: theme.spacing.xl,
    borderWidth: 1,
    borderColor: theme.colors.primary[100],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.gray[800],
    marginBottom: theme.spacing.lg,
  },
  imageWrap: {
    position: 'relative',
    marginBottom: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
  },
  preview: {
    width: '100%',
    height: 192,
    backgroundColor: theme.colors.primary[50],
  },
  removeImage: {
    position: 'absolute',
    top: theme.spacing.sm,
    right: theme.spacing.sm,
    backgroundColor: theme.colors.red[500],
    padding: 6,
    borderRadius: theme.borderRadius.full,
  },
  imageLabel: {
    position: 'absolute',
    bottom: theme.spacing.sm,
    left: theme.spacing.sm,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
  },
  imageLabelText: {
    color: '#fff',
    fontSize: 12,
  },
  uploadZone: {
    height: 160,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: theme.colors.primary[300],
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.lg,
  },
  uploadTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.primary[700],
    marginTop: theme.spacing.md,
  },
  uploadHint: {
    fontSize: 12,
    color: theme.colors.gray[500],
    marginTop: 4,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.gray[400],
  },
  dividerText: {
    fontSize: 14,
    color: theme.colors.gray[400],
  },
  input: {
    width: '100%',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: 12,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 2,
    borderColor: theme.colors.primary[200],
    backgroundColor: theme.colors.white,
    fontSize: 16,
    color: theme.colors.gray[800],
    marginBottom: theme.spacing.lg,
  },
  btnPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.primary[800],
    paddingVertical: 14,
    borderRadius: theme.borderRadius.lg,
  },
  btnDisabled: {
    opacity: 0.5,
  },
  btnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.red[50],
    borderWidth: 1,
    borderColor: theme.colors.red[200],
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  errorText: {
    flex: 1,
    color: theme.colors.red[700],
    fontWeight: '500',
  },
  results: {
    marginTop: theme.spacing.sm,
  },
  scoreTitle: {
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.gray[800],
    marginBottom: theme.spacing.lg,
  },
  recalcRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.lg,
  },
  recalcText: {
    fontSize: 14,
    color: theme.colors.primary[600],
  },
  adviceBox: {
    marginTop: theme.spacing.xl,
    backgroundColor: theme.colors.primary[50],
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
  },
  adviceText: {
    textAlign: 'center',
    fontSize: 14,
    color: theme.colors.gray[600],
  },
  ingredientsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.gray[800],
    marginBottom: theme.spacing.lg,
  },
  addRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  addInput: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.primary[200],
    backgroundColor: theme.colors.white,
    color: theme.colors.gray[800],
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: theme.colors.primary[600],
    borderRadius: theme.borderRadius.sm,
  },
  addBtnDisabled: {
    opacity: 0.5,
  },
  addBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  ingredientsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
  },
  ingredientRow: {
    position: 'relative',
    marginRight: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  removeIngredient: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: theme.colors.red[500],
    alignItems: 'center',
    justifyContent: 'center',
  },
  hint: {
    marginTop: theme.spacing.lg,
    fontSize: 12,
    color: theme.colors.gray[400],
  },
  empty: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xxl,
  },
  emptyEmoji: {
    fontSize: 56,
    marginBottom: theme.spacing.lg,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 14,
    color: theme.colors.gray[500],
    lineHeight: 22,
  },
})

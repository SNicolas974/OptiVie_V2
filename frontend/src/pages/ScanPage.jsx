import { useState, useRef } from 'react'
import ScoreGauge from '../components/ScoreGauge'
import IngredientCard from '../components/IngredientCard'

function ScanPage({ analysisResult, setAnalysisResult }) {
  const [platInput, setPlatInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [recalculating, setRecalculating] = useState(false)
  const [error, setError] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [imageBase64, setImageBase64] = useState(null)
  const [newIngredient, setNewIngredient] = useState('')
  const fileInputRef = useRef(null)

  const analyzeePlat = async (platName, image = null) => {
    setLoading(true)
    setError(null)
    setAnalysisResult(null)

    try {
      const body = image 
        ? { image: image.base64, mimeType: image.mimeType }
        : { plat: platName }

      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Erreur lors de l\'analyse')
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
      const ingredientNames = ingredients.map(i => i.nom).join(', ')
      const response = await fetch('/api/recalculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          plat: analysisResult.plat,
          ingredients: ingredientNames 
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
      setError('Vous devez garder au moins un ingredient')
      return
    }

    recalculateScore(updatedIngredients)
  }

  const handleAddIngredient = (e) => {
    e.preventDefault()
    if (!newIngredient.trim() || !analysisResult) return

    const ingredientNames = [
      ...analysisResult.ingredients.map(i => i.nom),
      newIngredient.trim()
    ]

    setNewIngredient('')
    
    // Recalculate with new ingredient
    setRecalculating(true)
    setError(null)

    fetch('/api/recalculate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        plat: analysisResult.plat,
        ingredients: ingredientNames.join(', ')
      }),
    })
      .then(response => {
        if (!response.ok) {
          return response.json().then(data => {
            throw new Error(data.message || 'Erreur lors du recalcul')
          })
        }
        return response.json()
      })
      .then(data => {
        setAnalysisResult(data)
      })
      .catch(err => {
        setError(err.message || 'Une erreur est survenue')
      })
      .finally(() => {
        setRecalculating(false)
      })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (imageBase64) {
      analyzeePlat(null, imageBase64)
    } else if (platInput.trim()) {
      analyzeePlat(platInput.trim())
    }
  }

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!validTypes.includes(file.type)) {
      setError('Format non supporte. Utilisez JPG, PNG, WebP ou GIF.')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image trop volumineuse. Maximum 5 Mo.')
      return
    }

    setError(null)

    // Create preview
    const previewUrl = URL.createObjectURL(file)
    setImagePreview(previewUrl)

    // Convert to base64
    const reader = new FileReader()
    reader.onloadend = () => {
      const base64 = reader.result.split(',')[1]
      setImageBase64({
        base64,
        mimeType: file.type
      })
      setPlatInput('')
    }
    reader.readAsDataURL(file)
  }

  const clearImage = () => {
    setImagePreview(null)
    setImageBase64(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="page-container p-4 space-y-6">
      {/* Input Section */}
      <section className="bg-white rounded-2xl p-5 shadow-sm border border-primary-100">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Analysez votre plat
        </h2>
        
        {/* Image Upload Area */}
        <div className="mb-4">
          {imagePreview ? (
            <div className="relative">
              <img 
                src={imagePreview} 
                alt="Apercu du plat" 
                className="w-full h-48 object-cover rounded-xl"
              />
              <button
                type="button"
                onClick={clearImage}
                className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 transition-colors"
                aria-label="Supprimer l'image"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded-lg">
                Image prete pour l'analyse
              </div>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-primary-300 rounded-xl cursor-pointer bg-primary-50 hover:bg-primary-100 transition-colors">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <CameraIcon className="w-10 h-10 text-primary-500 mb-3" />
                <p className="mb-1 text-sm text-gray-600">
                  <span className="font-semibold text-primary-700">Cliquez pour uploader</span>
                </p>
                <p className="text-xs text-gray-500">JPG, PNG, WebP ou GIF (max 5 Mo)</p>
              </div>
              <input 
                ref={fileInputRef}
                type="file" 
                className="hidden" 
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleImageUpload}
                disabled={loading}
              />
            </label>
          )}
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 my-4">
          <div className="flex-1 h-px bg-gray-200"></div>
          <span className="text-sm text-gray-400">ou decrivez votre plat</span>
          <div className="flex-1 h-px bg-gray-200"></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              value={platInput}
              onChange={(e) => {
                setPlatInput(e.target.value)
                if (e.target.value) {
                  clearImage()
                }
              }}
              placeholder="Ex: Cari poulet avec riz..."
              className="input-primary"
              disabled={loading || !!imageBase64}
            />
          </div>
          <button
            type="submit"
            disabled={loading || (!platInput.trim() && !imageBase64)}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <LoadingSpinner />
                Analyse en cours...
              </>
            ) : (
              <>
                <AnalyzeIcon />
                {imageBase64 ? 'Analyser la photo' : 'Analyser'}
              </>
            )}
          </button>
        </form>
      </section>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 animate-fade-in">
          <div className="flex items-center gap-2 text-red-700">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-medium">{error}</span>
          </div>
        </div>
      )}

      {/* Results Section */}
      {analysisResult && !loading && (
        <section className="space-y-6 animate-fade-in">
          {/* Score Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-primary-100">
            <h2 className="text-center text-lg font-semibold text-gray-800 mb-4">
              Score pour "{analysisResult.plat}"
            </h2>
            <div className="flex justify-center">
              <ScoreGauge score={analysisResult.score_global} />
            </div>
            {recalculating && (
              <div className="mt-4 flex items-center justify-center gap-2 text-primary-600">
                <LoadingSpinner />
                <span className="text-sm">Recalcul en cours...</span>
              </div>
            )}
            {analysisResult.conseil_general && (
              <p className="mt-6 text-center text-gray-600 bg-primary-50 rounded-xl p-4">
                {analysisResult.conseil_general}
              </p>
            )}
          </div>

          {/* Ingredients List with Add/Remove */}
          {analysisResult.ingredients && analysisResult.ingredients.length > 0 && (
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-primary-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-800">
                  Ingredients ({analysisResult.ingredients.length})
                </h3>
              </div>

              {/* Add Ingredient Form */}
              <form onSubmit={handleAddIngredient} className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={newIngredient}
                  onChange={(e) => setNewIngredient(e.target.value)}
                  placeholder="Ajouter un ingredient..."
                  className="flex-1 px-3 py-2 text-sm rounded-lg border border-primary-200 focus:border-primary-500 focus:outline-none"
                  disabled={recalculating}
                />
                <button
                  type="submit"
                  disabled={!newIngredient.trim() || recalculating}
                  className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                >
                  <PlusIcon className="w-4 h-4" />
                  Ajouter
                </button>
              </form>

              {/* Ingredients with Remove Button */}
              <div className="flex flex-wrap gap-2">
                {analysisResult.ingredients.map((ingredient, index) => (
                  <div key={index} className="relative group">
                    <IngredientCard ingredient={ingredient} />
                    <button
                      onClick={() => handleRemoveIngredient(index)}
                      disabled={recalculating}
                      className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 disabled:opacity-50"
                      aria-label={`Supprimer ${ingredient.nom}`}
                    >
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>

              <p className="mt-4 text-xs text-gray-400">
                Survolez un ingredient pour le supprimer, ou ajoutez-en un nouveau ci-dessus.
              </p>
            </div>
          )}
        </section>
      )}

      {/* Empty State */}
      {!analysisResult && !loading && !error && (
        <div className="text-center py-8">
          <div className="text-6xl mb-4">📸</div>
          <p className="text-gray-500">
            Prenez en photo votre plat ou decrivez-le
            <br />
            pour decouvrir son score anti-inflammatoire
          </p>
        </div>
      )}
    </div>
  )
}

function LoadingSpinner() {
  return (
    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  )
}

function AnalyzeIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  )
}

function CameraIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
    </svg>
  )
}

function PlusIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    </svg>
  )
}

export default ScanPage

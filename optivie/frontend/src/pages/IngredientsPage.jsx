import { useNavigate } from 'react-router-dom'
import IngredientCard from '../components/IngredientCard'

function IngredientsPage({ analysisResult }) {
  const navigate = useNavigate()

  if (!analysisResult) {
    return (
      <div className="page-container p-4">
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Aucune analyse disponible
          </h2>
          <p className="text-gray-500 mb-6">
            Analysez d'abord un plat pour voir le detail des ingredients
          </p>
          <button
            onClick={() => navigate('/')}
            className="btn-primary"
          >
            Analyser un plat
          </button>
        </div>
      </div>
    )
  }

  const { plat, ingredients } = analysisResult

  return (
    <div className="page-container p-4 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-primary-100">
        <h2 className="text-lg font-semibold text-gray-800">
          Detail des ingredients
        </h2>
        <p className="text-primary-600 mt-1">
          Analyse de "{plat}"
        </p>
      </div>

      {/* Ingredients List */}
      <section>
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
          {ingredients.length} ingredients analyses
        </h3>
        <div className="space-y-3">
          {ingredients.map((ingredient, index) => (
            <div key={index} className="animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
              <IngredientCard ingredient={ingredient} detailed />
            </div>
          ))}
        </div>
      </section>

      {/* Legend */}
      <section className="bg-primary-50 rounded-2xl p-4">
        <h3 className="font-semibold text-gray-800 mb-3">Legende</h3>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-lg">✅</span>
            <span className="text-gray-600">Anti-inflammatoire (score 7-10)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg">⚠️</span>
            <span className="text-gray-600">Neutre (score 4-6)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg">❌</span>
            <span className="text-gray-600">Pro-inflammatoire (score 1-3)</span>
          </div>
        </div>
      </section>
    </div>
  )
}

export default IngredientsPage

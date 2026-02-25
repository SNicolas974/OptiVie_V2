function IngredientCard({ ingredient, detailed = false }) {
  const { nom, score, statut, explication } = ingredient

  // Status config
  const statusConfig = {
    'anti-inflammatoire': {
      icon: '\u2705',
      color: 'bg-green-100 text-green-800 border-green-200',
      scoreColor: 'text-green-600 bg-green-50',
      label: 'Anti-inflammatoire'
    },
    'pro-inflammatoire': {
      icon: '\u274C',
      color: 'bg-red-100 text-red-800 border-red-200',
      scoreColor: 'text-red-600 bg-red-50',
      label: 'Pro-inflammatoire'
    },
    'neutre': {
      icon: '\u26A0\uFE0F',
      color: 'bg-orange-100 text-orange-800 border-orange-200',
      scoreColor: 'text-orange-600 bg-orange-50',
      label: 'Neutre'
    }
  }

  const config = statusConfig[statut] || statusConfig['neutre']

  if (detailed) {
    return (
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-primary-100 card-hover">
        <div className="flex items-start gap-3">
          <span className="text-2xl">{config.icon}</span>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-gray-800">{nom}</h3>
              <div className={`px-2.5 py-1 rounded-lg text-sm font-bold ${config.scoreColor}`}>
                {score}/10
              </div>
            </div>
            <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium border ${config.color}`}>
              {config.label}
            </span>
            {explication && (
              <p className="mt-3 text-sm text-gray-600 leading-relaxed">
                {explication}
              </p>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Compact version for ScanPage
  return (
    <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border ${config.color}`}>
      <span className="text-base">{config.icon}</span>
      <span>{nom}</span>
      <span className="font-bold">({score}/10)</span>
    </div>
  )
}

export default IngredientCard

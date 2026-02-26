import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { useAnalysis } from '../context/AnalysisContext'
import IngredientCard from '../components/IngredientCard'
import { theme } from '../theme'

export default function IngredientsScreen() {
  const navigation = useNavigation()
  const { analysisResult } = useAnalysis()

  if (!analysisResult) {
    return (
      <View style={styles.container}>
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>🔍</Text>
          <Text style={styles.emptyTitle}>Aucune analyse disponible</Text>
          <Text style={styles.emptyText}>
            Analysez d'abord un plat pour voir le détail des ingrédients
          </Text>
          <TouchableOpacity
            style={styles.btnPrimary}
            onPress={() => navigation.navigate('Scan')}
            activeOpacity={0.8}
          >
            <Text style={styles.btnText}>Analyser un plat</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  const { plat, ingredients } = analysisResult

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Détail des ingrédients</Text>
        <Text style={styles.cardSubtitle}>Analyse de "{plat}"</Text>
      </View>

      <Text style={styles.sectionTitle}>{ingredients.length} ingrédients analysés</Text>

      <View style={styles.list}>
        {ingredients.map((ingredient, index) => (
          <IngredientCard key={index} ingredient={ingredient} detailed />
        ))}
      </View>

      <View style={styles.legend}>
        <Text style={styles.legendTitle}>Légende</Text>
        <View style={styles.legendRow}>
          <Text style={styles.legendIcon}>✅</Text>
          <Text style={styles.legendText}>Anti-inflammatoire (score 7-10)</Text>
        </View>
        <View style={styles.legendRow}>
          <Text style={styles.legendIcon}>⚠️</Text>
          <Text style={styles.legendText}>Neutre (score 4-6)</Text>
        </View>
        <View style={styles.legendRow}>
          <Text style={styles.legendIcon}>❌</Text>
          <Text style={styles.legendText}>Pro-inflammatoire (score 1-3)</Text>
        </View>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.primary[100],
  },
  scrollContent: {
    padding: theme.spacing.lg,
    paddingBottom: 100,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.xl,
  },
  emptyEmoji: {
    fontSize: 56,
    marginBottom: theme.spacing.lg,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.gray[800],
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: theme.colors.gray[500],
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
  },
  btnPrimary: {
    backgroundColor: theme.colors.primary[800],
    paddingVertical: 14,
    paddingHorizontal: theme.spacing.xxl,
    borderRadius: theme.borderRadius.lg,
  },
  btnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
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
  },
  cardSubtitle: {
    fontSize: 14,
    color: theme.colors.primary[600],
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.gray[500],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: theme.spacing.md,
  },
  list: {
    marginBottom: theme.spacing.xl,
  },
  legend: {
    backgroundColor: theme.colors.primary[50],
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
  },
  legendTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.gray[800],
    marginBottom: theme.spacing.md,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  legendIcon: {
    fontSize: 18,
  },
  legendText: {
    fontSize: 14,
    color: theme.colors.gray[600],
  },
})

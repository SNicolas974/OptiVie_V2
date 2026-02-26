import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { theme } from '../theme'

const statusConfig = {
  'anti-inflammatoire': {
    icon: '✅',
    color: theme.colors.green,
    label: 'Anti-inflammatoire',
  },
  'pro-inflammatoire': {
    icon: '❌',
    color: theme.colors.red,
    label: 'Pro-inflammatoire',
  },
  neutre: {
    icon: '⚠️',
    color: theme.colors.orange,
    label: 'Neutre',
  },
}

export default function IngredientCard({ ingredient, detailed = false }) {
  const { nom, score, statut, explication } = ingredient
  const config = statusConfig[statut] || statusConfig.neutre

  if (detailed) {
    return (
      <View style={styles.cardDetailed}>
        <View style={styles.rowDetailed}>
          <Text style={styles.iconLarge}>{config.icon}</Text>
          <View style={styles.content}>
            <View style={styles.rowTitle}>
              <Text style={styles.name}>{nom}</Text>
              <View style={[styles.scoreBadge, { backgroundColor: config.color[50] }]}>
                <Text style={[styles.scoreText, { color: config.color[600] }]}>{score}/10</Text>
              </View>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: config.color[100], borderColor: config.color[200] }]}>
              <Text style={[styles.statusText, { color: config.color[800] }]}>{config.label}</Text>
            </View>
            {explication ? (
              <Text style={styles.explication}>{explication}</Text>
            ) : null}
          </View>
        </View>
      </View>
    )
  }

  return (
    <View style={[styles.badgeCompact, { backgroundColor: config.color[100], borderColor: config.color[200] }]}>
      <Text style={styles.iconCompact}>{config.icon}</Text>
      <Text style={[styles.badgeText, { color: config.color[800] }]}>{nom}</Text>
      <Text style={[styles.badgeScore, { color: config.color[800] }]}>({score}/10)</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  cardDetailed: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.primary[100],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  rowDetailed: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.md,
  },
  iconLarge: {
    fontSize: 24,
  },
  content: {
    flex: 1,
  },
  rowTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.gray[800],
  },
  scoreBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
  },
  scoreText: {
    fontSize: 14,
    fontWeight: '700',
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  explication: {
    marginTop: theme.spacing.md,
    fontSize: 14,
    color: theme.colors.gray[600],
    lineHeight: 20,
  },
  badgeCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    marginRight: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  iconCompact: {
    fontSize: 16,
  },
  badgeText: {
    fontSize: 14,
    fontWeight: '500',
  },
  badgeScore: {
    fontSize: 14,
    fontWeight: '700',
  },
})

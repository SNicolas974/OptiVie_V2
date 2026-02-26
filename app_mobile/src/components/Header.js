import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { theme } from '../theme'

export default function Header() {
  const insets = useSafeAreaInsets()

  return (
    <View style={[styles.header, { paddingTop: insets.top + theme.spacing.md }]}>
      <View style={styles.row}>
        <Text style={styles.emoji}>🌿</Text>
        <Text style={styles.title}>OptiVie</Text>
      </View>
      <Text style={styles.subtitle}>Nutrition anti-inflammatoire</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: theme.colors.primary[100],
    paddingBottom: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.primary[200],
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  emoji: {
    fontSize: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.primary[800],
  },
  subtitle: {
    fontSize: 14,
    color: theme.colors.primary[600],
    marginTop: 2,
  },
})

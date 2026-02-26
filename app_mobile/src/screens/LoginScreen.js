import React, { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { theme } from '../theme'
import { useAuth } from '../context/AuthContext'

export default function LoginScreen({ navigation }) {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  
  const { login, register } = useAuth()

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs')
      return
    }

    if (!isLogin && !name.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer votre nom')
      return
    }

    setLoading(true)

    try {
      let result
      if (isLogin) {
        result = await login(email.trim(), password)
      } else {
        result = await register(email.trim(), password, name.trim())
      }

      if (!result.success) {
        Alert.alert('Erreur', result.error)
      }
      // Navigation is handled by App.js based on auth state
    } catch (error) {
      Alert.alert('Erreur', 'Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  const toggleMode = () => {
    setIsLogin(!isLogin)
    setEmail('')
    setPassword('')
    setName('')
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo */}
          <View style={styles.logoContainer}>
            <Text style={styles.logoEmoji}>🌿</Text>
            <Text style={styles.logoText}>OptiVie</Text>
            <Text style={styles.tagline}>Nutrition anti-inflammatoire</Text>
          </View>

          {/* Form */}
          <View style={styles.formContainer}>
            <Text style={styles.title}>
              {isLogin ? 'Connexion' : 'Creer un compte'}
            </Text>

            {!isLogin && (
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Nom</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Votre nom"
                  placeholderTextColor={theme.colors.gray[400]}
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                />
              </View>
            )}

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="votre@email.com"
                placeholderTextColor={theme.colors.gray[400]}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Mot de passe</Text>
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor={theme.colors.gray[400]}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={theme.colors.white} />
              ) : (
                <Text style={styles.buttonText}>
                  {isLogin ? 'Se connecter' : 'S\'inscrire'}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity onPress={toggleMode} style={styles.toggleButton}>
              <Text style={styles.toggleText}>
                {isLogin
                  ? 'Pas de compte ? Creer un compte'
                  : 'Deja un compte ? Se connecter'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.primary[100],
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: theme.spacing.xl,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoEmoji: {
    fontSize: 60,
    marginBottom: theme.spacing.sm,
  },
  logoText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: theme.colors.primary[800],
  },
  tagline: {
    fontSize: 14,
    color: theme.colors.primary[600],
    marginTop: theme.spacing.xs,
  },
  formContainer: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.gray[800],
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
  },
  inputContainer: {
    marginBottom: theme.spacing.lg,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.gray[600],
    marginBottom: theme.spacing.sm,
  },
  input: {
    backgroundColor: theme.colors.primary[100],
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    fontSize: 16,
    color: theme.colors.gray[800],
    borderWidth: 2,
    borderColor: theme.colors.primary[200],
  },
  button: {
    backgroundColor: theme.colors.primary[800],
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    alignItems: 'center',
    marginTop: theme.spacing.lg,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  toggleButton: {
    marginTop: theme.spacing.xl,
    alignItems: 'center',
  },
  toggleText: {
    color: theme.colors.primary[700],
    fontSize: 14,
  },
})

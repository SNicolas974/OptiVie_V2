import React, { createContext, useContext, useState, useEffect } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { API_BASE_URL } from '../config'

const AuthContext = createContext(null)

const STORAGE_KEYS = {
  TOKEN: '@optivie_token',
  USER: '@optivie_user',
  ONBOARDING_DONE: '@optivie_onboarding_done',
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)
  const [goals, setGoals] = useState([])
  const [profile, setProfile] = useState(null)
  const [onboardingDone, setOnboardingDone] = useState(false)

  // Load stored auth on app start
  useEffect(() => {
    loadStoredAuth()
  }, [])

  const loadStoredAuth = async () => {
    try {
      const storedToken = await AsyncStorage.getItem(STORAGE_KEYS.TOKEN)
      const storedUser = await AsyncStorage.getItem(STORAGE_KEYS.USER)
      const storedOnboarding = await AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING_DONE)
      
      if (storedToken && storedUser) {
        setToken(storedToken)
        setUser(JSON.parse(storedUser))
        setOnboardingDone(storedOnboarding === 'true')
        // Fetch latest user data
        await fetchUserData(storedToken)
      }
    } catch (error) {
      console.error('Error loading stored auth:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchUserData = async (authToken) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${authToken}` }
      })
      
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
        setGoals(data.goals || [])
        setProfile(data.profile || null)
        await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(data.user))
        
        // Si le profil a des donnees, l'onboarding est fait
        if (data.profile && data.profile.age && data.goals && data.goals.length > 0) {
          setOnboardingDone(true)
          await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING_DONE, 'true')
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
    }
  }

  const register = async (email, password, name) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors de l\'inscription')
      }

      // Store auth data
      await AsyncStorage.setItem(STORAGE_KEYS.TOKEN, data.token)
      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(data.user))
      await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING_DONE, 'false')
      
      setToken(data.token)
      setUser(data.user)
      setGoals([])
      setOnboardingDone(false) // Nouveau compte = onboarding requis

      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  const login = async (email, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors de la connexion')
      }

      // Store auth data
      await AsyncStorage.setItem(STORAGE_KEYS.TOKEN, data.token)
      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(data.user))
      
      setToken(data.token)
      setUser(data.user)
      setGoals(data.user.goals || [])

      // Fetch full profile to check onboarding status
      await fetchUserData(data.token)

      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  const logout = async () => {
    try {
      // Appeler l'API de logout si possible
      if (token) {
        try {
          await fetch(`${API_BASE_URL}/api/auth/logout`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` }
          })
        } catch {}
      }
      
      await AsyncStorage.removeItem(STORAGE_KEYS.TOKEN)
      await AsyncStorage.removeItem(STORAGE_KEYS.USER)
      await AsyncStorage.removeItem(STORAGE_KEYS.ONBOARDING_DONE)
      setToken(null)
      setUser(null)
      setGoals([])
      setProfile(null)
      setOnboardingDone(false)
    } catch (error) {
      console.error('Error logging out:', error)
    }
  }

  const updateProfile = async (profileData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/user/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(profileData)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors de la mise a jour du profil')
      }

      setProfile(data.profile)
      return { success: true, profile: data.profile }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  const updateGoals = async (newGoals) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/user/goals`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ goals: newGoals })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors de la mise a jour')
      }

      setGoals(newGoals)
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  const completeOnboarding = async () => {
    setOnboardingDone(true)
    await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING_DONE, 'true')
  }

  const fetchGoals = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/user/goals`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (response.ok) {
        const data = await response.json()
        const goalIds = data.goals.map(g => g.id)
        setGoals(goalIds)
        return goalIds
      }
    } catch (error) {
      console.error('Error fetching goals:', error)
    }
    return []
  }

  return (
    <AuthContext.Provider value={{
      user,
      token,
      goals,
      profile,
      loading,
      isAuthenticated: !!token,
      onboardingDone,
      register,
      login,
      logout,
      updateProfile,
      updateGoals,
      fetchGoals,
      completeOnboarding,
      fetchUserData: () => fetchUserData(token)
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

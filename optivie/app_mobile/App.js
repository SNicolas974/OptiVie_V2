import React from 'react'
import { StatusBar } from 'expo-status-bar'
import { View, ActivityIndicator } from 'react-native'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { NavigationContainer } from '@react-navigation/native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { AuthProvider, useAuth } from './src/context/AuthContext'
import { AnalysisProvider } from './src/context/AnalysisContext'
import Header from './src/components/Header'
import ScanScreen from './src/screens/ScanScreen'
import IngredientsScreen from './src/screens/IngredientsScreen'
import StatsScreen from './src/screens/StatsScreen'
import AccountScreen from './src/screens/AccountScreen'
import LoginScreen from './src/screens/LoginScreen'
import OnboardingScreen from './src/screens/OnboardingScreen'
import { TabIconScan, TabIconIngredients, TabIconStats, TabIconAccount } from './src/components/Icons'
import { theme } from './src/theme'

const Tab = createBottomTabNavigator()
const Stack = createNativeStackNavigator()

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary[800],
        tabBarInactiveTintColor: theme.colors.gray[400],
        tabBarStyle: {
          backgroundColor: theme.colors.white,
          borderTopColor: theme.colors.primary[200],
          borderTopWidth: 1,
        },
        tabBarLabelStyle: { fontSize: 12, fontWeight: '500' },
      }}
    >
      <Tab.Screen
        name="Scan"
        component={ScanScreen}
        options={{
          tabBarLabel: 'Scan',
          tabBarIcon: ({ color, size }) => <TabIconScan color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Stats"
        component={StatsScreen}
        options={{
          tabBarLabel: 'Suivi',
          tabBarIcon: ({ color, size }) => <TabIconStats color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Ingredients"
        component={IngredientsScreen}
        options={{
          tabBarLabel: 'Ingredients',
          tabBarIcon: ({ color, size }) => <TabIconIngredients color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Account"
        component={AccountScreen}
        options={{
          tabBarLabel: 'Compte',
          tabBarIcon: ({ color, size }) => <TabIconAccount color={color} size={size} />,
        }}
      />
    </Tab.Navigator>
  )
}

function MainApp() {
  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.primary[100] }}>
      <Header />
      <TabNavigator />
    </View>
  )
}

function AppContent() {
  const { isAuthenticated, loading, onboardingDone, completeOnboarding } = useAuth()

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.primary[100] }}>
        <ActivityIndicator size="large" color={theme.colors.primary[600]} />
      </View>
    )
  }

  // Non connecte -> Login
  if (!isAuthenticated) {
    return <LoginScreen />
  }

  // Connecte mais onboarding pas fait -> Questionnaire
  if (!onboardingDone) {
    return <OnboardingScreen onComplete={completeOnboarding} />
  }

  // Connecte et onboarding fait -> App principale
  return <MainApp />
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <AnalysisProvider>
          <NavigationContainer>
            <StatusBar style="dark" />
            <AppContent />
          </NavigationContainer>
        </AnalysisProvider>
      </AuthProvider>
    </SafeAreaProvider>
  )
}

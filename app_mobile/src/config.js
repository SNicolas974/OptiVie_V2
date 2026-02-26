// URL de l'API backend en dev (ton Mac)
const DEV_MACHINE_IP = '192.168.99.152'
const API_PORT = 3001

import { Platform } from 'react-native'

const getApiBaseUrl = () => {
  if (__DEV__) {
    // Émulateur Android : localhost de la machine
    if (Platform.OS === 'android') return `http://10.0.2.2:${API_PORT}`
    // Téléphone physique ou simulateur iOS : IP de ton Mac
    return `http://${DEV_MACHINE_IP}:${API_PORT}`
  }
  return 'https://votre-api.com'
}

export const API_BASE_URL = getApiBaseUrl()

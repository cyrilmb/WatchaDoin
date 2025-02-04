import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'

const getEnvVar = (key: string): string => {
    const value = process.env[key]
    if (!value) {
      throw new Error(`Missing environment variable: ${key}`)
    }
    return value
  }
  
  const supabaseUrl = getEnvVar("EXPO_PUBLIC_SUPABASE_URL")
  const supabaseAnonKey = getEnvVar("EXPO_PUBLIC_SUPABASE_ANON_KEY")

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})
import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://uuextcqzybbhwsbgsjmr.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV1ZXh0Y3F6eWJiaHdzYmdzam1yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg1OTYzMDQsImV4cCI6MjA1NDE3MjMwNH0.ApQnGRKPkWxKmxGjiOlQ2gPQNI5gY_JkQqZbPUZvgQs'
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})
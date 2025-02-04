import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import Auth from './components/Auth'
import { SafeAreaView } from 'react-native'
import { Session } from '@supabase/supabase-js'
import LogTypeSelection from './components/LogTypeSelection'
import Account from './components/Account'
import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'

const Stack = createStackNavigator()

export default function App() {
  const [session, setSession] = useState<Session | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
  }, [])

  return (
    <SafeAreaView style={{ flex: 1 }}>
      {session && session.user ? (
        <NavigationContainer>
          <Stack.Navigator>
            <Stack.Screen
              name="LogSelection"
              options={{ title: 'Whatcha Up To?' }}
            >
              {() => <LogTypeSelection session={session} />}
            </Stack.Screen>
            <Stack.Screen name="Account" options={{ title: 'Account Info' }}>
              {() => <Account session={session} />}
            </Stack.Screen>
          </Stack.Navigator>
        </NavigationContainer>
      ) : (
        <Auth />
      )}
    </SafeAreaView>
  )
}

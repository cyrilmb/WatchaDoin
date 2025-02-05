import React from 'react'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Alert, View, Text, Button, StyleSheet } from 'react-native'
import { Session } from '@supabase/supabase-js'
import { useNavigation, NavigationProp } from '@react-navigation/native'
import { RootStackParamList } from '../src/types' // Import the navigation types

export default function LogTypeSelection({ session }: { session: Session }) {
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    if (session) getProfile()
  }, [session])

  async function getProfile() {
    try {
      setLoading(true)
      if (!session?.user) throw new Error('No user on the session!')

      const { data, error, status } = await supabase
        .from('profiles')
        .select(`username, website, avatar_url`)
        .eq('id', session?.user.id)
        .single()
      if (error && status !== 406) {
        throw error
      }

      if (data) {
        // setUsername(data.username)
        // setWebsite(data.website)
        // setAvatarUrl(data.avatar_url)
      }
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(error.message)
      }
    } finally {
      setLoading(false)
    }
  }

  const navigation = useNavigation<NavigationProp<RootStackParamList>>()

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Whatta ya think yer doin?</Text>

      <View style={styles.buttonContainer}>
        <Button
          title="Activity"
          onPress={() => navigation.navigate('ActivitySelection')}
        />
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title="Drug"
          onPress={() => console.log('Drug button pressed')}
        />
      </View>
      {/* Bottom Button for Account Information */}
      <View style={styles.buttonContainer}>
        <Button
          title="Account Information"
          onPress={() => navigation.navigate('Account')}
          color="gray"
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  buttonContainer: {
    width: '80%',
    marginVertical: 10,
  },
  accountButton: {
    position: 'absolute',
    bottom: 40,
    width: '80%',
  },
})

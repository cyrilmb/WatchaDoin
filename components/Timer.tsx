import React, { useState, useEffect } from 'react'
import { View, Text, Button, StyleSheet, AppState } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { supabase } from '../lib/supabase'
import { NavigationProp } from '@react-navigation/native'
import { RootStackParamList } from '../src/types'
import { RouteProp } from '@react-navigation/native'

interface TimerProps {
  route: RouteProp<RootStackParamList, 'Timer'>
  navigation: NavigationProp<RootStackParamList>
}

export default function Timer({ route, navigation }: TimerProps) {
  const { activity, session } = route.params
  const [timeElapsed, setTimeElapsed] = useState(0) // Time in seconds
  const [isRunning, setIsRunning] = useState(false)
  const [startTime, setStartTime] = useState<number | null>(null)
  const [isPaused, setIsPaused] = useState(false)

  useEffect(() => {
    const loadStoredTimer = async () => {
      const savedStartTime = await AsyncStorage.getItem('timerStart')
      const savedElapsedTime = await AsyncStorage.getItem('timerElapsed')
      const savedIsRunning = await AsyncStorage.getItem('timerRunning')

      if (savedStartTime && savedIsRunning === 'true') {
        const now = Date.now()
        const adjustedElapsed =
          Math.floor((now - Number(savedStartTime)) / 1000) +
          (Number(savedElapsedTime) || 0)
        setTimeElapsed(adjustedElapsed)
        setStartTime(Number(savedStartTime))
        setIsRunning(true)
      } else if (savedElapsedTime) {
        setTimeElapsed(Number(savedElapsedTime))
      }
    }

    loadStoredTimer()
  }, [])

  useEffect(() => {
    const subscription = AppState.addEventListener(
      'change',
      async (nextAppState) => {
        if (nextAppState === 'active' && startTime && isRunning) {
          const now = Date.now()
          const adjustedElapsed =
            Math.floor((now - startTime) / 1000) +
            (Number(await AsyncStorage.getItem('timerElapsed')) || 0)
          setTimeElapsed(adjustedElapsed)
        }
      }
    )

    return () => subscription.remove()
  }, [startTime, isRunning])

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isRunning) {
      interval = setInterval(() => {
        setTimeElapsed((prev) => prev + 1)
      }, 1000)
    } else if (interval) {
      clearInterval(interval)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isRunning])

  const startTimer = async () => {
    const now = Date.now()
    setStartTime(now)
    setIsRunning(true)
    setIsPaused(false)
    await AsyncStorage.setItem('timerStart', now.toString())
    await AsyncStorage.setItem('timerRunning', 'true')
  }

  const pauseTimer = async () => {
    if (startTime) {
      const now = Date.now()
      setTimeElapsed(timeElapsed)
      setIsRunning(false)
      setIsPaused(true)
      setStartTime(null)

      await AsyncStorage.setItem('timerElapsed', timeElapsed.toString())
      await AsyncStorage.setItem('timerRunning', 'false')
      await AsyncStorage.removeItem('timerStart')
    }
  }

  const resumeTimer = async () => {
    const now = Date.now()
    setStartTime(now)
    setIsRunning(true)
    setIsPaused(false)
    await AsyncStorage.setItem('timerStart', now.toString())
    await AsyncStorage.setItem('timerRunning', 'true')
  }

  const stopTimer = async () => {
    setIsRunning(false)
    setIsPaused(false)
    await AsyncStorage.removeItem('timerStart')
    await AsyncStorage.removeItem('timerElapsed')
    await AsyncStorage.removeItem('timerRunning')
    handleSubmit()
  }

  const handleSubmit = async () => {
    try {
      const { error } = await supabase.from('activities').insert([
        {
          activity_type: activity,
          time_elapsed: timeElapsed,
          user_id: session.user.id,
          created_at: new Date().toISOString(),
        },
      ])
      setTimeElapsed(0)
      if (error) throw error
      navigation.navigate('ReviewActivityLog', {
        activity,
        timeElapsed,
      })
    } catch (error) {
      console.error('Error submitting activity:', error)
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.activity}>{activity}</Text>
      <Text style={styles.timer}>
        {new Date(timeElapsed * 1000).toISOString().substr(11, 8)}
      </Text>
      {!isRunning ? (
        <>
          {isPaused ? (
            <Button title="Resume" onPress={resumeTimer} />
          ) : (
            <Button title="Start" onPress={startTimer} />
          )}
          <Button title="End" onPress={stopTimer} />
        </>
      ) : (
        <>
          <Button title="Pause" onPress={pauseTimer} />
          <Button title="End" onPress={stopTimer} />
        </>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 20,
  },
  activity: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  timer: {
    fontSize: 30,
    marginBottom: 20,
  },
})

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
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null)

  //   const navigation = useNavigation<NavigationProp<RootStackParamList>>()

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
        setStartTime(now)
        startInterval()
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
          setTimeElapsed(Math.floor((now - startTime) / 1000))
        }
      }
    )

    return () => subscription.remove()
  }, [startTime, isRunning])

  const startInterval = () => {
    const id = setInterval(() => {
      setTimeElapsed((prev) => prev + 1)
    }, 1000)
    setIntervalId(id)
  }

  const stopInterval = () => {
    if (intervalId) clearInterval(intervalId)
    setIntervalId(null)
  }

  const startTimer = async () => {
    const now = Date.now()
    setStartTime(now)
    setIsRunning(true)
    setIsPaused(false)
    await AsyncStorage.setItem('timerStart', now.toString())
    await AsyncStorage.setItem('timerRunning', 'true')
    startInterval()
  }

  const pauseTimer = async () => {
    if (startTime) {
      stopInterval() // Stop interval before calculating elapsed time
      const now = Date.now()
      const additionalElapsed = Math.floor((now - startTime) / 1000) // Time since last start
      const totalElapsed = timeElapsed + additionalElapsed // Correct total time
      setTimeElapsed(totalElapsed)
      setIsRunning(false)
      setIsPaused(true)
      setStartTime(null)

      await AsyncStorage.setItem('timerElapsed', totalElapsed.toString())
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
    startInterval()
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

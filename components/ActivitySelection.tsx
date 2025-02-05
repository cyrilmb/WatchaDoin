import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  Button,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from 'react-native'
import { useNavigation, NavigationProp } from '@react-navigation/native'
import { supabase } from '../lib/supabase'
import { RootStackParamList } from '../src/types' // Import the navigation types

export default function ActivitySelection() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>()

  const [activities, setActivities] = useState<string[]>([])
  const [newActivity, setNewActivity] = useState('')

  // Fetch unique activities from the database
  useEffect(() => {
    const fetchActivities = async () => {
      const { data, error } = await supabase
        .from('activities')
        .select('activity_type')

      if (error) {
        console.error(error)
      } else {
        // Remove duplicates and update state
        const uniqueActivities = [
          ...new Set(data.map((item) => item.activity_type)),
        ]
        setActivities(uniqueActivities)
      }
    }

    fetchActivities()
  }, [])

  // Handle navigation to Timer with selected activity
  const handleActivitySelect = (activity: string) => {
    navigation.navigate('Timer', { activity })
  }

  return (
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.backButton}
      >
        <Text style={styles.backButtonText}>← Back</Text>
      </TouchableOpacity>

      {/* Title */}
      <Text style={styles.title}>Choose Your Activity</Text>

      {/* Activity Grid */}
      <View style={styles.gridContainer}>
        {activities.length > 0 ? (
          <FlatList
            data={activities}
            numColumns={2}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.activityButton}
                onPress={() => handleActivitySelect(item)}
              >
                <Text style={styles.activityText}>{item}</Text>
              </TouchableOpacity>
            )}
          />
        ) : (
          <Text style={styles.noActivityText}>Enter a new activity below</Text>
        )}
      </View>

      {/* New Activity Input & Submit Button */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Doin' something new?"
          value={newActivity}
          onChangeText={setNewActivity}
        />
        <Button
          title="Start"
          onPress={() => handleActivitySelect(newActivity)}
          disabled={!newActivity.trim()}
        />
      </View>
    </View>
  )
}

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  backButton: {
    marginBottom: 10,
  },
  backButtonText: {
    fontSize: 16,
    color: '#007BFF',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  gridContainer: {
    flex: 1,
    alignItems: 'center',
  },
  activityButton: {
    backgroundColor: '#007BFF',
    padding: 15,
    margin: 10,
    borderRadius: 10,
    width: '40%',
    alignItems: 'center',
  },
  activityText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  noActivityText: {
    fontSize: 16,
    color: '#666',
    marginTop: 20,
  },
  inputContainer: {
    position: 'absolute',
    bottom: 30,
    width: '100%',
    alignItems: 'center',
  },
  input: {
    width: '80%',
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 10,
    backgroundColor: 'white',
  },
})

import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native'
import { RouteProp, NavigationProp } from '@react-navigation/native'
import { RootStackParamList } from '../src/types'
import { supabase } from '../lib/supabase'

// Utility function to format seconds as HH:MM:SS
const formatTime = (seconds: number) => {
  const hh = String(Math.floor(seconds / 3600)).padStart(2, '0')
  const mm = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0')
  const ss = String(seconds % 60).padStart(2, '0')
  return `${hh}:${mm}:${ss}`
}

// Utility function to convert HH:MM:SS to total seconds
const parseTime = (hhmmss: string) => {
  const [hh, mm, ss] = hhmmss.split(':').map(Number)
  return hh * 3600 + mm * 60 + ss
}

interface ReviewActivityLogProps {
  route: RouteProp<RootStackParamList, 'ReviewActivityLog'>
  navigation: NavigationProp<RootStackParamList>
}

export default function ReviewActivityLog({
  route,
  navigation,
}: ReviewActivityLogProps) {
  const { activity, timeElapsed } = route.params

  const [recentActivity, setRecentActivity] = useState({
    id: '',
    activity_type: activity,
    time_elapsed: formatTime(timeElapsed), // Ensure it's formatted
    created_at: '',
  })

  const [allActivities, setAllActivities] = useState<
    {
      id: string
      activity_type: string
      time_elapsed: string // Keep it as HH:MM:SS
      created_at: string
    }[]
  >([])

  const [editMode, setEditMode] = useState<{ [key: string]: boolean }>({})
  const [editedActivities, setEditedActivities] = useState<{
    [key: string]: { activity_type: string; time_elapsed: string }
  }>({})

  // Fetch activities from Supabase
  useEffect(() => {
    const fetchActivities = async () => {
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching activities:', error)
      } else if (data.length > 0) {
        // Ensure time_elapsed is in HH:MM:SS
        const formattedData = data.map((item) => ({
          ...item,
          time_elapsed: item.time_elapsed, // Supabase should already store it as HH:MM:SS
        }))
        setRecentActivity(formattedData[0])
        setAllActivities(formattedData)
      }
    }

    fetchActivities()
  }, [])

  // Toggle edit mode
  const toggleEditMode = (
    id: string,
    currentActivity: string,
    currentTime: string
  ) => {
    setEditMode((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
    setEditedActivities((prev) => ({
      ...prev,
      [id]: {
        activity_type: currentActivity,
        time_elapsed: currentTime, // Keep HH:MM:SS format
      },
    }))
  }

  // Update activity in the database
  const handleUpdate = async (id: string) => {
    const { activity_type, time_elapsed } = editedActivities[id]

    const { error } = await supabase
      .from('activities')
      .update({
        activity_type,
        time_elapsed, // Save as HH:MM:SS
      })
      .eq('id', id)

    if (error) {
      console.error('Error updating activity:', error)
    } else {
      setAllActivities((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, activity_type, time_elapsed } : item
        )
      )
      setEditMode((prev) => ({
        ...prev,
        [id]: false, // Exit edit mode
      }))
      Alert.alert('Success', 'Activity updated!')
    }
  }

  // Confirm delete
  const confirmDelete = (id: string) => {
    Alert.alert(
      'Delete Activity',
      'Are you sure you want to delete this activity?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => handleDelete(id),
        },
      ]
    )
  }

  // Delete an activity
  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('activities').delete().eq('id', id)

    if (error) {
      console.error('Error deleting activity:', error)
    } else {
      setAllActivities((prev) => prev.filter((activity) => activity.id !== id))
      if (id === recentActivity.id) {
        setRecentActivity({
          id: '',
          activity_type: '',
          time_elapsed: '00:00:00',
          created_at: '',
        })
      }
      Alert.alert('Deleted', 'Activity has been removed.')
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Past Activities</Text>
      <FlatList
        data={allActivities}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.activityItem}>
            <Text>{item.created_at.split('T')[0]}</Text>
            {editMode[item.id] ? (
              <>
                <TextInput
                  style={styles.input}
                  value={
                    editedActivities[item.id]?.activity_type ||
                    item.activity_type
                  }
                  onChangeText={(text) =>
                    setEditedActivities((prev) => ({
                      ...prev,
                      [item.id]: { ...prev[item.id], activity_type: text },
                    }))
                  }
                />
                <TextInput
                  style={styles.input}
                  value={
                    editedActivities[item.id]?.time_elapsed || item.time_elapsed
                  }
                  onChangeText={(text) =>
                    setEditedActivities((prev) => ({
                      ...prev,
                      [item.id]: { ...prev[item.id], time_elapsed: text },
                    }))
                  }
                />
                <Button title="Save" onPress={() => handleUpdate(item.id)} />
                <Button
                  title="Cancel"
                  onPress={() =>
                    toggleEditMode(
                      item.id,
                      item.activity_type,
                      item.time_elapsed
                    )
                  }
                />
              </>
            ) : (
              <>
                <Text>
                  {item.activity_type} - {item.time_elapsed}
                </Text>
                <TouchableOpacity
                  onPress={() =>
                    toggleEditMode(
                      item.id,
                      item.activity_type,
                      item.time_elapsed
                    )
                  }
                >
                  <Text style={styles.editButton}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => confirmDelete(item.id)}>
                  <Text style={styles.deleteButton}>Delete</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        )}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  activityItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  editButton: {
    color: 'blue',
    fontWeight: 'bold',
    marginTop: 5,
  },
  deleteButton: {
    color: 'red',
    fontWeight: 'bold',
    marginTop: 5,
  },
})

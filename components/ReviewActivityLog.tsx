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
    time_elapsed: timeElapsed,
    created_at: '',
  })
  const [allActivities, setAllActivities] = useState<
    {
      id: string
      activity_type: string
      time_elapsed: number
      created_at: string
    }[]
  >([])
  const [editMode, setEditMode] = useState<{ [key: string]: boolean }>({}) // Tracks edit mode per activity
  const [editedActivities, setEditedActivities] = useState<{
    [key: string]: { activity_type: string; time_elapsed: string }
  }>({}) // Stores edits

  // Fetch recent activity and all past activities
  useEffect(() => {
    const fetchActivities = async () => {
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching activities:', error)
      } else if (data.length > 0) {
        setRecentActivity(data[0])
        setAllActivities(data)
      }
    }

    fetchActivities()
  }, [])

  // Toggle edit mode for an activity
  const toggleEditMode = (
    id: string,
    currentActivity: string,
    currentTime: number
  ) => {
    setEditMode((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
    setEditedActivities((prev) => ({
      ...prev,
      [id]: {
        activity_type: currentActivity,
        time_elapsed: currentTime.toString(),
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
        time_elapsed: parseInt(time_elapsed),
      })
      .eq('id', id)

    if (error) {
      console.error('Error updating activity:', error)
    } else {
      setAllActivities((prev) =>
        prev.map((item) =>
          item.id === id
            ? { ...item, activity_type, time_elapsed: parseInt(time_elapsed) }
            : item
        )
      )
      setEditMode((prev) => ({
        ...prev,
        [id]: false, // Exit edit mode
      }))
      Alert.alert('Success', 'Activity updated!')
    }
  }

  // Show confirmation before deleting
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
          time_elapsed: 0,
          created_at: '',
        })
      }
      Alert.alert('Deleted', 'Activity has been removed.')
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Recent Activity</Text>
      <Text>{recentActivity.created_at.split('T')[0]}</Text>
      <TextInput
        style={styles.input}
        value={recentActivity.activity_type}
        onChangeText={(text) =>
          setRecentActivity((prev) => ({ ...prev, activity_type: text }))
        }
      />
      <TextInput
        style={styles.input}
        value={recentActivity.time_elapsed.toString()}
        onChangeText={(text) =>
          setRecentActivity((prev) => ({
            ...prev,
            time_elapsed: parseInt(text),
          }))
        }
        keyboardType="numeric"
      />
      <Button
        title="Update Activity"
        onPress={() => handleUpdate(recentActivity.id)}
      />
      <Button
        title="Delete Activity"
        onPress={() => confirmDelete(recentActivity.id)}
        color="red"
      />

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
                    editedActivities[item.id]?.time_elapsed ||
                    item.time_elapsed.toString()
                  }
                  onChangeText={(text) =>
                    setEditedActivities((prev) => ({
                      ...prev,
                      [item.id]: { ...prev[item.id], time_elapsed: text },
                    }))
                  }
                  keyboardType="numeric"
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
                  {item.activity_type} - {item.time_elapsed}s
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

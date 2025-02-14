import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  Button,
  TextInput,
  Modal,
  Alert,
  FlatList,
  StyleSheet,
} from 'react-native'
import { supabase } from '../lib/supabase'
import { Session } from '@supabase/supabase-js'
import { RootStackParamList } from '../src/types'
import { RouteProp } from '@react-navigation/native'
import { NavigationProp } from '@react-navigation/native'

interface DrugSelectionProps {
  route: RouteProp<RootStackParamList, 'DrugSelection'>
  navigation: NavigationProp<RootStackParamList>
}

export default function DrugSelection({
  route,
  navigation,
}: DrugSelectionProps) {
  const { session } = route.params
  const [drugs, setDrugs] = useState<string[]>([])
  const [selectedDrug, setSelectedDrug] = useState<string | null>(null)
  const [ingestionMethods, setIngestionMethods] = useState<string[]>([])
  const [modalVisible, setModalVisible] = useState(false)
  const [newDrug, setNewDrug] = useState('')
  const [newIngestionMethod, setNewIngestionMethod] = useState('')
  const userId = session.user.id

  useEffect(() => {
    fetchDrugs()
  }, [])

  type Drug = { drug_type: string }
  const fetchDrugs = async (): Promise<void> => {
    if (!session?.user?.id) return
    const { data, error } = await supabase
      .from('drugs')
      .select('drug_type')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false })
    if (!error) {
      setDrugs([...new Set(data.map((item: Drug) => item.drug_type))])
    }
  }

  type IngestionMethod = { ingestion_method: string }
  const fetchIngestionMethods = async (drugType: string): Promise<void> => {
    if (!session?.user?.id) return
    const { data, error } = await supabase
      .from('drugs')
      .select('ingestion_method')
      .eq('user_id', userId)
      .eq('drug_type', drugType)
      .order('timestamp', { ascending: false })
    if (!error) {
      setIngestionMethods([
        ...new Set(data.map((item: IngestionMethod) => item.ingestion_method)),
      ])
    }
  }

  const addDrugType = async () => {
    if (newDrug.trim() === '') return
    const { error } = await supabase
      .from('drugs')
      .insert([{ user_id: userId, drug_type: newDrug }])

    if (error) {
      console.error('Error adding drug type:', error.message)
    } else {
      console.log('Drug type added successfully!')
      setNewDrug('')
      fetchDrugs()
    }
    // setDrugs([newDrug, ...drugs])
    // setNewDrug('')
  }

  const addIngestionMethod = async () => {
    if (newIngestionMethod.trim() === '' || !selectedDrug) return
    const { error } = await supabase.from('drugs').insert([
      {
        user_id: userId,
        drug_type: selectedDrug,
        ingestion_method: newIngestionMethod,
      },
    ])

    if (error) {
      console.error('Error adding ingestion method:', error.message)
    } else {
      console.log('Ingestion method added successfully!')
      setNewIngestionMethod('')
      fetchIngestionMethods(selectedDrug)
    }
    // if (newIngestionMethod.trim() === '' || !selectedDrug) return
    // setIngestionMethods([newIngestionMethod, ...ingestionMethods])
    // setNewIngestionMethod('')
  }

  const confirmIngestion = async (ingestionMethod: string) => {
    const timeStamp = new Date().toISOString()
    Alert.alert('Are you sure about ingestion?', '', [
      { text: 'No', onPress: () => setModalVisible(false), style: 'cancel' },
      {
        text: 'Yes',
        onPress: async () => {
          const { error } = await supabase.from('drugs').insert([
            {
              user_id: userId,
              drug_type: selectedDrug,
              ingestion_method: ingestionMethod,
              timestamp: timeStamp,
            },
          ])
          if (error) {
            console.error('Error inserting ingestion:', error.message)
          } else {
            console.log('Ingestion added successfully!')
            setModalVisible(false)
            navigation.navigate('DrugNotes', { timeStamp })
          }
        },
      },
    ])
  }

  return (
    <View>
      <Text style={styles.title}>Choose your drug</Text>
      <FlatList
        data={drugs}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <Button
            title={item}
            onPress={() => {
              setSelectedDrug(item)
              fetchIngestionMethods(item)
              setModalVisible(true)
            }}
          />
        )}
      />
      <TextInput
        placeholder="Add new drug"
        value={newDrug}
        onChangeText={setNewDrug}
        style={styles.input}
      />
      <Button title="Add Drug" onPress={addDrugType} />
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.title}>
              Choose ingestion method for {selectedDrug}
            </Text>
            <FlatList
              data={ingestionMethods}
              keyExtractor={(item) => item}
              renderItem={({ item }) =>
                item ? (
                  <Button
                    title={`${item}`}
                    onPress={() => {
                      confirmIngestion(item)
                    }}
                  />
                ) : null
              }
            />
            <TextInput
              placeholder="Add new ingestion method"
              value={newIngestionMethod}
              onChangeText={setNewIngestionMethod}
              style={styles.input}
            />
            <Button title="Add Method" onPress={addIngestionMethod} />
            <Button title="Close" onPress={() => setModalVisible(false)} />
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Darken background
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%', // Adjust width to be close to screen edges
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    alignContent: 'center',
  },
  input: {
    borderWidth: 1,
    padding: 10,
    marginVertical: 10,
    marginHorizontal: 20,
    width: '90%',
  },
})

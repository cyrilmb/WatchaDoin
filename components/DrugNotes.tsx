import React, { useState, useEffect } from 'react'
import { View, Text, Button, StyleSheet } from 'react-native'
import { supabase } from '../lib/supabase'
import { Session } from '@supabase/supabase-js'
import { useNavigation, NavigationProp } from '@react-navigation/native'
import { RootStackParamList } from '../src/types'
import { RouteProp } from '@react-navigation/native'

interface DrugNotesProps {
  route: RouteProp<RootStackParamList, 'DrugNotes'>
  navigation: NavigationProp<RootStackParamList>
}

export default function DrugNotes({ route, navigation }: DrugNotesProps) {
  const { timeStamp } = route.params
  return (
    <View>
      <Text>Drug Notes</Text>
      <Text>Timestamp: {timeStamp}</Text>
    </View>
  )
}

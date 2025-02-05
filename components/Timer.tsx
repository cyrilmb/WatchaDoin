import { View, Text } from 'react-native'
import { TimerScreenProps } from '../src/types'

export default function Timer({ route }: TimerScreenProps) {
  const { activity } = route.params

  return (
    <View>
      <Text>Activity: {activity}</Text>
    </View>
  )
}

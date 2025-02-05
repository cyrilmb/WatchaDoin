import { NativeStackScreenProps } from '@react-navigation/native-stack'

export type RootStackParamList = {
  LogTypeSelection: undefined;
  Account: undefined;
  ActivitySelection: undefined;
  Timer: { activity: string }; // Ensure Timer expects an 'activity' parameter
}

export type TimerScreenProps = NativeStackScreenProps<RootStackParamList, 'Timer'>;

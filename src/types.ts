import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Session } from '@supabase/supabase-js';

// Update the param list type to ensure correct types for each screen
export type RootStackParamList = {
  LogTypeSelection: undefined;
  Account: undefined;
  ActivitySelection: { session: Session }; // Pass session as a param
  Timer: { activity: string; session: Session }; // Expect activity and session props
  ReviewActivityLog: { activity: string; timeElapsed: number }; // Expect activity and timeElapsed props
  DrugSelection: { session: Session }
  DrugNotes: {timeStamp: string}
};

// Ensure that the Timer screen props are correctly typed
// export type TimerScreenProps = NativeStackScreenProps<RootStackParamList, 'Timer'>;
// export type ActivitySelectionScreenProps = NativeStackScreenProps<RootStackParamList, 'ActivitySelection'>;
// export type ReviewActivityLogScreenProps = NativeStackScreenProps<RootStackParamList, 'ReviewActivityLog'>;

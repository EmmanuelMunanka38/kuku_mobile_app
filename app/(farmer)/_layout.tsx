import { Stack } from 'expo-router';
import { colors } from '../../constants/colors';

export default function FarmerLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
        animation: 'slide_from_right',
      }}
    />
  );
}

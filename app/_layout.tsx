import { useFonts } from '@/hooks/useFonts';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { Text, View } from 'react-native';
import Colors from '@/constants/Colors';
import useColorScheme from '@/hooks/useColorScheme';
import { AuthProvider } from '@/contexts/AuthContext'; // ENABLED

export default function RootLayout() {
  const { fontsLoaded, fontError } = useFonts();
  useFrameworkReady();

  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];

  // Return null until fonts are loaded
  if (!fontsLoaded && !fontError) {
    return null;
  }

  // Show error loading fonts
  if (fontError) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <Text>Error loading fonts</Text>
      </View>
    );
  }

  return (
    <AuthProvider>
      <>
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.background },
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" options={{ title: 'Oops!' }} />
        </Stack>
      </>
    </AuthProvider>
  );
}

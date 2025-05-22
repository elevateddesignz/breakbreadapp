import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Image, Animated, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Text } from '@/components/ui/Text';
import useColorScheme from '@/hooks/useColorScheme';
import Colors from '@/constants/Colors';
import { SPACING } from '@/constants/Theme';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SplashScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(fadeAnim, {
      toValue: 1,
      friction: 5,
      useNativeDriver: true,
    }).start();

    async function checkAuth() {
      const token = await AsyncStorage.getItem('authToken');
      setTimeout(() => {
        if (token) {
          router.replace('/(tabs)');
        } else {
          router.replace('/(auth)/login');
        }
      }, 3200); // Faster for snappier UX
    }
    checkAuth();
  }, []);

  return (
    <LinearGradient
      colors={['#fff9ec', colors.background]} // brand cream to theme background
      style={styles.gradient}
    >
      <SafeAreaView style={styles.container}>
        <Animated.View style={[styles.center, { opacity: fadeAnim, transform: [{ scale: fadeAnim.interpolate({ inputRange: [0, 1], outputRange: [0.92, 1] }) }] }]}>
          <View style={styles.logoCircleOuter}>
            <View style={styles.logoCircleInner}>
              <Image
                source={require('@/assets/images/breakbread-logo.png')}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
          </View>
          <Text
            variant="h1"
            weight="bold"
            color={colors.tint}
            align="center"
            style={styles.title}
          >
            Break Bread
          </Text>
          <View style={styles.divider} />
          <Text
            variant="body"
            color={colors.muted}
            align="center"
            style={styles.tagline}
          >
            Lunch Together, Simplified.
          </Text>
          <ActivityIndicator
            size="small"
            color={colors.tint}
            style={styles.spinner}
          />
        </Animated.View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  center: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  logoCircleOuter: {
    width: 126,
    height: 126,
    borderRadius: 63,
    backgroundColor: '#FFF6DC',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
    shadowColor: '#ffd384',
    shadowOpacity: 0.22,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 32,
    elevation: 18,
  },
  logoCircleInner: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#f5c16c',
    shadowOpacity: 0.11,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 4,
  },
  logo: {
    width: 86,
    height: 86,
  },
  title: {
    marginTop: SPACING.lg,
    marginBottom: 4,
    fontSize: 34,
    letterSpacing: 1.5,
  },
  divider: {
    width: 48,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#FFE3B3',
    marginTop: 8,
    marginBottom: 12,
    opacity: 0.7,
  },
  tagline: {
    fontSize: 18,
    color: '#a39372',
    fontStyle: 'italic',
    marginBottom: 12,
  },
  spinner: {
    marginTop: SPACING.lg,
  },
});

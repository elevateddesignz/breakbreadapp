import React, { useState } from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity, Image, Alert } from 'react-native';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { router } from 'expo-router';
import { RADIUS, SPACING } from '@/constants/Theme';
import Colors from '@/constants/Colors';
import useColorScheme from '@/hooks/useColorScheme';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';

export default function LoginScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Missing Info', 'Enter both email and password.');
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      Alert.alert('Login Failed', error.message);
      return;
    }

    // Go directly to home tab
    router.replace('/(tabs)');
  };

  const handleSignUp = () => {
    router.push('/(auth)/register');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.headerContainer}>
        <Image
          source={{ uri: 'https://nbglrvsdimjtyibjwjgf.supabase.co/storage/v1/object/public/avatars/public/breadbreaking.png' }}
          style={styles.headerImage}
        />
        <View
          style={[
            styles.headerOverlay,
            {
              backgroundColor: colorScheme === 'dark'
                ? 'rgba(20,20,20,0.7)'
                : 'rgba(0,0,0,0.3)',
            },
          ]}
        />
        <View style={styles.logoContainer}>
          <Text variant="h1" weight="bold" color="#fff" style={styles.brandTitle}>
            Break Bread
          </Text>
          <Text variant="body" weight="medium" color="#fff">
            Welcome back!
          </Text>
        </View>
      </View>

      <View style={styles.formContainer}>
        <View style={styles.inputContainer}>
          <Mail size={20} color={colors.muted} style={styles.inputIcon} />
          <TextInput
            style={[
              styles.input,
              {
                color: colors.text,
                borderColor: colors.border,
                backgroundColor: colorScheme === 'dark' ? '#25262a' : '#fafbfc',
              },
            ]}
            placeholder="Email"
            placeholderTextColor={colors.muted}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />
        </View>

        <View style={styles.inputContainer}>
          <Lock size={20} color={colors.muted} style={styles.inputIcon} />
          <TextInput
            style={[
              styles.input,
              {
                color: colors.text,
                borderColor: colors.border,
                backgroundColor: colorScheme === 'dark' ? '#25262a' : '#fafbfc',
              },
            ]}
            placeholder="Password"
            placeholderTextColor={colors.muted}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            autoComplete="password"
          />
          <TouchableOpacity
            style={styles.passwordToggle}
            onPress={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <EyeOff size={20} color={colors.muted} />
            ) : (
              <Eye size={20} color={colors.muted} />
            )}
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.forgotPassword}>
          <Text
            variant="body-sm"
            color={colors.tint}
            weight="medium"
          >
            Forgot Password?
          </Text>
        </TouchableOpacity>

        <Button
          title="Log In"
          onPress={handleLogin}
          fullWidth
          loading={loading}
          style={styles.loginButton}
        />

        <View style={styles.divider}>
          <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
          <Text variant="body-sm" color={colors.muted} style={styles.dividerText}>
            OR
          </Text>
          <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
        </View>

        <Button
          title="Continue with Google"
          variant="outline"
          onPress={() => {}}
          fullWidth
          style={styles.socialButton}
        />

        <View style={styles.signupContainer}>
          <Text variant="body" color={colors.muted}>
            Don't have an account?
          </Text>
          <TouchableOpacity onPress={handleSignUp}>
            <Text
              variant="body"
              color={colors.tint}
              weight="medium"
              style={styles.signupText}
            >
              Sign Up
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerContainer: {
    height: 220,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
  },
  headerOverlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
  },
  logoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  brandTitle: {
    fontSize: 36,
    marginBottom: 4,
    letterSpacing: 2,
    textShadowColor: 'rgba(0,0,0,0.25)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 6,
  },
  formContainer: {
    flex: 1,
    padding: SPACING.lg,
    marginTop: -36,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
    position: 'relative',
  },
  inputIcon: {
    position: 'absolute',
    left: SPACING.sm,
    zIndex: 1,
  },
  input: {
    flex: 1,
    height: 48,
    borderWidth: 1.5,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.xl,
    fontSize: 16,
    shadowColor: 'rgba(0,0,0,0.03)',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 2,
  },
  passwordToggle: {
    position: 'absolute',
    right: SPACING.sm,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: SPACING.lg,
  },
  loginButton: {
    marginBottom: SPACING.lg,
    borderRadius: RADIUS.md,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1.5,
    opacity: 0.25,
  },
  dividerText: {
    marginHorizontal: SPACING.sm,
  },
  socialButton: {
    marginBottom: SPACING.lg,
    borderRadius: RADIUS.md,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: SPACING.lg,
  },
  signupText: {
    marginLeft: SPACING.xs,
    textDecorationLine: 'underline',
  },
});


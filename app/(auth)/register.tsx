import React, { useState } from 'react';
import {
  StyleSheet, View, TextInput, TouchableOpacity, Image, ScrollView, Alert
} from 'react-native';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { router } from 'expo-router';
import { RADIUS, SPACING } from '@/constants/Theme';
// 🟢 MAKE SURE THIS FILE EXISTS!
import Colors from '@/constants/Colors';
import useColorScheme from '@/hooks/useColorScheme';
import { Mail, Lock, User, Eye, EyeOff, ArrowLeft } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';


export default function RegisterScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    if (!fullName || !email || !password || !confirmPassword) {
      Alert.alert('Missing info', 'Please fill out all fields.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Passwords do not match', 'Please check your password.');
      return;
    }

    setLoading(true);

    // 1. Register user with Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
      },
    });

    if (error) {
      setLoading(false);
      Alert.alert('Registration Failed', error.message);
      return;
    }

    // 2. Defensive: Upsert user profile into `profiles` table
    const userId = data?.user?.id;
    if (userId) {
      const { error: profileError } = await supabase.from('profiles').upsert([
        {
          id: userId,            // UUID (auth UID)
          full_name: fullName,   // Must match your column!
          email: email,          // Must match your column!
        }
      ]);
      if (profileError) {
        setLoading(false);
        Alert.alert(
          'Profile Creation Failed',
          profileError.message || 'Profile error'
        );
        return;
      }
    }

    setLoading(false);
    Alert.alert(
      'Check your email',
      'A verification link was sent to your email. Please verify your email before logging in.'
    );
    router.replace('/(auth)/login');
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.contentContainer}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.headerContainer}>
        <Image
          source={{ uri: 'https://images.pexels.com/photos/5053998/pexels-photo-5053998.jpeg' }}
          style={styles.headerImage}
        />
        <View style={[styles.headerOverlay, { backgroundColor: colors.overlay }]} />
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.logoContainer}>
          <Text variant="h1" weight="bold" color="#fff">
            Break Bread
          </Text>
          <Text variant="body" weight="medium" color="#fff">
            Create an account
          </Text>
        </View>
      </View>
      <View style={styles.formContainer}>
        <View style={styles.inputContainer}>
          <User size={20} color={colors.muted} style={styles.inputIcon} />
          <TextInput
            style={[
              styles.input,
              { color: colors.text, borderColor: colors.border },
            ]}
            placeholder="Full Name"
            placeholderTextColor={colors.muted}
            value={fullName}
            onChangeText={setFullName}
          />
        </View>
        <View style={styles.inputContainer}>
          <Mail size={20} color={colors.muted} style={styles.inputIcon} />
          <TextInput
            style={[
              styles.input,
              { color: colors.text, borderColor: colors.border },
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
              { color: colors.text, borderColor: colors.border },
            ]}
            placeholder="Password"
            placeholderTextColor={colors.muted}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            autoComplete="new-password"
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
        <View style={styles.inputContainer}>
          <Lock size={20} color={colors.muted} style={styles.inputIcon} />
          <TextInput
            style={[
              styles.input,
              { color: colors.text, borderColor: colors.border },
            ]}
            placeholder="Confirm Password"
            placeholderTextColor={colors.muted}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showConfirmPassword}
            autoComplete="new-password"
          />
          <TouchableOpacity
            style={styles.passwordToggle}
            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            {showConfirmPassword ? (
              <EyeOff size={20} color={colors.muted} />
            ) : (
              <Eye size={20} color={colors.muted} />
            )}
          </TouchableOpacity>
        </View>
        <Button
          title="Sign Up"
          onPress={handleSignUp}
          fullWidth
          loading={loading}
          style={styles.signupButton}
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
        <View style={styles.loginContainer}>
          <Text variant="body" color={colors.muted}>
            Already have an account?
          </Text>
          <TouchableOpacity onPress={() => router.replace('/(auth)/login')}>
            <Text
              variant="body"
              color={colors.tint}
              weight="medium"
              style={styles.loginText}
            >
              Log In
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  contentContainer: { flexGrow: 1 },
  headerContainer: { height: 200, position: 'relative' },
  headerImage: { width: '100%', height: '100%', position: 'absolute' },
  headerOverlay: { position: 'absolute', width: '100%', height: '100%' },
  backButton: { position: 'absolute', top: SPACING.lg, left: SPACING.md, zIndex: 10 },
  logoContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  formContainer: { flex: 1, padding: SPACING.lg },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
    position: 'relative',
  },
  inputIcon: { position: 'absolute', left: SPACING.sm, zIndex: 1 },
  input: {
    flex: 1,
    height: 50,
    borderWidth: 1,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.xl,
    fontSize: 16,
  },
  passwordToggle: { position: 'absolute', right: SPACING.sm },
  signupButton: { marginTop: SPACING.sm, marginBottom: SPACING.lg },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: SPACING.lg },
  dividerLine: { flex: 1, height: 1 },
  dividerText: { marginHorizontal: SPACING.sm },
  socialButton: { marginBottom: SPACING.lg },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  loginText: { marginLeft: SPACING.xs },
});

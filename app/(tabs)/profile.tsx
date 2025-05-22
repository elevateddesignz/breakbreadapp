import React, { useEffect, useState } from 'react';
import {
  StyleSheet, View, TouchableOpacity, ScrollView, Image, Switch, ActivityIndicator, Alert, Modal, TextInput
} from 'react-native';
import { Text } from '@/components/ui/Text';
import { Card } from '@/components/ui/Card';
import { SPACING, RADIUS } from '@/constants/Theme';
import Colors from '@/constants/Colors';
import useColorScheme from '@/hooks/useColorScheme';
import {
  User, CreditCard, Bell, MessageSquare, Heart, CircleHelp as HelpCircle, ChevronRight, Settings, LogOut, Edit
} from 'lucide-react-native';
import { supabase } from '@/lib/supabase';

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const [notifications, setNotifications] = React.useState(true);

  // 👇 Profile/user state
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [editFullName, setEditFullName] = useState('');
  const [editAvatar, setEditAvatar] = useState('');
  const [saving, setSaving] = useState(false);

  // Fetch profile on mount
  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);

      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        setError('User not logged in');
        setLoading(false);
        return;
      }

      const { data, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) {
        setError('Profile not found.');
        setLoading(false);
        return;
      }

      setProfile({
        ...data,
        email: user.email, // fallback to Auth email
      });
      setLoading(false);
    })();
  }, []);

  // Open edit modal and fill with current info
  const openEditModal = () => {
    setEditFullName(profile?.full_name || '');
    setEditAvatar(profile?.avatar_url || '');
    setEditing(true);
  };

  // Save changes
  const handleSaveProfile = async () => {
    if (!editFullName) {
      Alert.alert('Full name required');
      return;
    }
    setSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({ full_name: editFullName, avatar_url: editAvatar })
      .eq('id', profile.id);

    setSaving(false);

    if (error) {
      Alert.alert('Error', error.message);
      return;
    }

    setProfile({ ...profile, full_name: editFullName, avatar_url: editAvatar });
    setEditing(false);
    Alert.alert('Success', 'Profile updated!');
  };

  // Logout handler
  const handleLogout = async () => {
    await supabase.auth.signOut();
    Alert.alert('Logged Out', 'You have been logged out.');
    // You may want to navigate to login here!
  };

  // Render
  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.tint} size="large" />
      </View>
    );
  }
  if (error) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <Text color={colors.error} align="center">
          {error}
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Edit Modal */}
      <Modal
        visible={editing}
        animationType="slide"
        transparent
        onRequestClose={() => setEditing(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <Text variant="h3" weight="bold" style={{ marginBottom: 20 }}>
              Edit Profile
            </Text>
            <Text variant="body">Full Name</Text>
            <TextInput
              value={editFullName}
              onChangeText={setEditFullName}
              style={[styles.input, { color: colors.text, borderColor: colors.border }]}
              placeholder="Full Name"
              placeholderTextColor={colors.muted}
            />
            <Text variant="body" style={{ marginTop: 10 }}>Avatar URL</Text>
            <TextInput
              value={editAvatar}
              onChangeText={setEditAvatar}
              style={[styles.input, { color: colors.text, borderColor: colors.border }]}
              placeholder="Avatar URL"
              placeholderTextColor={colors.muted}
            />
            <View style={{ flexDirection: 'row', marginTop: 24 }}>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: colors.primaryLight, marginRight: 10 }]}
                onPress={handleSaveProfile}
                disabled={saving}
              >
                <Text variant="body" weight="bold" color={colors.tint}>
                  {saving ? 'Saving...' : 'Save'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: colors.error }]}
                onPress={() => setEditing(false)}
              >
                <Text variant="body" weight="bold" color="#fff">
                  Cancel
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Main Content */}
      <View style={styles.header}>
        <Text variant="h3" weight="bold">
          Profile
        </Text>
        <TouchableOpacity>
          <Settings size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.profileHeader}>
          <Image
            source={{ uri: profile?.avatar_url || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(profile?.full_name || profile?.email || 'User') }}
            style={styles.profileImage}
          />
          <View style={styles.profileInfo}>
            <Text variant="h3" weight="bold">
              {profile?.full_name || 'No Name'}
            </Text>
            <Text variant="body" color={colors.muted}>
              {profile?.email}
            </Text>
            <TouchableOpacity
              style={[
                styles.editButton,
                { backgroundColor: colors.primaryLight }
              ]}
              onPress={openEditModal}
            >
              <Text variant="body-sm" weight="medium" color={colors.tint}>
                Edit Profile
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        {/* ...Rest of your UI, stats, menu, etc. unchanged... */}
        <Card style={styles.statsCard}>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text variant="h3" weight="bold" color={colors.tint}>
                {profile?.orders_created ?? 0}
              </Text>
              <Text variant="body-sm" color={colors.muted}>
                Orders Created
              </Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
            <View style={styles.statItem}>
              <Text variant="h3" weight="bold" color={colors.tint}>
                {profile?.reward_points ?? 0}
              </Text>
              <Text variant="body-sm" color={colors.muted}>
                Reward Points
              </Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
            <View style={styles.statItem}>
              <Text variant="h3" weight="bold" color={colors.tint}>
                {profile?.active_groups ?? 0}
              </Text>
              <Text variant="body-sm" color={colors.muted}>
                Active Groups
              </Text>
            </View>
          </View>
        </Card>
        {/* ...other menu/settings sections (unchanged)... */}
        <TouchableOpacity
          style={[
            styles.logoutButton,
            { borderColor: colors.error }
          ]}
          onPress={handleLogout}
        >
          <LogOut size={20} color={colors.error} />
          <Text
            variant="body"
            weight="medium"
            color={colors.error}
            style={styles.logoutText}
          >
            Log Out
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.md,
  },
  scrollContent: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.xxl },
  profileHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.lg },
  profileImage: { width: 80, height: 80, borderRadius: 40 },
  profileInfo: { marginLeft: SPACING.md, flex: 1 },
  editButton: { alignSelf: 'flex-start', paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs, borderRadius: RADIUS.full, marginTop: SPACING.xs },
  statsCard: { marginBottom: SPACING.lg },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  statItem: { flex: 1, alignItems: 'center' },
  statDivider: { width: 1, height: '100%' },
  section: { marginBottom: SPACING.lg },
  sectionTitle: { marginBottom: SPACING.sm },
  menuCard: { overflow: 'hidden' },
  menuItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: SPACING.md },
  menuItemLeft: { flexDirection: 'row', alignItems: 'center' },
  menuIcon: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginRight: SPACING.md },
  menuDivider: { height: 1, width: '100%' },
  logoutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: SPACING.md, borderRadius: RADIUS.md, borderWidth: 1, marginBottom: SPACING.xl },
  logoutText: { marginLeft: SPACING.xs },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.25)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '90%', borderRadius: RADIUS.lg, padding: 24, alignItems: 'stretch' },
  input: { borderWidth: 1, borderRadius: RADIUS.md, paddingHorizontal: 16, paddingVertical: 10, fontSize: 16, marginTop: 6 },
  modalBtn: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: RADIUS.md }
});

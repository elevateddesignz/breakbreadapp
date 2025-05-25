import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView, Alert, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Card } from '@/components/ui/Card';
import { Trash, LogOut, Copy, Home, List } from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';
import { supabase } from '@/lib/supabase';
import Colors from '@/constants/Colors';
import { SPACING, RADIUS } from '@/constants/Theme';
import useColorScheme from '@/hooks/useColorScheme';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

type TableRow = {
  id: string;
  name: string;
  invite_code: string;
  created_at: string;
  creator_id: string;
  lastorder?: string;
  image?: string | null;
  image_filename?: string | null;
};

export default function TableDetailsScreen() {
  const { id: tableId, tableJson } = useLocalSearchParams<{ id?: string; tableJson?: string }>();
  const [table, setTable] = useState<TableRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState<any[]>([]);
  const [creatorName, setCreatorName] = useState<string | null>(null);
  const [fetchingMembers, setFetchingMembers] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // Load current user
  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      setUserId(data?.user?.id ?? null);
    })();
  }, []);

  // Fetch table and members
  useEffect(() => {
    let parsed = null;
    if (tableJson) {
      try { parsed = JSON.parse(tableJson); } catch {}
    }
    if (parsed) {
      setTable(parsed);
      setLoading(false);
      fetchCreatorName(parsed.creator_id);
    } else {
      fetchTable();
    }
    fetchMembers();
    // eslint-disable-next-line
  }, [tableId, tableJson]);

  // Updated: Use maybeSingle() to avoid "json object requested" errors
  async function fetchTable() {
    if (!tableId) {
      setTable(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from('tables')
      .select('*')
      .eq('id', tableId)
      .maybeSingle();
    if (error) {
      Alert.alert('Error', error.message);
      setLoading(false);
    } else {
      setTable(data);
      setLoading(false);
      if (data?.creator_id) fetchCreatorName(data.creator_id);
    }
  }

  async function fetchMembers() {
    setFetchingMembers(true);
    const { data, error } = await supabase
      .from('table_members')
      .select('id, user_id, username, joined_at')
      .eq('table_id', tableId);
    if (!error && data) setMembers(data);
    setFetchingMembers(false);
  }

  // GET THE CREATOR FULL NAME from profiles
  async function fetchCreatorName(creatorId: string) {
    const { data } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', creatorId)
      .maybeSingle();
    setCreatorName(data?.full_name || 'Creator');
  }

  async function handleCopyCode() {
    if (table?.invite_code) {
      await Clipboard.setStringAsync(table.invite_code);
      Alert.alert('Copied', 'Invite code copied to clipboard!');
    }
  }

  async function handleLeaveTable() {
    if (!userId) return;
    Alert.alert('Leave Table', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Leave', style: 'destructive', onPress: async () => {
        await supabase.from('table_members').delete().match({ table_id: tableId, user_id: userId });
        router.replace('/groups');
      }},
    ]);
  }

  async function handleDeleteTable() {
    Alert.alert('Delete Table', 'Are you sure you want to delete this table?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        const { error } = await supabase.from('tables').delete().eq('id', tableId);
        if (!error) router.replace('/groups');
        else Alert.alert('Error', error.message);
      }},
    ]);
  }

  // Combine creator as member (always first)
  const memberRows = (() => {
    if (!table) return [];
    // Creator as member
    const creatorRow = {
      id: 'creator',
      user_id: table.creator_id,
      username: creatorName ? creatorName : 'Table Creator',
      joined_at: table.created_at,
      isCreator: true,
    };
    // Filter out duplicate if creator_id already in members
    const memberList = members.filter(m => m.user_id !== table.creator_id);
    return [creatorRow, ...memberList];
  })();

  if (loading) return (
    <View style={styles.center}><ActivityIndicator size="large" color={colors.tint} /></View>
  );

  if (!table) return (
    <View style={styles.center}><Text style={{ color: colors.text }}>Table not found.</Text></View>
  );

  const isCreator = userId === table.creator_id;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingTop: insets.top + 8,
          paddingBottom: insets.bottom + 130,
          minHeight: '100%',
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Card style={[styles.card, { backgroundColor: colors.card }]}>
          {table.image ? (
            <Image
              source={{ uri: table.image }}
              style={styles.image}
              resizeMode="cover"
            />
          ) : (
            <View style={[
              styles.image,
              { backgroundColor: colors.muted, alignItems: 'center', justifyContent: 'center' }
            ]}>
              <Text style={{ color: colors.text }}>No Image</Text>
            </View>
          )}
          <Text style={[styles.name, { color: colors.text }]}>{table.name}</Text>
          <Text style={[styles.subText, { color: colors.muted }]}>
            Created: {new Date(table.created_at).toLocaleString()}
          </Text>
          <View style={styles.row}>
            <Text style={[styles.label, { color: colors.text }]}>Invite Code:</Text>
            <Text selectable style={[styles.code, { color: colors.text }]}>{table.invite_code}</Text>
            <TouchableOpacity onPress={handleCopyCode}>
              <Copy size={20} color={colors.tint} />
            </TouchableOpacity>
          </View>
          {table.lastorder && (
            <View style={{ marginTop: 8 }}>
              <Text style={[styles.label, { color: colors.text }]}>Last Order:</Text>
              <Text style={[styles.value, { color: colors.text }]}>{table.lastorder}</Text>
            </View>
          )}
        </Card>

        <Card style={[styles.card, { backgroundColor: colors.card }]}>
          <Text style={[styles.label, { marginBottom: 8, color: colors.text }]}>Members</Text>
          {fetchingMembers ? <ActivityIndicator color={colors.tint} /> : (
            memberRows.length > 0 ? memberRows.map(m => (
              <View key={m.id + m.user_id} style={styles.memberRow}>
                <Text style={{
                  fontWeight: '500',
                  color: m.isCreator ? colors.tint : colors.text,
                  flexShrink: 1,
                }}>
                  {m.isCreator ? '👑 ' : ''}
                  {m.username || m.user_id}
                </Text>
                <Text style={{ color: colors.muted, fontSize: 12 }}>
                  {new Date(m.joined_at).toLocaleDateString()}
                </Text>
              </View>
            )) : <Text style={{ color: colors.muted }}>No members yet.</Text>
          )}
        </Card>

        <View style={[styles.actions, { marginBottom: 36 }]}>
          {/* Show "Leave Table" ONLY IF the user is NOT the creator */}
          {!isCreator && (
            <TouchableOpacity style={[styles.button, { backgroundColor: colors.warning }]} onPress={handleLeaveTable}>
              <LogOut size={20} color="#fff" />
              <Text style={[styles.btnText, { color: '#fff' }]}>Leave Table</Text>
            </TouchableOpacity>
          )}
          {/* Only the creator can see the Delete button */}
          {isCreator && (
            <TouchableOpacity style={[styles.button, { backgroundColor: colors.error }]} onPress={handleDeleteTable}>
              <Trash size={20} color="#fff" />
              <Text style={[styles.btnText, { color: '#fff' }]}>Delete Table</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {/* Bottom Nav Links */}
      <View style={[
        styles.bottomNav,
        {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          paddingBottom: insets.bottom > 0 ? insets.bottom : 12,
        }
      ]}>
        <TouchableOpacity style={styles.navLink} onPress={() => router.navigate('/groups')}>
          <Home size={24} color={colors.tint} />
          <Text style={{ color: colors.tint, fontWeight: 'bold', marginTop: 2 }}>Tables</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navLink} onPress={() => router.replace('/orders')}>
          <List size={24} color={colors.tint} />
          <Text style={{ color: colors.tint, fontWeight: 'bold', marginTop: 2 }}>Orders</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: SPACING,
    marginTop: SPACING,
    marginBottom: SPACING / 2,
    borderRadius: RADIUS * 2,
    padding: SPACING + 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 160,
    borderRadius: RADIUS * 2,
    marginBottom: SPACING,
    overflow: 'hidden',
  },
  name: { fontSize: 24, fontWeight: 'bold', marginBottom: 8 },
  subText: { fontSize: 12, marginBottom: 8 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' },
  label: { fontSize: 16, fontWeight: '500', marginRight: 6 },
  code: { fontSize: 16, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', marginRight: 6, maxWidth: '60%' },
  value: { fontSize: 15, marginBottom: 2 },
  memberRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderColor: '#f0f0f0',
    minHeight: 34,
  },
  actions: {
    marginHorizontal: SPACING,
    marginTop: 12,
    gap: 12,
    marginBottom: 24,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: RADIUS,
    marginBottom: 8,
    justifyContent: 'center',
  },
  btnText: { marginLeft: 8, fontWeight: 'bold', fontSize: 15 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  bottomNav: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingVertical: 12,
    justifyContent: 'space-around',
    alignItems: 'center',
    zIndex: 999,
    minHeight: 60,
    // SafeArea padding applied dynamically
  },
  navLink: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    minHeight: 44,
  },
});

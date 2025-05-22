import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Text } from '@/components/ui/Text';
import { Card } from '@/components/ui/Card';
import { SPACING, RADIUS } from '@/constants/Theme';
import Colors from '@/constants/Colors';
import useColorScheme from '@/hooks/useColorScheme';
import { Plus, Clock, Trash, LogOut } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';

type TableRow = {
  id: string;
  name: string;
  invite_code: string;
  created_at: string;
  creator_id: string;
  lastorder?: string;
  image?: string;
};

function generateInviteCode(length = 6) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export default function GroupsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];

  // Auth state and loading state for user
  const [userId, setUserId] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      setUserId(data?.user?.id ?? null);
      setAuthLoading(false);
    })();
  }, []);

  const [tables, setTables] = useState<TableRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal for creating table
  const [modalVisible, setModalVisible] = useState(false);
  const [newTableName, setNewTableName] = useState('');

  // Fetch tables on mount
  useEffect(() => {
    (async () => {
      try {
        const { data, error } = await supabase
          .from('tables')
          .select('*')
          .order('created_at', { ascending: false });
        if (error) throw error;
        setTables(data || []);
      } catch (e: any) {
        setError(e.message || 'Could not load tables.');
      }
      setLoading(false);
    })();
  }, []);

  // Open modal
  const openCreateTableModal = () => {
    setNewTableName('');
    setError(null);
    setModalVisible(true);
  };

  // Add new table row (with creator_id)
  const handleCreateTable = async () => {
    if (!newTableName.trim()) {
      setError('Table name cannot be empty.');
      return;
    }
    if (!userId || userId === '') {
      setError('You must be logged in to create a table.');
      return;
    }
    setLoading(true);
    setError(null);
    const newTable = {
      name: newTableName.trim(),
      invite_code: generateInviteCode(),
      image: 'https://via.placeholder.com/600x120.png?text=Table+Image',
      lastorder: null,
      creator_id: userId,
    };
    const { data, error } = await supabase
      .from('tables')
      .insert([newTable])
      .select('*');
    if (error) {
      setError(error.message || 'Could not create table.');
    } else if (data && data.length > 0) {
      setTables((prev) => [data[0], ...prev]);
      setModalVisible(false);
    }
    setLoading(false);
  };

  // Delete table (only for creator)
  const handleDeleteTable = async (tableId: string) => {
    Alert.alert(
      'Delete Table',
      'Are you sure you want to delete this table?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete', style: 'destructive', onPress: async () => {
            setLoading(true);
            const { error } = await supabase.from('tables').delete().eq('id', tableId);
            if (!error) {
              setTables((prev) => prev.filter((t) => t.id !== tableId));
            }
            setLoading(false);
          }
        }
      ]
    );
  };

  // Leave table (assumes table_members exists)
  const handleLeaveTable = async (tableId: string) => {
    setLoading(true);
    if (!userId) {
      setError('User not authenticated.');
      setLoading(false);
      return;
    }
    const { error } = await supabase
      .from('table_members')
      .delete()
      .match({ table_id: tableId, user_id: userId });
    if (!error) {
      setTables((prev) => prev.filter((t) => t.id !== tableId));
    }
    setLoading(false);
  };

  // Placeholder handlers
  const handleCreateOrder = (tableId: string) => {};
  const handleViewTable = (tableId: string) => {};

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Modal for New Table */}
      {modalVisible && (
        <View style={[styles.modalOverlay, { backgroundColor: colors.modalOverlay || 'rgba(0,0,0,0.7)' }]}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
          >
            <View style={[
              styles.modalContent,
              {
                backgroundColor: colors.card,
                borderColor: colors.border
              }
            ]}>
              <Text variant="h4" weight="bold" style={{ marginBottom: 16, color: colors.text }}>New Table</Text>
              <Text variant="body" style={{ marginBottom: 8, color: colors.text }}>Enter table name:</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={[
                    styles.input,
                    {
                      color: colors.text,
                      borderColor: colors.border,
                      backgroundColor: colors.inputBackground || colors.background,
                    }
                  ]}
                  value={newTableName}
                  onChangeText={setNewTableName}
                  placeholder="e.g., Pizza Crew"
                  placeholderTextColor={colors.muted}
                  autoFocus
                />
              </View>
              {error && <Text color={colors.error || 'red'} style={{ marginBottom: 8 }}>{error}</Text>}
              <View style={{ flexDirection: 'row', gap: 16 }}>
                <TouchableOpacity
                  style={[styles.groupButton, { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1, flex: 1 }]}
                  onPress={() => setModalVisible(false)}
                >
                  <Text variant="body-sm" weight="medium" color={colors.tint}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.groupButton, { backgroundColor: colors.tint, flex: 1 }]}
                  onPress={handleCreateTable}
                  disabled={!userId || authLoading}
                >
                  <Text variant="body-sm" weight="medium" color={colors.card}>Create</Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      )}

      <View style={styles.header}>
        <Text variant="h3" weight="bold" style={{ color: colors.text }}>
          Your Tables
        </Text>
        <TouchableOpacity
          style={[styles.createButton, { backgroundColor: colors.tint }]}
          onPress={openCreateTableModal}
          disabled={!userId || authLoading}
        >
          <Plus size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {(loading || authLoading) ? (
          <View style={{ padding: SPACING.xl }}>
            <ActivityIndicator size="large" color={colors.tint} />
          </View>
        ) : error ? (
          <View style={{ padding: SPACING.xl }}>
            <Text color={colors.error || 'red'} align="center">{error}</Text>
          </View>
        ) : tables.length === 0 ? (
          <Card style={{ alignItems: 'center', marginBottom: SPACING.lg, backgroundColor: colors.card }}>
            <Text style={{ color: colors.text }}>No tables found. Tap "Create New Table" below!</Text>
          </Card>
        ) : (
          tables.map((table) => (
            <TouchableOpacity
              key={table.id}
              activeOpacity={0.9}
              style={styles.touchable}
              onPress={() => handleViewTable(table.id)}
            >
              <Card padding={false} style={[styles.groupCard, { backgroundColor: colors.card }]}>
                <Image
                  source={{
                    uri: table.image || 'https://via.placeholder.com/600x120.png?text=Table',
                  }}
                  style={styles.groupImage}
                  resizeMode="cover"
                />
                <View style={styles.groupContent}>
                  <Text variant="h4" weight="bold" style={{ color: colors.text }}>
                    {table.name}
                  </Text>
                  <Text
                    variant="body-sm"
                    color={colors.muted}
                    style={{ marginTop: 6, marginBottom: 2 }}
                  >
                    Invite Code: {table.invite_code}
                  </Text>
                  <Text
                    variant="body-sm"
                    color={colors.muted}
                  >
                    Created: {new Date(table.created_at).toLocaleString()}
                  </Text>
                  <View style={styles.detailRow}>
                    <Clock size={16} color={colors.muted} />
                    <Text
                      variant="body-sm"
                      color={colors.muted}
                      style={styles.detailText}
                    >
                      Last order: {table.lastorder || 'None'}
                    </Text>
                  </View>
                  <View style={[styles.buttonRow, { marginTop: 12 }]}>
                    <TouchableOpacity
                      style={[
                        styles.groupButton,
                        { backgroundColor: colors.tint },
                      ]}
                      onPress={() => handleCreateOrder(table.id)}
                    >
                      <Text variant="body-sm" weight="medium" color={colors.card}>
                        Create Order
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.groupButton,
                        styles.secondaryButton,
                        { backgroundColor: colors.primaryLight },
                      ]}
                      onPress={() => handleViewTable(table.id)}
                    >
                      <Text
                        variant="body-sm"
                        weight="medium"
                        color={colors.tint}
                      >
                        View Table
                      </Text>
                    </TouchableOpacity>
                    {table.creator_id === userId ? (
                      <TouchableOpacity
                        style={[
                          styles.groupButton,
                          { backgroundColor: colors.error || '#e74c3c', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
                        ]}
                        onPress={() => handleDeleteTable(table.id)}
                      >
                        <Trash size={18} color="#fff" />
                        <Text
                          variant="body-sm"
                          weight="medium"
                          color="#fff"
                          style={{ marginLeft: 4 }}
                        >
                          Delete
                        </Text>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        style={[
                          styles.groupButton,
                          { backgroundColor: colors.warning || '#f39c12', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
                        ]}
                        onPress={() => handleLeaveTable(table.id)}
                      >
                        <LogOut size={18} color="#fff" />
                        <Text
                          variant="body-sm"
                          weight="medium"
                          color="#fff"
                          style={{ marginLeft: 4 }}
                        >
                          Leave
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </Card>
            </TouchableOpacity>
          ))
        )}

        <TouchableOpacity
          style={[
            styles.createGroupCard,
            { borderColor: colors.border },
          ]}
          onPress={openCreateTableModal}
          disabled={!userId || authLoading}
        >
          <Plus size={36} color={colors.tint} />
          <Text
            variant="body"
            weight="medium"
            color={colors.tint}
            style={styles.createGroupText}
          >
            Create New Table
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
  createButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  groupCard: {
    marginBottom: SPACING.md,
    overflow: 'hidden',
  },
  groupImage: {
    width: '100%',
    height: 120,
    backgroundColor: '#eee',
  },
  groupContent: {
    padding: SPACING.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  detailText: {
    marginLeft: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.xs,
    gap: 12,
  },
  groupButton: {
    flex: 0.48,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  createGroupCard: {
    height: 120,
    borderRadius: RADIUS.md,
    borderWidth: 2,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    marginTop: SPACING.md,
  },
  createGroupText: {
    marginTop: SPACING.sm,
  },
  touchable: {
    width: '100%',
  },
  // MODAL STYLES BELOW
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  modalContent: {
    width: '80%',
    borderRadius: 16,
    padding: 24,
    alignItems: 'stretch',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 8,
  },
  inputWrapper: {
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
});

import React, { useEffect, useState } from 'react';
import {
  StyleSheet, View, TouchableOpacity, ScrollView, Image, ActivityIndicator, Alert, Modal, TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Text } from '@/components/ui/Text';
import { Card } from '@/components/ui/Card';
import { SPACING, RADIUS } from '@/constants/Theme';
import Colors from '@/constants/Colors';
import useColorScheme from '@/hooks/useColorScheme';
import {
  Plus, Clock, Trash, LogOut, Edit3 as EditIcon, Users as UsersIcon, Image as ImageIcon,
} from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';

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

function generateInviteCode(length = 6) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

async function uploadImage(imageUri: string, userId: string): Promise<{ publicUrl: string; fileName: string }> {
  const ext = imageUri.split('.').pop() || 'jpg';
  const fileName = `banner_${userId}_${Date.now()}.${ext}`;
  let contentType = 'image/jpeg';
  if (imageUri.toLowerCase().endsWith('.png')) contentType = 'image/png';
  if (imageUri.toLowerCase().endsWith('.webp')) contentType = 'image/webp';

  const { data, error } = await supabase.storage.from('tables').createSignedUploadUrl(fileName);
  if (error) throw new Error(error.message);

  const uploadRes = await FileSystem.uploadAsync(data.signedUrl, imageUri, {
    httpMethod: 'PUT',
    headers: { 'Content-Type': contentType },
    uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
  });

  if (uploadRes.status !== 200) throw new Error('Failed to upload image. Try again.');

  const { data: urlData } = supabase.storage.from('tables').getPublicUrl(fileName);
  return { publicUrl: urlData?.publicUrl, fileName };
}

async function removeImageFromStorage(fileName: string) {
  if (!fileName) return;
  try {
    await supabase.storage.from('tables').remove([fileName]);
  } catch (err) {
    console.warn('Error deleting image:', err);
  }
}

function getTableImageUrl(table: TableRow) {
  return table.image && table.image.startsWith('http')
    ? table.image
    : 'https://nbglrvsdimjtyibjwjgf.supabase.co/storage/v1/object/public/tables/ChatGPT%20Image%20May%2023,%202025,%2010_51_20%20PM.png';
}

export default function GroupsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const router = useRouter();

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

  // Modal states for Create
  const [modalVisible, setModalVisible] = useState(false);
  const [newTableName, setNewTableName] = useState('');
  const [bannerImage, setBannerImage] = useState<string | null>(null);
  const [bannerUploading, setBannerUploading] = useState(false);

  // Modal states for Edit
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editTableId, setEditTableId] = useState<string | null>(null);
  const [editTableName, setEditTableName] = useState('');
  const [editBannerImage, setEditBannerImage] = useState<string | null>(null);
  const [editBannerUploading, setEditBannerUploading] = useState(false);
  const [editTableOldFilename, setEditTableOldFilename] = useState<string | null>(null);

  async function fetchTables() {
    setLoading(true);
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
  }

  useEffect(() => {
    fetchTables();
  }, []);

  const openCreateTableModal = () => {
    setNewTableName('');
    setBannerImage(null);
    setError(null);
    setBannerUploading(false);
    setModalVisible(true);
  };

  const handlePickBanner = async (setter: (val: string) => void) => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('Permission required', 'Please grant access to photos.');
        return;
      }
      const pickerResult = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [3, 1],
        quality: 0.9,
        base64: false,
      });
      if (pickerResult.canceled || !pickerResult.assets?.length) return;
      setter(pickerResult.assets[0].uri);
    } catch (err) {
      Alert.alert('Image picker error', String(err));
    }
  };

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

    let imageUrl: string | undefined = undefined;
    let imageFilename: string | undefined = undefined;
    if (bannerImage) {
      try {
        setBannerUploading(true);
        const { publicUrl, fileName } = await uploadImage(bannerImage, userId);
        imageUrl = publicUrl;
        imageFilename = fileName;
      } catch (err: any) {
        setError(err.message || 'Banner upload failed.');
        setBannerUploading(false);
        setLoading(false);
        return;
      }
      setBannerUploading(false);
    } else {
      // Set default image if none uploaded
      imageUrl = 'https://nbglrvsdimjtyibjwjgf.supabase.co/storage/v1/object/public/tables/ChatGPT%20Image%20May%2023,%202025,%2010_51_20%20PM.png';
      imageFilename = null;
    }

    const newTable = {
      name: newTableName.trim(),
      invite_code: generateInviteCode(),
      image: imageUrl ?? null,
      image_filename: imageFilename ?? null,
      lastorder: null,
      creator_id: userId,
    };

    const { error } = await supabase.from('tables').insert([newTable]);
    if (error) {
      setError(error.message || 'Could not create table.');
    } else {
      await fetchTables();
      setModalVisible(false);
    }
    setLoading(false);
  };

  const openEditTableModal = (table: TableRow) => {
    setEditTableId(table.id);
    setEditTableName(table.name);
    setEditBannerImage(table.image || null);
    setEditTableOldFilename(table.image_filename || null);
    setEditModalVisible(true);
    setError(null);
    setEditBannerUploading(false);
  };

  const handleEditTable = async () => {
    if (!editTableName.trim()) {
      setError('Table name cannot be empty.');
      return;
    }
    setLoading(true);
    setError(null);

    let imageUrl: string | undefined = editBannerImage || undefined;
    let imageFilename: string | undefined = editTableOldFilename || undefined;
    let newFileName: string | undefined = undefined;
    let uploaded = false;

    if (editBannerImage && editBannerImage.startsWith('file://')) {
      try {
        setEditBannerUploading(true);
        const { publicUrl, fileName } = await uploadImage(editBannerImage, userId!);
        imageUrl = publicUrl;
        imageFilename = fileName;
        newFileName = fileName;
        uploaded = true;
      } catch (err: any) {
        setError(err.message || 'Banner upload failed.');
        setEditBannerUploading(false);
        setLoading(false);
        return;
      }
      setEditBannerUploading(false);
    }

    // If user removed banner, set default image
    if (!editBannerImage) {
      imageUrl = 'https://nbglrvsdimjtyibjwjgf.supabase.co/storage/v1/object/public/tables/ChatGPT%20Image%20May%2023,%202025,%2010_51_20%20PM.png';
      imageFilename = null;
    }

    const { error } = await supabase
      .from('tables')
      .update({ name: editTableName.trim(), image: imageUrl, image_filename: imageFilename })
      .eq('id', editTableId);

    if (error) {
      setError(error.message || 'Could not update table.');
      setLoading(false);
      return;
    }

    if (
      uploaded &&
      editTableOldFilename &&
      editTableOldFilename !== newFileName
    ) {
      await removeImageFromStorage(editTableOldFilename);
    }

    await fetchTables();
    setEditModalVisible(false);
    setLoading(false);
  };

  const handleDeleteTable = async (tableId: string, imageFilename?: string | null) => {
    Alert.alert(
      'Delete Table',
      'Are you sure you want to delete this table?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete', style: 'destructive', onPress: async () => {
            setLoading(true);
            const { error } = await supabase.from('tables').delete().eq('id', tableId);
            if (!error && imageFilename) {
              await removeImageFromStorage(imageFilename);
              await fetchTables();
            }
            setLoading(false);
          }
        }
      ]
    );
  };

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
      await fetchTables();
    }
    setLoading(false);
  };

  // --- Render UI
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>

      {/* ---------- CREATE TABLE MODAL ---------- */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <Text style={{ fontWeight: 'bold', fontSize: 20, marginBottom: 14, color: colors.text }}>Create Table</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={[styles.input, { color: colors.text, borderColor: colors.border }]}
                placeholder="Table name"
                placeholderTextColor={colors.muted}
                value={newTableName}
                onChangeText={setNewTableName}
                autoFocus
              />
            </View>
            <View style={{ alignItems: 'center' }}>
              <TouchableOpacity
                style={styles.bannerUploadButton}
                onPress={() => handlePickBanner(setBannerImage)}
              >
                <ImageIcon size={20} color={colors.tint} />
                <Text style={{ color: colors.tint, marginLeft: 6 }}>Pick Banner</Text>
              </TouchableOpacity>
              <View style={{ minHeight: 80, marginVertical: 8 }}>
                {bannerImage ? (
                  <Image source={{ uri: bannerImage }} style={{ width: 160, height: 80, borderRadius: 8 }} />
                ) : (
                  <Image source={{ uri: 'https://nbglrvsdimjtyibjwjgf.supabase.co/storage/v1/object/public/tables/ChatGPT%20Image%20May%2023,%202025,%2010_51_20%20PM.png' }} style={{ width: 160, height: 80, borderRadius: 8, opacity: 0.7 }} />
                )}
              </View>
            </View>
            <View style={{ flexDirection: 'row', marginTop: 10 }}>
              <TouchableOpacity
                style={[styles.groupButton, { backgroundColor: colors.tint, flex: 1, marginRight: 8 }]}
                onPress={handleCreateTable}
                disabled={loading || bannerUploading}
              >
                {bannerUploading ? <ActivityIndicator color="#fff" /> : <Text style={{ color: '#fff', fontWeight: 'bold' }}>Create</Text>}
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.groupButton, { backgroundColor: colors.error, flex: 1, marginLeft: 8 }]}
                onPress={() => setModalVisible(false)}
                disabled={loading}
              >
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>Cancel</Text>
              </TouchableOpacity>
            </View>
            {error ? <Text style={{ color: colors.error, marginTop: 12 }}>{error}</Text> : null}
          </View>
        </View>
      </Modal>

      {/* ---------- EDIT TABLE MODAL ---------- */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <Text style={{ fontWeight: 'bold', fontSize: 20, marginBottom: 14, color: colors.text }}>Edit Table</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={[styles.input, { color: colors.text, borderColor: colors.border }]}
                placeholder="Table name"
                placeholderTextColor={colors.muted}
                value={editTableName}
                onChangeText={setEditTableName}
              />
            </View>
            <View style={{ alignItems: 'center' }}>
              <TouchableOpacity
                style={styles.bannerUploadButton}
                onPress={() => handlePickBanner(setEditBannerImage)}
              >
                <ImageIcon size={20} color={colors.tint} />
                <Text style={{ color: colors.tint, marginLeft: 6 }}>Pick Banner</Text>
              </TouchableOpacity>
              <View style={{ minHeight: 80, marginVertical: 8 }}>
                {editBannerImage ? (
                  <Image source={{ uri: editBannerImage }} style={{ width: 160, height: 80, borderRadius: 8 }} />
                ) : (
                  <Image source={{ uri: 'https://nbglrvsdimjtyibjwjgf.supabase.co/storage/v1/object/public/tables/ChatGPT%20Image%20May%2023,%202025,%2010_51_20%20PM.png' }} style={{ width: 160, height: 80, borderRadius: 8, opacity: 0.7 }} />
                )}
              </View>
            </View>
            <View style={{ flexDirection: 'row', marginTop: 10 }}>
              <TouchableOpacity
                style={[styles.groupButton, { backgroundColor: colors.tint, flex: 1, marginRight: 8 }]}
                onPress={handleEditTable}
                disabled={loading || editBannerUploading}
              >
                {editBannerUploading ? <ActivityIndicator color="#fff" /> : <Text style={{ color: '#fff', fontWeight: 'bold' }}>Save</Text>}
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.groupButton, { backgroundColor: colors.error, flex: 1, marginLeft: 8 }]}
                onPress={() => setEditModalVisible(false)}
                disabled={loading}
              >
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>Cancel</Text>
              </TouchableOpacity>
            </View>
            {error ? <Text style={{ color: colors.error, marginTop: 12 }}>{error}</Text> : null}
          </View>
        </View>
      </Modal>

      {/* -------- MAIN PAGE -------- */}
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
            <Text color={colors.error} align="center">{error}</Text>
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
            >
              <Card padding={false} style={[styles.groupCard, { backgroundColor: colors.card }]}>
                <Image
                  source={{
                    uri: getTableImageUrl(table)
                  }}
                  style={styles.bannerPreview}
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
                    {/* ---- VIEW TABLE BUTTON ---- */}
                    <TouchableOpacity
                      style={[
                        styles.groupButton,
                        { backgroundColor: colors.tint, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }
                      ]}
                      onPress={() => router.push(`/tables/${table.id}/TableDetailsScreen`)}
                    >
                      <UsersIcon size={16} color="#fff" />
                      <Text
                        variant="body-sm"
                        weight="medium"
                        color="#fff"
                        style={{ marginLeft: 4 }}
                      >
                        View Table
                      </Text>
                    </TouchableOpacity>
                    {/* ---- END VIEW TABLE BUTTON ---- */}
                    {table.creator_id === userId ? (
                      <>
                        <TouchableOpacity
                          style={[
                            styles.groupButton,
                            { backgroundColor: colors.warning, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
                          ]}
                          onPress={() => openEditTableModal(table)}
                        >
                          <EditIcon size={18} color="#fff" />
                          <Text
                            variant="body-sm"
                            weight="medium"
                            color="#fff"
                            style={{ marginLeft: 4 }}
                          >
                            Edit
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[
                            styles.groupButton,
                            { backgroundColor: colors.error, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
                          ]}
                          onPress={() => handleDeleteTable(table.id, table.image_filename)}
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
                      </>
                    ) : (
                      <TouchableOpacity
                        style={[
                          styles.groupButton,
                          { backgroundColor: colors.warning, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
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
  bannerPreview: {
    width: '100%',
    aspectRatio: 1,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
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
    flexWrap: 'wrap',
  },
  groupButton: {
    flex: 0.48,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 100,
    marginBottom: 6,
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
  bannerUploadButton: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: '#f1f5fb',
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
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

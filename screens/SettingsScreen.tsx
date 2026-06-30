import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

import UserAvatar from '@/components/UserAvatar';
import { BrandColors } from '@/constants/theme';
import { useApp } from '@/contexts/AppContext';

const SettingsScreen: React.FC = () => {
  const { currentUser, updateProfile, changePassword, logout } = useApp();
  const [displayName, setDisplayName] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setDisplayName(currentUser.name);
      setPhotoURL(currentUser.photoURL);
    }
  }, [currentUser]);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('需要權限', '請允許存取相簿以選擇頭像');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      setPhotoURL(result.assets[0].uri);
    }
  };

  const takePicture = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('需要權限', '請允許使用相機以拍攝頭像');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      setPhotoURL(result.assets[0].uri);
    }
  };

  const handleSaveProfile = async () => {
    if (!displayName.trim()) {
      Alert.alert('缺少欄位', '請輸入顯示名稱');
      return;
    }
    setSaving(true);
    try {
      await updateProfile(displayName, photoURL);
      Alert.alert('成功', '個人資料已更新');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : '無法更新';
      Alert.alert('更新失敗', message);
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!currentPassword || !newPassword) {
      Alert.alert('缺少欄位', '請輸入目前密碼與新密碼');
      return;
    }
    setSaving(true);
    try {
      await changePassword(currentPassword, newPassword);
      setCurrentPassword('');
      setNewPassword('');
      Alert.alert('成功', '密碼已更新');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : '無法更新密碼';
      Alert.alert('更新失敗', message);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('登出', '確定要登出嗎？', [
      { text: '取消', style: 'cancel' },
      { text: '登出', style: 'destructive', onPress: () => logout() },
    ]);
  };

  if (!currentUser) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={BrandColors.standard} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.avatarSection}>
        <UserAvatar name={displayName || currentUser.name} photoURL={photoURL} size={100} />
        <Text style={styles.email}>{currentUser.email}</Text>
        <Text style={styles.userId}>ID: {currentUser.uid}</Text>
      </View>

      <TouchableOpacity style={styles.secondaryButton} onPress={pickImage}>
        <Text style={styles.secondaryButtonText}>📱 從相簿選擇頭像</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.secondaryButton, styles.cameraButton]} onPress={takePicture}>
        <Text style={styles.secondaryButtonText}>📷 拍照設定頭像</Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>個人資料</Text>
      <TextInput
        style={styles.input}
        placeholder="顯示名稱"
        value={displayName}
        onChangeText={setDisplayName}
      />
      <TouchableOpacity style={styles.button} onPress={handleSaveProfile} disabled={saving}>
        {saving ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>儲存個人資料</Text>
        )}
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>修改密碼</Text>
      <TextInput
        style={styles.input}
        placeholder="目前密碼"
        value={currentPassword}
        onChangeText={setCurrentPassword}
        secureTextEntry
      />
      <TextInput
        style={styles.input}
        placeholder="新密碼"
        value={newPassword}
        onChangeText={setNewPassword}
        secureTextEntry
      />
      <TouchableOpacity style={styles.button} onPress={handlePasswordChange} disabled={saving}>
        {saving ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>修改密碼</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.logoutButton} 
        onPress={handleLogout}
        activeOpacity={0.7}
      >
        <Text style={styles.logoutText}>登出</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 80,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  email: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  userId: {
    marginTop: 4,
    fontSize: 11,
    color: '#aaa',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#dcdfe6',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 12,
  },
  button: {
    backgroundColor: BrandColors.standard,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
  },
  secondaryButton: {
    backgroundColor: BrandColors.standard,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 8,
  },
  cameraButton: {
    backgroundColor: '#b19cff',
  },
  secondaryButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  logoutButton: {
    marginTop: 32,
    marginBottom: 12,
    paddingVertical: 16,
    minHeight: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: BrandColors.standard,
    backgroundColor: 'transparent',
  },
  logoutText: {
    color: BrandColors.standard,
    fontWeight: '700',
    fontSize: 16,
  },
});

export default SettingsScreen;

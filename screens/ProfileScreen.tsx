import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import {
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';


const ProfileScreen: React.FC = () => {
  const [profileImage, setProfileImage] = useState<string | null>(null);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'We need permission to access your photos');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const takePicture = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'We need permission to access your camera');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const handleRemovePhoto = () => {
    setProfileImage(null);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>My Profile</Text>

      <View style={styles.avatarSection}>
        <View style={styles.avatarContainer}>
          {profileImage ? (
            <Image source={{ uri: profileImage }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.placeholderText}>No Photo</Text>
            </View>
          )}
        </View>
        <Text style={styles.username}>Your Name</Text>
        <Text style={styles.email}>user@example.com</Text>
      </View>

      <View style={styles.buttonGroup}>
        <TouchableOpacity style={styles.button} onPress={pickImage}>
          <Text style={styles.buttonText}>📱 Choose from Gallery</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, styles.cameraButton]} onPress={takePicture}>
          <Text style={styles.buttonText}>📷 Take a Photo</Text>
        </TouchableOpacity>

        {profileImage && (
          <TouchableOpacity style={[styles.button, styles.removeButton]} onPress={handleRemovePhoto}>
            <Text style={styles.removeButtonText}>✕ Remove Photo</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>Profile Information</Text>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Username:</Text>
          <Text style={styles.infoValue}>User</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Status:</Text>
          <Text style={styles.infoValue}>Active</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Member Since:</Text>
          <Text style={styles.infoValue}>2024</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DesignSystem.colors.background.primary,
  },
  content: {
    paddingHorizontal: DesignSystem.spacing.lg,
    paddingVertical: DesignSystem.spacing.lg,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: DesignSystem.colors.text.primary,
    marginBottom: DesignSystem.spacing.xl,
    textAlign: 'center',
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: DesignSystem.spacing.xxl,
  },
  avatarContainer: {
    marginBottom: DesignSystem.spacing.lg,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: DesignSystem.colors.border.light,
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: DesignSystem.colors.border.light,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: DesignSystem.colors.text.tertiary,
    fontSize: 14,
  },
  username: {
    fontSize: 20,
    fontWeight: '600',
    color: DesignSystem.colors.text.primary,
    marginBottom: DesignSystem.spacing.xs,
  },
  email: {
    fontSize: 14,
    color: DesignSystem.colors.text.secondary,
  },
  buttonGroup: {
    gap: DesignSystem.spacing.md,
    marginBottom: DesignSystem.spacing.xxl,
  },
  button: {
    backgroundColor: DesignSystem.colors.primary,
    paddingVertical: DesignSystem.spacing.md,
    paddingHorizontal: DesignSystem.spacing.lg,
    borderRadius: DesignSystem.borderRadius.md,
    alignItems: 'center',
    minHeight: 44,
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cameraButton: {
    backgroundColor: DesignSystem.colors.primaryDark,
  },
  removeButton: {
    backgroundColor: DesignSystem.colors.state.error,
  },
  removeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  infoSection: {
    backgroundColor: DesignSystem.colors.background.secondary,
    borderRadius: DesignSystem.borderRadius.md,
    padding: DesignSystem.spacing.lg,
    borderWidth: 1,
    borderColor: DesignSystem.colors.border.light,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: DesignSystem.colors.text.primary,
    marginBottom: DesignSystem.spacing.md,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: DesignSystem.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: DesignSystem.colors.border.light,
  },
  infoLabel: {
    fontSize: 14,
    color: DesignSystem.colors.text.secondary,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: DesignSystem.colors.text.primary,
    fontWeight: '600',
  },
});

export default ProfileScreen;

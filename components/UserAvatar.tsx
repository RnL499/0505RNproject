import React from 'react';
import { Image, StyleSheet, Text, View, ViewStyle } from 'react-native';

import { getAvatarColor, getInitials } from '@/utils/chatUtils';

interface UserAvatarProps {
  name: string;
  photoURL?: string;
  size?: number;
  style?: ViewStyle;
}

const UserAvatar: React.FC<UserAvatarProps> = ({ name, photoURL, size = 48, style }) => {
  const radius = size / 2;

  if (photoURL) {
    return (
      <Image
        source={{ uri: photoURL }}
        style={[{ width: size, height: size, borderRadius: radius }, style]}
      />
    );
  }

  return (
    <View
      style={[
        styles.placeholder,
        { width: size, height: size, borderRadius: radius, backgroundColor: getAvatarColor(name) },
        style,
      ]}
    >
      <Text style={[styles.initials, { fontSize: size * 0.4 }]}>{getInitials(name)}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  placeholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  initials: {
    color: '#fff',
    fontWeight: '700',
  },
});

export default UserAvatar;

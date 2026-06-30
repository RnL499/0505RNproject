import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';


const friends = [
  { id: '1', name: 'Ava', status: 'Online' },
  { id: '2', name: 'Noah', status: 'Away' },
  { id: '3', name: 'Mia', status: 'Online' },
];

const FriendsScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Friends</Text>
      <FlatList
        data={friends}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
            </View>
            <View>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.status}>{item.status}</Text>
            </View>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DesignSystem.colors.background.primary,
    paddingHorizontal: DesignSystem.spacing.lg,
    paddingTop: DesignSystem.spacing.lg,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: DesignSystem.spacing.lg,
    color: DesignSystem.colors.text.primary,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: DesignSystem.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: DesignSystem.colors.border.light,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: DesignSystem.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: DesignSystem.spacing.md,
  },
  avatarText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: DesignSystem.colors.text.primary,
  },
  status: {
    color: DesignSystem.colors.text.secondary,
    marginTop: DesignSystem.spacing.xs,
    fontSize: 14,
  },
});

export default FriendsScreen;

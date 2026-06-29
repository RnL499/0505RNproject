import React, { useMemo, useState } from 'react';
import {
    Alert,
    FlatList,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

interface UserDoc {
  uid: string;
  name: string;
  email: string;
  status: string;
}

const demoUsers: UserDoc[] = [
  { uid: 'u1', name: 'Ava', email: 'ava@example.com', status: 'Online' },
  { uid: 'u2', name: 'Noah', email: 'noah@example.com', status: 'Away' },
  { uid: 'u3', name: 'Mia', email: 'mia@example.com', status: 'Online' },
  { uid: 'u4', name: 'Liam', email: 'liam@example.com', status: 'Busy' },
  { uid: 'u5', name: 'Sophia', email: 'sophia@example.com', status: 'Online' },
];

const FindFriendsScreen: React.FC = () => {
  const [searchText, setSearchText] = useState('');

  const filteredUsers = useMemo(() => {
    const query = searchText.trim().toLowerCase();

    if (!query) {
      return demoUsers;
    }

    return demoUsers.filter((user) => {
      return user.email.toLowerCase().includes(query) || user.name.toLowerCase().includes(query);
    });
  }, [searchText]);

  const handleAddFriend = async (friendUid: string) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 300));
      Alert.alert('Demo mode', `Added friend ${friendUid}`);
    } catch (error: any) {
      Alert.alert('Failed', error.message || 'Unable to add friend.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Friends</Text>
      <TextInput
        style={styles.input}
        placeholder="Search friends"
        value={searchText}
        onChangeText={setSearchText}
        autoCapitalize="none"
      />

      <FlatList
        data={filteredUsers}
        keyExtractor={(item) => item.uid}
        ListEmptyComponent={<Text style={styles.emptyText}>No friends found.</Text>}
        renderItem={({ item }) => (
          <View style={styles.resultCard}>
            <View style={styles.resultInfo}>
              <Text style={styles.userName}>{item.name}</Text>
              <Text style={styles.userEmail}>{item.email}</Text>
              <Text style={styles.userStatus}>{item.status}</Text>
            </View>
            <TouchableOpacity style={styles.addButton} onPress={() => handleAddFriend(item.uid)}>
              <Text style={styles.addButtonText}>Add</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#dcdfe6',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 12,
  },
  resultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  resultInfo: {
    flex: 1,
    marginRight: 12,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
  },
  userEmail: {
    color: '#777',
    marginTop: 2,
  },
  userStatus: {
    color: '#34C759',
    marginTop: 2,
    fontSize: 12,
  },
  addButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  emptyText: {
    color: '#777',
    marginTop: 12,
  },
});

export default FindFriendsScreen;

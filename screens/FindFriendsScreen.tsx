import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
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
}

const demoUsers: UserDoc[] = [
  { uid: 'u1', name: 'Ava', email: 'ava@example.com' },
  { uid: 'u2', name: 'Noah', email: 'noah@example.com' },
  { uid: 'u3', name: 'Mia', email: 'mia@example.com' },
];

const FindFriendsScreen: React.FC = () => {
  const [searchText, setSearchText] = useState('');
  const [results, setResults] = useState<UserDoc[]>([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    const runSearch = async () => {
      if (!searchText.trim()) {
        setResults([]);
        return;
      }

      setSearching(true);
      setLoading(true);

      try {
        await new Promise((resolve) => setTimeout(resolve, 300));
        const term = searchText.trim().toLowerCase();
        const matches = demoUsers.filter((user) => {
          return user.email.toLowerCase().includes(term) || user.name.toLowerCase().includes(term);
        });
        setResults(matches);
      } catch (error: any) {
        Alert.alert('Search failed', error.message || 'Unable to search users.');
      } finally {
        setLoading(false);
        setSearching(false);
      }
    };

    const timeout = setTimeout(runSearch, 300);
    return () => clearTimeout(timeout);
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
      <Text style={styles.title}>Find Friends</Text>
      <TextInput
        style={styles.input}
        placeholder="Search by email or name"
        value={searchText}
        onChangeText={setSearchText}
        autoCapitalize="none"
      />

      {loading ? (
        <ActivityIndicator style={{ marginTop: 12 }} color="#007AFF" />
      ) : null}

      {!loading && !searching && !searchText.trim() ? (
        <Text style={styles.helperText}>Type an email or name to search for users.</Text>
      ) : null}

      <FlatList
        data={results}
        keyExtractor={(item) => item.uid}
        ListEmptyComponent={() => {
          if (!searchText.trim()) return null;
          return <Text style={styles.emptyText}>No users found.</Text>;
        }}
        renderItem={({ item }) => (
          <View style={styles.resultCard}>
            <View style={styles.resultInfo}>
              <Text style={styles.userName}>{item.name}</Text>
              <Text style={styles.userEmail}>{item.email}</Text>
            </View>
            <TouchableOpacity style={styles.addButton} onPress={() => handleAddFriend(item.uid)}>
              <Text style={styles.addButtonText}>Add Friend</Text>
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
  helperText: {
    color: '#777',
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
